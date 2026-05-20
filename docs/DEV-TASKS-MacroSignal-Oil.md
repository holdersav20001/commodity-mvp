# Developer Tasks: MacroSignal Oil

## 1. Purpose

This backlog turns the implementation plan into developer-ready tasks. Each task includes scope, dependencies, acceptance criteria, and required tests.

Tasks are ordered roughly by build sequence. Developers should avoid skipping ahead to visual polish or real LLM integration until the schema, provider, and testing gates are stable.

## 2. Size Guide

- S: 0.5-1 day
- M: 1-2 days
- L: 3-5 days
- XL: split before starting

## 3. Phase 0: Project Setup And Quality Gates

### TASK-001: Initialize Frontend App

Phase: 0  
Size: S  
Depends on: None

Goal:
Create the Vite React TypeScript frontend app with a minimal app shell.

Likely files/modules:
- `frontend/package.json`
- `frontend/src/App.tsx`
- `frontend/src/main.tsx`
- `frontend/src/styles/`

Acceptance criteria:
- Frontend app starts locally.
- App renders `MacroSignal Oil`.
- Basic app shell placeholder exists.
- TypeScript is enabled.

Tests required:
- Unit test: app shell renders product name.
- Unit test: app does not crash on initial render.

### TASK-002: Initialize Backend App

Phase: 0  
Size: S  
Depends on: None

Goal:
Create the FastAPI backend with a health endpoint.

Likely files/modules:
- `backend/pyproject.toml`
- `backend/app/main.py`
- `backend/app/api/health.py`
- `backend/tests/`

Acceptance criteria:
- Backend starts locally.
- `GET /api/health` returns OK.
- pytest is configured.

Tests required:
- Integration test: health endpoint returns 200.
- Unit test: health response has expected shape.

### TASK-003: Add Shared Developer Commands

Phase: 0  
Size: S  
Depends on: TASK-001, TASK-002

Goal:
Add consistent commands for running, testing, linting, and formatting.

Likely files/modules:
- Root `README.md`
- Root package/task scripts if used
- `frontend/package.json`
- `backend/pyproject.toml`

Acceptance criteria:
- One documented command runs frontend tests.
- One documented command runs backend tests.
- One documented command starts frontend.
- One documented command starts backend.

Tests required:
- Manual verification of documented commands.

### TASK-004: Configure Frontend Test Stack

Phase: 0  
Size: S  
Depends on: TASK-001

Goal:
Configure Vitest and React Testing Library.

Likely files/modules:
- `frontend/vitest.config.ts`
- `frontend/src/test/`
- `frontend/src/App.test.tsx`

Acceptance criteria:
- `npm test` or equivalent runs frontend tests.
- App shell test passes.

Tests required:
- App shell renders product title.
- Top-level fallback/error boundary renders if included.

### TASK-005: Configure Backend Test Stack

Phase: 0  
Size: S  
Depends on: TASK-002

Goal:
Configure pytest, httpx test client, and backend test structure.

Likely files/modules:
- `backend/tests/conftest.py`
- `backend/tests/test_health.py`
- `backend/pyproject.toml`

Acceptance criteria:
- pytest runs.
- Health endpoint test passes.

Tests required:
- Health endpoint returns 200.
- Health endpoint response validates.

### TASK-006: Configure Playwright E2E

Phase: 0  
Size: M  
Depends on: TASK-001, TASK-002

Goal:
Add Playwright with a smoke test that opens the app.

Likely files/modules:
- `e2e/playwright.config.ts`
- `e2e/tests/smoke.spec.ts`
- Root test scripts

Acceptance criteria:
- Playwright can open local frontend.
- Smoke test sees `MacroSignal Oil`.
- Test checks for fatal console errors.

Tests required:
- E2E: app loads.
- E2E: no fatal console errors.

## 4. Phase 1: Core Schemas And Demo Dataset Provider

