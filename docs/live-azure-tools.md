# Live Azure Tools

The first live slice is read-only. It uses the Azure CLI context of the machine running the MCP server.

## Requirements

- Azure CLI installed
- Signed in with `az login`
- Correct subscription selected with `az account set`
- Permissions to read Azure AI Services, role assignments, and Container Apps

## Tools

- `foundry_live_account`
- `foundry_live_list_resources`
- `foundry_live_get_resource`
- `foundry_live_list_model_deployments`
- `foundry_live_list_role_assignments`
- `foundry_live_check_quota`
- `foundry_live_check_network_posture`
- `foundry_live_list_private_endpoints`
- `foundry_live_get_container_app_status`
- `foundry_live_list_app_insights`
- `foundry_live_query_app_insights_traces`
- `foundry_live_doctor`

## Example Prompts

```text
Run foundry_live_account and tell me which tenant and subscription you see.
```

```text
List my Foundry resources in rg-aifoundry-dev.
```

```text
Check model deployments for account craifoundrydevil3ytrnz6ojsg in rg-aifoundry-dev.
```

```text
Run foundry_live_doctor for rg-aifoundry-dev and container app foundry-engineer-mcp.
```

```text
Check quota for westeurope.
```

```text
Check network posture for account ais-aifoundry-dev in rg-aifoundry-dev.
```

```text
List private endpoints in rg-aifoundry-dev for account ais-aifoundry-dev.
```

```text
List Application Insights components in rg-aifoundry-dev.
```

```text
Query recent App Insights traces for app <app-insights-name> in rg-aifoundry-dev over the last 1h.
```

## Local Script Test

After building, you can test the same read-only path outside an MCP client:

```bash
npm run doctor:live
```

Optional arguments:

```bash
npm run doctor:live -- <resource-group> <foundry-account-name> <container-app-name> <location> <app-insights-name>
```

## Scope

These tools do not create, update, or delete Azure resources. They only inspect current state.

Live mutation tools should be added separately with explicit approval gates.
