# Project continuity instructions

This repository is the source of truth for 六分计划. Before making changes, read `docs/PROJECT.md`, `docs/ROADMAP.md`, `docs/PROJECT_STATUS.md`, and `docs/HANDOFF.md`.

Keep the app cloud-first: durable learner data belongs in D1, large future audio files belong in R2, and browser storage is only for temporary interface preferences. Every database query involving learner data must be scoped by the authenticated user ID on the server.

After a meaningful change, update `docs/HANDOFF.md` with what changed, what was verified, and the next concrete task. Never commit passwords, API keys, service tokens, or `.env` files.

Use Chinese for learner-facing copy. Preserve responsive behavior for phone and desktop. Treat AI-generated IELTS scores as estimates and align feedback with official IELTS public band descriptors.

## Default execution protocol

Unless the user explicitly says “只分析，不修改”, complete the full loop: understand the outcome, inventory the project, record the baseline, implement the smallest compatible change, test normal and failure paths, independently review the change, fix valuable findings, run regression tests, update project knowledge, and report facts precisely.

- Distinguish `已验证`, `根据代码判断`, and `尚未验证`. Never promote an assumption to a verified result.
- Run at most five automatic improvement rounds. Stop early when P0/P1 are zero, no serious P2 is known, the build and core tests pass, and further work has low value.
- Prioritize P0 unavailable system, P1 core-function failure, then P2 security/permissions/data consistency. Do not let optional polish delay core work.
- Do not hide failures by deleting tests, swallowing errors, hard-coding fake success, or relabeling errors as warnings.
- Production publication, destructive data operations, force pushes, paid resources, secrets, and account-permission changes still require explicit user authority.
- For every meaningful task, create or update `reports/YYYY-MM-DD_task-name.md` with baseline, changes, tests, failures, review findings, security checks, unresolved items, and next steps.
- Keep `docs/PROJECT_STATUS.md` current so another Codex session can resume without the previous conversation.
