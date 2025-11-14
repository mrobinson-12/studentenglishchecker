# 📝 Student English Checker

A comprehensive tool for students to get instant feedback on their English writing drafts. This application provides spelling and grammar checks, writing analytics, and AI-powered feedback against custom success criteria using OpenAI's GPT-5-Nano model.

## ✨ Features

### Frontend Features

- **Draft Input Area**
  - Large textarea for writing or pasting drafts
  - Upload .txt files
  - Download drafts as .txt files
  - Clear draft functionality with confirmation
  - Autosave to browser localStorage

- **Live Writing Analytics** (Real-time, Client-side)
  - Word count
  - Character count
  - Sentence count
  - Average sentence length
  - Longest sentence length
  - Estimated reading time (based on 225 words/minute)

- **Spelling & Grammar Feedback** (Client-side)
  - Detection of overly long sentences (>30 words)
  - Repeated word detection
  - Passive voice pattern detection
  - Basic spelling checks
  - Highlighted issues with detailed explanations

- **Word Frequency Analysis**
  - Top 10 most common words (excluding stopwords)
  - Visual bar chart representation

- **Sentence Breakdown Table**
  - List of all sentences with word counts
  - Flags for long sentences
  - Easy identification of problematic sentences

- **Success Criteria Builder**
  - Add, edit, and delete custom success criteria
  - Support for up to 15 criteria
  - Persistent storage in localStorage

- **AI-Powered Feedback** (Backend)
  - Analysis against custom success criteria
  - Four-level rating system:
    - 🟢 **Exceeding**: Outstanding achievement
    - 🔵 **Accomplished**: Goal met successfully
    - 🟠 **Developing**: Progress made, improvement needed
    - 🔴 **Not Evident**: Not demonstrated
  - Short, actionable feedback for each criterion
  - Overall summary with improvement suggestions

- **Additional Features**
  - Light/Dark mode toggle (saves preference)
  - Export feedback as text file
  - Responsive design (works on tablets and laptops)
  - Clean, student-friendly interface

### Backend Features

- Express.js REST API
- OpenAI GPT-5-Nano integration
- Two main endpoints:
  - `POST /api/analyse` - Full criteria-based analysis
  - `POST /api/quick-check` - Quick overall feedback
- Environment-based configuration
- Error handling and validation
- CORS support

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studentenglishchecker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   # Open .env in your text editor and replace 'your_api_key_here' with your actual key
   ```

   Your `.env` file should look like:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📖 Usage Guide

### Writing Your Draft

1. Type or paste your English draft into the main textarea
2. Or upload a `.txt` file using the "Upload .txt" button
3. Watch as live analytics update automatically

### Analyzing Your Writing

1. **View Real-time Feedback**
   - Analytics update as you type
   - Grammar and spelling issues are detected automatically
   - See word frequency and sentence breakdown

2. **Add Success Criteria**
   - Type a criterion in the input field (e.g., "Uses varied sentence structures")
   - Click "Add" or press Enter
   - Add multiple criteria (up to 15)
   - Edit or delete criteria as needed

3. **Get AI Feedback**
   - Click "Check Against Criteria (AI)"
   - Wait for analysis (may take 10-30 seconds)
   - View detailed ratings and feedback for each criterion
   - Read the overall summary for key improvement areas

4. **Export Your Work**
   - Download your draft as `.txt`
   - Export feedback report including all analytics and AI feedback

### Tips for Best Results

- **Write complete sentences** for better analytics
- **Add specific criteria** that match your assignment requirements
- **Be patient** with AI analysis - it may take a moment
- **Review all feedback** critically - use your judgment

## 🔧 Technical Details

### Project Structure

```
root/
├── index.html              # Main HTML structure
├── style.css               # Complete styling with themes
├── script.js               # Frontend JavaScript logic
├── backend/
│   ├── server.js          # Express server
│   ├── routes/
│   │   └── analyse.js     # API route handlers
│   ├── utils/
│   │   └── openaiClient.js # OpenAI integration
│   ├── package.json       # Dependencies and scripts
│   └── .env.example       # Environment template
├── assets/                 # (Optional) Images/icons
└── README.md              # This file
```

### API Endpoints

#### POST /api/analyse
Analyzes a draft against success criteria.

**Request Body:**
```json
{
  "draft": "Your draft text here...",
  "criteria": [
    "Uses varied sentence structures",
    "Includes supporting evidence",
    "Has clear topic sentences"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "criteria": [
      {
        "criterionNumber": 1,
        "criterion": "Uses varied sentence structures",
        "rating": "Accomplished",
        "feedback": "Good variety of simple and complex sentences throughout."
      }
    ],
    "summary": [
      "Strong use of varied sentence structures",
      "Consider adding more transitional phrases",
      "Evidence is well-integrated"
    ]
  }
}
```

#### POST /api/quick-check
Provides quick overall feedback.

**Request Body:**
```json
{
  "draft": "Your draft text here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "impression": "Well-written draft with clear structure.",
    "strengths": [
      "Clear thesis statement",
      "Good use of evidence",
      "Logical organization"
    ],
    "improvements": [
      "Vary sentence length more",
      "Add more transitional phrases",
      "Strengthen conclusion"
    ]
  }
}
```

#### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-14T10:12:03.486Z",
  "hasApiKey": true
}
```

### Frontend Technology

- **Vanilla JavaScript** - No frameworks required
- **Local Storage API** - For autosave and persistence
- **Fetch API** - For backend communication
- **CSS Variables** - For theming
- **Responsive Design** - Mobile-friendly layout

### Backend Technology

- **Express.js** - Web framework
- **OpenAI SDK** - Official Node.js client
- **dotenv** - Environment configuration
- **cors** - Cross-origin support

## 🔒 Security & Privacy

### Important Security Notes

- **Never commit your `.env` file** to version control
- The `.env.example` file is provided as a template only
- Your OpenAI API key should be kept private
- Add `.env` to your `.gitignore` (already configured)

### Data Privacy

- All drafts are processed locally in the browser
- Only when using AI features is data sent to OpenAI's servers
- No drafts are stored on the backend server
- localStorage data stays on your device only

## 🐛 Troubleshooting

### Server won't start
- Make sure you're in the `backend` directory
- Check that Node.js is installed: `node --version`
- Verify dependencies are installed: `npm install`

### "Invalid API key" error
- Ensure your `.env` file exists in the `backend` directory
- Check that your API key is correct
- Verify there are no extra spaces in the `.env` file

### AI analysis fails
- Check your internet connection
- Verify your OpenAI API key is valid
- Check the browser console for errors
- Ensure the backend server is running

### Draft not saving
- Check browser localStorage is enabled
- Try a different browser
- Check browser console for errors

## 🎯 Future Enhancements

Potential features for future versions:

- Multiple language support
- Advanced grammar checking with AI
- Plagiarism detection
- Citation checker
- Export to PDF with formatting
- Collaborative editing
- Teacher dashboard for class management
- Historical draft comparison

## 📄 License

MIT License - Feel free to use this project for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

If you encounter any issues or have questions, please:
1. Check this README thoroughly
2. Review the troubleshooting section
3. Open an issue on the repository

## ⚠️ Important Notes

- This tool uses OpenAI's API which may incur costs based on usage
- The GPT-5-Nano model is used for efficiency and cost-effectiveness
- Always review AI feedback critically - it's meant to assist, not replace human judgment
- Keep your API keys secure and never share them

---

Built with ❤️ for students | Powered by OpenAI GPT-5-Nano
