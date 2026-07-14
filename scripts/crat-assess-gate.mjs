#!/usr/bin/env node
// Blocks a PR when CrAT `assess` finds a REACHABLE vulnerability at or above a
// severity floor. Reads the assessment-<ts>.json that `manifest-cli crat` writes.
//
// Usage:
//   node crat-assess-gate.mjs --assessment <file> --severity-floor HIGH [--dry-run]
//
// Only REACHABLE blocks. POTENTIALLY REACHABLE is reported but does not block
// (it's the non-deterministic middle ground; keep the hard gate on confident
// findings). Exit 1 = block; branch protection turns that into a blocked merge.

import { readFileSync } from "node:fs";

function flag(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return !next || next.startsWith("--") ? fallback : next;
}

const file = flag("--assessment");
const floor = String(flag("--severity-floor", "HIGH")).toUpperCase();
const dryRun = process.argv.includes("--dry-run");

const RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const floorRank = RANK[floor] ?? RANK.HIGH;
const rank = (s) => RANK[String(s || "").toUpperCase()] ?? 0; // unknown never blocks

const data = JSON.parse(readFileSync(file, "utf8"));
const rows = [];
for (const c of data.components ?? []) {
  for (const v of c.assessments ?? []) {
    rows.push({ pkg: c.name, cve: v.vulnId, label: v.reachabilityLabel, sev: v.cvssSeverity || "?" });
  }
}

const blocking = rows.filter((r) => r.label === "REACHABLE" && rank(r.sev) >= floorRank);
const reachableBelow = rows.filter((r) => r.label === "REACHABLE" && rank(r.sev) < floorRank);
const potential = rows.filter((r) => r.label === "POTENTIALLY REACHABLE");
const unreachable = rows.filter((r) => r.label === "UNREACHABLE FROM APPLICATION");

const rule = "-".repeat(72);
console.log(rule);
console.log(`CrAT assess gate   floor: ${floor}${dryRun ? "   (dry-run)" : ""}   model: ${data.llmModel ?? "?"}`);
console.log(rule);
const section = (label, arr) => {
  console.log(`${label}: ${arr.length}`);
  for (const r of arr) console.log(`  - ${r.cve}  ${r.pkg}  [${r.sev}]`);
};
section("BLOCKING (reachable, at or above floor)", blocking);
section("Reachable, below floor", reachableBelow);
section("Potentially reachable (not blocking)", potential);
console.log(`Unreachable: ${unreachable.length}`);
console.log(rule);

if (blocking.length > 0) {
  if (dryRun) {
    console.log(`DRY-RUN: ${blocking.length} finding(s) would block this PR. Not failing.`);
    process.exit(0);
  }
  console.error(`FAIL: ${blocking.length} reachable vulnerability(ies) at or above ${floor}.`);
  process.exit(1);
}
console.log("PASS: no reachable vulnerabilities at or above the floor.");
process.exit(0);
