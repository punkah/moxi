import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import os from "os";
import path from "path";
import { simpleGit, SimpleGit } from "simple-git";
import { auditFileWithAI, AuditResult } from "../../utils/auditFile";
import { getComponentFiles } from "../../utils/getComponentFiles";

interface AuditRequest {
  repoUrl: string;
}

interface AuditResponse {
  success: boolean;
  results?: AuditResult[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuditResponse>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { repoUrl }: AuditRequest = req.body;

    if (!repoUrl) {
      return res
        .status(400)
        .json({ success: false, error: "Repository URL is required" });
    }

    // Validate GitHub URL
    if (!repoUrl.includes("github.com")) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Please provide a valid GitHub repository URL",
        });
    }

    // Create temporary directory for cloning
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "audit-"));

    try {
      // Clone the repository
      const git: SimpleGit = simpleGit();
      await git.clone(repoUrl, tempDir);

      // Get component files
      const componentFiles = await getComponentFiles(tempDir);

      if (componentFiles.length === 0) {
        return res.status(404).json({
          success: false,
          error:
            "No component files found in /components or /pages directories",
        });
      }

      // Audit each file
      const auditPromises = componentFiles.map((file) =>
        auditFileWithAI(file.path, file.content)
      );

      const results = await Promise.all(auditPromises);

      // Clean up temporary directory
      await fs.rm(tempDir, { recursive: true, force: true });

      return res.status(200).json({
        success: true,
        results,
      });
    } catch (error) {
      // Clean up on error
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error("Failed to clean up temp directory:", cleanupError);
      }

      throw error;
    }
  } catch (error) {
    console.error("Audit error:", error);

    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred",
    });
  }
}
