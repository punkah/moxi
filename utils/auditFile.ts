export interface AccessibilityIssue {
  line: number;
  issue: string;
  suggestion: string;
}

export interface AuditResult {
  file: string;
  issues: AccessibilityIssue[];
}

export async function auditFile(
  filePath: string,
  content: string
): Promise<AuditResult> {
  // Mock AI response for now - in a real implementation, this would call Claude/GPT-4
  const mockIssues: AccessibilityIssue[] = [];

  // Simple static analysis for demonstration
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check for common accessibility issues
    if (
      line.includes("<input") &&
      !line.includes("aria-label") &&
      !line.includes("id=")
    ) {
      mockIssues.push({
        line: lineNumber,
        issue: "Input element missing label or aria-label",
        suggestion: "Add aria-label attribute or wrap in a label element",
      });
    }

    if (
      line.includes("<button") &&
      !line.includes("aria-label") &&
      !line.includes("aria-describedby")
    ) {
      mockIssues.push({
        line: lineNumber,
        issue: "Button missing accessible name",
        suggestion:
          "Add aria-label or ensure button has descriptive text content",
      });
    }

    if (line.includes("<img") && !line.includes("alt=")) {
      mockIssues.push({
        line: lineNumber,
        issue: "Image missing alt attribute",
        suggestion: "Add alt attribute with descriptive text",
      });
    }

    if (
      line.includes("onClick") &&
      !line.includes("onKeyDown") &&
      !line.includes("onKeyPress")
    ) {
      mockIssues.push({
        line: lineNumber,
        issue: "Click handler without keyboard support",
        suggestion: "Add onKeyDown handler for keyboard accessibility",
      });
    }

    if (line.includes("tabIndex") && line.includes('tabIndex="-1"')) {
      mockIssues.push({
        line: lineNumber,
        issue: "Element removed from tab order",
        suggestion:
          "Ensure keyboard users can access this element or provide alternative navigation",
      });
    }
  }

  // Add some random mock issues for demonstration
  if (Math.random() > 0.5) {
    mockIssues.push({
      line: Math.floor(Math.random() * lines.length) + 1,
      issue: "Missing focus indicator",
      suggestion: "Add visible focus styles for keyboard navigation",
    });
  }

  if (Math.random() > 0.7) {
    mockIssues.push({
      line: Math.floor(Math.random() * lines.length) + 1,
      issue: "Color contrast may be insufficient",
      suggestion: "Check color contrast ratio meets WCAG AA standards",
    });
  }

  return {
    file: filePath,
    issues: mockIssues,
  };
}

// Mock function for AI-powered auditing (would call Claude/GPT-4)
export async function auditFileWithAI(
  filePath: string,
  content: string
): Promise<AuditResult> {
  const prompt = `You are an accessibility expert. Audit the following React component for accessibility issues based on WCAG 2.1 Level AA. List each issue with line number, description, and suggestion for fix.

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
}`;

  // For now, return mock data
  // In production, this would make an API call to Claude/GPT-4
  return await auditFile(filePath, content);
}
