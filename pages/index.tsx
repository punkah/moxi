import {
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
} from "lucide-react";
import { useState } from "react";
import { AccessibilityIssue, AuditResult } from "../utils/auditFile";

interface AuditResponse {
  success: boolean;
  results?: AuditResult[];
  error?: string;
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      const data: AuditResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to audit repository");
      }

      if (data.success && data.results) {
        setResults(data.results);
        // Expand all files by default
        setExpandedFiles(new Set(data.results.map((result) => result.file)));
      } else {
        throw new Error(data.error || "No results returned");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFileExpansion = (filePath: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedFiles(newExpanded);
  };

  const getTotalIssues = () => {
    return results.reduce((total, result) => total + result.issues.length, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Accessibility Auditor
          </h1>
          <p className="text-lg text-gray-600">
            Audit your React components for accessibility issues using AI
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form aria-label="Describe form"
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="mb-4">
              <label
                htmlFor="repoUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                GitHub Repository URL
              </label>
              <input aria-label="Describe input"
                id="repoUrl"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="input-field"
                disabled={isLoading}
              />
            </div>
            <button aria-label="Button action"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Audit...
                </>
              ) : (
                "Run Audit"
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Audit Results
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Found {getTotalIssues()} accessibility issues across{" "}
                  {results.length} files
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {results.map((result) => (
                  <FileResult
                    key={result.file}
                    result={result}
                    isExpanded={expandedFiles.has(result.file)}
                    onToggle={() => toggleFileExpansion(result.file)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FileResultProps {
  result: AuditResult;
  isExpanded: boolean;
  onToggle: () => void;
}

function FileResult({ result, isExpanded, onToggle }: FileResultProps) {
  const hasIssues = result.issues.length > 0;

  return (
    <div className="bg-white">
      <button aria-label="Button action"
        onClick={onToggle} /* Add focus indicator */
        className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-400 mr-2" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <FileIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="font-medium text-gray-900">{result.file}</span>
          </div>
          <div className="flex items-center">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                hasIssues
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {result.issues.length}{" "}
              {result.issues.length === 1 ? "issue" : "issues"}
            </span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-4">
          {hasIssues ? (
            <div className="space-y-3">
              {result.issues.map((issue, index) => (
                <IssueCard key={index} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No accessibility issues found in this file! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface IssueCardProps {
  issue: AccessibilityIssue;
}

function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-red-800">
              Line {issue.line}
            </span>
          </div>
          <p className="text-sm text-red-700 mb-2">{issue.issue}</p>
          <div className="bg-white rounded border border-red-200 p-3">
            <p className="text-xs font-medium text-gray-700 mb-1">
              Suggestion:
            </p>
            <p className="text-sm text-gray-600">{issue.suggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
