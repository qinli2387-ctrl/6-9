# Development handoff

Last updated: 2026-08-15

## Completed

- Initialized the cloud-hosted web project.
- Replaced the starter with the 六分计划 landing page and responsive dashboard.
- Added ChatGPT sign-in flow for cross-device identity.
- Added D1 schemas for learner profiles, daily tasks, study events, vocabulary cards and review logs.
- Added server-owned task completion so one user cannot change another user's records.
- Added authenticated onboarding for exam type, target date and daily study time.
- Added the responsive 24-week level map with six worlds, review nodes and Boss nodes.
- Added cloud level state, stars, XP and streak fields. Daily tasks award XP only once.
- Added playable routes for weeks 1–4 with question-by-question progress, immediate explanations and result screens.
- Added server-side answer scoring, one-time level XP, replay-safe best scores and sequential week unlocking.
- Added a public `/demo` route for local product trials. Demo progress is intentionally browser-local and never mixed with authenticated cloud records.
- Published the standalone Cloudflare demo at `https://band-six-demo.pages.dev` with `https://ielts-band-six-demo.qinli2387-ielts.workers.dev` as a secondary route. Its source is kept in `deploy/cloudflare-public-demo.js`; its progress is browser-local.
- Reworked the public demo to server-render the map, lesson intro, five-question flow, explanations and result page. This avoids the blank/loading screen caused when some embedded browsers do not execute client-side scripts.
- Added `docs/CONTENT_SOURCES.md` for the official IELTS format facts used in authored lesson questions.
- Completed a research and product audit covering official IELTS requirements, learning science, gamification, accessibility and open-source licensing. See `docs/RESEARCH_AUDIT_2026-08-15.md`.
- Added `ts-fsrs` 5.4.1, twelve original starter vocabulary cards, a cloud due-card queue and the four FSRS review ratings.
- Added the authenticated `/vocabulary` flow and `/api/vocabulary/review`. All card reads, updates, review logs and task completion writes are scoped to the authenticated `userId`.
- Expanded the D1 schema and migration with the full FSRS scheduling state and review-log fields. Finishing the due queue automatically completes the vocabulary task and awards XP once.
- Added `/demo/vocabulary` for local interaction and phone-layout verification without touching learner cloud records.
- Added this documentation so a new Codex session can resume without the old conversation.
- Added repository-level autonomous execution rules in `AGENTS.md`, live status in `docs/PROJECT_STATUS.md`, and task reports under `reports/` so future Codex sessions preserve the same verify-review-improve workflow.
- Researched the game direction and selected a learning-first level map. See `docs/OPEN_SOURCE_REFERENCES.md`.

## Verify before continuing

- Database migrations were generated and inspected.
- The production build completed successfully on Windows.
- A private Sites deployment was started, but the hosting service later returned `Sites project not found` while checking its status. Do not create a replacement Sites project until the existing platform state has been checked again.
- The Cloudflare API confirms that both deployments are enabled. This development computer times out on `workers.dev`, while `https://band-six-demo.pages.dev` returns HTTP 200, so use the Pages address as the primary public demo URL.
- Cloudflare Browser Rendering verified the live mobile page at 430×900, then verified the first-level intro, question form, correct-answer explanation and 100-point result page using visible selectors.
- The new vocabulary route passed a production build, targeted lint, the rendered landing-page regression test, and a real Chrome smoke test at 430×900. The smoke test revealed a card, verified all four rating controls, selected “记得”, loaded the next card and confirmed progress changed to 1/3.
- Publish or recover the private preview, then sign in.
- Complete a task, open the site on another device, and confirm the completion remains visible.

## Source handoff status

- Local Git history is initialized and clean as of the first application commit.
- The source was pushed to the temporary Sites Git remote.
- The durable GitHub handoff repository is `https://github.com/qinli2387-ctrl/6-9` and the working branch is `main`.
- Research audit and FSRS vocabulary work were pushed to GitHub in commit `295b0b6`.
- Cloudflare Worker name: `ielts-band-six-demo`; account subdomain: `qinli2387-ielts`.
- Cloudflare Pages project: `band-six-demo`; primary demo domain: `band-six-demo.pages.dev`.
- Never put account passwords or API secrets in the repository. Connect each Codex device with GitHub OAuth/repository permissions instead.

## Next implementation task

Build the four-skill placement flow and use its results to set initial training weights. Then add the reading/listening error taxonomy and generate review levels from due cards and mistakes. The first match-3 prototype should consume that same due-card queue rather than maintain a separate game score.
