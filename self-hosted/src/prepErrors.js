const DEFAULT_STEPS = [
  "Click ◈ RUN PREP AGENT again.",
  "If the problem continues, check self-hosted/.env and restart with npm run dev.",
];

export function getPrepErrorGuidance(errorMessage) {
  const message = String(errorMessage || "Prep agent generation failed").trim();
  const lower = message.toLowerCase();

  if (lower.includes("missing vite_anthropic_api_key") || lower.includes("missing api key")) {
    return {
      title: "Anthropic API key is missing",
      message: "Prep cannot call the AI until your API key is configured.",
      steps: [
        "Open self-hosted/.env in a text editor.",
        "Add a line: VITE_ANTHROPIC_API_KEY=your-key-here",
        "Save the file, then stop Terminal (Ctrl+C) and run npm run dev again from self-hosted/",
        "Return here and click ◈ RUN PREP AGENT again.",
      ],
      technical: message,
    };
  }

  if (
    lower.includes("401") ||
    lower.includes("authentication") ||
    lower.includes("invalid x-api-key") ||
    lower.includes("invalid api key")
  ) {
    return {
      title: "Anthropic API key was rejected",
      message: "The key in .env is present but Anthropic did not accept it.",
      steps: [
        "Sign in at console.anthropic.com and confirm your API key is active.",
        "Copy a fresh key into self-hosted/.env as VITE_ANTHROPIC_API_KEY=...",
        "Restart npm run dev, then click ◈ RUN PREP AGENT again.",
      ],
      technical: message,
    };
  }

  if (
    lower.includes("404") ||
    lower.includes("not_found") ||
    lower.includes("model:") ||
    lower.includes("model not found")
  ) {
    return {
      title: "AI model is not available",
      message: "The model name in your settings is invalid or your account cannot use it.",
      steps: [
        "Open self-hosted/.env and set VITE_ANTHROPIC_MODEL=claude-sonnet-4-6 (or remove that line to use the default).",
        "Restart npm run dev, then click ◈ RUN PREP AGENT again.",
      ],
      technical: message,
    };
  }

  if (
    lower.includes("not valid json") ||
    lower.includes("unterminated string") ||
    lower.includes("unexpected token") ||
    lower.includes("json.parse")
  ) {
    return {
      title: "Full audit could not be read",
      message:
        "Prep reached the AI but the scored audit could not be saved. Your form entries are unchanged — try running Prep again.",
      steps: [
        "Click ◈ RUN PREP AGENT again — this often succeeds on the second try.",
        "If the form shows red character-limit errors, fix those first — Prep will not run until they are resolved.",
        "To set up reporting: open REPORTER → ▲ PUSH MODE, select the same project, and click Generate. Reporter uses the form in this app — it does not read .tracker-config.json from your folder.",
        "Do not copy .tracker-config.json from a failed run — wait for a successful Prep, or use the form-only preview below only if you understand it is incomplete.",
      ],
      technical: message,
    };
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("networkerror") ||
    lower.includes("load failed")
  ) {
    return {
      title: "Could not reach the AI service",
      message: "Prep could not connect to Anthropic. Check your internet connection and that npm run dev is still running.",
      steps: [
        "Confirm you are online and no VPN or firewall is blocking api.anthropic.com.",
        "In Terminal, stop and restart npm run dev from self-hosted/.",
        "Click ◈ RUN PREP AGENT again.",
      ],
      technical: message,
    };
  }

  if (lower.includes("rate limit") || lower.includes("429") || lower.includes("overloaded")) {
    return {
      title: "AI service is busy",
      message: "Anthropic rate-limited or overloaded the request.",
      steps: [
        "Wait 30–60 seconds, then click ◈ RUN PREP AGENT again.",
        "If this happens often, check your Anthropic usage limits at console.anthropic.com.",
      ],
      technical: message,
    };
  }

  return {
    title: "Prep audit did not finish",
    message: "Something went wrong before the full audit could complete.",
    steps: DEFAULT_STEPS,
    technical: message,
  };
}

export function getPrepWarningGuidance(warningMessage) {
  const message = String(warningMessage || "").trim();
  const lower = message.toLowerCase();

  if (lower.includes("cut off") || lower.includes("max_tokens")) {
    return {
      title: "Audit response was cut off",
      message: "Prep mostly worked, but the AI answer was truncated.",
      steps: [
        "Review the results below — if .tracker-config.json looks complete, you can copy it after a successful Prep.",
        "If any form field shows a red character count, shorten it before running Prep again.",
        "Reporter setup is separate: REPORTER → ▲ PUSH MODE uses the project form here, not the saved config file.",
      ],
      technical: message,
    };
  }

  return {
    title: "Prep finished with a warning",
    message: message || "Review the results below before continuing.",
    steps: ["Read the warning below.", "Run Prep again if anything looks incomplete."],
    technical: message,
  };
}
