# Showcase Guide

Use this guide when you want to demo the Microsoft Foundry Engineer MCP as a complete engineering assistant.

## What To Show

1. Tenant awareness
2. Foundry resource inventory
3. Model deployments
4. Quota and usage
5. Network posture and private endpoints
6. Hosted MCP health
7. App Insights traces
8. Live smoke prompt
9. EU AI Act readiness
10. Release evidence pack

## Five Minute Demo

### 1. Prove The Tenant

Prompt:

```text
Run foundry_live_account and tell me which Azure tenant, subscription, and user you see.
```

Expected result:

- Subscription name and ID
- Tenant ID
- Signed-in user

### 2. Show Foundry Resources

Prompt:

```text
List Foundry resources in rg-aifoundry-dev, then show the resource details for ais-aifoundry-dev.
```

Expected result:

- Account name
- Region
- Endpoint
- SKU
- Public network access setting

### 3. Show Deployments And Quota

Prompt:

```text
List model deployments for ais-aifoundry-dev and check quota in westeurope.
```

Expected result:

- Deployment names
- Model names and versions
- Capacity
- Quota and current usage

### 4. Show Network And Access Evidence

Prompt:

```text
Check network posture, private endpoints, and RBAC evidence for rg-aifoundry-dev and ais-aifoundry-dev.
```

Expected result:

- Public network access review
- Firewall rule count
- Private endpoint connection state
- Role assignment export

### 5. Run A Live Smoke Prompt

Prompt:

```text
Run foundry_live_run_smoke_prompt for ais-aifoundry-dev using deployment gpt-4o.
```

Expected result:

- HTTP status 200
- Latency
- Token usage
- Finish reason
- Content filter results
- One short model response

### 6. Generate The Release Pack

Prompt:

```text
Generate a release evidence pack for Microsoft Foundry Engineer MCP using rg-aifoundry-dev, ais-aifoundry-dev, westeurope, container app foundry-engineer-mcp, deployment gpt-4o, and include the smoke prompt.
```

Expected result:

- Markdown release evidence pack
- Raw JSON evidence
- EU AI Act findings
- Next actions for sign-off

## Terminal Backup

Run this after `npm run build`:

```bash
npm run evidence:release -- rg-aifoundry-dev ais-aifoundry-dev gpt-4o evidence-pack.md
```

The script writes a Markdown evidence pack to `evidence-pack.md`.

## Demo Tips

- Start with the account check so people see it is connected to the real tenant.
- Use the live smoke prompt near the end. It is the clearest proof that the deployment responds.
- Close with the evidence pack. It shows this is more than a tool list; it creates a release record.
- If App Insights is not configured yet, say that trace evidence is ready but waiting on an App Insights component name.

## Useful Hosted URLs

- Health: `https://foundry-engineer-mcp.whitebay-07b090af.westeurope.azurecontainerapps.io/health`
- MCP endpoint: `https://foundry-engineer-mcp.whitebay-07b090af.westeurope.azurecontainerapps.io/mcp`
