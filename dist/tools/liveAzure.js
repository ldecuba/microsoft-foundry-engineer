import { runAzJson } from "../services/azureCli.js";
export async function getAzureAccount() {
    return runAzJson(["account", "show", "--query", "{tenantId:tenantId,subscriptionId:id,name:name,user:user.name}"]);
}
export async function listFoundryResources(args) {
    const query = "[].{name:name,resourceGroup:resourceGroup,location:location,kind:kind,sku:sku.name,endpoint:properties.endpoint,customSubDomainName:properties.customSubDomainName,publicNetworkAccess:properties.publicNetworkAccess}";
    const commandArgs = args.resourceGroup
        ? ["cognitiveservices", "account", "list", "--resource-group", args.resourceGroup, "--query", query]
        : ["cognitiveservices", "account", "list", "--query", query];
    return runAzJson(commandArgs);
}
export async function getFoundryResource(args) {
    return runAzJson([
        "cognitiveservices",
        "account",
        "show",
        "--name",
        args.name,
        "--resource-group",
        args.resourceGroup,
        "--query",
        "{name:name,resourceGroup:resourceGroup,location:location,kind:kind,sku:sku.name,endpoint:properties.endpoint,publicNetworkAccess:properties.publicNetworkAccess,networkAcls:properties.networkAcls,privateEndpointConnections:properties.privateEndpointConnections[].properties.privateLinkServiceConnectionState.status}"
    ]);
}
export async function listModelDeployments(args) {
    return runAzJson([
        "cognitiveservices",
        "account",
        "deployment",
        "list",
        "--name",
        args.accountName,
        "--resource-group",
        args.resourceGroup,
        "--query",
        "[].{name:name,model:properties.model.name,version:properties.model.version,format:properties.model.format,sku:sku.name,capacity:sku.capacity,raiPolicy:properties.raiPolicyName,provisioningState:properties.provisioningState}"
    ]);
}
export async function listRoleAssignments(args) {
    const commandArgs = ["role", "assignment", "list"];
    if (args.scope) {
        commandArgs.push("--scope", args.scope);
    }
    if (args.assignee) {
        commandArgs.push("--assignee", args.assignee);
    }
    commandArgs.push("--query", "[].{principalName:principalName,principalType:principalType,roleDefinitionName:roleDefinitionName,scope:scope}");
    return runAzJson(commandArgs, 60000);
}
export async function getContainerAppStatus(args) {
    return runAzJson([
        "containerapp",
        "show",
        "--name",
        args.name,
        "--resource-group",
        args.resourceGroup,
        "--query",
        "{name:name,resourceGroup:resourceGroup,location:location,provisioningState:properties.provisioningState,runningStatus:properties.runningStatus,fqdn:properties.configuration.ingress.fqdn,image:properties.template.containers[0].image,outboundIpAddresses:properties.outboundIpAddresses}"
    ]);
}
export async function runLiveDoctor(args) {
    const account = await getAzureAccount();
    const resources = await listFoundryResources({ resourceGroup: args.resourceGroup });
    const deployments = args.accountName && args.resourceGroup
        ? await listModelDeployments({ accountName: args.accountName, resourceGroup: args.resourceGroup })
        : {
            ok: false,
            command: "az cognitiveservices account deployment list",
            error: "Provide accountName and resourceGroup to list deployments."
        };
    const containerApp = args.containerAppName && args.resourceGroup
        ? await getContainerAppStatus({ name: args.containerAppName, resourceGroup: args.resourceGroup })
        : undefined;
    return {
        status: "review",
        account,
        foundryResources: resources,
        modelDeployments: deployments,
        containerApp,
        nextChecks: [
            "Confirm model quota in the target Foundry region.",
            "Run RBAC export for the exact Foundry account or project scope.",
            "Run evals against the actual deployment or agent.",
            "Confirm EU AI Act classification and evidence owner before production."
        ]
    };
}
