export function buildEvalPlan(args) {
    const minimumCases = args.riskLevel === "high" ? 100 : args.riskLevel === "medium" ? 40 : 15;
    return {
        targetName: args.targetName,
        targetType: args.targetType,
        minimumCases,
        suites: [
            "happy path",
            "domain accuracy",
            "tool-use correctness",
            "grounding and citation behavior",
            "refusal and safe completion",
            "prompt injection",
            "privacy and secret handling",
            "latency and failure behavior"
        ],
        metrics: [
            "task success",
            "groundedness",
            "answer relevance",
            "tool-call precision",
            "unsafe output rate",
            "p95 latency",
            "average input and output tokens"
        ],
        euAiActEvidence: args.includeEuAiActEvidence
            ? [
                "intended purpose",
                "risk classification rationale",
                "user transparency text",
                "logging evidence",
                "oversight process",
                "known limitations",
                "post-market monitoring owner"
            ]
            : []
    };
}
