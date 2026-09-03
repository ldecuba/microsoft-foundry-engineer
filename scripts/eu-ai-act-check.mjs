#!/usr/bin/env node

const now = new Date().toISOString();

const report = {
  generatedAt: now,
  status: "review",
  summary: "EU AI Act engineering readiness checklist. Fill in the workload facts before using this as release evidence.",
  checks: [
    "Confirm whether EU users, EU customers, or EU market placement are in scope.",
    "Document intended purpose, users, affected decisions, and excluded uses.",
    "Screen for prohibited practices before build or release.",
    "Triage whether the system is high-risk.",
    "Add user-facing AI disclosure for interactive systems.",
    "Label generated or altered content where applicable.",
    "Keep model provider documentation when using third-party GPAI models.",
    "Record logging, oversight, accuracy, robustness, cybersecurity, and monitoring evidence.",
    "Assign legal or compliance reviewer before production release."
  ],
  currentMilestones: [
    "AI Act entered into force: 2024-08-01.",
    "Prohibited-practice and AI-literacy obligations started applying: 2025-02-02.",
    "GPAI model provider obligations started applying: 2025-08-02.",
    "Main AI Act application and transparency enforcement: 2026-08-02.",
    "Additional non-consensual intimate material and CSAM-related prohibition: 2026-12-02.",
    "Annex III high-risk rules: 2027-12-02.",
    "High-risk rules for regulated products: 2028-08-02."
  ]
};

console.log(JSON.stringify(report, null, 2));
