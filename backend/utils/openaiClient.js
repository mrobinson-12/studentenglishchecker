/**
 * OpenAI Client Wrapper
 * Handles all interactions with the OpenAI API using gpt-5-nano
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a student draft against success criteria using OpenAI
 * @param {string} draft - The student's draft text
 * @param {Array<string>} criteria - Array of success criteria
 * @returns {Promise<Object>} - Analysis results with ratings and feedback
 */
async function analyzeWithCriteria(draft, criteria) {
  if (!draft || !draft.trim()) {
    throw new Error('Draft text is required');
  }

  if (!criteria || criteria.length === 0) {
    throw new Error('At least one success criterion is required');
  }

  // Build the criteria list for the prompt
  const criteriaList = criteria
    .map((criterion, index) => `${index + 1}. ${criterion}`)
    .join('\n');

  // Adjust instructions based on number of criteria
  const feedbackLength = criteria.length > 10 
    ? 'Keep each feedback sentence extremely short (max 20 words).'
    : 'Provide 1 short sentence of feedback (max 30 words).';
  
  const summaryLength = criteria.length > 10
    ? 'Provide exactly 2 bullet points for the summary.'
    : 'Provide 2-3 bullet points for the summary.';

  // Construct the prompt
  const prompt = `You are an English teacher assessing a student's draft against success criteria.

Student draft:
"""
${draft}
"""

Success criteria (numbered):
${criteriaList}

For each criterion:
- Rate it using exactly one of: "Exceeding", "Accomplished", "Developing", "Not Evident"
- ${feedbackLength}

After all criteria:
- ${summaryLength}
- Focus on the main improvements the student should prioritize.

Output strictly in JSON with this exact schema:
{
  "criteria": [
    {
      "criterionNumber": number,
      "criterion": string,
      "rating": "Exceeding" | "Accomplished" | "Developing" | "Not Evident",
      "feedback": string
    }
  ],
  "summary": [
    string,
    string,
    string (optional)
  ]
}

Ensure valid JSON formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced English teacher providing constructive feedback on student writing. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Try to parse JSON response
    let result;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate the structure
    if (!result.criteria || !Array.isArray(result.criteria)) {
      throw new Error('Invalid response structure: missing criteria array');
    }

    if (!result.summary || !Array.isArray(result.summary)) {
      throw new Error('Invalid response structure: missing summary array');
    }

    return result;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.message.includes('Invalid JSON')) {
      throw error;
    }
    
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key');
    }
    
    if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Provides quick overall feedback on a draft
 * @param {string} draft - The student's draft text
 * @returns {Promise<Object>} - Quick feedback
 */
async function getQuickFeedback(draft) {
  if (!draft || !draft.trim()) {
    throw new Error('Draft text is required');
  }

  const prompt = `You are an English teacher providing quick feedback on a student's draft.

Student draft:
"""
${draft}
"""

Provide:
1. Overall impression (1-2 sentences)
2. Top 3 strengths
3. Top 3 areas for improvement

Output in JSON:
{
  "impression": string,
  "strengths": [string, string, string],
  "improvements": [string, string, string]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced English teacher. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Clean and parse JSON
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`Failed to get quick feedback: ${error.message}`);
  }
}

module.exports = {
  analyzeWithCriteria,
  getQuickFeedback,
};
