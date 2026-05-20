# Implementation Plan: MacroSignal Oil

## 1. Purpose

This document breaks MacroSignal Oil into buildable work packages with test-driven development expectations. Testing is part of every phase: schema tests, unit tests, integration tests, AI regression tests, E2E tests, and visual verification.

The goal is to build a polished case-study intelligence simulator without losing engineering discipline.

For developer-ready tickets with dependencies, acceptance criteria, and required tests, see `docs/DEV-TASKS-MacroSignal-Oil.md`.

## 2. Development Principles

1. Write or define tests before implementing risky behavior.
2. Treat schemas as product contracts.
3. Keep the UI data-driven from the beginning.
4. Gate every LLM output through validation.
5. Prefer small vertical slices over large unfinished systems.
6. Do not add live data providers until the demo provider is stable.
7. Every phase must have a clear definition of done.

## 3. Recommended Tooling

### Frontend

- Vite React
- TypeScript
- Vitest
- React Testing Library
- Playwright
- MapLibre GL
- deck.gl
- Tailwind CSS
- ECharts
- Zustand or lightweight React state

### Backend

- FastAPI
- Pydantic
- pytest
- httpx test client
- ruff or equivalent linting

### AI Testing

- Structured output schemas
- Prompt snapshots
- Golden test cases
- Refusal tests
- Evidence citation tests
- Mock LLM adapter for deterministic tests

### E2E And Visual

- Playwright
- Screenshot checks
- Basic canvas/map nonblank checks
- Accessibility smoke checks

## 4. Global Definition Of Done

A feature is done only when:

- It is implemented.
- Relevant unit tests pass.
- Relevant schema tests pass.
- Integration behavior is covered where needed.
- E2E path is updated if the user workflow changed.
- Error/loading/empty states are handled.
- No unsupported AI claims are rendered.
- Documentation is updated if behavior or architecture changed.

## 5. Phase 0: Project Setup And Quality Gates

### Objective

Create the base application structure and automated quality checks.

### Build

- Initialize frontend app.
- Initialize backend app.
- Add shared development scripts.
- Add linting and formatting.
- Add test runners.
- Add Playwright.
- Add basic CI-style local command.
- Add environment variable examples.

### Tests First

Create failing smoke tests before feature work:

- Frontend renders app shell.
- Backend health endpoint returns OK.
- Playwright opens the app.

### Unit Tests

- App shell renders product name.
- Top-level error boundary renders fallback.

### Integration Tests

- Frontend can call backend health endpoint in local/dev mode.

### E2E Tests

- User opens app and sees `MacroSignal Oil`.
- Page has no fatal console errors.

### Definition Of Done

- One command runs frontend tests.
- One command runs backend tests.
- One command runs E2E tests.
- Health check works.
- Basic app shell is visible.

## 6. Phase 1: Core Schemas And Demo Dataset Provider

### Objective

Define the data contracts that everything else depends on.

### Build

- Define Pydantic backend schemas:
  - CaseStudy
  - MarketEvent
  - Evidence
  - RouteSignal
  - RegionSignal
  - IndicatorSignal
  - CounterSignal
  - WatchIndicator
  - ScenarioAssumptions
  - ScenarioForecast
- Define matching TypeScript types or generated client schemas.
- Implement DemoDatasetProvider.
- Create first case study: Red Sea Shipping Risk.
- Add provider endpoints:
  - `GET /api/cases`
  - `GET /api/cases/:caseId`

### Tests First

Write schema validation tests before adding full case data.

### Schema Tests

- Reject missing required fields.
- Reject invalid coordinates.
- Reject severity outside 0-1.
- Reject confidence outside 0-1.
- Reject invalid impact direction.
- Reject invalid impact type.
- Reject events with missing evidence IDs.
- Verify every evidence ID resolves.
- Verify every source ID resolves.
- Verify every route has at least two coordinates.

### Unit Tests

- DemoDatasetProvider lists case summaries.
- DemoDatasetProvider returns a complete case study.
- Provider throws controlled error for unknown case ID.

### Integration Tests

- `GET /api/cases` returns valid summaries.
- `GET /api/cases/:caseId` returns schema-valid case data.

### E2E Tests

- App loads case list from backend.
- Case selector shows Red Sea case.

### Definition Of Done

- Red Sea case study validates.
- Case APIs return validated data.
- Frontend can display case metadata.
- Invalid demo data fails tests.

## 7. Phase 2: Map-First Static UI

### Objective

Build the core command-center layout before adding complex dynamic behavior.

### Build

