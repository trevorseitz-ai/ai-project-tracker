import { useState } from "react";
import { copyTextToClipboard } from "./anthropic.js";
import { getPrepErrorGuidance, getPrepWarningGuidance } from "./prepErrors.js";

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

const card = {
  background: "#0D1017",
  border: "1px solid #1E2530",
  borderRadius: 10,
  padding: "20px",
};

const promptBox = {
  background: "#060810",
  border: "1px solid #1E2530",
  borderRadius: 7,
  padding: "14px",
  fontFamily: "inherit",
  fontSize: 11,
  color: "#94A3B8",
  whiteSpace: "pre-wrap",
  lineHeight: 1.7,
};

function btn(variant = "primary") {
  return {
    background: variant === "primary" ? "#6EE7B7" : variant === "danger" ? "#FCA5A5" : "#1E2530",
    color: variant === "primary" ? "#0A0C10" : variant === "danger" ? "#0A0C10" : "#E2E8F0",
    border: "none",
    borderRadius: 7,
    padding: "9px 18px",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.08em",
  };
}

function Tag({ type }) {
  const t = UPDATE_TYPES[type] || UPDATE_TYPES.daily;
  return (
    <span style={{
      background: t.color + "22", color: t.color, borderRadius: 4,
      fontSize: 10, fontWeight: 700, padding: "2px 8px", letterSpacing: "0.06em",
    }}>{t.icon} {t.label.toUpperCase()}</span>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#aaa";
  return (
    <span style={{
      background: color + "22", color, borderRadius: 4,
      fontSize: 10, fontWeight: 700, padding: "2px 8px",
    }}>{status?.toUpperCase()}</span>
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

export function PrepIssueBanner({ guidance, variant = "error", onRetry }) {
  const isError = variant === "error";
  const accent = isError ? "#FCA5A5" : "#FDE68A";

  return (
    <div style={{
      border: `2px solid ${accent}`,
      background: isError ? "#FCA5A514" : "#FDE68A14",
      borderRadius: 10,
      padding: "20px 22px",
      boxShadow: isError ? "0 0 0 1px #FCA5A533" : "0 0 0 1px #FDE68A33",
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.14em", color: accent }}>
        {isError ? "✕ PREP FAILED — READ THIS FIRST" : "⚠ PREP WARNING — REVIEW BEFORE CONTINUING"}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", marginTop: 10 }}>{guidance.title}</div>
      <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 8, lineHeight: 1.7 }}>{guidance.message}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.12em", marginTop: 18, marginBottom: 8 }}>
        HOW TO FIX
      </div>
      <ol style={{ margin: 0, paddingLeft: 20 }}>
        {guidance.steps.map((step, i) => (
          <li key={i} style={{ fontSize: 12, color: "#E2E8F0", marginBottom: 8, lineHeight: 1.65 }}>{step}</li>
        ))}
      </ol>
      {guidance.technical && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ fontSize: 10, color: "#64748B", cursor: "pointer" }}>Technical details</summary>
          <div style={{ fontSize: 10, color: "#64748B", marginTop: 8, lineHeight: 1.6, wordBreak: "break-word" }}>
            {guidance.technical}
          </div>
        </details>
      )}
      {isError && onRetry && (
        <button
          style={{
            marginTop: 18,
            width: "100%",
            background: "#FCA5A522",
            border: "1px solid #FCA5A566",
            color: "#FCA5A5",
            borderRadius: 7,
            padding: "12px 14px",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.08em",
          }}
          onClick={onRetry}
        >
          ⟳ RUN PREP AGENT AGAIN
        </button>
      )}
    </div>
  );
}

