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
npx microsoft-foundry-engineer-mcp
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

