# Project continuity instructions

This repository is the source of truth for 六分计划. Before making changes, read `docs/PROJECT.md`, `docs/ROADMAP.md`, and `docs/HANDOFF.md`.

Keep the app cloud-first: durable learner data belongs in D1, large future audio files belong in R2, and browser storage is only for temporary interface preferences. Every database query involving learner data must be scoped by the authenticated user ID on the server.

After a meaningful change, update `docs/HANDOFF.md` with what changed, what was verified, and the next concrete task. Never commit passwords, API keys, service tokens, or `.env` files.

Use Chinese for learner-facing copy. Preserve responsive behavior for phone and desktop. Treat AI-generated IELTS scores as estimates and align feedback with official IELTS public band descriptors.
