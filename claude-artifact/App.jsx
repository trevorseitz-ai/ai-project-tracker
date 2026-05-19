import { useState, useEffect } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const TS = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 9);

const UPDATE_TYPES = {
  feature: { label: "Feature Idea", color: "#6EE7B7", icon: "✦" },
  tool: { label: "New Tool", color: "#93C5FD", icon: "⚙" },
  daily: { label: "Daily Log", color: "#FDE68A", icon: "◉" },
  blocker: { label: "Blocker", color: "#FCA5A5", icon: "⚠" },
  progress: { label: "Progress", color: "#C4B5FD", icon: "▲" },
};

const STATUS_COLORS = {
  Active: "#6EE7B7",
  Blocked: "#FCA5A5",
  Stalled: "#FDE68A",
  Complete: "#93C5FD",
};

const REPORTER_PROMPT = `You are a project update reporter for an AI project tracker.
When the user describes their work session, parse it and respond ONLY with a JSON object using this exact schema:

{
  "type": "feature|tool|daily|blocker|progress",
  "project": "project name as stated or 'Unknown'",
  "summary": "one clear sentence summary",
  "detail": "full description of the update",
  "model_used": "AI model or service mentioned (or null)",
  "status": "Active|Blocked|Stalled|Complete",
  "blockers": ["list any blockers or empty array"],
  "next_steps": ["list any next steps or empty array"],
  "confidence": 0.0-1.0,
  "missing_fields": ["list any fields you are uncertain about"]
}

Be concise. Do not include markdown, explanation, or backticks. Output raw JSON only.`;

// ── PUSH MODE: Tracker has context, pushes a pre-configured reporter to the agent
const PUSH_AGENT_SYSTEM = `You are an expert AI agent developer. The tracker already knows about this project and is PUSHING a fully pre-configured reporting agent to it.

Generate a Python reporter agent that already knows everything — project name, schema, endpoint — and needs zero setup from the agent that receives it. It should be droppable into any project and work immediately.

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "agent_script": "complete Python script as string with \\n for newlines",
  "agent_summary": "2-3 sentence description of what the agent does",
  "embed_instructions": "one paragraph: exactly how an autonomous agent should import and call this reporter — no human steps",
  "first_update": {
    "type": "feature|tool|daily|blocker|progress",
    "project": "project name",
    "summary": "one sentence: reporter has been deployed to this project",
    "detail": "full description of what was configured and what the agent will now report on",
    "model_used": "AI model or service",
    "status": "Active|Blocked|Stalled|Complete",
    "blockers": [],
    "next_steps": ["first concrete next step"],
    "confidence": 0.95,
    "missing_fields": []
  }
}

The script must:
- Be fully runnable with standard libraries + requests only
- Have ALL config hardcoded from the project info provided (no manual .env setup needed)
- Export a report_update(update_dict) function the host agent can call at any time
- Export a report_session(summary, detail, status, next_steps, blockers) convenience wrapper
- Auto-detect errors and report them as blocker updates
- Include a standalone __main__ block that sends the first_update immediately on first run
- Have no interactive prompts — must run fully headlessly`;

// ── PULL MODE: Tracker spawns a reporter that goes out, gathers context, then sends first update
const PULL_AGENT_SYSTEM = `You are an expert AI agent developer. The tracker is spawning a PULL reporter — an agent that goes OUT to a project it knows nothing about, interviews it, gathers context, then sends a structured first update back.

This reporter must work in two modes:
1. AUTONOMOUS: inspects files, git log, README, package.json/requirements.txt itself
2. HUMAN-IN-LOOP: asks a series of targeted questions if it cannot determine something

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "agent_script": "complete Python script as string with \\n for newlines",
  "agent_summary": "2-3 sentence description of what the pull reporter does",
  "questions_if_human": ["question 1 to ask a human if context is unclear", "question 2", "question 3"],
  "first_update": {
    "type": "progress",
    "project": "Unknown — will be discovered",
    "summary": "Pull reporter deployed and gathering project context",
    "detail": "Reporter has been initialized and will inspect the project to determine current state before sending a real first update",
    "model_used": null,
    "status": "Active",
    "blockers": [],
    "next_steps": ["Reporter will scan project files", "Reporter will send real first update after context gathered"],
    "confidence": 0.5,
    "missing_fields": ["project name", "stack", "current status"]
  }
}

The script must:
- Try to auto-discover: README, git log (last 10 commits), package.json, requirements.txt, .env.example, any TODO files
- Parse what it finds into a structured project summary
- If running autonomously (AUTONOMOUS=true env var), post the gathered update without asking
- If running interactively, print the questions_if_human list and accept stdin answers
- Build the final structured update from gathered context and POST it to TRACKER_URL
- Include clear section comments: DISCOVERY, INTERVIEW, BUILD UPDATE, REPORT`;

// ── PULL INTERVIEW: conversational context gathering for human-in-loop mode
const PULL_INTERVIEW_SYSTEM = `You are a project intake interviewer for an AI project tracker. Your job is to ask targeted questions to gather enough context to create a complete first project update.

You are interviewing a human about their project. Ask ONE question at a time. Be conversational and brief.

When you have enough info to fill all fields, respond with a JSON object (raw, no markdown) starting with "READY:" like:
READY:{"type":"...","project":"...","summary":"...","detail":"...","model_used":"...","status":"...","blockers":[...],"next_steps":[...],"confidence":0.85,"missing_fields":[]}

Until then, respond with a plain conversational question. Start by asking the project name and what it does.`;

