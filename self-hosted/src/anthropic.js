const DEFAULT_MODEL = "claude-sonnet-4-6";

export function getAnthropicModel() {
  const fromEnv = import.meta.env.VITE_ANTHROPIC_MODEL?.trim();
  return fromEnv || DEFAULT_MODEL;
}

export async function requestAnthropic({ system, messages, max_tokens = 1000 }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing VITE_ANTHROPIC_API_KEY in .env — restart npm run dev after editing.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: getAnthropicModel(),
      max_tokens,
      system,
      messages,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || `Anthropic API error (${res.status})`;
    throw new Error(msg);
  }

  return {
    text: data.content?.map(b => b.text || "").join("") || "",
    stopReason: data.stop_reason || null,
  };
}

export function parseJsonFromModel(raw) {
  const cleaned = String(raw).replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("AI response was not valid JSON — try again.");
  }
}

export async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