- AppShell.
- TopBar.
- CaseStudySelector.
- TimeHorizonToggle.
- PriceChip.
- Left LayerControlPanel.
- RightInsightPanel.
- Bottom IntelligenceDrawer.
- Static map canvas with dark style.
- Basic loading and error states.

### Tests First

Define component rendering expectations before connecting full map data.

### Unit Tests

- TopBar renders product name, case selector, time toggle, Brent/WTI chips.
- LayerControlPanel renders expected layer toggles.
- RightInsightPanel renders default case summary.
- IntelligenceDrawer renders tabs: Analyst Memo, Scenario Forecast, Chat.
- PriceChip handles positive, negative, and neutral moves.

### Integration Tests

- Selecting a case updates top bar and right panel summary.
- Toggling weekly/monthly updates displayed period.

### E2E Tests

- User can open the app and see the full dashboard layout.
- User can switch bottom drawer tabs.
- User can toggle a layer control.

### Visual Verification

- Desktop screenshot shows map as dominant center element.
- Panels do not overlap.
- Text does not overflow.
- Map area is not blank.

### Definition Of Done

- Layout matches design spec.
- Static map-first UI is usable.
- Core UI components have tests.
- E2E smoke path passes.

## 8. Phase 3: Data-Driven Map Layers

### Objective

Render hotspots, routes, chokepoints, regions, and risk zones from case-study data.

### Build

- OilMap component.
- Event marker layer.
- Shipping route layer.
- Chokepoint layer.
- Region/risk zone layer.
- Map legend encoding.
- Marker click selection.
- Timeline hover/click selection.
- Connected highlights between map, right panel, and timeline.

### Tests First

Write data-to-layer transformation tests before map rendering polish.

### Unit Tests

- Converts events into marker render data.
- Converts route signals into line/arc layer data.
- Converts region signals into polygon layer data.
- Maps impact direction to color.
- Maps impact type to icon.
- Maps severity to marker size.
- Maps confidence to opacity/border style.

### Integration Tests

- Selecting an event updates RightInsightPanel.
- Toggling a layer hides/shows its map data.
- Timeline click selects matching event.
- Unknown event ID does not crash UI.

### E2E Tests

- User selects Red Sea case.
- User sees event hotspots.
- User clicks `Red Sea Shipping Risk`.
- Right panel updates with event details.
- User toggles shipping routes off and on.

### Visual Verification

- Map is nonblank.
- Hotspots are visible.
- Routes render.
- Selected marker is distinguishable.
- Legend matches marker colors/icons.

### Definition Of Done

- Map is fully data-driven for one case.
- Event selection works across map, timeline, and right panel.
- Layer controls work.
- Visual encoding is test-covered.

## 9. Phase 4: Complete Curated Case Study Dataset

### Objective

Add all six v1 case studies and make switching between them feel like switching intelligence scenes.

### Build

Create curated JSON for:
- Red Sea Shipping Risk
- OPEC Supply Discipline
- China Demand Slowdown
- Fed/USD Shock
- U.S. Inventory Draw
- Energy Transition Pressure

Each case must include:
- Events
- Routes or regions where relevant
- Indicators
- Evidence
- Sources
- Counter-signals
- Watch indicators
- Scenario templates
- Historical analogues

### Tests First

Add a fixture validation test that scans every case file.

### Schema Tests

- Every case file validates.
- Every event has evidence.
- Every case has at least one counter-signal.
- Every case has at least three watch indicators.
- Every case has at least one scenario template.
- Every case has Brent and WTI price movement data.

### Unit Tests

- Case selector renders all six cases.
- Case summary cards use correct impact direction and impact type.

### Integration Tests

- Switching case updates map focus, markers, routes, panels, and price chips.

### E2E Tests

- User cycles through all six cases.
- Each case shows at least one visible hotspot.
- Each case has a populated right panel.

### Definition Of Done

- All six case studies validate.
- Case switching is stable.
- No case produces empty primary UI.
- Dataset is rich enough for memo/scenario/chat generation.

## 10. Phase 5: AI Output Contracts And Mock LLM Adapter

### Objective

Build the AI system boundaries before calling a real LLM.

### Build

- AIOrchestrator interface.
- MockLLMAdapter for deterministic tests.
- Prompt registry.
- Memo output schema.
- Scenario output schema.
- Chat output schema.
- Validation and repair flow.
- Evidence citation checker.

### Tests First

Write tests against mock LLM outputs:
- valid output
- invalid JSON
- unsupported evidence ID
- missing disclaimer
- trading advice language

### Unit Tests

