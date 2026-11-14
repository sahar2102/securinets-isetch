#!/usr/bin/env node
/**
 * Convert plaintext `flag` fields in data/challenges/*.json into salted
 * hashes. The plaintext never touches the repository after this runs.
 *
 *   node scripts/hash-flags.mjs            # hash every plaintext flag found
 *   node scripts/hash-flags.mjs --check    # verify every challenge has a hash
 *
 * Authors can keep writing `"flag": "SNT{...}"` locally and run this before
 * committing. Once hashed, edit flags from the admin panel instead.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DIR = join(process.cwd(), "data", "challenges");
const checkOnly = process.argv.includes("--check");

const normalize = (value) => value.trim().replace(/\s+/g, " ").replace(/\u00a0/g, " ");
const hash = (flag, salt) =>
  createHash("sha256").update(`${salt}:${normalize(flag)}`).digest("hex");

let changed = 0;
let missing = [];

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
  const path = join(DIR, file);
  const json = JSON.parse(readFileSync(path, "utf8"));
  let dirty = false;

  for (const challenge of json.challenges) {
    if (challenge.flag && !checkOnly) {
      const salt = createHash("sha256")
        .update(`${challenge.slug}:${Math.random()}`)
        .digest("hex")
        .slice(0, 16);
      challenge.salt = salt;
      challenge.flagHash = hash(challenge.flag, salt);
      delete challenge.flag;
      dirty = true;
      changed++;
      console.log(`hashed  ${challenge.slug}`);
    } else if (!challenge.flagHash) {
      missing.push(challenge.slug);
    }
  }

  if (dirty) writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
}

if (missing.length) {
  console.warn(`\n${missing.length} challenge(s) without a flag:\n  ${missing.join("\n  ")}`);
}
console.log(`\n${changed} flag(s) hashed.`);
if (checkOnly) {
  console.log(missing.length ? "FAILED: some challenges have no flag hash." : "OK: every challenge has a hash.");
  process.exit(missing.length ? 1 : 0);
}