### TASK-101: Define Backend Pydantic Schemas

Phase: 1  
Size: M  
Depends on: TASK-005

Goal:
Define backend data schemas for case studies, events, evidence, routes, regions, indicators, scenarios, and forecasts.

Likely files/modules:
- `backend/app/schemas/case_study.py`
- `backend/app/schemas/scenario.py`
- `backend/app/schemas/ai_outputs.py`

Acceptance criteria:
- CaseStudy schema exists.
- MarketEvent schema exists.
- Evidence schema exists.
- ScenarioAssumptions schema exists.
- ScenarioForecast schema exists.
- Enums match architecture doc.

Tests required:
- Valid minimal case study passes.
- Invalid impact direction fails.
- Invalid impact type fails.
- Invalid coordinates fail.
- Severity/confidence outside 0-1 fail.

### TASK-102: Define Frontend Types

Phase: 1  
Size: S  
Depends on: TASK-101

Goal:
Create TypeScript types or schema definitions matching backend contracts.

Likely files/modules:
- `frontend/src/data/schemas.ts`
- `frontend/src/data/types.ts`

Acceptance criteria:
- Frontend has typed CaseStudy, MarketEvent, Evidence, ScenarioAssumptions, ScenarioForecast.
- Types match backend schema names and enums.

Tests required:
- Typecheck passes.
- Optional unit test for frontend schema parsing if using Zod.

### TASK-103: Create Red Sea Case Study JSON

Phase: 1  
Size: M  
Depends on: TASK-101

Goal:
Create the first curated case study for Red Sea Shipping Risk.

Likely files/modules:
- `backend/data/cases/red-sea-shipping-risk.json`

Acceptance criteria:
- Case includes Brent and WTI price movement.
- Case includes events, routes, regions, evidence, sources, counter-signals, watch indicators, scenario templates, and historical analogues.
- Every event references valid evidence.
- Coordinates are valid.

Tests required:
- Schema fixture test validates Red Sea JSON.
- Test verifies every event has evidence.
- Test verifies every evidence source resolves.

### TASK-104: Implement DemoDatasetProvider

Phase: 1  
Size: M  
Depends on: TASK-101, TASK-103

Goal:
Load and validate curated case studies from local JSON files.

Likely files/modules:
- `backend/app/providers/demo_dataset_provider.py`
- `backend/app/providers/base.py`
- `backend/tests/providers/test_demo_dataset_provider.py`

Acceptance criteria:
- Provider lists available cases.
- Provider returns full case by ID.
- Provider validates case before returning.
- Unknown case ID returns controlled error.

Tests required:
- Provider lists Red Sea case.
- Provider returns schema-valid Red Sea case.
- Unknown ID raises expected error.
- Invalid fixture fails validation.

### TASK-105: Add Case Study API Endpoints

Phase: 1  
Size: M  
Depends on: TASK-104

Goal:
Expose case study list and details over the backend API.

Likely files/modules:
- `backend/app/api/cases.py`
- `backend/app/main.py`
- `backend/tests/api/test_cases.py`

Acceptance criteria:
- `GET /api/cases` returns metadata list.
- `GET /api/cases/:caseId` returns full case.
- Responses validate.
- Unknown case returns 404.

Tests required:
- Integration test: list cases.
- Integration test: fetch Red Sea case.
- Integration test: unknown case returns 404.

### TASK-106: Connect Frontend To Case API

Phase: 1  
Size: M  
Depends on: TASK-105

Goal:
Load case list and active case data in the frontend.

Likely files/modules:
- `frontend/src/data/apiClient.ts`
- `frontend/src/state/caseStudyStore.ts`
- `frontend/src/App.tsx`

Acceptance criteria:
- Frontend fetches case list.
- Frontend fetches selected case.
- Loading and error states exist.

Tests required:
- Unit test: API client handles case list.
- Unit test: API client handles fetch error.
- E2E: case selector shows Red Sea case.

