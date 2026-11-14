/**
 * Keeps data/challenges/*.json in sync with the files actually present in
 * public/challenges. Run after adding or regenerating artefacts:
 *
 *   node scripts/sync-artifact-sizes.mjs
 *
 * It reports missing files (a broken download is worse than a missing one)
 * and rewrites the human-readable `size` field.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dataDir = join(root, "data", "challenges");
const pub = join(root, "public");

const human = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

let missing = 0;
let updated = 0;

for (const file of readdirSync(dataDir).filter((f) => f.endsWith(".json"))) {
  const path = join(dataDir, file);
  const json = JSON.parse(readFileSync(path, "utf8"));

  for (const ch of json.challenges) {
    for (const f of ch.files ?? []) {
      const abs = join(pub, f.href.replace(/^\//, ""));
      if (!existsSync(abs)) {
        console.warn(`MISSING  ${ch.slug} -> ${f.href}`);
        missing++;
        continue;
      }
      const size = human(statSync(abs).size);
      if (f.size !== size) {
        f.size = size;
        updated++;
      }
    }
  }

  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
}

console.log(`sizes updated: ${updated}; missing files: ${missing}`);
