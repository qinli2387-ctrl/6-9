import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const migrationDirectory = path.join(root, "drizzle");
const migrationFiles = readdirSync(migrationDirectory)
  .filter((name) => /^\d+_.+\.sql$/.test(name))
  .sort();
const database = new DatabaseSync(":memory:");

database.exec("BEGIN");
try {
  for (const migrationFile of migrationFiles) {
    database.exec(readFileSync(path.join(migrationDirectory, migrationFile), "utf8"));
  }
  database.exec("COMMIT");
} catch (error) {
  database.exec("ROLLBACK");
  throw error;
}

const tableNames = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((row) => row.name);
assert.deepEqual(tableNames, [
  "daily_tasks",
  "learner_profiles",
  "learning_errors",
  "level_progress",
  "skill_baselines",
  "study_events",
  "vocab_cards",
  "vocab_reviews",
]);

const columns = database.prepare("PRAGMA table_info(learning_errors)").all().map((row) => row.name);
for (const requiredColumn of ["user_id", "question_id", "skill", "category", "status", "due_at", "occurrence_count"]) {
  assert.ok(columns.includes(requiredColumn), `learning_errors is missing ${requiredColumn}`);
}

database.close();
process.stdout.write(`Replayed ${migrationFiles.length} migrations; verified ${tableNames.length} tables and ${columns.length} learning_errors columns.\n`);