## 5. Phase 2: Map-First Static UI

### TASK-201: Build App Shell Layout

Phase: 2  
Size: M  
Depends on: TASK-106

Goal:
Create the main command-center layout: top bar, left panel, map center, right panel, bottom drawer.

Likely files/modules:
- `frontend/src/components/shell/AppShell.tsx`
- `frontend/src/components/shell/TopBar.tsx`
- `frontend/src/components/panels/LeftPanel.tsx`
- `frontend/src/components/panels/RightInsightPanel.tsx`
- `frontend/src/components/panels/IntelligenceDrawer.tsx`

Acceptance criteria:
- Layout matches design spec at desktop viewport.
- Map area is dominant.
- Panels are readable.

Tests required:
- Unit test: shell renders all major regions.
- E2E: dashboard layout visible.
- Visual check: no overlap at 1440x900.

### TASK-202: Build Top Bar Controls

Phase: 2  
Size: S  
Depends on: TASK-201

Goal:
Implement product name, case selector, time horizon toggle, Brent/WTI price chips, and scenario button.

Likely files/modules:
- `frontend/src/components/shell/TopBar.tsx`
- `frontend/src/components/common/PriceChip.tsx`
- `frontend/src/components/common/TimeHorizonToggle.tsx`

Acceptance criteria:
- Case selector displays available cases.
- Weekly/monthly toggle updates selected horizon.
- Brent and WTI chips render price moves.

Tests required:
- Unit test: PriceChip renders positive, negative, neutral.
- Unit test: time horizon toggle calls change handler.
- Integration test: selecting case updates displayed title.

### TASK-203: Build Layer Control Panel

Phase: 2  
Size: S  
Depends on: TASK-201

Goal:
Implement layer toggles, filters, and impact legend.

Likely files/modules:
- `frontend/src/components/panels/LayerControlPanel.tsx`
- `frontend/src/components/panels/ImpactLegend.tsx`

Acceptance criteria:
- Layer toggles exist for events, routes, chokepoints, infrastructure, macro regions, transition signals.
- Legend matches design spec.

Tests required:
- Unit test: all layer toggles render.
- Unit test: toggling layer updates state.
- Unit test: legend contains all impact colors and icons.

### TASK-204: Build Right Insight Panel Default State

Phase: 2  
Size: S  
Depends on: TASK-201

Goal:
Show active case summary, top drivers placeholder, confidence, and watch indicators.

Likely files/modules:
- `frontend/src/components/panels/RightInsightPanel.tsx`
- `frontend/src/components/panels/DriverRankList.tsx`
- `frontend/src/components/common/ConfidenceBadge.tsx`

Acceptance criteria:
- Default state renders active case summary.
- Confidence badge renders.
- Watch indicators render.

Tests required:
- Unit test: default panel renders case summary.
- Unit test: confidence badge maps value to label/style.

### TASK-205: Build Intelligence Drawer Tabs

Phase: 2  
Size: S  
Depends on: TASK-201

Goal:
Add bottom drawer with Analyst Memo, Scenario Forecast, and Chat tabs.

Likely files/modules:
- `frontend/src/components/panels/IntelligenceDrawer.tsx`
- `frontend/src/components/memo/AnalystMemo.tsx`
- `frontend/src/components/scenario/ScenarioControls.tsx`
- `frontend/src/components/chat/GroundedChat.tsx`

Acceptance criteria:
- Drawer can switch tabs.
- Drawer can collapse/expand if included in v1.
- Placeholder content exists for each tab.

Tests required:
- Unit test: tabs render.
- Unit test: tab selection changes content.
- E2E: user switches tabs.

## 6. Phase 3: Data-Driven Map Layers

### TASK-301: Add MapLibre Base Map

Phase: 3  
Size: M  
Depends on: TASK-201

Goal:
Render a dark world map as the main canvas.

