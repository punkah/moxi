# AI Accessibility Auditor

A Next.js TypeScript application that audits React components for accessibility issues using AI. The app clones GitHub repositories, analyzes component files, and provides detailed accessibility recommendations based on WCAG 2.1 Level AA standards.

## Features

- 🔍 **GitHub Repository Analysis**: Clone and analyze any public GitHub repository
- 🤖 **AI-Powered Auditing**: Uses AI to identify accessibility issues in React components
- 📁 **Smart File Detection**: Automatically finds `.ts`, `.tsx`, `.js`, `.jsx` files in `/components` and `/pages` directories
- 🎯 **Detailed Reporting**: Provides line-by-line accessibility issues with specific suggestions
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 📊 **Collapsible Results**: Interactive file tree view for easy navigation

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend**: Next.js API Routes
- **Git Operations**: simple-git
- **File System**: Node.js fs/promises

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git (for cloning repositories)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-accessibility-auditor
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Enter Repository URL**: Paste a GitHub repository URL (e.g., `https://github.com/username/repository`)

2. **Run Audit**: Click "Run Audit" to start the analysis

3. **Review Results**: The app will:
   - Clone the repository to a temporary directory
   - Scan for component files in `/components` and `/pages` directories
   - Analyze each file for accessibility issues
   - Display results in a collapsible tree view

4. **Fix Issues**: Each issue includes:
   - Line number where the issue occurs
   - Description of the accessibility problem
   - Specific suggestion for fixing the issue

## API Endpoints

### POST `/api/audit`

Analyzes a GitHub repository for accessibility issues.

**Request Body:**
```json
{
  "repoUrl": "https://github.com/username/repository"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "file": "components/LoginForm.tsx",
      "issues": [
        {
          "line": 12,
          "issue": "Missing label on input",
          "suggestion": "Wrap the input in a <label> element or use aria-label."
        }
      ]
    }
  ]
}
```

## Accessibility Issues Detected

The auditor currently checks for:

- ✅ Missing labels on form inputs
- ✅ Buttons without accessible names
- ✅ Images missing alt attributes
- ✅ Click handlers without keyboard support
- ✅ Elements removed from tab order
- ✅ Missing focus indicators
- ✅ Color contrast issues

## Development

### Project Structure

```
├── pages/
│   ├── index.tsx          # Main application page
│   ├── _app.tsx           # App wrapper
│   └── api/
│       └── audit.ts       # API endpoint for auditing
├── utils/
│   ├── getComponentFiles.ts # Utility to find component files
│   └── auditFile.ts       # Accessibility auditing logic
├── styles/
│   └── globals.css        # Global styles with Tailwind
└── package.json
```

### Adding Real AI Integration

To integrate with Claude or GPT-4, replace the mock function in `utils/auditFile.ts`:

```typescript
export async function auditFileWithAI(filePath: string, content: string): Promise<AuditResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are an accessibility expert. Audit the following React component for accessibility issues based on WCAG 2.1 Level AA. List each issue with line number, description, and suggestion for fix.

File: ${filePath}
Content:
${content}

Please respond with a JSON object in this format:
{
  "file": "${filePath}",
  "issues": [
    {
      "line": 12,
      "issue": "Missing label on input",
      "suggestion": "Wrap the input in a <label> element or use aria-label."
    }
  ]
}`
      }]
    })
  })

  const data = await response.json()
  return JSON.parse(data.content[0].text)
}
```

## Environment Variables

Create a `.env.local` file for API keys:

```env
CLAUDE_API_KEY=your_claude_api_key_here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] Support for private repositories
- [ ] Integration with GitHub Actions
- [ ] Export results to PDF/CSV
- [ ] Custom accessibility rule configuration
- [ ] Real-time collaboration features
- [ ] Support for Vue.js and Angular components
