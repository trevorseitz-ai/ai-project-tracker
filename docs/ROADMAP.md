# Roadmap

Features that are **not implemented yet** or only partially planned. For what works today, start at [docs/README.md](./README.md).

---

## Implemented (v1)

- Project board with manual status and update history
- AI parse / prep / reporter generation via Anthropic (browser)
- **Webhook API** — `POST /api/project-update`, status polling, UI sync
- **Persistence** — `data/projects.json` on server + `localStorage` cache
- JSON export/import from **AGENT API** tab
- Prep/Push/Pull script generation (copy to external repos)

---

## Planned

| Feature | Notes |
|---|---|
| **Multi-user auth** | Single-user/local trust model today |
| **Server-side API key proxy** | Anthropic key currently runs in the browser |
| **Slack / email notifications** | Alert when projects go Blocked |
| **CI integration examples** | Call live API from GitHub Actions (not CLI `prep-agent`) |
| **Jira / Linear sync** | External ticket linking |
| **Localization (i18n)** | English-only UI today |
| **Database backend** | JSON file is sufficient for self-hosted MVP |

---

## Deprecated doc topics

These guides describe aspirational designs, not current behaviour:

- [Advanced Guides](./ADVANCED_GUIDES.md) — PostgreSQL, Slack webhooks in `.env`
- [Advanced Integrations](./ADVANCED_INTEGRATIONS.md) — `npm run prep-agent` CI jobs
- [Localization](./LOCALIZATION.md) — `locales/` directory that does not exist

Refer to [Architecture](./ARCHITECTURE.md) and [API Reference](./API_REFERENCE.md) for the live system.

---

## Contributing

PRs welcome on roadmap items. Check [Architecture](./ARCHITECTURE.md) before adding new API routes or shared modules.