// ── PREP AGENT: audits a project and prepares it for an incoming reporter
const PREP_AGENT_SYSTEM = `You are an expert AI project preparation agent. Your job is to audit a project and produce everything needed to make it fully compliant with an incoming reporter agent.

Given project information, you will:
1. Run a compliance audit across 6 categories
2. Generate remediation actions for anything failing
3. Produce a .tracker-config.json handshake file the reporter will read on arrival
4. Generate a complete Python prep agent script that performs all remediation autonomously
5. Produce a compliance update for the tracker board

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "audit": {
    "overall_score": 0-100,
    "categories": [
      {
        "name": "Identity",
        "description": "Project has a clear name, purpose statement, and owner",
        "status": "pass|warn|fail",
        "score": 0-100,
        "findings": ["finding 1", "finding 2"],
        "fixes": ["exact fix 1", "exact fix 2"]
      },
      {
        "name": "Documentation",
        "description": "README exists, is meaningful, describes stack and goals",
        "status": "pass|warn|fail",
        "score": 0-100,
        "findings": [],
        "fixes": []
      },
      {
        "name": "Version Control",
        "description": "Git initialized, commits are descriptive, branch is named",
        "status": "pass|warn|fail",
        "score": 0-100,
        "findings": [],
        "fixes": []
      },
      {
        "name": "Stack Legibility",
        "description": "Dependencies declared, AI model identified, environment vars documented",
        "status": "pass|warn|fail",
        "score": 0-100,
        "findings": [],
        "fixes": []
      },
      {
        "name": "Status Clarity",
        "description": "Current project status is determinable, blockers are surfaced",
        "status": "pass|warn|fail",
        "score": 0-100,
        "findings": [],
        "fixes": []
      },
      {
        "name": "Reporter Readiness",
        "description": ".tracker-config.json exists or can be created, TRACKER_URL is set",
        "status": "pass|warn|fail",
        "score": 0-100,
        "findings": [],
        "fixes": []
      }
    ]
  },
  "handshake_file": {
    "project_name": "string",
    "description": "string",
    "model_used": "string",
    "stack": ["item1", "item2"],
    "status": "Active|Blocked|Stalled|Complete",
    "blockers": [],
    "next_steps": ["step1"],
    "tracker_url": "https://your-tracker.example.com/api/update",
    "agent_key": "prep-generated-key",
    "prepped_at": "ISO timestamp",
    "prep_version": "1.0",
    "reporter_mode": "push|pull|either"
  },
  "prep_script": "complete Python prep agent script as string with \\n for newlines",
  "prep_summary": "2-3 sentences describing what the prep agent will do and fix",
  "human_actions_required": ["action 1 that cannot be automated", "action 2"],
  "compliance_update": {
    "type": "progress",
    "project": "project name",
    "summary": "Prep agent completed compliance audit — project ready for reporter",
    "detail": "full description of what was audited, what was fixed, what the reporter will find",
    "model_used": null,
    "status": "Active",
    "blockers": [],
    "next_steps": ["Deploy reporter agent"],
    "confidence": 0.9,
    "missing_fields": []
  }
}

The prep_script must:
- Be fully runnable with standard libraries only (os, json, subprocess, pathlib, datetime)
- Section 1 AUDIT: check for README, git init, requirements/package.json, .env.example, TODO
- Section 2 REMEDIATE: create missing files with sensible stubs, never overwrite existing content
- Section 3 HANDSHAKE: write .tracker-config.json to project root with all discovered/inferred values
- Section 4 REPORT: POST the compliance_update to TRACKER_URL
- Work silently if AUTONOMOUS=true, print progress if interactive
- Never destructively modify existing files — only create or append`;


const REQUIRED_FIELDS = ["project", "summary", "type", "status"];

