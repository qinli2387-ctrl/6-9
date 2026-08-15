# Development handoff

Last updated: 2026-08-15

## Completed

- Initialized the cloud-hosted web project.
- Replaced the starter with the 六分计划 landing page and responsive dashboard.
- Added ChatGPT sign-in flow for cross-device identity.
- Added D1 schemas for learner profiles, daily tasks, study events, vocabulary cards and review logs.
- Added server-owned task completion so one user cannot change another user's records.
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
- A private GitHub repository is still required for durable cross-computer Codex handoff.
- Never put account passwords or API secrets in the repository. Connect each Codex device with GitHub OAuth/repository permissions instead.

## Next implementation task

Build the 24-week visual level-map shell, then onboarding: exam type, target date, daily study minutes, and the first diagnostic flow. After onboarding, replace the seeded sample tasks with generated map levels.
