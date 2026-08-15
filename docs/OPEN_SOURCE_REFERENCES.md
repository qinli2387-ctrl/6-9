# Open-source reference review

Reviewed on 2026-08-15. Re-check licenses before copying code or assets.

## Recommended references

### Athena

- Repository: https://github.com/devjoshi0/Athena
- License: MIT.
- Useful ideas: sequential zigzag roadmap, lock gating, lesson types, XP, streaks, hearts and achievements.
- Decision: use as the main product-flow reference, but reimplement the interface in our own visual language and simpler cloud architecture.
- Caution: very new repository with one visible commit at review time; inspect code quality before reusing individual modules.

### Phaser official Next.js template

- Repository: https://github.com/phaserjs/template-nextjs
- License: MIT.
- Useful ideas: React-to-Phaser bridge and event bus for optional mini-games.
- Decision: only introduce Phaser when the first real match-3 vocabulary level is built. The learning map itself should remain normal React/CSS for accessibility and performance.

### Phaser official examples

- Repository: https://github.com/phaserjs/examples
- Code license: MIT.
- Useful ideas: input, animation, particles, tweening and tile mechanics.
- Caution: repository assets are not covered by the code license; do not copy graphics or audio without checking each asset license.

### Code With Antonio Duolingo clone

- Repository: https://github.com/code-with-antonio/nextjs-duolingo-clone
- Useful ideas: lesson path, hearts, XP, quests, milestones and responsive course UI.
- Decision: architectural inspiration only. No explicit license was visible in the repository at review time, so do not copy code or assets.

## Rejected as a foundation

- Small Candy Crush clones: useful for studying a single board algorithm, but often have unclear asset licenses, weak tests or outdated structure.
- Full Phaser app for every screen: unnecessary for forms, writing, speaking and reports; it would increase load time and reduce accessibility.

## Proposed IELTS game structure

1. Six worlds, each representing four weeks.
2. Each world has foundation, listening, reading, writing, speaking, review and Boss nodes.
3. A learner earns up to three stars per node: completion, accuracy and retention.
4. Review nodes are dynamically generated from mistakes and FSRS due cards.
5. Match-3 is an optional 2–4 minute vocabulary mechanic: matching word, meaning, collocation or audio—not a substitute for exam practice.
