#!/usr/bin/env node
// Selects CVE ids from a CrAT assessment.json by reachability label.
//
// Usage: node crat-assess-select.mjs <assessment.json> <label>
//   label: unreachable (default) | reachable | potential
//
// "unreachable" returns CVEs the LLM judged UNREACHABLE FROM APPLICATION,
// the ones safe to auto-triage as "Not Affected".

import { readFileSync } from "node:fs";

const assessment = JSON.parse(readFileSync(process.argv[2], "utf8"));
const mode = (process.argv[3] || "unreachable").toLowerCase();
const target =
  mode === "reachable"
    ? "REACHABLE"
    : mode === "potential"
      ? "POTENTIALLY REACHABLE"
      : "UNREACHABLE FROM APPLICATION";

const out = new Set();
for (const component of assessment.components ?? []) {
  for (const a of component.assessments ?? []) {
    if (a.reachabilityLabel === target && a.vulnId) out.add(a.vulnId);
  }
}

console.log([...out].join(","));
