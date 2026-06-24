#!/usr/bin/env node
// Selects which CVEs to auto-triage as "Not Affected" based on CrAT reachability.
//
// A CVE is auto-triageable when EVERY package it affects is unreachable from the
// application (CrAT found zero call paths). If any affected package is reachable,
// the CVE is left for a human, this stays conservative on purpose.
//
// Usage: node crat-triage-select.mjs <watchlist.json> <reach.json>
// Prints the comma-separated list of unreachable CVE ids.

import { readFileSync } from "node:fs";

const watchlist = JSON.parse(readFileSync(process.argv[2], "utf8"));
const reach = JSON.parse(readFileSync(process.argv[3], "utf8"));

const reachable = new Set();
for (const e of Array.isArray(reach) ? reach : []) {
  const paths = Math.max(e.summary?.totalPaths ?? 0, e.directUsage?.length ?? 0);
  if (paths > 0) reachable.add(e.name);
}

// Group watchlist rows (one per cve+package) by CVE.
const byCve = new Map();
for (const row of watchlist.packages ?? []) {
  if (!byCve.has(row.cve)) byCve.set(row.cve, []);
  byCve.get(row.cve).push(row);
}

const unreachable = [];
for (const [cve, rows] of byCve) {
  if (rows.every((r) => !reachable.has(r.name))) unreachable.push(cve);
}

console.log([...new Set(unreachable)].join(","));
