import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_PROJECTS = [
  { id: "seed-alpha", name: "Project Alpha", status: "Active", model: "Claude", updates: [] },
];

export function getDataFilePath() {
  const dataDir = process.env.DATA_DIR || path.join(__dirname, "../data");
  return path.join(dataDir, "projects.json");
}

async function ensureDataDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readProjects() {
  const filePath = getDataFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.projects)) return parsed.projects;
    return [...DEFAULT_PROJECTS];
  } catch (err) {
    if (err.code === "ENOENT") {
      await ensureDataDir(filePath);
      await fs.writeFile(filePath, JSON.stringify(DEFAULT_PROJECTS, null, 2));
      return [...DEFAULT_PROJECTS];
    }
    return [...DEFAULT_PROJECTS];
  }
}

export async function writeProjects(projects) {
  const filePath = getDataFilePath();
  await ensureDataDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(projects, null, 2));
}
