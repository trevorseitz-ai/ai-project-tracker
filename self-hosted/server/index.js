import express from "express";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";
import {
  commitUpdateToProjects,
  validateAgentUpdatePayload,
  normalizeAgentUpdate,
  getProjectStatus,
} from "../shared/projectLogic.js";
import { isValidProject, normalizeImportedProjects } from "../shared/projectsSchema.js";
import { readProjects, writeProjects } from "./fileStorage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

export function getAgentKey() {
  return (
    process.env.AGENT_KEY?.trim() ||
    process.env.VITE_AGENT_KEY?.trim() ||
    "dev-agent-key"
  );
}

function validateProjectsList(projects) {
  if (!Array.isArray(projects) || projects.length === 0) return false;
  return projects.every(isValidProject);
}

export function createApp({ staticDir } = {}) {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await readProjects();
      res.json(projects);
    } catch {
      res.status(500).json({ error: "Failed to load projects." });
    }
  });

  app.put("/api/projects", async (req, res) => {
    try {
      const projects = normalizeImportedProjects(req.body);
      if (!validateProjectsList(projects)) {
        return res.status(400).json({ error: "Invalid projects payload." });
      }
      await writeProjects(projects);
      res.json({ message: "Projects saved.", count: projects.length });
    } catch (err) {
      res.status(400).json({ error: err.message || "Invalid projects payload." });
    }
  });

  app.post("/api/project-update", async (req, res) => {
    const agentKey = req.get("X-Agent-Key");
    if (!agentKey || agentKey !== getAgentKey()) {
      return res.status(401).json({ error: "Invalid or missing agent key." });
    }

    const validation = validateAgentUpdatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const update = normalizeAgentUpdate(req.body);
      const projects = await readProjects();
      const next = commitUpdateToProjects(projects, update, update.model_used);
      await writeProjects(next);
      res.json({ message: "Update received successfully." });
    } catch {
      res.status(500).json({ error: "Failed to save update." });
    }
  });

  app.get("/api/project-status", async (req, res) => {
    const agentKey = req.get("X-Agent-Key");
    if (!agentKey || agentKey !== getAgentKey()) {
      return res.status(401).json({ error: "Invalid or missing agent key." });
    }

    const projectName = req.query.project;
    if (!projectName || typeof projectName !== "string") {
      return res.status(400).json({ error: "Query parameter project is required." });
    }

    const projects = await readProjects();
    const status = getProjectStatus(projects, projectName);
    if (!status) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json(status);
  });

  app.get("/api/project/:name/updates", async (req, res) => {
    const agentKey = req.get("X-Agent-Key");
    if (!agentKey || agentKey !== getAgentKey()) {
      return res.status(401).json({ error: "Invalid or missing agent key." });
    }

    const projects = await readProjects();
    const project = projects.find(
      p => p.name.toLowerCase() === decodeURIComponent(req.params.name).toLowerCase()
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json({
      project_name: project.name,
      status: project.status,
      updates: project.updates,
    });
  });

  if (staticDir) {
    app.use(express.static(staticDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
  }

  return app;
}

export async function startServer() {
  const port = Number(process.env.PORT || (isProd ? 3000 : 3001));
  const isProd = process.env.NODE_ENV === "production";
  const staticDir = isProd ? path.join(__dirname, "../dist") : null;
  const app = createApp({ staticDir });

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      console.log(
        isProd
          ? `AI Project Tracker running at http://localhost:${port}`
          : `API server listening on http://localhost:${port}`
      );
      resolve(server);
    });
  });
}

if (process.argv[1]) {
  const isMain = import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
  if (isMain) {
    startServer();
  }
}