Likely files/modules:
- `frontend/src/components/map/OilMap.tsx`
- `frontend/src/components/map/mapStyle.ts`

Acceptance criteria:
- Map renders in center canvas.
- Map is not blank.
- Map resizes with layout.

Tests required:
- Unit test: OilMap renders container.
- E2E: map container visible.
- Visual check: map nonblank.

### TASK-302: Transform Events To Marker Data

Phase: 3  
Size: M  
Depends on: TASK-102, TASK-301

Goal:
Create pure transformation functions for event markers and visual encoding.

Likely files/modules:
- `frontend/src/components/map/layers/eventMarkers.ts`
- `frontend/src/components/map/encoding.ts`

Acceptance criteria:
- Impact direction maps to color.
- Impact type maps to icon.
- Severity maps to marker size.
- Confidence maps to opacity/border.

Tests required:
- Unit test: bullish maps to green.
- Unit test: bearish maps to red.
- Unit test: shipping maps to ship icon.
- Unit test: high severity creates larger marker.
- Unit test: lower confidence reduces opacity or changes border.

### TASK-303: Render Event Hotspots

Phase: 3  
Size: M  
Depends on: TASK-302

Goal:
Render case-study events as clickable map hotspots.

Likely files/modules:
- `frontend/src/components/map/EventMarkerLayer.tsx`
- `frontend/src/state/mapStore.ts`

Acceptance criteria:
- Events appear on map.
- Clicking marker selects event.
- Selected marker has distinct style.

Tests required:
- Integration test: selected marker updates state.
- E2E: user clicks Red Sea hotspot and sees right panel update.

### TASK-304: Render Routes And Chokepoints

Phase: 3  
Size: M  
Depends on: TASK-301

Goal:
Render shipping routes and chokepoints from case-study data.

Likely files/modules:
- `frontend/src/components/map/RouteLayer.tsx`
- `frontend/src/components/map/ChokepointLayer.tsx`

Acceptance criteria:
- Active routes render.
- Chokepoints render.
- Layer toggle hides/shows routes.

Tests required:
- Unit test: route coordinate transform.
- Integration test: route layer respects toggle.
- E2E: user toggles shipping routes off/on.

### TASK-305: Render Regions And Risk Zones

Phase: 3  
Size: M  
Depends on: TASK-301

Goal:
Render region overlays and risk zones.

Likely files/modules:
- `frontend/src/components/map/RiskZoneLayer.tsx`
- `frontend/src/components/map/RegionLayer.tsx`

Acceptance criteria:
- Regions render from case data.
- Risk zone style reflects impact direction and severity.
- Layer toggle hides/shows regions.

Tests required:
- Unit test: region style maps direction/severity correctly.
- Integration test: region layer respects toggle.

### TASK-306: Connect Timeline To Map Selection

Phase: 3  
Size: M  
Depends on: TASK-303

Goal:
Add case timeline and connect it to map event selection.

Likely files/modules:
- `frontend/src/components/panels/CaseTimeline.tsx`
- `frontend/src/state/mapStore.ts`

Acceptance criteria:
- Timeline lists case events.
- Hover highlights map event.
- Click selects map event and updates right panel.

Tests required:
- Unit test: timeline renders events.
- Integration test: click selects event.
- E2E: click timeline item updates right panel.

## 7. Phase 4: Complete Curated Case Studies

### TASK-401: Add OPEC Supply Discipline Case

Phase: 4  
Size: M  
Depends on: TASK-103

Goal:
Create curated OPEC+ production cut case study.

Acceptance criteria:
- Case validates.
- Includes OPEC policy events, production regions, evidence, counter-signals, scenarios.
- Includes Brent and WTI price movement.

Tests required:
- Schema fixture validation.
- Evidence ID resolution.

### TASK-402: Add China Demand Slowdown Case

Phase: 4  
Size: M  
Depends on: TASK-103

Goal:
Create curated China demand slowdown case study.

