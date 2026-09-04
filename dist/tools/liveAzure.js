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
export async function listCognitiveServicesUsage(args) {
    return runAzJson([
        "cognitiveservices",
        "usage",
        "list",
        "--location",
        args.location,
        "--query",
        "[].{name:name.value,localizedName:name.localizedValue,currentValue:currentValue,limit:limit,unit:unit}"
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
export async function checkNetworkPosture(args) {
    const resource = await getFoundryResource({
        name: args.accountName,
        resourceGroup: args.resourceGroup
    });
    const data = resource.data;
    const publicNetworkAccess = data?.publicNetworkAccess ?? "Unknown";
    const privateEndpointConnections = data?.privateEndpointConnections ?? [];
    const networkAcls = data?.networkAcls;
    return {
        status: publicNetworkAccess === "Disabled" || privateEndpointConnections.length > 0 ? "review" : "warning",
        resource,
        assessment: {
            publicNetworkAccess,
            defaultAction: networkAcls?.defaultAction ?? "not configured",
            ipRuleCount: networkAcls?.ipRules?.length ?? 0,
            virtualNetworkRuleCount: networkAcls?.virtualNetworkRules?.length ?? 0,
            privateEndpointConnectionStates: privateEndpointConnections,
            productionConcern: publicNetworkAccess === "Enabled" && privateEndpointConnections.length === 0
                ? "Public network access is enabled and no private endpoint connection was found in the account payload."
                : "Network posture has private access or public access restrictions to review."
        },
        nextActions: [
            "Confirm whether production requires Private Link.",
            "Confirm DNS resolution from the runtime network.",
            "Confirm public network access and firewall rules match the data classification.",
            "Record the result in the go-live evidence pack."
        ]
    };
}
export async function listPrivateEndpoints(args) {
    const query = args.accountName
        ? `[?contains(properties.privateLinkServiceConnections[0].properties.privateLinkServiceId, '${args.accountName}')].{name:name,location:location,provisioningState:properties.provisioningState,connectionState:properties.privateLinkServiceConnections[0].properties.privateLinkServiceConnectionState.status,subnet:properties.subnet.id,privateLinkServiceId:properties.privateLinkServiceConnections[0].properties.privateLinkServiceId}`
        : "[].{name:name,location:location,provisioningState:properties.provisioningState,connectionState:properties.privateLinkServiceConnections[0].properties.privateLinkServiceConnectionState.status,subnet:properties.subnet.id,privateLinkServiceId:properties.privateLinkServiceConnections[0].properties.privateLinkServiceId}";
    return runAzJson(["network", "private-endpoint", "list", "--resource-group", args.resourceGroup, "--query", query]);
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
export async function listAppInsightsComponents(args) {
    const query = "[].{name:name,resourceGroup:resourceGroup,location:location,kind:kind,id:id,appId:properties.AppId,connectionString:properties.ConnectionString}";
    const commandArgs = args.resourceGroup
        ? ["resource", "list", "--resource-group", args.resourceGroup, "--resource-type", "Microsoft.Insights/components", "--query", query]
        : ["resource", "list", "--resource-type", "Microsoft.Insights/components", "--query", query];
    return runAzJson(commandArgs);
}
export async function queryAppInsightsTraces(args) {
    const analyticsQuery = args.query ??
        "traces | union requests, exceptions | order by timestamp desc | take 20";
    const commandArgs = [
        "monitor",
        "app-insights",
        "query",
        "--app",
        args.app,
        "--analytics-query",
        analyticsQuery,
        "--offset",
        args.offset ?? "1h"
    ];
    if (args.resourceGroup) {
        commandArgs.push("--resource-group", args.resourceGroup);
    }
    return runAzJson(commandArgs, 60000);
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
    const quota = args.location
        ? await listCognitiveServicesUsage({ location: args.location })
        : undefined;
    const networkPosture = args.accountName && args.resourceGroup
        ? await checkNetworkPosture({ accountName: args.accountName, resourceGroup: args.resourceGroup })
        : undefined;
    const privateEndpoints = args.resourceGroup
        ? await listPrivateEndpoints({ resourceGroup: args.resourceGroup, accountName: args.accountName })
        : undefined;
    const appInsightsComponents = await listAppInsightsComponents({ resourceGroup: args.resourceGroup });
    const recentTraces = args.appInsightsApp
        ? await queryAppInsightsTraces({ app: args.appInsightsApp, resourceGroup: args.resourceGroup, offset: "1h" })
        : undefined;
    return {
        status: "review",
        account,
        foundryResources: resources,
        modelDeployments: deployments,
        containerApp,
        quota,
        networkPosture,
        privateEndpoints,
        appInsightsComponents,
        recentTraces,
        nextChecks: [
            "Run RBAC export for the exact Foundry account or project scope.",
            "Run evals against the actual deployment or agent.",
            "Confirm EU AI Act classification and evidence owner before production."
        ]
    };
}