function detectMissing(update) {
  const issues = [];
  if (!update.project || update.project === "Unknown") issues.push("Project name is missing or unclear.");
  if (!update.summary || update.summary.length < 10) issues.push("Summary seems too brief.");
  if (update.confidence < 0.6) issues.push("Low confidence parse — please review all fields.");
  if (update.missing_fields?.length) issues.push(...update.missing_fields.map(f => `Field uncertain: "${f}"`));
  return issues;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Tag({ type }) {
  const t = UPDATE_TYPES[type] || UPDATE_TYPES.daily;
  return (
    <span style={{
      background: t.color + "22", color: t.color, border: `1px solid ${t.color}44`,
      borderRadius: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px",
      letterSpacing: "0.08em", textTransform: "uppercase"
    }}>{t.icon} {t.label}</span>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || "#aaa";
  return (
    <span style={{
      background: c + "18", color: c, border: `1px solid ${c}55`,
      borderRadius: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px",
    }}>{status}</span>
  );
}

function ConfidenceMeter({ value }) {
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 80 ? "#6EE7B7" : pct >= 55 ? "#FDE68A" : "#FCA5A5";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ height: 4, width: 60, background: "#ffffff18", borderRadius: 9 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 9, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 10, color, fontWeight: 600 }}>{pct}%</span>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("board");
  const [projects, setProjects] = useState([
    { id: uid(), name: "Project Alpha", status: "Active", model: "Claude", updates: [] },
  ]);
  const [rawInput, setRawInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedUpdate, setParsedUpdate] = useState(null);
  const [parseIssues, setParseIssues] = useState([]);
  const [editFields, setEditFields] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeLog, setActiveLog] = useState(null);
  const [toast, setToast] = useState(null);
  const [schemaTab, setSchemaTab] = useState("push"); // push | pull | ref
  // Push mode
  const [pushForm, setPushForm] = useState({ projectName: "", description: "", stack: "", model: "", stage: "new", existingContext: "", agentType: "autonomous" });
  const [pushResult, setPushResult] = useState(null);
  const [pushing, setPushing] = useState(false);
  const [pushScriptCopied, setPushScriptCopied] = useState(false);
  // Pull mode
  const [pullMode, setPullMode] = useState("autonomous"); // autonomous | human
  const [pullResult, setPullResult] = useState(null);
  const [pulling, setPulling] = useState(false);
  const [pullScriptCopied, setPullScriptCopied] = useState(false);
  // Pull human interview
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [interviewInput, setInterviewInput] = useState("");
  const [interviewing, setInterviewing] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  // Prep agent
  const [prepForm, setPrepForm] = useState({ projectName: "", description: "", stack: "", model: "", status: "Active", blockers: "", knownIssues: "", agentMode: "autonomous" });
  const [prepping, setPrepping] = useState(false);
  const [prepResult, setPrepResult] = useState(null);
  const [prepScriptCopied, setPrepScriptCopied] = useState(false);
  const [handshakeCopied, setHandshakeCopied] = useState(false);

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  }

  async function parseUpdate() {
    if (!rawInput.trim()) return;
    setParsing(true);
    setParsedUpdate(null);
    setParseIssues([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: REPORTER_PROMPT,
          messages: [{ role: "user", content: rawInput }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      parsed.id = uid();
      parsed.timestamp = TS();
      const issues = detectMissing(parsed);
      setParsedUpdate(parsed);
      setParseIssues(issues);
      setEditFields({ ...parsed });
    } catch (e) {
      showToast("Parse failed — check input or API", false);
    }
    setParsing(false);
  }

  function commitUpdate() {
    const update = { ...editFields, id: parsedUpdate.id, timestamp: parsedUpdate.timestamp };
    const projName = update.project;
    setProjects(prev => {
      let found = prev.find(p => p.name.toLowerCase() === projName?.toLowerCase());
      if (!found) {
        found = { id: uid(), name: projName || "Unknown", status: update.status || "Active", model: update.model_used || "Unknown", updates: [] };
        return [...prev.map(p => ({ ...p })), { ...found, updates: [update], status: update.status || "Active" }];
      }
      return prev.map(p => p.name.toLowerCase() === projName?.toLowerCase()
        ? { ...p, status: update.status || p.status, model: update.model_used || p.model, updates: [update, ...p.updates] }
        : p
      );
    });
    setParsedUpdate(null);
    setRawInput("");
    setParseIssues([]);
    showToast("Update logged ✓");
  }

  function addProject() {
    if (!newProjectName.trim()) return;
    setProjects(prev => [...prev, { id: uid(), name: newProjectName, status: "Active", model: "Unknown", updates: [] }]);
    setNewProjectName("");
  }

  function copyPrompt() {
    navigator.clipboard.writeText(REPORTER_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const allBlockers = projects.filter(p => p.status === "Blocked");
  const totalUpdates = projects.reduce((a, p) => a + p.updates.length, 0);

  // ── PUSH: tracker has context, generates pre-configured reporter
  async function runPush() {
    if (!pushForm.projectName.trim() || !pushForm.description.trim()) return;
    setPushing(true); setPushResult(null);
    const userMsg = `Project: ${pushForm.projectName}
Description: ${pushForm.description}
Stack: ${pushForm.stack || "not specified"}
Model: ${pushForm.model || "not specified"}
Stage: ${pushForm.stage === "new" ? "brand new" : "in progress"}
Agent type: ${pushForm.agentType}
${pushForm.stage === "existing" ? `Existing context: ${pushForm.existingContext}` : ""}
TRACKER_URL: https://your-tracker.example.com/api/update
Generate the push reporter now.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: PUSH_AGENT_SYSTEM, messages: [{ role: "user", content: userMsg }] }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      parsed.first_update.id = uid(); parsed.first_update.timestamp = TS();
      setPushResult(parsed);
      commitToBoard(parsed.first_update, pushForm.model);
      showToast("Push reporter ready + first update logged ✓");
    } catch (e) { showToast("Generation failed", false); }
    setPushing(false);
  }

  // ── PULL autonomous: generate a self-discovering reporter script
  async function runPullAutonomous() {
    setPulling(true); setPullResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: PULL_AGENT_SYSTEM,
          messages: [{ role: "user", content: "Generate the autonomous pull reporter. TRACKER_URL=https://your-tracker.example.com/api/update" }] }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      parsed.first_update.id = uid(); parsed.first_update.timestamp = TS();
      setPullResult(parsed);
      commitToBoard(parsed.first_update, null);
      showToast("Pull reporter generated ✓");
    } catch (e) { showToast("Generation failed", false); }
    setPulling(false);
  }

  // ── PULL human interview: conversational intake
  async function startInterview() {
    setInterviewMessages([]);
    setInterviewDone(false);
    setInterviewing(true);
    // Send first message from interviewer
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, system: PULL_INTERVIEW_SYSTEM,
        messages: [{ role: "user", content: "Start the interview." }] }),
    });
    const data = await res.json();
    const q = data.content?.map(b => b.text || "").join("") || "";
    setInterviewMessages([{ role: "assistant", content: q }]);
    setInterviewing(false);
  }

  async function sendInterviewMessage() {
    if (!interviewInput.trim()) return;
    const userMsg = interviewInput.trim();
    setInterviewInput("");
    const updated = [...interviewMessages, { role: "user", content: userMsg }];
    setInterviewMessages(updated);
    setInterviewing(true);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 500, system: PULL_INTERVIEW_SYSTEM,
        messages: updated }),
    });
    const data = await res.json();
    const reply = data.content?.map(b => b.text || "").join("") || "";
    if (reply.startsWith("READY:")) {
      try {
        const parsed = JSON.parse(reply.slice(6).trim());
        parsed.id = uid(); parsed.timestamp = TS();
        commitToBoard(parsed, parsed.model_used);
        setInterviewMessages([...updated, { role: "assistant", content: "✓ All set — I have enough context. First update has been logged to the board.", done: true }]);
        setInterviewDone(true);
      } catch { setInterviewMessages([...updated, { role: "assistant", content: reply }]); }
    } else {
      setInterviewMessages([...updated, { role: "assistant", content: reply }]);
    }
    setInterviewing(false);
  }

  function commitToBoard(update, model) {
    setProjects(prev => {
      const name = update.project || "Unknown";
      const found = prev.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (!found) return [...prev, { id: uid(), name, status: update.status || "Active", model: model || update.model_used || "Unknown", updates: [update] }];
      return prev.map(p => p.name.toLowerCase() === name.toLowerCase()
        ? { ...p, status: update.status || p.status, updates: [update, ...p.updates] } : p);
    });
  }



  // ── PREP: audit project, generate handshake, remediation script, compliance update
  async function runPrep() {
    if (!prepForm.projectName.trim()) return;
    setPrepping(true); setPrepResult(null);
    const userMsg = `Project name: ${prepForm.projectName}
Description: ${prepForm.description || "not provided"}
Stack / tools: ${prepForm.stack || "not specified"}
AI model: ${prepForm.model || "not specified"}
Current status: ${prepForm.status}
Known blockers: ${prepForm.blockers || "none stated"}
Known issues or gaps: ${prepForm.knownIssues || "none stated"}
Agent mode preference: ${prepForm.agentMode}
Timestamp: ${TS()}

Run the full compliance audit and generate the prep agent now.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 5000, system: PREP_AGENT_SYSTEM, messages: [{ role: "user", content: userMsg }] }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      parsed.compliance_update.id = uid();
      parsed.compliance_update.timestamp = TS();
      setPrepResult(parsed);
      commitToBoard(parsed.compliance_update, prepForm.model);
      showToast("Prep complete — compliance update logged ✓");
    } catch (e) { showToast("Prep agent generation failed", false); }
    setPrepping(false);
  }

  const S = {
    app: {
      minHeight: "100vh", background: "#0A0C10",
      fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      color: "#E2E8F0",
    },
    header: {
      borderBottom: "1px solid #1E2530",
      padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#0D1017",
    },
    logo: { fontSize: 15, fontWeight: 700, letterSpacing: "0.15em", color: "#6EE7B7" },
    nav: { display: "flex", gap: 2 },
    navBtn: (active) => ({
      background: active ? "#6EE7B718" : "transparent",
      border: active ? "1px solid #6EE7B733" : "1px solid transparent",
      color: active ? "#6EE7B7" : "#64748B",
      borderRadius: 6, padding: "6px 14px", fontSize: 12,
      fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.08em",
      fontWeight: active ? 700 : 400, transition: "all 0.15s",
    }),
    main: { padding: "28px", maxWidth: 1100, margin: "0 auto" },
    card: {
      background: "#0D1017", border: "1px solid #1E2530",
      borderRadius: 10, padding: "20px",
    },
    sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#475569", textTransform: "uppercase", marginBottom: 14 },
    input: {
      width: "100%", background: "#060810", border: "1px solid #1E2530",
      borderRadius: 7, color: "#E2E8F0", fontFamily: "inherit", fontSize: 13,
      padding: "10px 14px", outline: "none", boxSizing: "border-box",
      resize: "vertical",
    },
    btn: (variant = "primary") => ({
      background: variant === "primary" ? "#6EE7B7" : variant === "danger" ? "#FCA5A5" : "#1E2530",
      color: variant === "primary" ? "#0A0C10" : variant === "danger" ? "#0A0C10" : "#E2E8F0",
      border: "none", borderRadius: 7, padding: "9px 18px", fontFamily: "inherit",
      fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em",
      transition: "opacity 0.15s",
    }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14 },
    projCard: (status) => ({
      background: "#0D1017", border: `1px solid ${(STATUS_COLORS[status] || "#aaa") + "33"}`,
      borderRadius: 10, padding: "16px 18px", cursor: "pointer",
      transition: "border-color 0.2s",
    }),
    updateRow: {
      borderBottom: "1px solid #1E2530", paddingBottom: 14, marginBottom: 14,
    },
    issueBox: {
      background: "#FCA5A511", border: "1px solid #FCA5A533",
      borderRadius: 7, padding: "12px 16px", marginBottom: 14,
    },
    promptBox: {
      background: "#060810", border: "1px solid #1E2530",
      borderRadius: 7, padding: "14px", fontFamily: "inherit",
      fontSize: 11, color: "#94A3B8", whiteSpace: "pre-wrap", lineHeight: 1.7,
    },
    statChip: {
      background: "#1E2530", borderRadius: 7, padding: "8px 14px",
      display: "inline-flex", flexDirection: "column", gap: 2,
    },
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.ok ? "#6EE7B7" : "#FCA5A5",
          color: "#0A0C10", borderRadius: 7, padding: "10px 18px",
          fontSize: 12, fontWeight: 700, boxShadow: "0 4px 24px #0008",
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>◈ AI PROJECT TRACKER</div>
        <nav style={S.nav}>
          {["board", "submit", "reporter", "prep", "agent"].map(t => (
            <button key={t} style={S.navBtn(tab === t)} onClick={() => setTab(t)}>
              {t === "board" ? "BOARD" : t === "submit" ? "LOG UPDATE" : t === "reporter" ? "REPORTER" : t === "prep" ? "PREP AGENT" : "AGENT API"}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={S.statChip}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#6EE7B7" }}>{projects.length}</span>
            <span style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>PROJECTS</span>
          </div>
          <div style={S.statChip}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#93C5FD" }}>{totalUpdates}</span>
            <span style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>UPDATES</span>
          </div>
          {allBlockers.length > 0 && (
            <div style={{ ...S.statChip, borderLeft: "2px solid #FCA5A5" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#FCA5A5" }}>{allBlockers.length}</span>
              <span style={{ fontSize: 9, color: "#FCA5A5", letterSpacing: "0.1em" }}>BLOCKED</span>
            </div>
          )}
        </div>
      </div>

      <div style={S.main}>

        {/* ── BOARD TAB ── */}
        {tab === "board" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={S.sectionTitle}>PROJECT STATUS BOARD</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...S.input, width: 200, padding: "6px 12px", fontSize: 12 }}
                  placeholder="New project name…"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addProject()}
                />
                <button style={S.btn()} onClick={addProject}>+ ADD</button>
              </div>
            </div>

            <div style={S.grid}>
              {projects.map(proj => (
                <div key={proj.id} style={S.projCard(proj.status)} onClick={() => { setActiveLog(proj.id); setTab("board"); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <StatusBadge status={proj.status} />
                    <span style={{ fontSize: 10, color: "#475569" }}>{proj.model}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{proj.name}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{proj.updates.length} update{proj.updates.length !== 1 ? "s" : ""}</div>
                  {proj.updates[0] && (
                    <div style={{ marginTop: 10, borderTop: "1px solid #1E2530", paddingTop: 10 }}>
                      <Tag type={proj.updates[0].type} />
                      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6, lineHeight: 1.5 }}>
                        {proj.updates[0].summary?.slice(0, 80)}{proj.updates[0].summary?.length > 80 ? "…" : ""}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Expanded log */}
            {activeLog && (() => {
              const proj = projects.find(p => p.id === activeLog);
              if (!proj) return null;
              return (
                <div style={{ ...S.card, marginTop: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{proj.name}</span>
                      <StatusBadge status={proj.status} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {Object.keys(STATUS_COLORS).map(s => (
                        <button key={s} style={{ ...S.btn("ghost"), fontSize: 10, padding: "4px 10px" }}
                          onClick={() => setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, status: s } : p))}>
                          {s}
                        </button>
                      ))}
                      <button style={{ ...S.btn("ghost"), fontSize: 10, padding: "4px 10px" }} onClick={() => setActiveLog(null)}>✕ Close</button>
                    </div>
                  </div>
                  {proj.updates.length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>No updates yet.</div>}
                  {proj.updates.map(u => (
                    <div key={u.id} style={S.updateRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <Tag type={u.type} />
                        <ConfidenceMeter value={u.confidence} />
                        <span style={{ fontSize: 10, color: "#475569", marginLeft: "auto" }}>
                          {new Date(u.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{u.summary}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{u.detail}</div>
                      {u.next_steps?.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {u.next_steps.map((s, i) => (
                            <span key={i} style={{ background: "#6EE7B711", color: "#6EE7B7", borderRadius: 4, fontSize: 10, padding: "2px 8px" }}>→ {s}</span>
                          ))}
                        </div>
                      )}
                      {u.blockers?.length > 0 && (
                        <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {u.blockers.map((b, i) => (
                            <span key={i} style={{ background: "#FCA5A511", color: "#FCA5A5", borderRadius: 4, fontSize: 10, padding: "2px 8px" }}>⚠ {b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── SUBMIT TAB ── */}
        {tab === "submit" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={S.sectionTitle}>PASTE AI UPDATE</div>
              <div style={S.card}>
                <textarea
                  style={{ ...S.input, minHeight: 160 }}
                  placeholder={"Paste any raw update from ChatGPT, Gemini, Claude, etc.\n\nExample:\n'Today I added a new web search tool to the agent. It uses SerpAPI. I ran out of API credits at the end so I couldn't finish testing. Next step is to top up and run the eval suite.'"}
                  value={rawInput}
                  onChange={e => setRawInput(e.target.value)}
                />
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button style={S.btn()} onClick={parseUpdate} disabled={parsing}>
                    {parsing ? "PARSING…" : "⟳ PARSE UPDATE"}
                  </button>
                  <button style={S.btn("ghost")} onClick={() => { setRawInput(""); setParsedUpdate(null); setParseIssues([]); }}>CLEAR</button>
                </div>
              </div>

              {parseIssues.length > 0 && (
                <div style={{ ...S.issueBox, marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", marginBottom: 8, letterSpacing: "0.1em" }}>⚠ REVIEW NEEDED</div>
                  {parseIssues.map((issue, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#FCA5A5", marginBottom: 4 }}>• {issue}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              {parsedUpdate && (
                <div>
                  <div style={S.sectionTitle}>PARSED — REVIEW & EDIT</div>
                  <div style={S.card}>
                    {[
                      { key: "project", label: "Project" },
                      { key: "type", label: "Type", options: Object.keys(UPDATE_TYPES) },
                      { key: "status", label: "Status", options: Object.keys(STATUS_COLORS) },
                      { key: "model_used", label: "AI Model" },
                      { key: "summary", label: "Summary", multiline: true },
                      { key: "detail", label: "Detail", multiline: true },
                    ].map(({ key, label, options, multiline }) => (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 4 }}>{label.toUpperCase()}</div>
                        {options ? (
                          <select style={{ ...S.input, padding: "6px 10px" }} value={editFields[key] || ""}
                            onChange={e => setEditFields(f => ({ ...f, [key]: e.target.value }))}>
                            {options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <textarea rows={multiline ? 3 : 1} style={{ ...S.input, resize: multiline ? "vertical" : "none" }}
                            value={editFields[key] || ""}
                            onChange={e => setEditFields(f => ({ ...f, [key]: e.target.value }))} />
                        )}
                      </div>
                    ))}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                      <ConfidenceMeter value={parsedUpdate.confidence} />
                      <button style={S.btn()} onClick={commitUpdate}>✓ COMMIT UPDATE</button>
                    </div>
                  </div>
                </div>
              )}
              {!parsedUpdate && !parsing && (
                <div style={{ ...S.card, color: "#475569", fontSize: 12, textAlign: "center", paddingTop: 40, paddingBottom: 40 }}>
                  Paste a raw update on the left,<br />then hit Parse Update to continue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REPORTER TAB ── */}
        {tab === "reporter" && (
          <div>
            {/* Mode selector */}
            <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
              {[
                ["push", "▲ PUSH MODE", "#6EE7B7", "Tracker knows the project — pushes a pre-configured reporter to the agent"],
                ["pull", "▼ PULL MODE", "#C4B5FD", "Tracker spawns a reporter that goes out, finds the project, and reports back"],
                ["ref", "◈ PROMPT REF", "#475569", "Copy the raw reporter schema prompt for use in any AI"],
              ].map(([key, label, color, tip]) => (
                <button key={key} onClick={() => setSchemaTab(key)} style={{
                  background: schemaTab === key ? color + "18" : "transparent",
                  border: `1px solid ${schemaTab === key ? color + "55" : "#1E2530"}`,
                  color: schemaTab === key ? color : "#475569",
                  borderRadius: 7, padding: "10px 18px", fontFamily: "inherit",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em",
                  transition: "all 0.15s", textAlign: "left", flex: 1,
                }}>
                  <div>{label}</div>
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 3, opacity: 0.7, letterSpacing: "0.04em" }}>{tip}</div>
                </button>
              ))}
            </div>

            {/* ── PUSH MODE ── */}
            {schemaTab === "push" && (
              <div style={{ display: "grid", gridTemplateColumns: pushResult ? "1fr 1fr" : "1fr 1fr", gap: 20 }}>
                {/* Form */}
                <div style={S.card}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6EE7B7", letterSpacing: "0.12em", marginBottom: 4 }}>PUSH REPORTER</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 16, lineHeight: 1.7 }}>
                    The tracker already knows this project. It will generate a reporter script with everything hardcoded — project name, schema, endpoint — so the receiving agent drops it in and runs it with zero configuration.
                  </div>
                  {[
                    { key: "projectName", label: "Project Name *", ph: "e.g. Research Agent v2" },
                    { key: "description", label: "What it does *", ph: "What is this project? What problem does it solve?", multi: true },
                    { key: "stack", label: "Stack / Tools", ph: "e.g. Python, LangChain, Pinecone" },
                    { key: "model", label: "AI Model", ph: "e.g. GPT-4o, Claude, Gemini" },
                  ].map(({ key, label, ph, multi }) => (
                    <div key={key} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 4 }}>{label.toUpperCase()}</div>
                      {multi
                        ? <textarea rows={3} style={S.input} placeholder={ph} value={pushForm[key]} onChange={e => setPushForm(f => ({ ...f, [key]: e.target.value }))} />
                        : <input style={{ ...S.input, padding: "8px 12px" }} placeholder={ph} value={pushForm[key]} onChange={e => setPushForm(f => ({ ...f, [key]: e.target.value }))} />}
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 6 }}>STAGE</div>
                      {[["new", "🌱 New"], ["existing", "🔧 In Progress"]].map(([v, l]) => (
                        <button key={v} style={{ ...S.btn(pushForm.stage === v ? "primary" : "ghost"), fontSize: 11, marginRight: 6, marginBottom: 4 }}
                          onClick={() => setPushForm(f => ({ ...f, stage: v }))}>{l}</button>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 6 }}>RECEIVING AGENT TYPE</div>
                      {[["autonomous", "🤖 Autonomous"], ["human", "👤 Human-in-loop"]].map(([v, l]) => (
                        <button key={v} style={{ ...S.btn(pushForm.agentType === v ? "primary" : "ghost"), fontSize: 11, marginRight: 6, marginBottom: 4 }}
                          onClick={() => setPushForm(f => ({ ...f, agentType: v }))}>{l}</button>
                      ))}
                    </div>
                  </div>
                  {pushForm.stage === "existing" && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 4 }}>CURRENT STATE / CONTEXT</div>
                      <textarea rows={3} style={S.input} placeholder="What's already built? Current blockers? Where did you leave off?"
                        value={pushForm.existingContext} onChange={e => setPushForm(f => ({ ...f, existingContext: e.target.value }))} />
                    </div>
                  )}
                  <button style={{ ...S.btn(), width: "100%", padding: 12 }}
                    onClick={runPush} disabled={pushing || !pushForm.projectName || !pushForm.description}>
                    {pushing ? "⟳ GENERATING PUSH REPORTER…" : "▲ GENERATE PUSH REPORTER + LOG FIRST UPDATE"}
                  </button>
                </div>

                {/* Result */}
                <div>
                  {!pushResult && (
                    <div style={{ ...S.card, color: "#475569", fontSize: 12, textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>▲</div>
                      Fill in the project details and generate.<br />The reporter will be pre-configured and ready to drop into any agent.
                    </div>
                  )}
                  {pushResult && (
                    <>
                      <div style={S.card}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#6EE7B7", letterSpacing: "0.1em" }}>PUSH REPORTER SCRIPT</div>
                          <button style={{ ...S.btn(), fontSize: 10, padding: "5px 12px" }} onClick={() => { navigator.clipboard.writeText(pushResult.agent_script); setPushScriptCopied(true); setTimeout(() => setPushScriptCopied(false), 2000); }}>
                            {pushScriptCopied ? "✓ COPIED" : "⎘ COPY"}
                          </button>
                        </div>
                        <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10 }}>{pushResult.agent_summary}</div>
                        <div style={{ ...S.promptBox, maxHeight: 200, overflowY: "auto", fontSize: 10.5 }}>{pushResult.agent_script}</div>
                      </div>
                      {pushResult.embed_instructions && (
                        <div style={{ ...S.card, marginTop: 12 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#FDE68A", letterSpacing: "0.1em", marginBottom: 6 }}>HOW THE RECEIVING AGENT USES THIS</div>
                          <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.7 }}>{pushResult.embed_instructions}</div>
                        </div>
                      )}
                      <div style={{ ...S.card, marginTop: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.1em", marginBottom: 8 }}>FIRST UPDATE — AUTO-LOGGED TO BOARD</div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <Tag type={pushResult.first_update.type} />
                          <StatusBadge status={pushResult.first_update.status} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{pushResult.first_update.summary}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>{pushResult.first_update.detail}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── PULL MODE ── */}
            {schemaTab === "pull" && (
              <div>
                {/* Pull sub-mode */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[["autonomous", "🤖 Autonomous Pull", "Reporter inspects the project itself — reads files, git log, README"], ["human", "👤 Human Interview", "Reporter asks you questions to gather context"]].map(([v, l, d]) => (
                    <button key={v} onClick={() => { setPullMode(v); setPullResult(null); setInterviewMessages([]); setInterviewDone(false); }} style={{
                      ...S.btn(pullMode === v ? "primary" : "ghost"), flex: 1, padding: "10px 14px", textAlign: "left"
                    }}>
                      <div style={{ fontSize: 12 }}>{l}</div>
                      <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{d}</div>
                    </button>
                  ))}
                </div>

                {/* Autonomous Pull */}
                {pullMode === "autonomous" && (
                  <div style={{ display: "grid", gridTemplateColumns: pullResult ? "1fr 1fr" : "1fr", gap: 20 }}>
                    <div style={S.card}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.12em", marginBottom: 8 }}>AUTONOMOUS PULL REPORTER</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.8, marginBottom: 16 }}>
                        This generates a self-discovering reporter script. Drop it into <em>any</em> project folder — new or existing — and it will:
                        <br />① Scan for README, git log, package.json, requirements.txt, TODO files
                        <br />② Build a structured picture of the project from what it finds
                        <br />③ POST a first update to the tracker with everything it discovered
                        <br />No project info needed from you — it figures it out.
                      </div>
                      <button style={{ ...S.btn(), padding: "12px", width: "100%" }}
                        onClick={runPullAutonomous} disabled={pulling}>
                        {pulling ? "⟳ GENERATING PULL REPORTER…" : "▼ GENERATE AUTONOMOUS PULL REPORTER"}
                      </button>
                    </div>
                    {pullResult && (
                      <div>
                        <div style={S.card}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.1em" }}>PULL REPORTER SCRIPT</div>
                            <button style={{ ...S.btn(), fontSize: 10, padding: "5px 12px" }} onClick={() => { navigator.clipboard.writeText(pullResult.agent_script); setPullScriptCopied(true); setTimeout(() => setPullScriptCopied(false), 2000); }}>
                              {pullScriptCopied ? "✓ COPIED" : "⎘ COPY"}
                            </button>
                          </div>
                          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10 }}>{pullResult.agent_summary}</div>
                          <div style={{ ...S.promptBox, maxHeight: 240, overflowY: "auto", fontSize: 10.5 }}>{pullResult.agent_script}</div>
                        </div>
                        {pullResult.questions_if_human?.length > 0 && (
                          <div style={{ ...S.card, marginTop: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#FDE68A", letterSpacing: "0.1em", marginBottom: 8 }}>QUESTIONS ASKED IF HUMAN-IN-LOOP</div>
                            {pullResult.questions_if_human.map((q, i) => (
                              <div key={i} style={{ fontSize: 11, color: "#94A3B8", marginBottom: 5 }}>
                                <span style={{ color: "#FDE68A", fontWeight: 700 }}>{i + 1}.</span> {q}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Human Interview Pull */}
                {pullMode === "human" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div style={S.card}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.12em", marginBottom: 8 }}>HUMAN INTERVIEW</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.7, marginBottom: 14 }}>
                        The tracker will interview you about your project — one question at a time. Once it has enough, it automatically builds the first update and logs it to the board. Works for any project at any stage.
                      </div>

                      {interviewMessages.length === 0 && !interviewDone && (
                        <button style={{ ...S.btn(), width: "100%", padding: 12 }} onClick={startInterview} disabled={interviewing}>
                          {interviewing ? "⟳ STARTING…" : "▼ START INTERVIEW"}
                        </button>
                      )}

                      {/* Chat thread */}
                      {interviewMessages.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflowY: "auto", marginBottom: 12 }}>
                          {interviewMessages.map((m, i) => (
                            <div key={i} style={{
                              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                              background: m.role === "user" ? "#6EE7B718" : "#1E2530",
                              border: `1px solid ${m.role === "user" ? "#6EE7B733" : "#2a3340"}`,
                              borderRadius: 8, padding: "8px 12px", maxWidth: "90%",
                              fontSize: 12, color: m.done ? "#6EE7B7" : "#E2E8F0", lineHeight: 1.6,
                            }}>{m.content}</div>
                          ))}
                          {interviewing && (
                            <div style={{ alignSelf: "flex-start", background: "#1E2530", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#475569" }}>
                              thinking…
                            </div>
                          )}
                        </div>
                      )}

                      {interviewMessages.length > 0 && !interviewDone && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <input style={{ ...S.input, padding: "8px 12px", flex: 1 }}
                            placeholder="Type your answer…"
                            value={interviewInput}
                            onChange={e => setInterviewInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !interviewing && sendInterviewMessage()} />
                          <button style={S.btn()} onClick={sendInterviewMessage} disabled={interviewing || !interviewInput.trim()}>→</button>
                        </div>
                      )}

                      {interviewDone && (
                        <button style={{ ...S.btn("ghost"), marginTop: 8, width: "100%" }}
                          onClick={() => { setInterviewMessages([]); setInterviewDone(false); setInterviewInput(""); }}>
                          + START NEW INTERVIEW
                        </button>
                      )}
                    </div>

                    <div style={S.card}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#FDE68A", letterSpacing: "0.1em", marginBottom: 10 }}>HOW THIS WORKS</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 2 }}>
                        <p>① The tracker asks you targeted questions about your project — one at a time.</p>
                        <p>② Answer naturally. It adapts based on what you tell it.</p>
                        <p>③ Once it has enough context, it stops asking and builds a structured first update.</p>
                        <p>④ The update is logged to the <strong style={{ color: "#E2E8F0" }}>Board</strong> automatically.</p>
                        <p>⑤ From this point, any reporter agent you attach to the project will have a baseline to build on.</p>
                      </div>
                      <div style={{ marginTop: 16, background: "#060810", borderRadius: 7, padding: 12, border: "1px solid #1E2530" }}>
                        <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 6 }}>GOOD FOR</div>
                        {["Projects mid-development with no existing reporter", "Human-managed projects joining the tracker", "Onboarding a project from a different AI platform", "When you want to describe it in your own words"].map((t, i) => (
                          <div key={i} style={{ fontSize: 11, color: "#C4B5FD", marginBottom: 4 }}>✓ {t}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PROMPT REF ── */}
            {schemaTab === "ref" && (
              <div style={S.card}>
                <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 16, lineHeight: 1.7 }}>
                  Copy this as a system prompt for any AI (ChatGPT, Gemini, Copilot) to make it report in the tracker's schema.
                </div>
                <div style={S.promptBox}>{REPORTER_PROMPT}</div>
                <button style={{ ...S.btn(), marginTop: 12 }} onClick={copyPrompt}>{copied ? "✓ COPIED!" : "⎘ COPY PROMPT"}</button>
              </div>
            )}
          </div>
        )}

        {/* ── PREP AGENT TAB ── */}
        {tab === "prep" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: prepResult ? "380px 1fr" : "1fr 1fr", gap: 20 }}>

              {/* ── Input form ── */}
              <div style={S.card}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FDE68A", letterSpacing: "0.12em", marginBottom: 4 }}>◈ PREP AGENT</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 16, lineHeight: 1.7 }}>
                  Audits a project for reporter compliance, fixes what it can, writes a <strong style={{ color: "#FDE68A" }}>.tracker-config.json</strong> handshake file, and logs a compliance update to the board. Run this <em>before</em> deploying any reporter.
                </div>

                {[
                  { key: "projectName", label: "Project Name *", ph: "e.g. Vision Pipeline Agent" },
                  { key: "description", label: "What it does", ph: "Brief description of the project", multi: true },
                  { key: "stack", label: "Stack / Tools", ph: "e.g. Python, FastAPI, OpenAI" },
                  { key: "model", label: "AI Model", ph: "e.g. GPT-4o, Claude 3.5, Gemini" },
                  { key: "blockers", label: "Known Blockers", ph: "Anything currently blocking progress?" },
                  { key: "knownIssues", label: "Known Gaps / Issues", ph: "Missing docs, no git, unclear status?" },
                ].map(({ key, label, ph, multi }) => (
                  <div key={key} style={{ marginBottom: 11 }}>
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 4 }}>{label.toUpperCase()}</div>
                    {multi
                      ? <textarea rows={2} style={S.input} placeholder={ph} value={prepForm[key]} onChange={e => setPrepForm(f => ({ ...f, [key]: e.target.value }))} />
                      : <input style={{ ...S.input, padding: "7px 12px" }} placeholder={ph} value={prepForm[key]} onChange={e => setPrepForm(f => ({ ...f, [key]: e.target.value }))} />}
                  </div>
                ))}

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 6 }}>CURRENT STATUS</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Object.keys(STATUS_COLORS).map(s => (
                      <button key={s} style={{ ...S.btn(prepForm.status === s ? "primary" : "ghost"), fontSize: 10, padding: "4px 10px" }}
                        onClick={() => setPrepForm(f => ({ ...f, status: s }))}>{s}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 6 }}>AGENT MODE</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["autonomous", "🤖 Autonomous"], ["human", "👤 Human-in-loop"]].map(([v, l]) => (
                      <button key={v} style={{ ...S.btn(prepForm.agentMode === v ? "primary" : "ghost"), flex: 1, fontSize: 11 }}
                        onClick={() => setPrepForm(f => ({ ...f, agentMode: v }))}>{l}</button>
                    ))}
                  </div>
                </div>

                <button style={{ ...S.btn(), width: "100%", padding: 12 }}
                  onClick={runPrep} disabled={prepping || !prepForm.projectName}>
                  {prepping ? "⟳ RUNNING PREP AUDIT…" : "◈ RUN PREP AGENT"}
                </button>
              </div>

              {/* ── Results ── */}
              {!prepResult && (
                <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#FDE68A", letterSpacing: "0.12em" }}>WHAT PREP AUDITS</div>
                  {[
                    ["Identity", "#6EE7B7", "Project has a clear name, purpose statement, and owner"],
                    ["Documentation", "#93C5FD", "README exists, is meaningful, describes stack and goals"],
                    ["Version Control", "#C4B5FD", "Git initialized, commits are descriptive, branch is named"],
                    ["Stack Legibility", "#FDE68A", "Dependencies declared, AI model identified, env vars documented"],
                    ["Status Clarity", "#FCA5A5", "Current project status is determinable, blockers are surfaced"],
                    ["Reporter Readiness", "#6EE7B7", ".tracker-config.json exists or can be created, TRACKER_URL is set"],
                  ].map(([name, color, desc]) => (
                    <div key={name} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ minWidth: 8, height: 8, borderRadius: "50%", background: color, marginTop: 4 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color }}>{name}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, background: "#060810", borderRadius: 7, padding: 14, border: "1px solid #1E2530" }}>
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 8 }}>WHAT IT PRODUCES</div>
                    {[
                      "Scored audit report across all 6 categories",
                      "Exact fix list — automated and manual actions separated",
                      ".tracker-config.json handshake file ready to drop in",
                      "Python prep script that performs all automated fixes",
                      "Compliance update auto-logged to the board",
                    ].map((t, i) => <div key={i} style={{ fontSize: 11, color: "#FDE68A", marginBottom: 4 }}>✓ {t}</div>)}
                  </div>
                </div>
              )}

              {prepResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  {/* Audit scorecard */}
                  <div style={S.card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#FDE68A", letterSpacing: "0.1em" }}>COMPLIANCE AUDIT</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: prepResult.audit.overall_score >= 80 ? "#6EE7B7" : prepResult.audit.overall_score >= 50 ? "#FDE68A" : "#FCA5A5" }}>
                          {prepResult.audit.overall_score}
                        </div>
                        <div style={{ fontSize: 10, color: "#475569" }}>/100</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {prepResult.audit.categories.map(cat => {
                        const statusColor = cat.status === "pass" ? "#6EE7B7" : cat.status === "warn" ? "#FDE68A" : "#FCA5A5";
                        const statusIcon = cat.status === "pass" ? "✓" : cat.status === "warn" ? "⚠" : "✕";
                        return (
                          <div key={cat.name} style={{ background: "#060810", border: `1px solid ${statusColor}33`, borderRadius: 7, padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: statusColor }}>{statusIcon} {cat.name}</span>
                              <span style={{ fontSize: 10, color: statusColor }}>{cat.score}</span>
                            </div>
                            <div style={{ height: 3, background: "#ffffff10", borderRadius: 3 }}>
                              <div style={{ height: "100%", width: `${cat.score}%`, background: statusColor, borderRadius: 3 }} />
                            </div>
                            {cat.findings?.length > 0 && (
                              <div style={{ marginTop: 6 }}>
                                {cat.findings.slice(0, 2).map((f, i) => (
                                  <div key={i} style={{ fontSize: 9, color: "#475569", marginTop: 2, lineHeight: 1.4 }}>• {f}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fixes + manual actions */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={S.card}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#6EE7B7", letterSpacing: "0.1em", marginBottom: 10 }}>AUTOMATED FIXES (SCRIPT WILL APPLY)</div>
                      {prepResult.audit.categories.flatMap(c => c.fixes || []).length === 0
                        ? <div style={{ fontSize: 11, color: "#475569" }}>No automated fixes needed.</div>
                        : prepResult.audit.categories.flatMap(c => (c.fixes || []).map(f => ({ fix: f, cat: c.name }))).map(({ fix, cat }, i) => (
                          <div key={i} style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6, display: "flex", gap: 8 }}>
                            <span style={{ color: "#6EE7B7", fontWeight: 700 }}>→</span>
                            <span><span style={{ color: "#475569" }}>[{cat}]</span> {fix}</span>
                          </div>
                        ))}
                    </div>
                    <div style={S.card}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#FCA5A5", letterSpacing: "0.1em", marginBottom: 10 }}>MANUAL ACTIONS REQUIRED</div>
                      {(!prepResult.human_actions_required || prepResult.human_actions_required.length === 0)
                        ? <div style={{ fontSize: 11, color: "#475569" }}>No manual actions needed — fully automated.</div>
                        : prepResult.human_actions_required.map((a, i) => (
                          <div key={i} style={{ fontSize: 11, color: "#FCA5A5", marginBottom: 6, display: "flex", gap: 8 }}>
                            <span style={{ fontWeight: 700 }}>{i + 1}.</span>{a}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Handshake file + script */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={S.card}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#93C5FD", letterSpacing: "0.1em" }}>.tracker-config.json</div>
                        <button style={{ ...S.btn(), fontSize: 10, padding: "4px 10px" }} onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(prepResult.handshake_file, null, 2));
                          setHandshakeCopied(true); setTimeout(() => setHandshakeCopied(false), 2000);
                        }}>{handshakeCopied ? "✓ COPIED" : "⎘ COPY"}</button>
                      </div>
                      <div style={{ fontSize: 10, color: "#475569", marginBottom: 8 }}>Drop this file into your project root. The reporter reads it on arrival.</div>
                      <div style={{ ...S.promptBox, fontSize: 10, maxHeight: 200, overflowY: "auto" }}>
                        {JSON.stringify(prepResult.handshake_file, null, 2)}
                      </div>
                    </div>
                    <div style={S.card}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.1em" }}>PREP SCRIPT</div>
                        <button style={{ ...S.btn(), fontSize: 10, padding: "4px 10px" }} onClick={() => {
                          navigator.clipboard.writeText(prepResult.prep_script);
                          setPrepScriptCopied(true); setTimeout(() => setPrepScriptCopied(false), 2000);
                        }}>{prepScriptCopied ? "✓ COPIED" : "⎘ COPY"}</button>
                      </div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>{prepResult.prep_summary}</div>
                      <div style={{ ...S.promptBox, fontSize: 10, maxHeight: 172, overflowY: "auto" }}>{prepResult.prep_script}</div>
                    </div>
                  </div>

                  {/* Compliance update preview */}
                  <div style={S.card}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6EE7B7", letterSpacing: "0.1em", marginBottom: 10 }}>COMPLIANCE UPDATE — AUTO-LOGGED TO BOARD</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <Tag type={prepResult.compliance_update.type} />
                      <StatusBadge status={prepResult.compliance_update.status} />
                      <ConfidenceMeter value={prepResult.compliance_update.confidence} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{prepResult.compliance_update.summary}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{prepResult.compliance_update.detail}</div>
                    {prepResult.compliance_update.next_steps?.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {prepResult.compliance_update.next_steps.map((s, i) => (
                          <span key={i} style={{ background: "#6EE7B711", color: "#6EE7B7", borderRadius: 4, fontSize: 10, padding: "2px 8px" }}>→ {s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button style={{ ...S.btn("ghost"), width: "100%" }}
                    onClick={() => { setPrepResult(null); setPrepForm({ projectName: "", description: "", stack: "", model: "", status: "Active", blockers: "", knownIssues: "", agentMode: "autonomous" }); }}>
                    + PREP ANOTHER PROJECT
                  </button>
                </div>
              )}
            </div>
          </div>
        )}


        {tab === "agent" && (
          <div>
            <div style={S.sectionTitle}>AGENT INTEGRATION SPEC</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={S.card}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6EE7B7", marginBottom: 10, letterSpacing: "0.1em" }}>WEBHOOK ENDPOINT FORMAT</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 12 }}>
                  Any reporting agent can POST a structured JSON update directly to your tracker.
                  Use this spec to configure your agent's output step.
                </div>
                <div style={S.promptBox}>{`// Agent posts to your tracker endpoint:
POST /api/project-update
Content-Type: application/json
X-Agent-Key: your-agent-key

// Body (same schema as reporter prompt):
{
  "type": "tool",
  "project": "My Agent Project",
  "summary": "Added memory module",
  "detail": "Integrated LangChain memory...",
  "model_used": "GPT-4o",
  "status": "Active",
  "blockers": [],
  "next_steps": ["Run eval suite"],
  "confidence": 0.92,
  "missing_fields": []
}`}</div>
              </div>

              <div style={S.card}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#93C5FD", marginBottom: 10, letterSpacing: "0.1em" }}>AGENT SYSTEM PROMPT SNIPPET</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 12 }}>
                  Add this to your agent's system prompt so it auto-reports after each work session.
                </div>
                <div style={S.promptBox}>{`After completing each work session or tool execution,
report your results by calling the report_update function
with this structure:

{
  "type": <feature|tool|daily|blocker|progress>,
  "project": <project name>,
  "summary": <one sentence>,
  "detail": <full description>,
  "model_used": <your model name>,
  "status": <Active|Blocked|Stalled|Complete>,
  "blockers": [...],
  "next_steps": [...],
  "confidence": <0.0-1.0>
}

Always report blockers immediately. If you are unsure
about any field, include it in "missing_fields".`}</div>
              </div>

              <div style={S.card}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FDE68A", marginBottom: 10, letterSpacing: "0.1em" }}>POLLING / STATUS CHECK</div>
                <div style={S.promptBox}>{`// Agent can also poll project status:
GET /api/projects
→ Returns all projects + latest status

GET /api/project/:name/updates
→ Returns update timeline for a project

// Example agent decision logic:
if (project.status === "Blocked") {
  agent.pause();
  agent.notify("Awaiting human unblock");
}`}</div>
              </div>

              <div style={S.card}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", marginBottom: 10, letterSpacing: "0.1em" }}>EXPORT CURRENT PROJECTS</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 12 }}>
                  Export all project data as JSON to hand off to an agent or another tool.
                </div>
                <button style={S.btn()} onClick={() => {
                  const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = "projects.json"; a.click();
                  showToast("Exported as projects.json");
                }}>⬇ EXPORT JSON</button>
                <div style={{ marginTop: 10 }}>
                  <button style={{ ...S.btn("ghost") }} onClick={() => {
                    const md = projects.map(p =>
                      `# ${p.name}\n**Status:** ${p.status} | **Model:** ${p.model}\n\n` +
                      p.updates.map(u => `### ${u.summary}\n_${new Date(u.timestamp).toLocaleString()}_ — ${u.type}\n\n${u.detail}\n`).join("\n")
                    ).join("\n---\n\n");
                    const blob = new Blob([md], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = "projects.md"; a.click();
                    showToast("Exported as projects.md");
                  }}>⬇ EXPORT MARKDOWN</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