Acceptance criteria:
- Case validates.
- Includes demand indicators, China region markers, evidence, counter-signals, scenarios.

Tests required:
- Schema fixture validation.
- Watch indicators count check.

### TASK-403: Add Fed/USD Shock Case

Phase: 4  
Size: M  
Depends on: TASK-103

Goal:
Create curated macro shock case study.

Acceptance criteria:
- Case validates.
- Includes Fed/USD macro events, price impact, evidence, counter-signals, scenarios.

Tests required:
- Schema fixture validation.
- Macro impact type coverage.

### TASK-404: Add U.S. Inventory Draw Case

Phase: 4  
Size: M  
Depends on: TASK-103

Goal:
Create curated U.S. inventory and refinery utilization case study.

Acceptance criteria:
- Case validates.
- Includes EIA-style inventory event, Gulf Coast/refinery markers, evidence, counter-signals, scenarios.

Tests required:
- Schema fixture validation.
- Inventory impact type coverage.

### TASK-405: Add Energy Transition Pressure Case

Phase: 4  
Size: M  
Depends on: TASK-103

Goal:
Create curated EV/renewables long-term pressure case study.

Acceptance criteria:
- Case validates.
- Includes long-term transition events, regions, evidence, counter-signals, scenarios.

Tests required:
- Schema fixture validation.
- Long-horizon signal coverage.

### TASK-406: Add All-Case Validation Suite

Phase: 4  
Size: S  
Depends on: TASK-401, TASK-402, TASK-403, TASK-404, TASK-405

Goal:
Validate all curated case studies as a fixture suite.

Acceptance criteria:
- Every case validates.
- Every case has at least one hotspot.
- Every case has at least one counter-signal.
- Every case has at least three watch indicators.
- Every case has scenario templates.

Tests required:
- Fixture scan test over all case JSON files.
- Cross-reference validation for evidence and sources.

### TASK-407: E2E Case Switching

Phase: 4  
Size: S  
Depends on: TASK-406

Goal:
Ensure every case produces a non-empty UI.

Acceptance criteria:
- User can cycle through all cases.
- Map updates for each case.
- Right panel updates for each case.

Tests required:
- E2E: select each case and verify visible hotspot and case title.

## 8. Phase 5: AI Output Contracts And Mock LLM Gates

### TASK-501: Define AI Output Schemas

Phase: 5  
Size: M  
Depends on: TASK-101

Goal:
Define structured schemas for memo, scenario, and chat outputs.

Likely files/modules:
- `backend/app/schemas/ai_outputs.py`
- `backend/tests/schemas/test_ai_outputs.py`

Acceptance criteria:
- AnalystMemo schema exists.
- ScenarioForecast schema exists.
- ChatAnswer schema exists.
- Required evidence references are modeled.

Tests required:
- Valid memo passes.
- Memo missing driver evidence fails.
- Scenario missing disclaimer fails.
- Chat answer missing evidence references fails when factual.

### TASK-502: Implement MockLLMAdapter

Phase: 5  
Size: M  
Depends on: TASK-501

Goal:
Create deterministic LLM adapter for tests and local development.

Likely files/modules:
- `backend/app/ai/adapters.py`
- `backend/app/ai/mock_adapter.py`

Acceptance criteria:
- Adapter can return valid memo, scenario, and chat outputs.
- Adapter can simulate invalid output for tests.

Tests required:
- Unit test: mock returns valid memo.
- Unit test: mock can simulate invalid JSON/schema.

### TASK-503: Implement AIOrchestrator

Phase: 5  
Size: M  
Depends on: TASK-501, TASK-502

Goal:
Create AI orchestration layer with validation and repair flow.

Likely files/modules:
- `backend/app/ai/orchestrator.py`
- `backend/app/ai/prompts.py`
- `backend/tests/ai/test_orchestrator.py`

Acceptance criteria:
- Orchestrator calls adapter.
- Output validates against schema.
- Invalid output triggers one repair attempt.
- Failed repair returns controlled error.

