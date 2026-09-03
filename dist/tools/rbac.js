export function checkRbac(args) {
    return {
        status: "review",
        summary: "RBAC review generated. Confirm assignments against the actual Foundry project and connected resources.",
        findings: [
            {
                severity: "medium",
                title: "Use least privilege for deployment and runtime identities",
                detail: "Separate human admin access, CI/CD deployment rights, and runtime data access.",
                evidence: [
                    args.principalName ?? "human or managed identity principal",
                    args.ciCdPrincipalName ?? "CI/CD service principal",
                    "role assignments on Foundry project, storage, search, and telemetry"
                ],
                nextAction: "Export role assignments and remove owner-level access where contributor or scoped roles are enough."
            }
        ],
        checklist: [
            { id: "human-access", title: "Human access reviewed", evidence: "Named users and groups with reason for access." },
            { id: "cicd-access", title: "CI/CD access reviewed", evidence: args.needsDeploymentWrite ? "Deployment write role assigned only to CI/CD principal." : "No deployment write role needed." },
            { id: "runtime-access", title: "Runtime access reviewed", evidence: args.needsDataAccess ? "Runtime identity has scoped read/write data permissions." : "Runtime does not require connected data access." },
            { id: "secretless", title: "Secretless runtime preferred", evidence: "Managed identity used instead of long-lived keys where supported." }
        ]
    };
}
