# VS Code MCP Setup

Use local stdio mode in VS Code when you want the MCP to use your existing Azure sign-in.

## Prerequisites

1. Install Node.js 20 or newer.
2. Install Azure CLI.
3. Sign in:

```bash
az login
az account show
```

4. Build the MCP:

```bash
npm install
npm run build
```

## Workspace Config

Create this file in your repo:

```text
.vscode/mcp.json
```

Use this JSON on Windows:

```json
{
  "servers": {
    "microsoft-foundry-engineer": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/server.js"
      ],
      "env": {
        "AZURE_CLI_PATH": "C:\\Program Files\\Microsoft SDKs\\Azure\\CLI2\\python.exe"
      }
    }
  }
}
```

Use this JSON on macOS or Linux:

```json
{
  "servers": {
    "microsoft-foundry-engineer": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/server.js"
      ]
    }
  }
}
```

## Reload VS Code

1. Open the Command Palette.
2. Run `Developer: Reload Window`.
3. Open your AI chat panel.
4. Ask it to list MCP tools.

## First Prompts

```text
Run foundry_live_account.
```

```text
Run foundry_live_doctor for rg-aifoundry-dev, ais-aifoundry-dev, foundry-engineer-mcp, and westeurope.
```

```text
Run foundry_live_run_smoke_prompt for ais-aifoundry-dev using deployment gpt-4o.
```

```text
Generate a release evidence pack for Microsoft Foundry Engineer MCP using rg-aifoundry-dev, ais-aifoundry-dev, westeurope, container app foundry-engineer-mcp, deployment gpt-4o, and include the smoke prompt.
```

## Local Versus Hosted

Use local stdio for tenant-aware engineering work. It uses your Azure CLI login on your machine.

Use hosted HTTPS for Copilot Studio or another client that needs a public MCP endpoint. The hosted endpoint cannot automatically reuse your local Azure CLI sign-in.