Tests required:
- Valid output returns parsed object.
- Invalid output triggers repair.
- Failed repair raises controlled AIOutputError.

### TASK-504: Implement Evidence Citation Checker

Phase: 5  
Size: M  
Depends on: TASK-501

Goal:
Validate that AI outputs cite only evidence IDs present in the selected case.

Likely files/modules:
- `backend/app/ai/grounding.py`
- `backend/tests/ai/test_grounding.py`

Acceptance criteria:
- Unknown evidence IDs are rejected.
- Missing evidence for major claims is rejected or flagged.
- Existing evidence IDs pass.

Tests required:
- Unknown evidence ID fails.
- Empty evidence references fail where required.
- Valid evidence references pass.

### TASK-505: Implement Forecast Safety Gate

Phase: 5  
Size: S  
Depends on: TASK-501

Goal:
Block unsafe forecast language and enforce disclaimers.

Likely files/modules:
- `backend/app/ai/safety.py`
- `backend/tests/ai/test_safety.py`

Acceptance criteria:
- Blocks direct trading advice terms.
- Requires experimental price range disclaimer.
- Flags overconfident certainty language where applicable.

Tests required:
- "buy oil futures" is blocked.
- "short Brent" is blocked.
- Scenario without disclaimer fails.

### TASK-506: Add Mock AI Endpoints

Phase: 5  
Size: M  
Depends on: TASK-503, TASK-504, TASK-505

Goal:
Expose memo, scenario, and chat endpoints backed by MockLLMAdapter.

Likely files/modules:
- `backend/app/api/ai.py`
- `backend/tests/api/test_ai_endpoints.py`

Acceptance criteria:
- `POST /api/cases/:caseId/memo` returns structured memo.
- `POST /api/cases/:caseId/scenario` returns structured forecast.
- `POST /api/cases/:caseId/chat` returns structured chat answer.
- All endpoints validate case ID and evidence.

Tests required:
- Integration test: memo endpoint.
- Integration test: scenario endpoint.
- Integration test: chat endpoint.
- Integration test: unknown case returns 404.

## 9. Phase 6: Analyst Memo Generation

### TASK-601: Build Analyst Memo UI

Phase: 6  
Size: M  
Depends on: TASK-205, TASK-506

Goal:
Render structured analyst memo output in the bottom drawer.

Acceptance criteria:
- Memo displays summary, drivers, evidence, counter-signals, confidence, watch indicators.
- Loading and error states exist.
- Evidence references are clickable or visibly linked.

Tests required:
- Unit test: memo renders all required sections.
- Unit test: loading and error states.
- E2E: user opens memo tab and sees generated memo.

### TASK-602: Implement Real Memo Prompt

Phase: 6  
Size: M  
Depends on: TASK-503, TASK-601

Goal:
Create real LLM prompt for analyst memo generation.

Acceptance criteria:
- Prompt includes selected case evidence IDs.
- Prompt restricts claims to evidence.
- Prompt requires uncertainty language.
- Prompt prohibits trading advice.

Tests required:
- Prompt snapshot test.
- AI regression: memo includes counter-signals.
- AI regression: memo does not invent live data.
- AI regression: memo avoids exact causality.

### TASK-603: Add Memo Caching

Phase: 6  
Size: S  
Depends on: TASK-602

Goal:
Cache generated memo by case and time horizon to reduce repeated calls.

Acceptance criteria:
- Same case/time horizon reuses memo result.
- Cache can be bypassed in dev if needed.

Tests required:
- Unit test: cache hit.
- Unit test: cache miss on different case or horizon.

## 10. Phase 7: Scenario Forecasting

### TASK-701: Build Scenario Controls UI

Phase: 7  
Size: M  
Depends on: TASK-205

Goal:
Build structured scenario toggle controls.

