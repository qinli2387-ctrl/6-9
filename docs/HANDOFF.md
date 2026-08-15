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
- Added `docs/CONTENT_SOURCES.md` for the official IELTS format facts used in authored lesson questions.
- Added this documentation so a new Codex session can resume without the old conversation.
- Researched the game direction and selected a learning-first level map. See `docs/OPEN_SOURCE_REFERENCES.md`.

## Verify before continuing

- Database migrations were generated and inspected.
- The production build completed successfully on Windows.
- A private Sites deployment was started, but the hosting service later returned `Sites project not found` while checking its status. Do not create a replacement project until the existing platform state has been checked again.
- Publish or recover the private preview, then sign in.
- Complete a task, open the site on another device, and confirm the completion remains visible.

## Source handoff status

- Local Git history is initialized and clean as of the first application commit.
- The source was pushed to the temporary Sites Git remote.
- The durable GitHub handoff repository is `https://github.com/qinli2387-ctrl/6-9` and the working branch is `main`.
- Never put account passwords or API secrets in the repository. Connect each Codex device with GitHub OAuth/repository permissions instead.

## Next implementation task

Add `ts-fsrs`, seed the first vocabulary cards, and generate review levels from due cards instead of fixed sample tasks. After that, author the second four-week world using licensed or original practice material.
