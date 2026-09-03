import { checkEnvironment } from "./environment.js";
import { buildEvalPlan } from "./evaluations.js";
import { checkEuAiAct } from "./euAiAct.js";
import { checkRbac } from "./rbac.js";
export function buildGoLiveReport(args) {
    return {
        systemName: args.systemName,
        environment: args.environment,
        decision: "review-required",
        sections: {
            environment: checkEnvironment({
                requirePrivateNetworking: args.privateNetworking
            }),
            rbac: checkRbac({
                needsDeploymentWrite: true,
                needsDataAccess: true
            }),
            evaluation: buildEvalPlan({
                targetName: args.modelDeployment ?? args.systemName,
                targetType: args.modelDeployment ? "model-deployment" : "agent",
                riskLevel: args.environment === "prod" ? "high" : "medium",
                includeEuAiActEvidence: true
            }),
            euAiAct: checkEuAiAct({
                systemName: args.systemName,
                useCase: args.useCase,
                euUsersOrMarket: args.euUsersOrMarket,
                interactsWithPeople: true,
                generatesOrAltersContent: true,
                biometricUse: false,
                employmentEducationCreditHealthLawMigrationJusticeUse: false,
                manipulativeOrExploitativeRisk: false,
                providerOfGpaiModel: false,
                usesThirdPartyGpaiModel: true
            })
        },
        requiredApprovals: ["engineering owner", "security owner", "product owner", "legal or compliance reviewer for EU AI Act scope"]
    };
}
export function runDoctor(args) {
    return {
        status: "review",
        summary: "Foundry doctor completed a static readiness pass. Wire live Azure checks in the next slice.",
        report: buildGoLiveReport({
            systemName: args.systemName,
            environment: args.environment,
            useCase: args.useCase,
            euUsersOrMarket: args.euUsersOrMarket,
            privateNetworking: args.environment === "prod"
        }),
        nextLiveChecks: [
            "Azure CLI login",
            "Foundry project lookup",
            "model deployment lookup",
            "quota lookup",
            "RBAC export",
            "network access check",
            "Application Insights trace query",
            "evaluation run"
        ]
    };
}
