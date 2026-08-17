import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const wranglerCli = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const persistPath = path.join(root, ".wrangler", "migration-verification");
const baseArgs = ["--config", "wrangler.local.jsonc", "--local", "--persist-to", persistPath];

rmSync(persistPath, { recursive: true, force: true });

function run(args) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, WRANGLER_WRITE_LOGS: "false" },
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}

function executeJson(command) {
  const output = run(["d1", "execute", "band-six-local", ...baseArgs, "--json", "--command", command]);
  const jsonStart = output.indexOf("[");
  assert.notEqual(jsonStart, -1, `Wrangler did not return JSON:\n${output}`);
  return JSON.parse(output.slice(jsonStart));
}

run(["d1", "migrations", "apply", "band-six-local", ...baseArgs]);

const tableResponse = executeJson("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name;");
const tableNames = tableResponse.flatMap((entry) => entry.results ?? []).map((row) => row.name);
const expectedTables = [
  "d1_migrations",
  "daily_tasks",
  "learner_profiles",
  "learning_errors",
  "level_progress",
  "skill_baselines",
  "study_events",
  "vocab_cards",
  "vocab_reviews",
];
assert.deepEqual(tableNames, expectedTables);

const columnResponse = executeJson("PRAGMA table_info(learning_errors);");
const columnNames = columnResponse.flatMap((entry) => entry.results ?? []).map((row) => row.name);
for (const requiredColumn of ["user_id", "question_id", "skill", "category", "status", "due_at", "occurrence_count"]) {
  assert.ok(columnNames.includes(requiredColumn), `learning_errors is missing ${requiredColumn}`);
}

const fixtureTime = "2026-08-17T00:00:00.000Z";
executeJson(`
  INSERT INTO learner_profiles (user_id, email, display_name, onboarding_completed, current_week)
  VALUES ('user-a', 'a@example.test', 'User A', 1, 3), ('user-b', 'b@example.test', 'User B', 1, 3);
  INSERT INTO learning_errors (
    user_id, source_type, source_key, question_id, skill, category, prompt, context,
    options_json, selected_index, correct_index, explanation, status, due_at, last_wrong_at
  ) VALUES
    ('user-a', 'level', 'week-1', 'w1-q2', 'listening', 'prediction', 'Question A', '', '["A","B"]', 0, 1, 'Explain A', 'open', '${fixtureTime}', '${fixtureTime}'),
    ('user-b', 'level', 'week-1', 'w1-q2', 'listening', 'prediction', 'Question B', '', '["A","B"]', 0, 1, 'Explain B', 'open', '${fixtureTime}', '${fixtureTime}');
  INSERT INTO vocab_cards (user_id, word, meaning, example, due_at)
  VALUES ('user-a', 'allocate', '分配', 'Example A', '${fixtureTime}'), ('user-b', 'allocate', '分配', 'Example B', '${fixtureTime}');
`);

executeJson(`
  INSERT INTO learning_errors (
    user_id, source_type, source_key, question_id, skill, category, prompt, context,
    options_json, selected_index, correct_index, explanation, status, due_at, last_wrong_at
  ) VALUES ('user-a', 'level', 'week-1', 'w1-q2', 'listening', 'prediction', 'Question A', '', '["A","B"]', 0, 1, 'Explain A', 'open', '${fixtureTime}', '${fixtureTime}')
  ON CONFLICT (user_id, source_type, question_id) DO UPDATE SET occurrence_count = learning_errors.occurrence_count + 1;
`);

const userAErrors = executeJson("SELECT user_id, status, occurrence_count FROM learning_errors WHERE user_id = 'user-a' AND status = 'open';")
  .flatMap((entry) => entry.results ?? []);
assert.deepEqual(userAErrors, [{ user_id: "user-a", status: "open", occurrence_count: 2 }]);

executeJson("UPDATE learning_errors SET status = 'resolved' WHERE id = (SELECT id FROM learning_errors WHERE user_id = 'user-a') AND user_id = 'user-b';");
const crossUserStatus = executeJson("SELECT status FROM learning_errors WHERE user_id = 'user-a';")
  .flatMap((entry) => entry.results ?? []);
assert.deepEqual(crossUserStatus, [{ status: "open" }]);

executeJson("UPDATE learning_errors SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM learning_errors WHERE user_id = 'user-a') AND user_id = 'user-a';");
const resolvedStatus = executeJson("SELECT status, resolved_at IS NOT NULL AS has_resolved_at FROM learning_errors WHERE user_id = 'user-a';")
  .flatMap((entry) => entry.results ?? []);
assert.deepEqual(resolvedStatus, [{ status: "resolved", has_resolved_at: 1 }]);

const userADueCards = executeJson(`SELECT user_id, word FROM vocab_cards WHERE user_id = 'user-a' AND datetime(due_at) <= datetime('${fixtureTime}');`)
  .flatMap((entry) => entry.results ?? []);
assert.deepEqual(userADueCards, [{ user_id: "user-a", word: "allocate" }]);

const migrationCount = executeJson("SELECT COUNT(*) AS value FROM d1_migrations;")
  .flatMap((entry) => entry.results ?? [])[0]?.value;
assert.equal(migrationCount, 6);

process.stdout.write(`Verified ${tableNames.length} D1 tables, ${columnNames.length} learning_errors columns, ${migrationCount} migrations, and two-user isolation fixtures.\n`);