Acceptance criteria:
- Controls include OPEC policy, shipping risk, China demand, Fed/USD, inventories, transition pressure, horizon.
- Control state produces valid ScenarioAssumptions.

Tests required:
- Unit test: default assumptions valid.
- Unit test: changing controls updates assumptions.

### TASK-702: Build Scenario Output UI

Phase: 7  
Size: M  
Depends on: TASK-701, TASK-506

Goal:
Render directional forecast, risk ranking, experimental range, analogues, invalidating signals, and watch indicators.

Acceptance criteria:
- Brent/WTI directional forecast visible.
- Confidence visible.
- Experimental price range disclaimer visible.
- Invalidating signals visible.

Tests required:
- Unit test: output renders all sections.
- Unit test: disclaimer is always visible when price range exists.
- E2E: user runs scenario and sees forecast.

### TASK-703: Implement Real Scenario Prompt

Phase: 7  
Size: M  
Depends on: TASK-503, TASK-702

Goal:
Create real LLM prompt for scenario forecast generation.

Acceptance criteria:
- Prompt includes scenario assumptions.
- Prompt includes selected case evidence.
- Prompt requires conditional language.
- Prompt prohibits trading advice.
- Prompt labels price range experimental.

Tests required:
- Prompt snapshot test.
- AI regression: conflicting assumptions produce nuanced output.
- AI regression: no trading advice.
- AI regression: invalidating signals included.

## 11. Phase 8: Grounded Follow-Up Chat

### TASK-801: Build Grounded Chat UI

Phase: 8  
Size: M  
Depends on: TASK-205, TASK-506

Goal:
Build chat panel with suggested prompts and evidence-grounded responses.

Acceptance criteria:
- Suggested prompts render.
- User can submit free-form question.
- Responses display evidence references.
- Insufficient-evidence state renders clearly.

Tests required:
- Unit test: suggested prompts render.
- Unit test: message submission.
- Unit test: evidence references render.
- E2E: user asks suggested prompt and sees answer.

### TASK-802: Implement Chat Evidence Selection

Phase: 8  
Size: M  
Depends on: TASK-504

Goal:
Select relevant evidence from the active case for chat responses.

Acceptance criteria:
- Chat uses only selected case evidence.
- Evidence selection is deterministic for tests.
- Unsupported questions return insufficient-evidence response.

Tests required:
- Unit test: relevant evidence selected.
- Unit test: unsupported question returns no evidence.
- Integration test: chat endpoint only uses selected case evidence.

### TASK-803: Implement Real Chat Prompt

Phase: 8  
Size: M  
Depends on: TASK-801, TASK-802

Goal:
Create real LLM prompt for grounded follow-up chat.

Acceptance criteria:
- Prompt includes selected evidence only.
- Prompt requires evidence references.
- Prompt instructs refusal for unsupported answers.
- Prompt blocks trading advice.

Tests required:
- Prompt snapshot test.
- AI regression: live price question refused.
- AI regression: trading advice refused.
- AI regression: supported question cites evidence.
- AI regression: prompt injection in evidence ignored.

## 12. Phase 9: Visual Polish And Interaction Quality

### TASK-901: Add Route And Marker Animations

Phase: 9  
Size: M  
Depends on: TASK-303, TASK-304

Goal:
Add polished animation for active routes and selected markers.

Acceptance criteria:
- Active routes have subtle animation.
- Selected marker pulses or highlights.
- Animation does not harm readability.

Tests required:
- E2E: selected marker remains visible.
- Visual check: route animation visible and non-distracting.

### TASK-902: Improve Panel Visual Hierarchy

Phase: 9  
Size: M  
Depends on: TASK-201, TASK-601, TASK-702, TASK-801

Goal:
Refine styling for panels, typography, spacing, and dense content.

Acceptance criteria:
- Panels are readable.
- No nested-card clutter.
- Text does not overflow.
- Dashboard feels professional and polished.