- Valid memo output passes.
- Memo with nonexistent evidence ID fails.
- Scenario without experimental range disclaimer fails.
- Chat answer without evidence reference fails when factual claims exist.
- Trading advice language is blocked or flagged.
- Invalid output triggers one repair attempt.
- Failed repair returns controlled error.

### Integration Tests

- Memo endpoint returns structured memo from mock adapter.
- Scenario endpoint returns structured forecast from mock adapter.
- Chat endpoint returns grounded answer from mock adapter.

### AI Gate Tests

Gate 1: Input validation
- Reject malformed scenario assumptions.
- Reject unknown case ID.

Gate 2: Grounding
- Reject unsupported evidence IDs.
- Require evidence references for major claims.

Gate 3: Output schema
- Enforce JSON schema.
- Enforce required fields.

Gate 4: Forecast safety
- Require experimental disclaimer.
- Block trading advice.

Gate 5: Refusal behavior
- Unsupported question returns insufficient-evidence response.

### Definition Of Done

- AI endpoints work with mock adapter.
- All AI gates are test-covered.
- No real LLM is needed for deterministic test suite.

## 11. Phase 6: Analyst Memo Generation

### Objective

Generate a grounded analyst memo from selected case-study evidence.

### Build

- Real memo prompt.
- Memo generation endpoint.
- AnalystMemo UI.
- Evidence links in memo.
- Loading, retry, and failure states.
- Optional memo caching per case/time horizon.

### Tests First

Create golden memo expectations for one case before live integration.

### Unit Tests

- Prompt includes only selected case evidence.
- Prompt includes evidence IDs.
- Prompt includes no unsupported source text.
- Memo renderer handles all required fields.
- Memo renderer handles missing optional fields.

### Integration Tests

- Memo endpoint returns valid structured memo.
- Memo evidence IDs resolve to visible evidence cards.
- Memo failure does not break map UI.

### AI Regression Tests

- Memo includes counter-signals when present.
- Memo uses uncertainty language.
- Memo does not claim exact causality.
- Memo does not invent live data.
- Memo does not recommend trades.

### E2E Tests

- User opens Analyst Memo tab.
- User generates memo.
- Memo appears with ranked drivers, evidence, confidence, and counter-signals.
- User clicks evidence reference and related event highlights.

### Definition Of Done

- Memo generation is grounded and validated.
- UI remains stable during loading/failure.
- Evidence references are interactive.

## 12. Phase 7: Scenario Forecasting

### Objective

Allow users to run scenario-based directional forecasts using toggles and optional natural language.

### Build

- ScenarioControls component.
- ScenarioForecast endpoint.
- ScenarioOutput component.
- Natural-language scenario field.
- Directional outlook cards for Brent and WTI.
- Risk ranking.
- Experimental price range.
- Historical analogues.
- Invalidating signals.

### Tests First

Write forecast validation tests before UI polish.

### Unit Tests

- Scenario controls produce valid assumptions object.
- Invalid assumptions are rejected.
- Experimental price range always includes disclaimer.
- Output renderer labels forecast as conditional.
- Directional outlook handles bullish, bearish, neutral, and mixed.

### Integration Tests

- Scenario endpoint accepts toggles and returns valid forecast.
- Natural-language question is included as optional context.
- Scenario changes update output.

### AI Regression Tests

- Forecast is conditional, not certain.
- Forecast includes invalidating signals.
- Forecast includes confidence.
- Forecast avoids trading advice.
- Conflicting assumptions produce nuanced or mixed output.

### E2E Tests

- User opens Scenario Forecast tab.
- User changes OPEC policy and shipping risk.
- User runs forecast.
- Directional forecast updates.
- Experimental price range disclaimer is visible.

### Definition Of Done

- Scenario forecasting is interactive.
- Output is schema-valid and safety-gated.
- Forecast language is conditional and explainable.

## 13. Phase 8: Grounded Follow-Up Chat

### Objective

Add chat that answers questions only from the selected case-study evidence.

### Build

- GroundedChat component.
- Suggested prompts.
- Chat endpoint.
- Evidence selection/retrieval from current case.
- Chat message history.
- Insufficient-evidence response.
- Evidence references in answers.

### Tests First

Write refusal and grounding tests before adding free-form chat UX.

### Unit Tests

- Suggested prompts render.
- Chat input validates non-empty question.
- Chat answer renderer displays evidence references.
- Insufficient-evidence response is styled distinctly.

### Integration Tests

- Chat endpoint receives selected case ID.
- Chat endpoint only searches selected case evidence.
- Chat endpoint returns evidence references.

