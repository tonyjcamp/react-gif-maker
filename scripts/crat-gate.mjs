#!/usr/bin/env node
// CrAT reachability gate.
//
// Reads a CVE watchlist and a CrAT `reach` output, then decides whether to
// block. A watchlisted package blocks the run when it is reachable from this
// repo's code AND its severity is at or above the chosen floor.
//
// Usage:
//   node scripts/crat-gate.mjs \
//     --watchlist crat-watchlist.json \
//     --reach crat-reach.json \
//     --severity-floor HIGH \
//     [--dry-run]
//
// Exit code 1 means "block" (a reachable, in-scope CVE was found). Branch
// protection turns that non-zero exit into a blocked merge.

import { readFileSync } from "node:fs";

function flagValue(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  if (!next || next.startsWith("--")) return fallback;
  return next;
}

const watchlistPath = flagValue("--watchlist", "crat-watchlist.json");
const reachPath = flagValue("--reach", "crat-reach.json");
const severityFloor = String(flagValue("--severity-floor", "HIGH")).toUpperCase();
const dryRun = process.argv.includes("--dry-run");

const RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const floorRank = RANK[severityFloor] ?? RANK.HIGH;

// An unrecognized severity should never block on its own. Rank it below LOW
// so it only counts when the floor is set to the lowest level deliberately.
const severityRank = (s) => RANK[s] ?? 0;

const watchlist = JSON.parse(readFileSync(watchlistPath, "utf8"));
const reach = JSON.parse(readFileSync(reachPath, "utf8"));

// Index the reach results by package name.
const reachByName = new Map();
for (const entry of Array.isArray(reach) ? reach : []) {
  reachByName.set(entry.name, entry);
}

// A package is reachable if CrAT found any code path or direct call site.
function pathCount(entry) {
  if (!entry) return 0;
  const summaryPaths = entry.summary?.totalPaths ?? 0;
  const direct = Array.isArray(entry.directUsage) ? entry.directUsage.length : 0;
  return Math.max(summaryPaths, direct);
}

const blocking = [];
const belowFloor = [];
const notReachable = [];

for (const item of watchlist.packages ?? []) {
  const severity = String(item.severity ?? "HIGH").toUpperCase();
  const entry = reachByName.get(item.name);
  const paths = pathCount(entry);
  const record = { name: item.name, cve: item.cve ?? "", severity, paths };

  if (paths === 0) {
    notReachable.push(record);
  } else if (severityRank(severity) < floorRank) {
    belowFloor.push(record);
  } else {
    blocking.push(record);
  }
}

const rule = "-".repeat(72);
console.log(rule);
console.log(`CrAT reachability gate   floor: ${severityFloor}${dryRun ? "   (dry-run)" : ""}`);
console.log(rule);

function section(label, rows) {
  console.log(`${label}: ${rows.length}`);
  for (const r of rows) {
    const where = r.paths > 0 ? `reachable, ${r.paths} path(s)` : "not reachable";
    console.log(`  - ${r.name}  [${r.severity}]  ${r.cve}  ${where}`);
  }
}

section("BLOCKING (reachable, at or above floor)", blocking);
section("Below severity floor (reachable)", belowFloor);
section("Not reachable / not a dependency", notReachable);
console.log(rule);

if (blocking.length > 0) {
  if (dryRun) {
    console.log(`DRY-RUN: ${blocking.length} finding(s) would block this PR. Not failing.`);
    process.exit(0);
  }
  console.error(`FAIL: ${blocking.length} reachable watchlisted package(s) at or above ${severityFloor}.`);
  process.exit(1);
}

console.log("PASS: no reachable watchlisted packages at or above the floor.");
process.exit(0);
