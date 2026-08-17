import assert from "node:assert/strict";
import test from "node:test";
import { buildReviewLesson, reviewSourceId, selectReviewSources } from "../lib/review-lesson.ts";

function error(id, skill = "listening", category = "distractor") {
  return {
    id,
    skill,
    category,
    prompt: `错题 ${id}`,
    context: "",
    optionsJson: JSON.stringify(["错误答案", "正确答案", "干扰项", "其他"]),
    correctIndex: 1,
    explanation: "回到原文定位答案。",
  };
}

const cards = [
  { id: 10, word: "allocate", meaning: "分配；拨出", example: "The city allocated more funds." },
  { id: 11, word: "decline", meaning: "下降；减少", example: "The figure declined." },
  { id: 12, word: "factor", meaning: "因素", example: "Cost is a factor." },
];

test("balances due errors and vocabulary while keeping stable source ids", () => {
  const sources = selectReviewSources([error(1), error(2), error(3), error(4)], cards, 5);
  assert.deepEqual(sources.map((source) => source.kind), ["error", "error", "error", "vocabulary", "vocabulary"]);

  const lesson = buildReviewLesson(sources, cards);
  assert.equal(lesson.questions.length, 5);
  assert.deepEqual(lesson.questions.map((question) => question.id), sources.map(reviewSourceId));
  assert.match(lesson.questions[0].explanation, /错因：干扰信息/);
});

test("builds deterministic vocabulary choices with the real meaning as the answer", () => {
  const source = { kind: "vocabulary", card: cards[0] };
  const first = buildReviewLesson([source], cards).questions[0];
  const second = buildReviewLesson([source], cards).questions[0];
  assert.deepEqual(first.options, second.options);
  assert.equal(first.options[first.correctIndex], cards[0].meaning);
});

test("rejects malformed stored error options", () => {
  const malformed = { ...error(9), optionsJson: "{}" };
  assert.throws(() => buildReviewLesson([{ kind: "error", error: malformed }], cards), /选项数据无效/);
});

test("rejects a category that does not belong to the stored skill", () => {
  const mismatched = error(10, "listening", "location");
  assert.throws(() => buildReviewLesson([{ kind: "error", error: mismatched }], cards), /错因分类无效/);
});
