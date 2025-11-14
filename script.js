/**
 * Student English Checker - Main JavaScript
 * Handles all frontend logic including analytics, grammar checking, and AI integration
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const WORDS_PER_MINUTE = 225;
const AUTOSAVE_DELAY = 1000; // milliseconds
const ANALYSIS_DEBOUNCE = 500; // milliseconds
const MAX_CRITERIA = 15;
const API_BASE_URL = '';

// Common English stopwords to exclude from word frequency
const STOPWORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'was',
    'is', 'are', 'been', 'has', 'had', 'were', 'can', 'could', 'should', 'may'
]);

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let debounceTimer = null;
let autosaveTimer = null;
let criteria = [];

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const draftInput = document.getElementById('draftInput');
const themeToggle = document.getElementById('themeToggle');
const uploadBtn = document.getElementById('uploadBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const fileInput = document.getElementById('fileInput');

// Analytics elements
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const sentenceCount = document.getElementById('sentenceCount');
const avgSentenceLength = document.getElementById('avgSentenceLength');
const longestSentence = document.getElementById('longestSentence');
const readingTime = document.getElementById('readingTime');

// Issues elements
const issuesSummary = document.getElementById('issuesSummary');
const issuesList = document.getElementById('issuesList');

// Word frequency
const wordFrequency = document.getElementById('wordFrequency');

// Sentence table
const sentenceTable = document.getElementById('sentenceTable');

// Criteria elements
const criterionInput = document.getElementById('criterionInput');
const addCriterionBtn = document.getElementById('addCriterionBtn');
const criteriaList = document.getElementById('criteriaList');
const analyseBtn = document.getElementById('analyseBtn');
const analysisLoading = document.getElementById('analysisLoading');

// Results elements
const resultsSection = document.getElementById('resultsSection');
const summaryList = document.getElementById('summaryList');
const criteriaResults = document.getElementById('criteriaResults');
const exportFeedbackBtn = document.getElementById('exportFeedbackBtn');

// Footer
const clearAllBtn = document.getElementById('clearAllBtn');

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadFromLocalStorage();
    setupEventListeners();
    updateAnalytics();
    renderCriteria();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Draft input
    draftInput.addEventListener('input', handleDraftInput);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // File operations
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    downloadBtn.addEventListener('click', downloadDraft);
    clearBtn.addEventListener('click', clearDraft);
    
    // Criteria management
    addCriterionBtn.addEventListener('click', addCriterion);
    criterionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCriterion();
    });
    
    // Analysis
    analyseBtn.addEventListener('click', analyzeWithAI);
    
    // Export
    exportFeedbackBtn.addEventListener('click', exportFeedback);
    
    // Clear all
    clearAllBtn.addEventListener('click', clearAllData);
}

function handleDraftInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        updateAnalytics();
        checkGrammarAndSpelling();
        updateWordFrequency();
        updateSentenceTable();
    }, ANALYSIS_DEBOUNCE);
    
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(saveToLocalStorage, AUTOSAVE_DELAY);
}

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

function updateAnalytics() {
    const text = draftInput.value.trim();
    
    if (!text) {
        resetAnalytics();
        return;
    }
    
    // Count words
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCountValue = words.length;
    
    // Count characters
    const charCountValue = text.length;
    
    // Count sentences
    const sentences = getSentences(text);
    const sentenceCountValue = sentences.length;
    
    // Average sentence length
    const avgLength = sentenceCountValue > 0 
        ? Math.round(wordCountValue / sentenceCountValue) 
        : 0;
    
    // Longest sentence
    const longestLength = sentences.reduce((max, sentence) => {
        const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 0).length;
        return Math.max(max, sentenceWords);
    }, 0);
    
    // Reading time
    const minutes = Math.floor(wordCountValue / WORDS_PER_MINUTE);
    const seconds = Math.round((wordCountValue % WORDS_PER_MINUTE) / WORDS_PER_MINUTE * 60);
    
    // Update DOM
    wordCount.textContent = wordCountValue.toLocaleString();
    charCount.textContent = charCountValue.toLocaleString();
    sentenceCount.textContent = sentenceCountValue.toLocaleString();
    avgSentenceLength.textContent = avgLength;
    longestSentence.textContent = longestLength;
    readingTime.textContent = `${minutes}m ${seconds}s`;
}

function resetAnalytics() {
    wordCount.textContent = '0';
    charCount.textContent = '0';
    sentenceCount.textContent = '0';
    avgSentenceLength.textContent = '0';
    longestSentence.textContent = '0';
    readingTime.textContent = '0m 0s';
}

function getSentences(text) {
    // Split on sentence-ending punctuation
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

// ============================================================================
// GRAMMAR & SPELLING CHECKS
// ============================================================================

function checkGrammarAndSpelling() {
    const text = draftInput.value.trim();
    
    if (!text) {
        issuesSummary.innerHTML = 'Start typing to see feedback...';
        issuesList.innerHTML = '';
        return;
    }
    
    const issues = {
        spelling: [],
        longSentences: [],
        repeatedWords: [],
        passiveVoice: [],
    };
    
    const sentences = getSentences(text);
    
    // Check each sentence
    sentences.forEach((sentence, index) => {
        const words = sentence.split(/\s+/);
        
        // Check for long sentences (> 30 words)
        if (words.length > 30) {
            issues.longSentences.push({
                sentence: index + 1,
                text: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''),
                wordCount: words.length
            });
        }
        
        // Check for repeated words
        const repeatedPattern = /\b(\w+)\s+\1\b/gi;
        if (repeatedPattern.test(sentence)) {
            issues.repeatedWords.push({
                sentence: index + 1,
                text: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : '')
            });
        }
        
        // Check for passive voice patterns
        const passivePatterns = [
            /\b(is|are|was|were|been|being)\s+\w+ed\b/i,
            /\b(is|are|was|were|been|being)\s+(given|taken|made|done|shown|seen)\b/i
        ];
        
        if (passivePatterns.some(pattern => pattern.test(sentence))) {
            issues.passiveVoice.push({
                sentence: index + 1,
                text: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : '')
            });
        }
    });
    
    // Basic spelling check (very simple - checks for common patterns)
    const words = text.toLowerCase().split(/\s+/);
    const suspiciousWords = words.filter(word => {
        // Remove punctuation
        word = word.replace(/[^a-z]/g, '');
        // Check for repeated letters (potential typo)
        if (/(.)\1{3,}/.test(word)) return true;
        return false;
    });
    
    if (suspiciousWords.length > 0) {
        issues.spelling = suspiciousWords.slice(0, 10).map(word => ({ word }));
    }
    
    // Display summary
    const totalIssues = 
        issues.spelling.length + 
        issues.longSentences.length + 
        issues.repeatedWords.length + 
        issues.passiveVoice.length;
    
    if (totalIssues === 0) {
        issuesSummary.innerHTML = '✅ No major issues detected! Great work!';
        issuesList.innerHTML = '';
    } else {
        issuesSummary.innerHTML = `Found ${totalIssues} potential issue${totalIssues !== 1 ? 's' : ''}`;
        displayIssues(issues);
    }
}

function displayIssues(issues) {
    let html = '';
    
    if (issues.longSentences.length > 0) {
        html += '<div class="issue-group">';
        html += '<h4>⚠️ Long Sentences</h4>';
        html += '<ul>';
        issues.longSentences.forEach(issue => {
            html += `<li>Sentence ${issue.sentence}: ${issue.wordCount} words<br>`;
            html += `<span class="issue-text">"${issue.text}"</span></li>`;
        });
        html += '</ul></div>';
    }
    
    if (issues.repeatedWords.length > 0) {
        html += '<div class="issue-group">';
        html += '<h4>🔄 Repeated Words</h4>';
        html += '<ul>';
        issues.repeatedWords.forEach(issue => {
            html += `<li>Sentence ${issue.sentence}:<br>`;
            html += `<span class="issue-text">"${issue.text}"</span></li>`;
        });
        html += '</ul></div>';
    }
    
    if (issues.passiveVoice.length > 0) {
        html += '<div class="issue-group">';
        html += '<h4>📝 Possible Passive Voice</h4>';
        html += '<ul>';
        issues.passiveVoice.forEach(issue => {
            html += `<li>Sentence ${issue.sentence}:<br>`;
            html += `<span class="issue-text">"${issue.text}"</span></li>`;
        });
        html += '</ul></div>';
    }
    
    if (issues.spelling.length > 0) {
        html += '<div class="issue-group">';
        html += '<h4>✏️ Potential Spelling Issues</h4>';
        html += '<ul>';
        issues.spelling.forEach(issue => {
            html += `<li>${issue.word}</li>`;
        });
        html += '</ul></div>';
    }
    
    issuesList.innerHTML = html;
}

// ============================================================================
// WORD FREQUENCY
// ============================================================================

function updateWordFrequency() {
    const text = draftInput.value.trim().toLowerCase();
    
    if (!text) {
        wordFrequency.innerHTML = 'Start typing to see word frequency...';
        return;
    }
    
    // Count word frequency
    const words = text.split(/\s+/).map(word => 
        word.replace(/[^a-z]/g, '')
    ).filter(word => 
        word.length > 3 && !STOPWORDS.has(word)
    );
    
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Sort by frequency
    const sorted = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    if (sorted.length === 0) {
        wordFrequency.innerHTML = 'No significant words found yet...';
        return;
    }
    
    // Display as bars
    const maxCount = sorted[0][1];
    let html = '<div class="freq-bars">';
    sorted.forEach(([word, count]) => {
        const percentage = (count / maxCount) * 100;
        html += `
            <div class="freq-item">
                <span class="freq-word">${word}</span>
                <div class="freq-bar-container">
                    <div class="freq-bar" style="width: ${percentage}%"></div>
                </div>
                <span class="freq-count">${count}</span>
            </div>
        `;
    });
    html += '</div>';
    
    wordFrequency.innerHTML = html;
}

// ============================================================================
// SENTENCE TABLE
// ============================================================================

function updateSentenceTable() {
    const text = draftInput.value.trim();
    
    if (!text) {
        sentenceTable.innerHTML = 'Start typing to see sentence breakdown...';
        return;
    }
    
    const sentences = getSentences(text);
    
    if (sentences.length === 0) {
        sentenceTable.innerHTML = 'No complete sentences found yet...';
        return;
    }
    
    let html = '<table class="sentence-table">';
    html += '<thead><tr><th>#</th><th>Sentence Preview</th><th>Words</th><th>Flag</th></tr></thead>';
    html += '<tbody>';
    
    sentences.forEach((sentence, index) => {
        const words = sentence.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const isLong = wordCount > 30;
        const preview = sentence.substring(0, 80) + (sentence.length > 80 ? '...' : '');
        
        html += `
            <tr class="${isLong ? 'long-sentence' : ''}">
                <td>${index + 1}</td>
                <td>${preview}</td>
                <td>${wordCount}</td>
                <td>${isLong ? '⚠️ Long' : '✓'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    sentenceTable.innerHTML = html;
}

// ============================================================================
// SUCCESS CRITERIA MANAGEMENT
// ============================================================================

function addCriterion() {
    const value = criterionInput.value.trim();
    
    if (!value) {
        alert('Please enter a criterion');
        return;
    }
    
    if (criteria.length >= MAX_CRITERIA) {
        alert(`Maximum ${MAX_CRITERIA} criteria allowed`);
        return;
    }
    
    criteria.push(value);
    criterionInput.value = '';
    renderCriteria();
    saveToLocalStorage();
}

function removeCriterion(index) {
    criteria.splice(index, 1);
    renderCriteria();
    saveToLocalStorage();
}

function editCriterion(index) {
    const newValue = prompt('Edit criterion:', criteria[index]);
    if (newValue !== null && newValue.trim()) {
        criteria[index] = newValue.trim();
        renderCriteria();
        saveToLocalStorage();
    }
}

function renderCriteria() {
    if (criteria.length === 0) {
        criteriaList.innerHTML = '<li class="empty-state">No criteria added yet. Add some above!</li>';
        analyseBtn.disabled = true;
        return;
    }
    
    analyseBtn.disabled = false;
    
    let html = '';
    criteria.forEach((criterion, index) => {
        html += `
            <li class="criterion-item">
                <span class="criterion-number">${index + 1}.</span>
                <span class="criterion-text">${criterion}</span>
                <div class="criterion-actions">
                    <button onclick="editCriterion(${index})" class="btn-icon" title="Edit">✏️</button>
                    <button onclick="removeCriterion(${index})" class="btn-icon" title="Delete">🗑️</button>
                </div>
            </li>
        `;
    });
    
    criteriaList.innerHTML = html;
}

// Make functions available globally for inline event handlers
window.removeCriterion = removeCriterion;
window.editCriterion = editCriterion;

// ============================================================================
// AI ANALYSIS
// ============================================================================

async function analyzeWithAI() {
    const draft = draftInput.value.trim();
    
    if (!draft) {
        alert('Please enter a draft first');
        return;
    }
    
    if (criteria.length === 0) {
        alert('Please add at least one success criterion');
        return;
    }
    
    // Show loading state
    analyseBtn.disabled = true;
    analysisLoading.style.display = 'block';
    resultsSection.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                draft: draft,
                criteria: criteria
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Analysis failed');
        }
        
        if (!result.success) {
            throw new Error(result.error || 'Analysis failed');
        }
        
        displayResults(result.data);
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert(`Failed to analyze draft: ${error.message}\n\nPlease check that:\n1. The backend server is running\n2. Your OpenAI API key is configured\n3. You have internet connection`);
    } finally {
        analyseBtn.disabled = false;
        analysisLoading.style.display = 'none';
    }
}

function displayResults(data) {
    // Display summary
    summaryList.innerHTML = '';
    if (data.summary && data.summary.length > 0) {
        data.summary.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            summaryList.appendChild(li);
        });
    }
    
    // Display criteria results
    criteriaResults.innerHTML = '';
    if (data.criteria && data.criteria.length > 0) {
        data.criteria.forEach(item => {
            const card = document.createElement('div');
            card.className = `criterion-result rating-${item.rating.toLowerCase().replace(' ', '-')}`;
            
            card.innerHTML = `
                <div class="criterion-result-header">
                    <span class="criterion-result-number">${item.criterionNumber}.</span>
                    <span class="criterion-result-text">${item.criterion}</span>
                    <span class="rating-badge rating-${item.rating.toLowerCase().replace(' ', '-')}">${item.rating}</span>
                </div>
                <p class="criterion-feedback">${item.feedback}</p>
            `;
            
            criteriaResults.appendChild(card);
        });
    }
    
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.txt')) {
        alert('Please upload a .txt file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        draftInput.value = e.target.result;
        handleDraftInput();
    };
    reader.readAsText(file);
    
    // Reset file input
    fileInput.value = '';
}

function downloadDraft() {
    const text = draftInput.value;
    
    if (!text.trim()) {
        alert('No draft to download');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draft_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportFeedback() {
    const draft = draftInput.value.trim();
    const summary = Array.from(summaryList.children).map(li => li.textContent);
    const results = Array.from(criteriaResults.children).map(card => {
        const number = card.querySelector('.criterion-result-number').textContent;
        const text = card.querySelector('.criterion-result-text').textContent;
        const rating = card.querySelector('.rating-badge').textContent;
        const feedback = card.querySelector('.criterion-feedback').textContent;
        return `${number} ${text}\nRating: ${rating}\nFeedback: ${feedback}`;
    });
    
    let content = '=== STUDENT ENGLISH CHECKER - FEEDBACK REPORT ===\n\n';
    content += `Date: ${new Date().toLocaleString()}\n\n`;
    
    content += '=== WRITING ANALYTICS ===\n';
    content += `Words: ${wordCount.textContent}\n`;
    content += `Characters: ${charCount.textContent}\n`;
    content += `Sentences: ${sentenceCount.textContent}\n`;
    content += `Average Sentence Length: ${avgSentenceLength.textContent} words\n`;
    content += `Reading Time: ${readingTime.textContent}\n\n`;
    
    content += '=== OVERALL SUMMARY ===\n';
    summary.forEach((point, i) => {
        content += `${i + 1}. ${point}\n`;
    });
    content += '\n';
    
    content += '=== DETAILED CRITERIA FEEDBACK ===\n';
    results.forEach((result, i) => {
        content += `\n${result}\n`;
    });
    
    content += '\n=== YOUR DRAFT ===\n';
    content += draft;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearDraft() {
    if (draftInput.value.trim() && !confirm('Are you sure you want to clear the draft?')) {
        return;
    }
    
    draftInput.value = '';
    handleDraftInput();
    saveToLocalStorage();
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.textContent = '🌙';
    }
    
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

function saveToLocalStorage() {
    const data = {
        draft: draftInput.value,
        criteria: criteria,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('studentEnglishChecker', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('studentEnglishChecker');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            draftInput.value = data.draft || '';
            criteria = data.criteria || [];
        } catch (e) {
            console.error('Failed to load saved data:', e);
        }
    }
    loadTheme();
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear all data? This will remove your draft, criteria, and settings.')) {
        return;
    }
    
    draftInput.value = '';
    criteria = [];
    localStorage.removeItem('studentEnglishChecker');
    
    renderCriteria();
    handleDraftInput();
    resultsSection.style.display = 'none';
    
    alert('All data cleared successfully');
}