Tests required:
- Visual screenshot at 1440x900.
- Visual screenshot at 1920x1080.
- E2E: no panel overlap.

### TASK-903: Add Tablet Responsive Behavior

Phase: 9  
Size: M  
Depends on: TASK-902

Goal:
Ensure app does not break on tablet-sized viewport.

Acceptance criteria:
- Left panel collapses or remains usable.
- Right panel does not cover whole map permanently.
- Bottom drawer remains usable.

Tests required:
- Playwright screenshot at 1024x768.
- E2E: user can select case and open drawer on tablet viewport.

### TASK-904: Accessibility Smoke Pass

Phase: 9  
Size: S  
Depends on: TASK-902

Goal:
Improve keyboard navigation, focus states, labels, and color independence.

Acceptance criteria:
- Major controls are keyboard reachable.
- Icons have labels or tooltips.
- Selected states are visible beyond color.
- Text contrast is acceptable.

Tests required:
- E2E: keyboard reaches major controls.
- Manual/accessibility smoke check.

## 13. Phase 10: Portfolio Demo Hardening

### TASK-1001: Write README

Phase: 10  
Size: S  
Depends on: TASK-506

Goal:
Document project purpose, setup, scripts, tests, and architecture.

Acceptance criteria:
- README explains product.
- README includes local run instructions.
- README includes test commands.
- README includes known limitations.

Tests required:
- Manual command verification.

### TASK-1002: Write Demo Script

Phase: 10  
Size: S  
Depends on: TASK-407, TASK-601, TASK-702, TASK-801

Goal:
Create a short scripted walkthrough for reviewers.

Acceptance criteria:
- Script covers Red Sea map, hotspot, memo, scenario, chat, and case switching.
- Script fits in 3-5 minutes.

Tests required:
- Manual walkthrough.
- E2E path matches script.

### TASK-1003: Add Full Test Command

Phase: 10  
Size: S  
Depends on: TASK-006, TASK-506

Goal:
Add a single documented command or sequence for full verification.

Acceptance criteria:
- Runs frontend unit tests.
- Runs backend tests.
- Runs schema validation.
- Runs AI regression tests.
- Runs Playwright E2E tests.

Tests required:
- Execute full test command locally.

### TASK-1004: Final Portfolio Review Pass

Phase: 10  
Size: M  
Depends on: TASK-1001, TASK-1002, TASK-1003

Goal:
Review product as a portfolio artifact.

Acceptance criteria:
- A reviewer can understand product value within 30 seconds.
- AI gates are visible in docs and tests.
- Demo path is stable.
- Limitations are honest.
- Visuals match the concept direction.

Tests required:
- Full test suite passes.
- Manual demo pass.
- Visual screenshot pass.

## 14. First Sprint Task Set

Recommended first sprint:

1. TASK-001: Initialize Frontend App
2. TASK-002: Initialize Backend App
3. TASK-003: Add Shared Developer Commands
4. TASK-004: Configure Frontend Test Stack
5. TASK-005: Configure Backend Test Stack
6. TASK-101: Define Backend Pydantic Schemas
7. TASK-103: Create Red Sea Case Study JSON
8. TASK-104: Implement DemoDatasetProvider
9. TASK-105: Add Case Study API Endpoints
10. TASK-106: Connect Frontend To Case API
11. TASK-006: Configure Playwright E2E

Sprint outcome:
- App shell exists.
- Backend serves case data.
- Red Sea case validates.
- Frontend loads case list.
- Tests exist from the beginning.

## 15. Notes For Developers

- Do not connect a real LLM before TASK-501 through TASK-506 are complete.
- Do not add more case studies before Red Sea validates and renders correctly.
- Do not hardcode UI prose that should come from case data.
- Do not let map components depend on raw backend JSON shape if a normalized frontend type exists.
- Do not treat scenario forecasts as trading predictions.
- Every AI answer must be evidence-grounded or explicitly qualified.
