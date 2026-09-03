# Host For Copilot Studio With Azure Container Apps

Copilot Studio needs a reachable HTTPS MCP server. This project now supports Streamable HTTP at:

```text
/mcp
```

Health check:

```text
/health
```

## Local Run

```bash
npm install
npm run build
$env:MCP_API_KEY = "replace-with-a-long-random-value"
npm start
```

Open:

```text
http://localhost:3000/health
```

## Container Build

```powershell
.\scripts\build-container.ps1 -ImageName microsoft-foundry-engineer-mcp:local
```

## Azure Container Apps

Build and push the image to your container registry first. Then deploy:

```powershell
.\scripts\deploy-container-app.ps1 `
  -ResourceGroup rg-foundry-engineer-mcp `
  -Image "<your-registry>.azurecr.io/microsoft-foundry-engineer-mcp:0.1.0" `
  -McpApiKey "<long-random-api-key>" `
  -Location westeurope
```

The deployment outputs:

- MCP URL for Copilot Studio
- health URL for a browser check

## Copilot Studio Values

Use these values when adding the MCP server:

- Name: `Microsoft Foundry Engineer MCP`
- Description: `Use this for Microsoft Foundry deployment planning, evaluation planning, RBAC checks, go-live reports, and EU AI Act readiness.`
- Server URL: the `/mcp` output URL
- Authentication: API key
- API key type: header
- Header name: `Authorization`
- Value: `Bearer <your-api-key>`

## Production Notes

- Use OAuth 2.0 with Entra ID when user-level authorization matters.
- Keep `MCP_API_KEY` in Container Apps secrets or Key Vault.
- Review Power Platform data policies before adding the MCP to production agents.
- Do not publish a tool to broad tenant audiences until the EU AI Act and security evidence pack has an owner.
