# Visual Evidence Pack

This folder captures the current MacroSignal Oil MVP in a reviewer-friendly form: screenshots of the running app and diagrams.net source diagrams for the core dataflows.

## App Screenshots

| View | Screenshot |
| --- | --- |
| Map overview with global routes and route-risk context | [01-map-overview.png](screenshots/01-map-overview.png) |
| Evidence-gated analyst memo | [02-analyst-memo-evidence-gates.png](screenshots/02-analyst-memo-evidence-gates.png) |
| Market data tab with the selected light operations theme | [03-market-data-light-theme.png](screenshots/03-market-data-light-theme.png) |
| Scenario forecast controls and driver view | [04-scenario-forecast.png](screenshots/04-scenario-forecast.png) |
| Grounded chat surface | [05-grounded-chat.png](screenshots/05-grounded-chat.png) |

## Draw.io Diagrams

Open [macrosignal-dataflows.drawio](diagrams/macrosignal-dataflows.drawio) in diagrams.net or draw.io desktop.

The file contains three pages:

- `Source To Insight Dataflow`: how EIA, CFTC, shipping/geopolitical, and macro-news inputs flow into the backend, storage, evidence gates, features, and UI.
- `Evidence-Gated LLM Workflow`: where claims are allowed, blocked, or contradicted before and after LLM memo generation.
- `Historical ML Pipeline`: how stored history becomes a training dataset, model evaluation loop, prediction API, and scenario forecast UI.

Rendered previews are also included for GitHub review:

| Diagram | PNG | SVG |
| --- | --- | --- |
| Source to insight dataflow | [PNG](diagrams/rendered/source-to-insight-dataflow.png) | [SVG](diagrams/rendered/source-to-insight-dataflow.svg) |
| Evidence-gated LLM workflow | [PNG](diagrams/rendered/evidence-gated-llm-workflow.png) | [SVG](diagrams/rendered/evidence-gated-llm-workflow.svg) |
| Historical ML pipeline | [PNG](diagrams/rendered/historical-ml-pipeline.png) | [SVG](diagrams/rendered/historical-ml-pipeline.svg) |

Note: the editable `.drawio` source is the canonical diagram file. The rendered previews are committed so reviewers can inspect the diagrams without installing draw.io.

## Refreshing Screenshots

Start the backend and frontend, then capture screenshots with Playwright from the `e2e/` package:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

cd ../frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

The screenshots in this pack were captured from:

```text
http://127.0.0.1:5173/
```
