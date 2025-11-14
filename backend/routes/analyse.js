/**
 * Analyse Route
 * Handles analysis of student drafts against success criteria
 */

const express = require('express');
const router = express.Router();
const { analyzeWithCriteria, getQuickFeedback } = require('../utils/openaiClient');

/**
 * POST /api/analyse
 * Analyzes a draft against success criteria using OpenAI
 */
router.post('/analyse', async (req, res) => {
  try {
    const { draft, criteria } = req.body;

    // Validation
    if (!draft || typeof draft !== 'string' || !draft.trim()) {
      return res.status(400).json({
        error: 'Draft text is required and must be a non-empty string'
      });
    }

    if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
      return res.status(400).json({
        error: 'At least one success criterion is required'
      });
    }

    // Limit criteria to prevent overlong prompts
    if (criteria.length > 15) {
      return res.status(400).json({
        error: 'Maximum 15 success criteria allowed'
      });
    }

    // Validate each criterion
    for (let i = 0; i < criteria.length; i++) {
      if (typeof criteria[i] !== 'string' || !criteria[i].trim()) {
        return res.status(400).json({
          error: `Criterion ${i + 1} must be a non-empty string`
        });
      }
    }

    // Call OpenAI
    const result = await analyzeWithCriteria(draft, criteria);

    // Return results
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Send appropriate error response
    res.status(500).json({
      error: error.message || 'Failed to analyze draft',
      success: false
    });
  }
});

/**
 * POST /api/quick-check
 * Provides quick overall feedback on a draft
 */
router.post('/quick-check', async (req, res) => {
  try {
    const { draft } = req.body;

    // Validation
    if (!draft || typeof draft !== 'string' || !draft.trim()) {
      return res.status(400).json({
        error: 'Draft text is required and must be a non-empty string'
      });
    }

    // Call OpenAI
    const result = await getQuickFeedback(draft);

    // Return results
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Quick check error:', error);
    
    res.status(500).json({
      error: error.message || 'Failed to get quick feedback',
      success: false
    });
  }
});

module.exports = router;
