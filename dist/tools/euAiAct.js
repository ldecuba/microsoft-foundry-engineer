const references = [
    "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    "https://digital-strategy.ec.europa.eu/en/policies/enforcement-ai-act",
    "https://digital-strategy.ec.europa.eu/en/factpages/general-purpose-ai-obligations-under-ai-act",
    "https://digital-strategy.ec.europa.eu/en/news/commission-starts-enforcing-ai-act-rules-and-new-transparency-requirements-2-august"
];
export function checkEuAiAct(args) {
    const findings = [];
    if (!args.euUsersOrMarket) {
        findings.push({
            severity: "info",
            title: "EU market not marked in scope",
            detail: "The EU AI Act screen is still useful, but applicability depends on legal scope and market placement.",
            evidence: ["user geography", "customer contracts", "deployment target regions"],
            nextAction: "Confirm with legal whether EU users, EU customers, or EU market placement are in scope."
        });
    }
    if (args.manipulativeOrExploitativeRisk || args.biometricUse) {
        findings.push({
            severity: "critical",
            title: "Potential prohibited-practice review required",
            detail: "The workload has signals that require review before build or release.",
            evidence: ["intended purpose", "affected users", "input data categories", "decision impact"],
            nextAction: "Stop production release until prohibited-practice screening is signed off."
        });
    }
    if (args.interactsWithPeople) {
        findings.push({
            severity: "medium",
            title: "User AI disclosure required",
            detail: "Interactive AI systems need clear user-facing disclosure that the user is interacting with AI where applicable.",
            evidence: ["chat entry screen", "agent welcome message", "support scripts", "accessibility copy"],
            nextAction: "Add and test disclosure text in every channel where the agent appears."
        });
    }
    if (args.generatesOrAltersContent) {
        findings.push({
            severity: "medium",
            title: "Synthetic content transparency evidence required",
            detail: "Generated or altered text, image, audio, or video may need user-facing labels and machine-readable marking.",
            evidence: ["content labels", "metadata strategy", "export pipeline", "watermarking or provenance decision"],
            nextAction: "Document when labels appear and how generated content is marked."
        });
    }
    const highRiskSignal = args.highRiskClaimed ?? args.employmentEducationCreditHealthLawMigrationJusticeUse;
    if (highRiskSignal) {
        findings.push({
            severity: "high",
            title: "High-risk AI system obligations may apply",
            detail: "The use case touches sensitive areas that need formal risk classification and engineering evidence.",
            evidence: ["risk management file", "data governance", "logging", "human oversight", "accuracy and robustness tests", "cybersecurity tests"],
            nextAction: "Create a high-risk evidence pack and get owner, legal, and security review."
        });
    }
    if (args.providerOfGpaiModel) {
        findings.push({
            severity: "high",
            title: "GPAI provider obligations may apply",
            detail: "If the team places a general-purpose AI model on the EU market, provider obligations can include technical documentation, copyright policy, training-content summary, and systemic-risk work for the most capable models.",
            evidence: ["model release plan", "model card", "training data summary", "copyright policy", "downstream provider documentation"],
            nextAction: "Confirm whether this team is a GPAI model provider or only a downstream system provider."
        });
    }
    else if (args.usesThirdPartyGpaiModel) {
        findings.push({
            severity: "medium",
            title: "Downstream GPAI dependency evidence needed",
            detail: "The workload should keep documentation from the GPAI model provider and record model limits for downstream risk management.",
            evidence: ["provider documentation", "model card", "safety notes", "version and deployment record"],
            nextAction: "Store provider documentation with the deployment record."
        });
    }
    return {
        status: findings.some((finding) => finding.severity === "critical") ? "fail" : "review",
        summary: `EU AI Act readiness screen generated for ${args.systemName}. This is an engineering checklist, not legal advice.`,
        findings,
        checklist: [
            { id: "intended-purpose", title: "Intended purpose documented", evidence: "Plain-language purpose, users, decisions supported, and known exclusions." },
            { id: "risk-classification", title: "Risk classification recorded", evidence: "Prohibited, high-risk, transparency-only, GPAI provider, downstream provider, or out-of-scope rationale." },
            { id: "ai-literacy", title: "AI literacy responsibilities assigned", evidence: "Training or guidance for operators and reviewers." },
            { id: "transparency", title: "Transparency text tested", evidence: "Screenshots or transcripts proving user disclosure and content labels." },
            { id: "logging", title: "Logging and traceability active", evidence: "Prompt, response, tool call, model version, user action, and error logs where lawful and proportionate." },
            { id: "oversight", title: "Reviewer process defined", evidence: "Escalation route, override process, and release owner." },
            { id: "monitoring", title: "Post-release monitoring planned", evidence: "Incident route, eval cadence, drift checks, and complaint intake." }
        ],
        references
    };
}
