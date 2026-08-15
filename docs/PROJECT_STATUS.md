# 六分计划项目状态

Last updated: 2026-08-15

## Product objective

为雅思初学者提供 24 周云端训练教练，以账号同步听说读写训练、词汇复习、错题和可视化闯关进度。目标 6.0 是学习目标，不是结果保证；计划必须在四科摸底后个性化。

## Current architecture

- React 19 + Vinext web application.
- Cloudflare Worker runtime through Sites.
- Drizzle ORM + Cloudflare D1 for learner data.
- ChatGPT identity headers for cross-device account identity.
- `ts-fsrs` 5.4.1 for vocabulary scheduling.
- Responsive React/CSS level map; optional Phaser mini-game is deferred.
- GitHub `qinli2387-ctrl/6-9`, branch `main`, is the durable source handoff.

## Verified features

- Responsive landing page and independent public demo.
- 24-week map divided into six worlds with locked, active, passed and mastered states.
- Playable weeks 1–4 with immediate explanations, score, stars, XP and sequential unlock.
- Authenticated onboarding and server-side user scoping in learner-data queries.
- FSRS starter deck, due queue, four ratings and full scheduling/review-log persistence.
- Vocabulary mobile flow: reveal answer, rate memory, load next card and update progress.
- Production build, full lint and rendered landing regression test pass locally.
- GitHub handoff is current through commit `62567d7`.

## Partially verified

- The FSRS page and client interaction were verified through the `/demo/vocabulary` route in a fresh production server at 430×900.
- The authenticated vocabulary API and D1 migration pass build/type analysis and code review, but have not yet run against a reachable production D1 database.
- The standalone public demo is reachable and previously browser-verified, but it intentionally uses browser-local progress and is not the authenticated formal application.

## Known issues

### P0

- The project ID in `.openai/hosting.json` returns `Sites project not found`. The authenticated formal app therefore cannot currently be deployed or cross-device tested. Do not create a replacement until project ownership/state is deliberately resolved.

### P1

- No four-skill placement test exists, so the 24-week plan is still mostly fixed.
- Only the first four weeks contain playable learning material.
- Review levels are not yet dynamically generated from mistakes and due cards.
- Writing and speaking submission/estimated feedback are not implemented.

### P2

- Data export, deletion and backup-recovery drill are missing.
- Production D1 migration and authenticated multi-device synchronization remain unverified.
- PWA manifest, offline recovery and complete WCAG 2.2 audit are missing.

## Important decisions

- Keep the learning loop primary; XP, stars and match-3 must represent real retrieval or exam practice.
- Use Phaser only for the optional 2–4 minute match-3 vocabulary level; normal screens remain React/CSS.
- Use original, licensed or officially permitted practice content. Do not copy assets from unlicensed clones.
- AI writing and speaking results must be labelled estimated and calibrated against official descriptors and samples.
- All durable learner data is cloud data and every server query must include the authenticated `userId`.

## Failed or blocked approaches

- The existing Sites project cannot be retrieved; repeated lookup returns `Sites project not found`.
- An old local production process served stale chunk names after a rebuild. Starting a fresh process fixed the issue and the browser smoke test passed. Always restart the production server after rebuilding before UI acceptance.
- GitHub pushes previously suffered network resets, but commits `295b0b6` and `62567d7` pushed successfully on 2026-08-15.

## Next concrete tasks

1. Build a short four-skill placement flow and store baseline skill estimates.
2. Resolve the formal Sites project, apply migration `0003`, and verify one account on two devices.
3. Add structured reading/listening error categories and generate review levels from errors plus FSRS due cards.
4. Expand weeks 5–8 with original or licensed IELTS-aligned material.
5. Prototype match-3 only after the same due-card queue is available in the formal app.
