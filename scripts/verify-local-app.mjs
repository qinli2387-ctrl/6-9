import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
const primaryUser = "validation-user-a";
const secondaryUser = "validation-user-b";
const wranglerPath = "node_modules/wrangler/bin/wrangler.js";

function sqlString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function executeSql(command) {
  const result = spawnSync(process.execPath, [
    wranglerPath,
    "d1",
    "execute",
    "band-six-local",
    "--config",
    "wrangler.local.jsonc",
    "--local",
    "--json",
    "--command",
    command,
  ], { encoding: "utf8", windowsHide: true });

  if (result.status !== 0) {
    throw new Error(`D1 command failed:\n${result.stderr || result.stdout}`);
  }
  const response = JSON.parse(result.stdout);
  assert.ok(response.every((entry) => entry.success), "D1 command reported a failure");
  return response.flatMap((entry) => entry.results ?? []);
}

function authHeaders(userId) {
  return {
    "content-type": "application/json",
    "oai-authenticated-user-id": userId,
    "oai-authenticated-user-email": `${userId}@example.test`,
    "oai-authenticated-user-full-name": encodeURIComponent(userId === primaryUser ? "验证用户甲" : "验证用户乙"),
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  };
}

async function requestPost(path, userId, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: userId ? authHeaders(userId) : { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  return { status: response.status, payload };
}

async function post(path, userId, body, expectedStatus) {
  const { status, payload } = await requestPost(path, userId, body);
  assert.equal(status, expectedStatus, `${path}: ${JSON.stringify(payload)}`);
  return payload;
}

async function page(path, userId, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`, { headers: authHeaders(userId) });
  const html = await response.text();
  assert.equal(response.status, expectedStatus, `${path}: ${html.slice(0, 300)}`);
  return html;
}

function cleanupFixtures() {
  const users = `${sqlString(primaryUser)}, ${sqlString(secondaryUser)}`;
  for (const table of [
    "vocab_reviews",
    "vocab_cards",
    "learning_errors",
    "study_events",
    "daily_tasks",
    "level_progress",
    "skill_baselines",
    "learner_profiles",
  ]) {
    executeSql(`DELETE FROM ${table} WHERE user_id IN (${users})`);
  }
}

function vocabularyCorrectIndex(card, pool) {
  const fallbackMeanings = ["显著的；重要的", "因素", "证据；依据", "替代方案；可供选择的"];
  const candidates = [card.meaning, ...pool.filter((item) => item.id !== card.id).map((item) => item.meaning), ...fallbackMeanings];
  const unique = [...new Set(candidates)].slice(0, 4);
  const shift = Math.abs(card.id) % unique.length;
  const options = [...unique.slice(shift), ...unique.slice(0, shift)];
  return options.indexOf(card.meaning);
}

cleanupFixtures();

const noAuth = await post("/api/profile/setup", null, {}, 401);
assert.equal(noAuth.error, "请先登录");

const invalidSetup = await post("/api/profile/setup", primaryUser, {
  examType: "academic",
  examDate: "2020-01-01",
  dailyMinutes: 60,
}, 400);
assert.match(invalidSetup.error, /晚于今天/);

for (const userId of [primaryUser, secondaryUser]) {
  await post("/api/profile/setup", userId, {
    examType: "academic",
    examDate: "2027-12-31",
    dailyMinutes: 60,
  }, 200);
}

const incompletePlacement = await post("/api/placement/complete", primaryUser, {
  listeningAnswers: [1],
}, 400);
assert.match(incompletePlacement.error, /全部听力/);

const writingResponse = "I prefer studying in a small group because other students can explain ideas in a different way. For example, when I misunderstand a reading passage, a classmate may show me the key sentence. Group study also gives me a regular schedule and helps me stay motivated. However, I still need some time alone to review vocabulary and organise my notes. Therefore, my ideal plan is to discuss difficult questions with classmates and then finish my own practice quietly. This balance helps me learn efficiently and check my progress without support.";
const placement = await post("/api/placement/complete", primaryUser, {
  listeningAnswers: [0, 0, 1],
  readingAnswers: [1, 0, 0],
  writingResponse,
  speakingSeconds: 60,
  speakingRatings: { fluency: 3, vocabulary: 3, grammar: 3, pronunciation: 3 },
  durationSeconds: 420,
}, 200);
assert.equal(Object.values(placement.result.skills).reduce((sum, skill) => sum + skill.weight, 0), 100);
assert.equal(executeSql(`SELECT COUNT(*) AS count FROM learning_errors WHERE user_id = ${sqlString(primaryUser)} AND status = 'open'`)[0].count, 6);

const dashboardHtml = await page("/dashboard", primaryUser);
assert.match(dashboardHtml, /今日训练/);
const [task] = executeSql(`SELECT id, skill FROM daily_tasks WHERE user_id = ${sqlString(primaryUser)} AND skill <> 'vocabulary' ORDER BY position LIMIT 1`);
assert.ok(task, "expected a generated non-vocabulary daily task");
const xpBeforeTask = executeSql(`SELECT total_xp AS totalXp FROM learner_profiles WHERE user_id = ${sqlString(primaryUser)}`)[0].totalXp;
const taskAttempts = await Promise.all([
  requestPost("/api/tasks/complete", primaryUser, { taskId: task.id, completed: true }),
  requestPost("/api/tasks/complete", primaryUser, { taskId: task.id, completed: true }),
]);
assert.deepEqual(taskAttempts.map((item) => item.status), [200, 200]);
assert.equal(taskAttempts.reduce((sum, item) => sum + item.payload.xpEarned, 0), 10);
assert.equal(executeSql(`SELECT total_xp AS totalXp FROM learner_profiles WHERE user_id = ${sqlString(primaryUser)}`)[0].totalXp, xpBeforeTask + 10);
assert.equal(executeSql(`SELECT COUNT(*) AS count FROM study_events WHERE user_id = ${sqlString(primaryUser)} AND source_id = ${task.id} AND activity_type = ${sqlString(task.skill)}`)[0].count, 1);
const repeatedTask = await post("/api/tasks/complete", primaryUser, { taskId: task.id, completed: true }, 200);
assert.equal(repeatedTask.xpEarned, 0);

const weekOne = await post("/api/levels/complete", primaryUser, {
  week: 1,
  answers: [1, 0, 1, 1, 1],
  durationSeconds: 180,
}, 200);
assert.equal(weekOne.score, 80);
assert.equal(weekOne.nextWeek, 2);

const weekTwo = await post("/api/levels/complete", primaryUser, {
  week: 2,
  answers: [1, 1, 1, 2, 2],
  durationSeconds: 240,
}, 200);
assert.equal(weekTwo.score, 100);
assert.equal(weekTwo.nextWeek, 3);

const reviewHtml = await page("/levels/3", primaryUser);
assert.match(reviewHtml, /只复习当前真正到期的内容/);
assert.match(reviewHtml, /FSRS 到期词汇/);

const [concurrentCard] = executeSql(`SELECT id FROM vocab_cards WHERE user_id = ${sqlString(primaryUser)} AND datetime(due_at) <= datetime('now') ORDER BY id LIMIT 1`);
assert.ok(concurrentCard, "expected a due vocabulary card for the concurrency check");
const vocabularyAttempts = await Promise.all([
  requestPost("/api/vocabulary/review", primaryUser, { cardId: concurrentCard.id, rating: 3 }),
  requestPost("/api/vocabulary/review", primaryUser, { cardId: concurrentCard.id, rating: 3 }),
]);
assert.deepEqual(vocabularyAttempts.map((item) => item.status).sort((left, right) => left - right), [200, 409]);
assert.equal(executeSql(`SELECT COUNT(*) AS count FROM vocab_reviews WHERE user_id = ${sqlString(primaryUser)} AND card_id = ${concurrentCard.id}`)[0].count, 1);
assert.equal(executeSql(`SELECT COUNT(*) AS count FROM study_events WHERE user_id = ${sqlString(primaryUser)} AND source_id = ${concurrentCard.id} AND activity_type = 'vocabulary_review'`)[0].count, 1);

const errors = executeSql(`SELECT id, correct_index AS correctIndex FROM learning_errors WHERE user_id = ${sqlString(primaryUser)} AND status = 'open' AND datetime(due_at) <= datetime('now') ORDER BY datetime(due_at), id LIMIT 5`);
const cards = executeSql(`SELECT id, word, meaning, example FROM vocab_cards WHERE user_id = ${sqlString(primaryUser)} AND datetime(due_at) <= datetime('now') ORDER BY datetime(due_at), id LIMIT 5`);
const pool = executeSql(`SELECT id, word, meaning, example FROM vocab_cards WHERE user_id = ${sqlString(primaryUser)} ORDER BY id LIMIT 50`);
assert.ok(errors.length >= 3, "expected at least three due learning errors");
assert.ok(cards.length >= 2, "expected at least two due vocabulary cards");

const selected = [
  ...errors.slice(0, 3).map((error) => ({ id: `error:${error.id}`, answer: error.correctIndex })),
  ...cards.slice(0, 2).map((card) => ({ id: `vocab:${card.id}`, answer: vocabularyCorrectIndex(card, pool) })),
];
assert.equal(selected.length, 5);

executeSql(`UPDATE learner_profiles SET current_week = 3 WHERE user_id = ${sqlString(secondaryUser)}`);
const foreignReview = await post("/api/levels/complete", secondaryUser, {
  week: 3,
  answers: [selected[0].answer],
  reviewQuestionIds: [selected[0].id],
}, 409);
assert.match(foreignReview.error, /不属于当前账号/);

const invalidReview = await post("/api/levels/complete", primaryUser, {
  week: 3,
  answers: [],
  reviewQuestionIds: selected.map((item) => item.id),
}, 400);
assert.match(invalidReview.error, /答案数量无效/);

const review = await post("/api/levels/complete", primaryUser, {
  week: 3,
  answers: selected.map((item) => item.answer),
  reviewQuestionIds: selected.map((item) => item.id),
  durationSeconds: 300,
}, 200);
assert.equal(review.score, 100);
assert.equal(review.passed, true);
assert.equal(review.nextWeek, 4);

const selectedErrorIds = selected.filter((item) => item.id.startsWith("error:" )).map((item) => Number(item.id.slice(6)));
const selectedCardIds = selected.filter((item) => item.id.startsWith("vocab:" )).map((item) => Number(item.id.slice(6)));
assert.equal(executeSql(`SELECT COUNT(*) AS count FROM learning_errors WHERE user_id = ${sqlString(primaryUser)} AND id IN (${selectedErrorIds.join(",")}) AND status = 'resolved'`)[0].count, selectedErrorIds.length);
assert.equal(executeSql(`SELECT COUNT(*) AS count FROM vocab_cards WHERE user_id = ${sqlString(primaryUser)} AND id IN (${selectedCardIds.join(",")}) AND datetime(due_at) > datetime('now')`)[0].count, selectedCardIds.length);
assert.equal(executeSql(`SELECT COUNT(*) AS count FROM level_progress WHERE user_id = ${sqlString(primaryUser)} AND level_key = 'week-3' AND status = 'mastered' AND best_score = 100`)[0].count, 1);
assert.equal(executeSql(`SELECT COUNT(*) AS count FROM learning_errors WHERE user_id = ${sqlString(secondaryUser)}`)[0].count, 0);

console.log("Local app integration passed: auth, validation, placement, weeks 1-3, personalized review, atomic task/vocabulary concurrency, FSRS scheduling, and cross-user isolation.");