### AI Regression Tests

- "What is today's Brent price?" is refused or qualified.
- "Should I buy oil futures?" is refused.
- "Why is this bullish for Brent?" answers from evidence.
- "Which signal has lowest confidence?" computes from case data.
- "Give exact cause of the price move" is qualified.
- Prompt injection inside evidence is ignored.

### E2E Tests

- User opens Chat tab.
- User clicks suggested prompt.
- Chat returns grounded answer with evidence reference.
- User asks unsupported live-data question.
- Chat gives insufficient-evidence response.

### Definition Of Done

- Chat is useful and visibly grounded.
- Unsupported questions are handled safely.
- Chat does not escape selected case evidence.

## 14. Phase 9: Visual Polish And Interaction Quality

### Objective

Make the app feel like the generated concept: serious, cinematic, and polished.

### Build

- Route animations.
- Marker pulse states.
- Case transition animations.
- Improved panel hierarchy.
- Better legend and icon treatment.
- Chart polish.
- Responsive tablet behavior.
- Keyboard and focus states.
- Loading skeletons.

### Tests First

Define visual and interaction acceptance checks.

### Unit Tests

- Components handle long labels.
- Components handle missing optional fields.
- Confidence badge maps values correctly.

### E2E Tests

- No panel overlap at desktop viewport.
- Bottom drawer expands/collapses.
- Case transitions do not blank the map.
- Keyboard navigation reaches major controls.

### Visual Verification

- Desktop screenshot at 1440x900.
- Wide desktop screenshot at 1920x1080.
- Tablet screenshot around 1024x768.
- Map canvas nonblank check.
- Hotspots visible check.
- Text overflow check for key panels.

### Definition Of Done

- Product feels demo-ready.
- Screenshots match the intended design direction.
- UI remains readable and stable across target viewports.

## 15. Phase 10: Portfolio Demo Hardening

### Objective

Prepare the project for review, demo, and future buildout.

### Build

- README.
- Demo script.
- Architecture summary.
- Known limitations.
- Testing instructions.
- Future roadmap.
- Optional short walkthrough video plan.

### Tests

- Full test suite passes.
- E2E suite passes.
- AI regression suite passes.
- Schema validation passes for all cases.

### Acceptance Demo Path

The final demo should show:

1. Open MacroSignal Oil.
2. Select Red Sea Shipping Risk.
3. Inspect map hotspots and shipping route.
4. Click hotspot and review event details.
5. Generate analyst memo.
6. Run scenario with severe shipping risk and OPEC cuts hold.
7. Ask chat: "What would invalidate this scenario?"
8. Switch to China Demand Slowdown.
9. Show map and memo update.

### Definition Of Done

- A reviewer can run the app locally.
- A reviewer can run tests locally.
- Demo path is stable.
- Limitations are documented honestly.
- Project clearly demonstrates AI engineering, product thinking, geospatial UI, and testing discipline.

## 16. Cross-Phase Test Matrix

| Area | Unit | Integration | E2E | Regression |
| --- | --- | --- | --- | --- |
| Schemas | Yes | Yes | No | Yes |
| Demo provider | Yes | Yes | Yes | No |
| Map layers | Yes | Yes | Yes | Visual |
| UI panels | Yes | Yes | Yes | Visual |
| Memo AI | Yes | Yes | Yes | AI |
| Scenario AI | Yes | Yes | Yes | AI |
| Chat AI | Yes | Yes | Yes | AI |
| Safety gates | Yes | Yes | Partial | AI |
| Case switching | Yes | Yes | Yes | Visual |
| Forecast disclaimers | Yes | Yes | Yes | AI |

## 17. Priority Build Order

Build in this order:

1. Project setup.
2. Schemas and Red Sea case.
3. Static UI shell.
4. Data-driven map for one case.
5. All six case studies.
6. AI gates with mock LLM.
7. Analyst memo.
8. Scenario forecast.
9. Grounded chat.
10. Visual polish.
11. Portfolio hardening.

## 18. First Sprint Recommendation

The first sprint should produce a thin vertical slice:

- App shell.
- Backend health endpoint.
- Case-study schemas.
- Red Sea case JSON.
- DemoDatasetProvider.
- `GET /api/cases`.
- `GET /api/cases/:caseId`.
- Top bar with case selector.
- Static map area.
- Right panel showing Red Sea summary.
- Tests for schema validation and provider behavior.
- Playwright smoke test.

This creates the foundation without getting trapped in map polish or LLM complexity too early.
