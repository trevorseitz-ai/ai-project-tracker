export async function fetchProjectsFromServer() {
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveProjectsToServer(projects) {
  try {
    await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projects),
    });
  } catch {
    // API unavailable — localStorage remains the fallback cache
  }
}

export async function postProjectUpdate(update, agentKey) {
  const res = await fetch("/api/project-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Key": agentKey,
    },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}
