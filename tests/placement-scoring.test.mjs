import assert from "node:assert/strict";
import test from "node:test";
import {
  PlacementValidationError,
  buildWeightedDailyTasks,
  calculateTrainingWeights,
  scorePlacement,
} from "../lib/placement.ts";
import { countEnglishWords } from "../lib/placement-utils.ts";

const writingResponse = `I prefer studying in a small group because other students can explain ideas in a different way. For example, when I misunderstand a reading passage, a classmate may show me the key sentence. Group study also gives me a regular schedule and helps me stay motivated. However, I still need some time alone to review vocabulary and organise my notes. Therefore, my ideal plan is to discuss difficult questions with two or three classmates and then finish my own practice quietly. This balance helps me learn efficiently and check whether I can solve problems without support.`;

test("scores all four placement skills and produces weights totalling 100", () => {
  const result = scorePlacement({
    listeningAnswers: [1, 2, 0],
    readingAnswers: [0, 2, 1],
    writingResponse,
    speakingSeconds: 60,
    speakingRatings: { fluency: 3, vocabulary: 3, grammar: 3, pronunciation: 3 },
  });

  assert.equal(result.skills.listening.score, 100);
  assert.equal(result.skills.reading.score, 100);
  assert.ok(result.skills.writing.score >= 75);
  assert.equal(Object.values(result.skills).reduce((sum, skill) => sum + skill.weight, 0), 100);
  assert.ok(result.overallBand >= 5 && result.overallBand <= 6);
});

test("gives the weakest skill the largest training weight", () => {
  const weights = calculateTrainingWeights({ listening: 6, reading: 5.5, writing: 4, speaking: 5 });
  assert.equal(Object.values(weights).reduce((sum, value) => sum + value, 0), 100);
  assert.ok(weights.writing > weights.reading);
  assert.ok(weights.writing > weights.listening);
});

test("builds a daily plan from the two highest weights without changing total minutes", () => {
  const tasks = buildWeightedDailyTasks(60, { listening: 18, reading: 22, writing: 35, speaking: 25 });
  assert.deepEqual(tasks.map((task) => task.skill), ["writing", "vocabulary", "speaking"]);
  assert.equal(tasks.reduce((sum, task) => sum + task.minutes, 0), 60);
  assert.ok(tasks.every((task) => task.minutes >= 10));
});

test("rejects incomplete placement submissions", () => {
  assert.throws(() => scorePlacement({ listeningAnswers: [1] }), PlacementValidationError);
  assert.equal(countEnglishWords("A short, well-formed answer."), 4);
});
