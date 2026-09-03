# Use This MCP In Copilot Studio

## What You Need First

Copilot Studio needs an MCP server URL that it can reach over HTTPS.

The current server in this repo runs as a local stdio MCP server:

```bash
node dist/server.js
```

That works for local MCP clients. For Copilot Studio, add an HTTPS Streamable MCP host before connecting it.

## Setup Steps

1. Host the MCP server behind HTTPS.

   Good options:

   - Azure Container Apps
   - Azure App Service
   - Azure Functions with a Streamable MCP adapter
   - Any internal HTTPS service reachable by Copilot Studio

2. Protect the endpoint.

   For a first controlled test, use an API key.

   For production, use OAuth 2.0 with Entra ID if user-level authorization matters.

3. Open Copilot Studio.

4. Open or create your agent.

5. Go to the agent's Build tab.

6. Open Tools.

7. Select Add.

8. Select Model Context Protocol.

9. Enter:

   - Name: `Microsoft Foundry Engineer MCP`
   - Description: `Use this for Microsoft Foundry deployment planning, evaluation planning, RBAC checks, go-live reports, and EU AI Act readiness.`
   - Server URL: your HTTPS MCP endpoint
   - Authentication: API key or OAuth 2.0

10. Save the MCP server.

11. Review the tools Copilot Studio discovers.

12. Start with these enabled:

   - `foundry_doctor`
   - `foundry_check_eu_ai_act`
   - `foundry_generate_go_live_report`
   - `foundry_validate_environment`
   - `foundry_create_deployment_plan`
   - `foundry_generate_eval_plan`
   - `foundry_check_rbac`

13. Add the agent instructions from `copilot-studio/foundry-engineer-agent.md`.

14. Test in Preview.

## Test Prompt

```text
Can my Foundry support agent go live for EU users?
```

The agent should call the MCP and return missing engineering evidence, including EU AI Act readiness gaps.

## Important Limit

The MCP connection reference must be created in Copilot Studio first. After you add the server in the UI and pull the agent files locally, you can use `mcp-action-foundry-engineer.mcs.yml` as the shape for editing the action metadata.

