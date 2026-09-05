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
- `foundry_live_run_smoke_prompt`
- `foundry_live_doctor`
- `foundry_live_generate_release_evidence_pack`

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

```text
Run a smoke prompt against deployment gpt-4o on account ais-aifoundry-dev in rg-aifoundry-dev.
```

```text
Generate a release evidence pack for Microsoft Foundry Engineer MCP using rg-aifoundry-dev, ais-aifoundry-dev, westeurope, container app foundry-engineer-mcp, deployment gpt-4o, and include the smoke prompt.
```

## Local Script Test

After building, you can test the same read-only path outside an MCP client:

```bash
npm run doctor:live
```

Run one live model smoke prompt:

```bash
npm run smoke:prompt -- rg-aifoundry-dev ais-aifoundry-dev gpt-4o
```

Generate a Markdown evidence pack:

```bash
npm run evidence:release -- rg-aifoundry-dev ais-aifoundry-dev gpt-4o evidence-pack.md
```

Optional arguments:

```bash
npm run doctor:live -- <resource-group> <foundry-account-name> <container-app-name> <location> <app-insights-name>
```

## Scope

These tools do not create, update, or delete Azure resources. They only inspect current state.

Live mutation tools should be added separately with explicit approval gates.

`foundry_live_run_smoke_prompt` is the exception to pure inspection: it sends one prompt to a selected model deployment and returns the response, latency, token usage, finish reason, and content-filter results. It authenticates with Entra ID by default using an Azure CLI token for `https://cognitiveservices.azure.com/`. You can also pass an API key explicitly.

The smoke prompt uses the Azure OpenAI chat completions route:

```text
POST {endpoint}/openai/deployments/{deploymentName}/chat/completions?api-version=2024-10-21
```

Reference: https://learn.microsoft.com/rest/api/microsoft-foundry/azureopenai/chat
