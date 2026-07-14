#!/usr/bin/env node
// Blocks a PR when CrAT `assess` finds a REACHABLE vulnerability at or above a
// severity floor. Reads the assessment-<ts>.json that `manifest-cli crat` writes.
//
// Usage:
//   node crat-assess-gate.mjs --assessment <file> --severity-floor HIGH [--dry-run]
//
// Blocks on REACHABLE OR POTENTIALLY REACHABLE at or above the floor. Gating on
// both (not just REACHABLE) is deliberate: the LLM can flip a borderline CVE
// between REACHABLE and POTENTIALLY across runs on identical code, so gating on
// the union keeps the pass/fail decision stable. Exit 1 = block; branch
// protection turns that into a blocked merge.

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

const blocks = (r) => (r.label === "REACHABLE" || r.label === "POTENTIALLY REACHABLE") && rank(r.sev) >= floorRank;
const belowFloor = (r) => (r.label === "REACHABLE" || r.label === "POTENTIALLY REACHABLE") && rank(r.sev) < floorRank;
const blocking = rows.filter(blocks);
const below = rows.filter(belowFloor);
const unreachable = rows.filter((r) => r.label === "UNREACHABLE FROM APPLICATION");

const rule = "-".repeat(72);
console.log(rule);
console.log(`CrAT assess gate   floor: ${floor}${dryRun ? "   (dry-run)" : ""}   model: ${data.llmModel ?? "?"}`);
console.log(rule);
const section = (label, arr) => {
  console.log(`${label}: ${arr.length}`);
  for (const r of arr) console.log(`  - ${r.cve}  ${r.pkg}  [${r.sev}]  ${r.label}`);
};
section("BLOCKING (reachable or potentially reachable, at or above floor)", blocking);
section("Below severity floor (not blocking)", below);
console.log(`Unreachable: ${unreachable.length}`);
console.log(rule);

if (blocking.length > 0) {
  if (dryRun) {
    console.log(`DRY-RUN: ${blocking.length} finding(s) would block this PR. Not failing.`);
    process.exit(0);
  }
  console.error(`FAIL: ${blocking.length} reachable/potentially-reachable vulnerability(ies) at or above ${floor}.`);
  process.exit(1);
}
console.log("PASS: no reachable or potentially-reachable vulnerabilities at or above the floor.");
process.exit(0);
