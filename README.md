# Microsoft Foundry Engineer MCP

An MCP workbench for engineers building with Microsoft Foundry.

It focuses on practical engineering jobs:

- Check local Azure and Foundry readiness.
- Inspect projects, model deployments, quota, RBAC, and network posture.
- Test deployments and agents.
- Run evaluation checks.
- Generate deployment, runbook, and governance templates.
- Screen a Foundry workload for EU AI Act readiness gaps.

## Current Build

This is a foundation build. Tools return structured checklists, commands, and expected evidence. The next slice can wire selected tools to live Azure CLI, Foundry SDK, and telemetry calls.

## Install

```bash
npm install
npm run build
```

## Run

```bash
npm run start:stdio
```

Hosted HTTP mode for Copilot Studio:

```bash
npm start
```

For local checks without an MCP client:

```bash
npm run doctor
npm run validate:eu-ai-act
```

## MCP Tools

- `foundry_validate_environment`
- `foundry_create_deployment_plan`
- `foundry_generate_agent_manifest`
- `foundry_generate_eval_plan`
- `foundry_check_rbac`
- `foundry_check_eu_ai_act`
- `foundry_generate_go_live_report`
- `foundry_doctor`
- `foundry_live_account`
- `foundry_live_list_resources`
- `foundry_live_get_resource`
- `foundry_live_list_model_deployments`
- `foundry_live_list_role_assignments`
- `foundry_live_get_container_app_status`
- `foundry_live_check_quota`
- `foundry_live_check_network_posture`
- `foundry_live_list_private_endpoints`
- `foundry_live_list_app_insights`
- `foundry_live_query_app_insights_traces`
- `foundry_live_run_smoke_prompt`
- `foundry_live_doctor`

The `foundry_live_*` tools are read-only and use the Azure CLI login available to the machine running the MCP server.

## Copilot Studio

Copilot Studio can use this MCP after the server is hosted behind a reachable HTTPS Streamable MCP endpoint.

See:

- `docs/hosting-azure-container-apps.md`
- `copilot-studio/setup-guide.md`
- `copilot-studio/foundry-engineer-agent.md`
- `copilot-studio/mcp-action-foundry-engineer.mcs.yml`

## EU AI Act Checks

The EU AI Act tool checks:

- whether the use case may fall under prohibited practices
- whether users are told they are interacting with AI
- whether generated or altered content needs labels or machine-readable marking
- whether the workload looks like a high-risk AI system
- whether the team is acting as a GPAI model provider, downstream provider, or deployer
- whether technical documentation, logging, oversight, risk management, accuracy, robustness, cybersecurity, and post-market monitoring evidence exists
- which current obligation dates apply

This MCP does not give legal advice. It gives engineering evidence gaps and review prompts so legal, compliance, and product owners have something concrete to inspect.
