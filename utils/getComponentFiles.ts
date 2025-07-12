import { promises as fs } from "fs";
import path from "path";

export interface ComponentFile {
  path: string;
  content: string;
}

export async function getComponentFiles(
  repoPath: string
): Promise<ComponentFile[]> {
  const componentFiles: ComponentFile[] = [];

  // Directories to search for components
  const searchDirs = ["components", "pages", "src/components", "src/pages"];

  for (const dir of searchDirs) {
    const dirPath = path.join(repoPath, dir);

    try {
      await fs.access(dirPath);
      await scanDirectory(dirPath, componentFiles);
    } catch (error) {
      // Directory doesn't exist, skip
      continue;
    }
  }

  return componentFiles;
}

async function scanDirectory(
  dirPath: string,
  componentFiles: ComponentFile[]
): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await scanDirectory(fullPath, componentFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
        try {
          const content = await fs.readFile(fullPath, "utf-8");
          componentFiles.push({
            path: path.relative(dirPath, fullPath),
            content,
          });
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  }
}