export function PrepReportPanel({
  prepResult,
  prepError = null,
  prepWarning = null,
  savedAt = null,
  onRetry,
  onToast,
  showComplianceSection = true,
  compact = false,
}) {
  const [handshakeCopied, setHandshakeCopied] = useState(false);
  const [prepScriptCopied, setPrepScriptCopied] = useState(false);

  if (!prepResult) return null;

  const toast = (msg, ok = true) => onToast?.(msg, ok);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {savedAt && (
        <div style={{ fontSize: 10, color: "#64748B", letterSpacing: "0.08em" }}>
          SAVED {new Date(savedAt).toLocaleString()}
        </div>
      )}

      {prepError && (
        <PrepIssueBanner
          guidance={getPrepErrorGuidance(prepError)}
          variant="error"
          onRetry={onRetry}
        />
      )}

      {!prepError && prepWarning && (
        <PrepIssueBanner
          guidance={getPrepWarningGuidance(prepWarning)}
          variant="warning"
        />
      )}

      <div style={{
        ...card,
        border: prepError ? "1px solid #FCA5A544" : "1px solid #6EE7B744",
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          marginBottom: 10,
          color: prepError ? "#FCA5A5" : "#6EE7B7",
        }}>
          {prepError
            ? "AUDIT FAILED — CONFIG BELOW MATCHES YOUR FORM ONLY (NOT AI AUDIT)"
            : prepWarning
              ? "PREP MOSTLY COMPLETE — REVIEW WARNING ABOVE"
              : "PREP COMPLETE — COPY YOUR FILES"}
        </div>
        {!compact && (
          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 14, lineHeight: 1.6 }}>
            {prepError ? (
              <>
                The file below is built from what you typed in the form — it is <strong style={{ color: "#FCA5A5" }}>not</strong> the full AI audit result.
                Run Prep again after fixing the error above for a complete audit and prep script.
              </>
            ) : (
              <>
                Save in your <strong style={{ color: "#E2E8F0" }}>outside project&apos;s top folder</strong> (not in ai-project-tracker).
                Name the file exactly <strong style={{ color: "#93C5FD" }}>.tracker-config.json</strong>.
              </>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            style={{ ...btn(), padding: "10px 16px", fontSize: 12 }}
            onClick={async () => {
              await copyTextToClipboard(JSON.stringify(prepResult.handshake_file, null, 2));
              setHandshakeCopied(true);
              setTimeout(() => setHandshakeCopied(false), 2000);
              toast("Copied .tracker-config.json ✓");
            }}
          >
            {handshakeCopied ? "✓ COPIED" : "⎘ COPY .tracker-config.json"}
          </button>
          {prepResult.prep_script ? (
            <button
              style={{ ...btn("ghost"), padding: "10px 16px", fontSize: 12 }}
              onClick={async () => {
                await copyTextToClipboard(prepResult.prep_script);
                setPrepScriptCopied(true);
                setTimeout(() => setPrepScriptCopied(false), 2000);
                toast("Copied prep script ✓");
              }}
            >
              {prepScriptCopied ? "✓ COPIED" : "⎘ COPY PREP SCRIPT"}
            </button>
          ) : null}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FDE68A", letterSpacing: "0.1em" }}>COMPLIANCE AUDIT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: (prepResult.audit?.overall_score ?? 0) >= 80 ? "#6EE7B7" : (prepResult.audit?.overall_score ?? 0) >= 50 ? "#FDE68A" : "#FCA5A5",
            }}>
              {prepResult.audit?.overall_score ?? "—"}
            </div>
            <div style={{ fontSize: 10, color: "#475569" }}>/100</div>
          </div>
        </div>
        {(prepResult.audit?.categories?.length ?? 0) === 0 ? (
          <div style={{ fontSize: 11, color: "#475569" }}>No scored audit in this report.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8 }}>
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
                      {cat.findings.slice(0, compact ? 1 : 2).map((f, i) => (
                        <div key={i} style={{ fontSize: 9, color: "#475569", marginTop: 2, lineHeight: 1.4 }}>• {f}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(prepResult.audit?.categories?.length ?? 0) > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 14 }}>
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6EE7B7", letterSpacing: "0.1em", marginBottom: 10 }}>AUTOMATED FIXES</div>
            {prepResult.audit.categories.flatMap(c => c.fixes || []).length === 0
              ? <div style={{ fontSize: 11, color: "#475569" }}>No automated fixes needed.</div>
              : prepResult.audit.categories.flatMap(c => (c.fixes || []).map(f => ({ fix: f, cat: c.name }))).map(({ fix, cat }, i) => (
                <div key={i} style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6, display: "flex", gap: 8 }}>
                  <span style={{ color: "#6EE7B7", fontWeight: 700 }}>→</span>
                  <span><span style={{ color: "#475569" }}>[{cat}]</span> {fix}</span>
                </div>
              ))}
          </div>
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#FCA5A5", letterSpacing: "0.1em", marginBottom: 10 }}>MANUAL ACTIONS REQUIRED</div>
            {(!prepResult.human_actions_required || prepResult.human_actions_required.length === 0)
              ? <div style={{ fontSize: 11, color: "#475569" }}>No manual actions needed.</div>
              : prepResult.human_actions_required.map((a, i) => (
                <div key={i} style={{ fontSize: 11, color: "#FCA5A5", marginBottom: 6, display: "flex", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>{i + 1}.</span>{a}
                </div>
              ))}
          </div>
        </div>
      )}

      {!compact && (
        <div style={{ display: "grid", gridTemplateColumns: prepResult.prep_script ? "1fr 1fr" : "1fr", gap: 14 }}>
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#93C5FD", letterSpacing: "0.1em", marginBottom: 10 }}>.tracker-config.json</div>
            <div style={{ ...promptBox, fontSize: 10, maxHeight: 200, overflowY: "auto" }}>
              {JSON.stringify(prepResult.handshake_file, null, 2)}
            </div>
          </div>
          {prepResult.prep_script ? (
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.1em", marginBottom: 10 }}>PREP SCRIPT</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>{prepResult.prep_summary}</div>
              <div style={{ ...promptBox, fontSize: 10, maxHeight: 172, overflowY: "auto" }}>{prepResult.prep_script}</div>
            </div>
          ) : null}
        </div>
      )}

      {showComplianceSection && !prepError && prepResult.compliance_update && (
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6EE7B7", letterSpacing: "0.1em", marginBottom: 10 }}>COMPLIANCE UPDATE</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <Tag type={prepResult.compliance_update.type} />
            <StatusBadge status={prepResult.compliance_update.status} />
            <ConfidenceMeter value={prepResult.compliance_update.confidence} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{prepResult.compliance_update.summary}</div>
          <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{prepResult.compliance_update.detail}</div>
        </div>
      )}
    </div>
  );
}
