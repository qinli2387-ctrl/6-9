# 六分计划项目状态

Last updated: 2026-08-17

## Product objective

为雅思初学者提供 24 周云端训练教练，以账号同步听说读写训练、词汇复习、错题和可视化闯关进度。目标 6.0 是学习目标，不是结果保证；计划必须在四科摸底后个性化。

## Current architecture

- React 19 + Vinext web application.
- Cloudflare Worker runtime through Sites.
- Drizzle ORM + Cloudflare D1 for learner data.
- ChatGPT identity headers for cross-device account identity.
- `ts-fsrs` 5.4.1 for vocabulary scheduling.
- Four-skill placement flow with server-computed preliminary bands and initial training weights.
- Structured listening/reading errors and a personalized review lesson built from due errors plus FSRS cards.
- Responsive React/CSS level map; optional Phaser mini-game is deferred.
- GitHub `qinli2387-ctrl/6-9`, branch `main`, is the durable source handoff.

## Verified features

- Responsive landing page and independent public demo.
- 24-week map divided into six worlds with locked, active, passed and mastered states.
- Playable weeks 1–4 with immediate explanations, score, stars, XP and sequential unlock.
- Authenticated onboarding and server-side user scoping in learner-data queries.
- FSRS starter deck, due queue, four ratings and full scheduling/review-log persistence.
- Vocabulary mobile flow: reveal answer, rate memory, load next card and update progress.
- Placement demo and formal route: original listening audio, reading questions, short writing analysis, timed speaking self-rating and result weight allocation.
- New users leave target setup for placement; users with a saved baseline see the four-skill summary and weighted daily tasks on the dashboard.
- The level and placement APIs record user-scoped listening/reading mistakes; the third-week review builder, strict source-ID checks, empty-queue fallback and FSRS integration pass unit/build review.
- Production build, full lint, rendered regression tests and a real local workerd/D1 integration pass locally.
- The repeatable local app integration covers unauthenticated and invalid submissions, placement, weeks 1–3, personalized review, FSRS scheduling and cross-user isolation.
- Daily-task completion and single-card FSRS review use transactional D1 batches. Concurrent duplicate task completion awards XP and writes its event once; concurrent duplicate card review accepts one request and returns 409 for the stale request.
- Desktop and 390×844 mobile browser checks cover the authenticated third-week intro, question selection, answer feedback, scrolling, button state and horizontal overflow.
- Legacy Edge compatibility: HTML responses prepend an `Object.hasOwn` polyfill before the Vinext client entry, preventing the previously observed blank page on browsers without that API.
- GitHub `main` is the durable handoff branch; local work was based on remote commit `215252c` before this validation update.

## Partially verified

- The FSRS page and client interaction were verified through the `/demo/vocabulary` route in a fresh production server at 430×900.
- The authenticated vocabulary API and D1 migration pass build/type analysis and code review, but have not yet run against a reachable production D1 database.
- The standalone public demo is reachable and previously browser-verified, but it intentionally uses browser-local progress and is not the authenticated formal application.
- The placement demo was verified at desktop size and 430×900 through a fresh production server; the formal D1 write path remains code-reviewed but not connected to a reachable production database.
- All six migrations replay successfully against an empty SQLite compatibility database and a real local `workerd`/D1 database. The D1 verifier checks nine business tables, all 20 `learning_errors` columns, migration count and two-user isolation fixtures.

## Known issues

### P0

- The project ID in `.openai/hosting.json` returns `Sites project not found`. The authenticated formal app therefore cannot currently be deployed or cross-device tested. Do not create a replacement until project ownership/state is deliberately resolved.

### P1

- The initial placement is a short baseline, not a calibrated IELTS score report; writing and speaking need richer rubrics and later calibration.
- Only the first four weeks contain playable learning material.
- Writing and speaking submission/estimated feedback are not implemented.

### P2

- Data export, deletion and backup-recovery drill are missing.
- Production D1 migration and authenticated multi-device synchronization remain unverified.
- Placement completion and the whole five-source level submission still span multiple atomic batches; full-request failure injection and all-or-nothing rollback remain to be implemented.
- PWA manifest, offline recovery and complete WCAG 2.2 audit are missing.

## Important decisions

- Keep the learning loop primary; XP, stars and match-3 must represent real retrieval or exam practice.
- Use Phaser only for the optional 2–4 minute match-3 vocabulary level; normal screens remain React/CSS.
- Use original, licensed or officially permitted practice content. Do not copy assets from unlicensed clones.
- AI writing and speaking results must be labelled estimated and calibrated against official descriptors and samples.
- All durable learner data is cloud data and every server query must include the authenticated `userId`.
- Keep the existing React/Vinext/D1/FSRS foundation. Adopt D1 local tooling, R2/Whisper, Promptfoo, axe-core and Workbox as bounded modules rather than migrating to a full LMS; see `docs/OPEN_SOURCE_ACCELERATION_2026-08-17.md`.
- Review questions are server-owned snapshots. A submitted review source must belong to the authenticated user and still be due; an empty personalized queue falls back to the authored foundation review.

## Failed or blocked approaches

- The existing Sites project cannot be retrieved; repeated lookup returns `Sites project not found`.
- An old local production process served stale chunk names after a rebuild. Starting a fresh process fixed the issue and the browser smoke test passed. Always restart the production server after rebuilding before UI acceptance.
- The local dev watcher previously tried to watch locked Chrome Cookies files under `work/`; Vite now ignores `work/**` and `.wrangler/**` runtime output.
- GitHub pushes previously suffered network resets, but commits `295b0b6` and `62567d7` pushed successfully on 2026-08-15.

## Next concrete tasks

1. Resolve the formal Sites project, apply migrations `0003`, `0004`, `0005`, and verify one account on two devices.
2. Expand weeks 5–8 with original or licensed IELTS-aligned material and required source/error metadata.
3. Calibrate the writing/speaking baseline with official public descriptors and richer submissions.
4. Build the MediaRecorder + R2 + Workers AI Whisper speaking MVP after the formal cloud path works.
5. Prototype match-3 from the same verified due-card queue rather than maintaining a separate game score.

## Current open-source acceleration decision

- Adopt now: repeatable D1 local migrations and axe-core checks.
- Adopt with the productive-skills work: native MediaRecorder + R2 + Workers AI Whisper, and Promptfoo rubric regression tests.
- Adopt after the cloud loop is stable: Workbox read-only/app-shell caching.
- Evaluate later: LanguageTool and wavesurfer.js.
- Do not migrate the current application to H5P or a full LMS.
