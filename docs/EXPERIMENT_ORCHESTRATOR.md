# Experiment Orchestrator Guide

## Overview

The **Experiment Orchestrator** is a dynamic, no-code pipeline runner that lets you design and execute multi-step experiments without writing code. Perfect for:

- Marketing campaign testing
- Feature experimentation
- AI prompt chains
- Data transformation pipelines
- Compliance workflows

## Core Concept

**Experiments are configurations, not code.** Each experiment is a JSON definition with steps that execute dynamically.

```json
{
  "id": "exp-1",
  "name": "Risk Assessment Pipeline",
  "steps": [
    {
      "id": "input-1",
      "type": "input",
      "name": "Collect Input",
      "config": {}
    },
    {
      "id": "transform-1",
      "type": "transform",
      "name": "Normalize Data",
      "config": {
        "mapping": { "riskScore": "risk_level" }
      }
    },
    {
      "id": "ai-1",
      "type": "ai_decision",
      "name": "AI Decision",
      "config": { "threshold": 0.7 }
    }
  ]
}
```

## Step Types

### 1. Input
Captures or initializes data.

```json
{
  "type": "input",
  "name": "Initial Data",
  "config": { "defaultValue": {} }
}
```

### 2. Transform
Applies field mappings, filters, thresholds.

```json
{
  "type": "transform",
  "name": "Normalize",
  "config": {
    "mapping": { "score": "normalized_score" },
    "filters": { "normalized_score": { "min": 0, "max": 1 } }
  }
}
```

### 3. AI Decision
Makes decisions using AI logic.

```json
{
  "type": "ai_decision",
  "name": "Risk Assessment",
  "config": {
    "threshold": 0.7,
    "agentType": "core-ai"
  }
}
```

### 4. Compliance Check
Validates compliance (GDPR, SOC2, etc).

```json
{
  "type": "compliance_check",
  "name": "GDPR Validation",
  "config": {
    "sensitiveFields": ["email", "userId", "phone"]
  }
}
```

### 5. Metrics
Aggregates metrics and adds timestamps.

```json
{
  "type": "metrics",
  "name": "Final Metrics",
  "config": {}
}
```

### 6. Webhook
Sends data to external endpoints.

```json
{
  "type": "webhook",
  "name": "Send to CRM",
  "config": {
    "url": "https://api.example.com/webhook",
    "method": "POST"
  }
}
```

### 7. Data Mapping
Maps nested object paths.

```json
{
  "type": "data_mapping",
  "name": "Map to CRM Format",
  "config": {
    "mappings": {
      "crm_id": "user.id",
      "crm_email": "user.contact.email"
    }
  }
}
```

## Using the Experiment Page

### 1. Load Experiment

Navigate to `/experiments/[id]` where `[id]` is your experiment ID.

### 2. Input Simulator (Left Panel)

- **Scenario Presets** – Quick templates (Happy Path, High Risk, GDPR Sensitive)
- **Risk Score Slider** – Adjust risk level (0.0 - 1.0)
- **GDPR Toggle** – Include/exclude sensitive data
- **JSON Preview** – Live view of input payload
- **Run Button** – Execute pipeline

### 3. Experiment Flow (Center)

Real-time visualization showing:
- Step name and type
- Active step (glowing border)
- Execution status (success ✓, error ✗, running ⚡)
- Duration for each step
- Data flow between steps

### 4. Run History (Right Panel)

- Previous runs with timestamps
- Click to replay scenario
- View logs and final output

## Creating an Experiment

### Via Database

```sql
INSERT INTO experiments (id, name, definition, user_id) VALUES (
  'exp-marketing',
  'Marketing Campaign Test',
  '{
    "id": "exp-marketing",
    "name": "Marketing Campaign Test",
    "steps": [
      {
        "id": "input-1",
        "type": "input",
        "name": "Campaign Data",
        "config": {}
      },
      {
        "id": "transform-1",
        "type": "transform",
        "name": "Segment Users",
        "config": {
          "mapping": {
            "revenue": "annual_revenue",
            "segment": "customer_segment"
          }
        }
      },
      {
        "id": "ai-1",
        "type": "ai_decision",
        "name": "Personalize Message",
        "config": { "threshold": 0.6 }
      },
      {
        "id": "webhook-1",
        "type": "webhook",
        "name": "Send to Email Service",
        "config": {
          "url": "https://api.sendgrid.com/v3/mail/send",
          "method": "POST"
        }
      }
    ]
  }',
  'user-id-here'
);
```

### Programmatically

```tsx
const experiment: ExperimentDefinition = {
  id: 'exp-custom',
  name: 'Custom Pipeline',
  steps: [
    { id: '1', type: 'input', name: 'Start', config: {} },
    { id: '2', type: 'transform', name: 'Process', config: { mapping: {} } },
  ]
}

const result = await runExperiment({
  experiment,
  input: { riskScore: 0.5 },
  scenario: 'test'
})
```

## Scenario Presets

### Happy Path
```json
{ "riskScore": 0.2, "email": null }
```
Low risk, no sensitive data.

### High Risk
```json
{ "riskScore": 0.9, "email": "user@example.com" }
```
High risk with sensitive data.

### GDPR Sensitive
```json
{ "riskScore": 0.5, "email": "person@eu.com" }
```
GDPR-specific test case.

## Extending with New Step Types

Add a handler to `lib/experiment-runner.ts`:

```tsx
const stepHandlers: Record<string, StepHandler> = {
  // ... existing handlers
  custom_step: async (step, ctx) => {
    const { customConfig } = step.config
    // Custom logic here
    return { result: 'success' }
  }
}
```

Then use in experiment:

```json
{
  "id": "custom-1",
  "type": "custom_step",
  "name": "My Custom Step",
  "config": { "customConfig": "value" }
}
```

## Performance Considerations

- Steps run **sequentially** – each waits for the previous to complete
- Async operations (webhooks, API calls) are awaited
- Logs are streamed in real-time to the UI
- Maximum pipeline duration: **60 seconds** (configurable)

## Debugging

### View Logs

In the Experiment Flow panel, click any step to see:
- Input data
- Output data
- Duration
- Errors (if any)

### Replay Scenario

Click a previous run in Run History to re-visualize and inspect.

### Console Debugging

```tsx
// In step handlers, add debug output
console.log("[v0] Step input:", ctx.prevOutput)
console.log("[v0] Step output:", output)
```

## Limits & Quotas

| Resource | Limit |
|----------|-------|
| Steps per experiment | 50 |
| Step execution time | 30s |
| Payload size | 10 MB |
| Concurrent runs | 10 |
| Stored runs | 1,000 per user |

---

## Next Steps

- [Creating Experiments](./EXPERIMENT_ORCHESTRATOR.md#creating-an-experiment)
- [Step Types Reference](./EXPERIMENT_ORCHESTRATOR.md#step-types)
- [Debugging Guide](./EXPERIMENT_ORCHESTRATOR.md#debugging)
