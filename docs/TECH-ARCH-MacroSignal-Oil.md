# Technical Architecture: MacroSignal Oil

## 1. Architecture Summary

MacroSignal Oil should be built as a web application with a map-first frontend, a structured case-study data layer, and AI endpoints that generate grounded analysis from validated evidence.

V1 is a case-study intelligence simulator:
- Data is curated JSON.
- AI analysis is generated dynamically from structured case evidence.
- UI consumes normalized internal schemas.
- Provider boundaries are designed so real market, macro, news, and shipping data can replace the demo provider later.

## 2. Recommended Stack

### Frontend

Recommended:
- Vite React or Next.js
- TypeScript
- MapLibre GL or Mapbox GL for base map
- deck.gl for advanced route, arc, point, and polygon layers
- Tailwind CSS or CSS modules
- ECharts or Recharts for charts
- lucide-react for icons
- Zod for client-side schema validation

Preferred initial choice:
- Vite React + TypeScript for fast prototype velocity.
- MapLibre GL + deck.gl if avoiding paid map lock-in.
- Mapbox GL + deck.gl if visual polish and hosted map styles are the priority.

### Backend

Recommended:
- Node/Express or FastAPI
- TypeScript if using Node, Python if using FastAPI
- Zod or Pydantic for schema validation
- File-based JSON provider for v1
- LLM service wrapper for memo, scenario, and chat generation

Preferred initial choice:
- Node/Express + TypeScript if the app is mostly frontend-heavy.
- FastAPI + Python if future data science and forecasting models are prioritized.

For this project, FastAPI is slightly stronger long term because future versions will likely include time-series modeling, data ingestion, and forecasting experiments.

## 3. High-Level System Diagram

```text
User
  |
  v
React Frontend
  |
  |-- Case study API
  |-- Memo generation API
  |-- Scenario forecast API
  |-- Grounded chat API
  v
Backend API
  |
  |-- DemoDatasetProvider
  |-- AI Orchestrator
  |-- Schema Validator
  |-- Prompt Registry
  |-- Evidence Grounding Layer
  v
Curated JSON Case Studies

Future providers:
  - MarketPriceProvider
  - EIAProvider
  - FREDProvider
  - NewsProvider
  - OPECProvider
  - ShippingProvider
  - MacroProvider
```

## 4. Frontend Architecture

### Core Modules

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    shell/
    map/
    panels/
    memo/
    scenario/
    chat/
    charts/
    common/
  data/
    apiClient.ts
    schemas.ts
  state/
    caseStudyStore.ts
    mapStore.ts
    scenarioStore.ts
  styles/
```

### Main State

Frontend state should track:
- Active case study.
- Active time horizon.
- Active layers.
- Selected event/route/region.
- Scenario assumptions.
- Generated memo.
- Generated scenario output.
- Chat messages.
- AI loading/error states.

State can start with lightweight local state or Zustand. Avoid heavy global state until needed.

### Map Rendering

Use separate layers for:
- Event markers.
- Route arcs/lines.
- Chokepoint points.
- Region polygons.
- Risk zones.
- Selected-event highlights.

The map should be driven entirely by normalized case-study data.

## 5. Backend Architecture

### API Endpoints

```text
GET /api/cases
GET /api/cases/:caseId
POST /api/cases/:caseId/memo
POST /api/cases/:caseId/scenario
POST /api/cases/:caseId/chat
GET /api/health
```

### Endpoint Responsibilities

`GET /api/cases`
- Return list of available case studies.
- Include metadata only.

`GET /api/cases/:caseId`
- Return complete normalized case-study object.
- Validate before returning.

`POST /api/cases/:caseId/memo`
- Generate analyst memo from selected case data.
- Return structured memo JSON.

`POST /api/cases/:caseId/scenario`
- Accept structured scenario assumptions and optional natural-language question.
- Generate scenario forecast.
- Return structured forecast JSON.

`POST /api/cases/:caseId/chat`
- Accept chat history and current user question.
- Retrieve relevant evidence from the selected case.
- Generate grounded answer.
- Return answer with evidence references.

## 6. Data Provider Design

### Provider Interface

```ts
interface CaseStudyProvider {
  listCases(): Promise<CaseStudySummary[]>;
  getCase(caseId: string): Promise<CaseStudy>;
}

interface MarketDataProvider {
  getPriceSeries(symbol: string, period: TimePeriod): Promise<PricePoint[]>;
}

interface EventProvider {
  getEvents(query: EventQuery): Promise<MarketEvent[]>;
}

interface IndicatorProvider {
  getIndicators(query: IndicatorQuery): Promise<IndicatorSeries[]>;
}
```

V1 uses:

```text
DemoDatasetProvider
```

Future versions add:

```text
EIAProvider
FREDProvider
OPECProvider
NewsProvider
ShippingProvider
MarketPriceProvider
```

### Important Rule

The UI and AI layer should not depend on raw provider response formats. Providers must normalize source data into internal schemas.

## 7. Core Schemas

### CaseStudy

```ts
type CaseStudy = {
  id: string;
  title: string;
  summary: string;
  period: {
    start: string;
    end: string;
    label: string;
  };
  primaryBenchmark: "brent" | "wti";
  priceMove: PriceMove;
  mapFocus: MapFocus;
  events: MarketEvent[];
  routes: RouteSignal[];
  regions: RegionSignal[];
  indicators: IndicatorSignal[];
  counterSignals: CounterSignal[];
  watchIndicators: WatchIndicator[];
  scenarios: ScenarioTemplate[];
  sources: Source[];
};
```

### MarketEvent

```ts
type MarketEvent = {
  id: string;
  title: string;
  description: string;
  locationName: string;
  coordinates: [number, number];
  impactDirection: "bullish" | "bearish" | "mixed" | "neutral" | "uncertain";
  impactType:
    | "geopolitical"
    | "shipping"
    | "supply"
    | "demand"
    | "macro"
    | "inventory"
    | "transition";
  severity: number;
  confidence: number;
  timeHorizon: "short" | "medium" | "long";
  affectedBenchmarks: Array<"brent" | "wti">;
  evidenceIds: string[];
  relatedEventIds?: string[];
};
```

### Evidence

```ts
type Evidence = {
  id: string;
  sourceId: string;
  claim: string;
  excerpt: string;
  relevance: number;
  supports: string[];
  contradicts?: string[];
};
```

### ScenarioAssumptions

```ts
type ScenarioAssumptions = {
  opecPolicy: "cuts_deepen" | "cuts_hold" | "cuts_unwind";
  shippingRisk: "low" | "elevated" | "severe";
  chinaDemand: "weak" | "stable" | "improving";
  fedUsd: "dovish" | "neutral" | "hawkish";
  inventories: "builds" | "neutral" | "draws";
  transitionPressure: "low" | "baseline" | "accelerating";
  horizon: "2_6_weeks" | "3_6_months";
  userQuestion?: string;
};
```

### ScenarioForecast

```ts
type ScenarioForecast = {
  brentOutlook: "bullish" | "neutral" | "bearish" | "mixed";
  wtiOutlook: "bullish" | "neutral" | "bearish" | "mixed";
  confidence: number;
  reasoning: string;
  riskRanking: Array<{
    factor: string;
    impact: "low" | "medium" | "high";
    direction: "bullish" | "bearish" | "mixed";
    evidenceIds: string[];
  }>;
  experimentalPriceRange?: {
    brent?: { low: number; high: number; unit: "USD/bbl" };
    wti?: { low: number; high: number; unit: "USD/bbl" };
    disclaimer: string;
  };
  historicalAnalogues: string[];
  invalidatingSignals: string[];
  watchIndicators: string[];
};
```

## 8. AI Architecture

### AI Components

```text
AIOrchestrator
  - buildMemoPrompt()
  - buildScenarioPrompt()
  - buildChatPrompt()
  - callModel()
  - validateOutput()
  - attachEvidenceReferences()
```

### Prompt Types

1. Analyst memo prompt.
2. Scenario forecast prompt.
3. Grounded chat prompt.

Each prompt should:
- Include selected case data.
- Include evidence IDs.
- Define allowed output schema.
- Require uncertainty language.
- Prohibit unsupported factual claims.
- Prohibit trading advice.

### Output Validation

All AI outputs should be parsed and validated against schemas.

If validation fails:
- Retry once with a repair prompt.
- If still invalid, return a graceful error and keep structured case data visible.

### Grounding Rules

The AI may:
- Summarize evidence.
- Rank drivers.
- Compare signals.
- Infer likely direction from provided structured fields.
- Explain uncertainty.

The AI may not:
- Add new facts.
- Invent sources.
- Claim live data.
- Produce trading advice.
- Present experimental price ranges as firm forecasts.

## 9. Forecasting Approach For V1

V1 forecasting is scenario-based, not model-based.

Inputs:
- Case-study structured evidence.
- User scenario toggles.
- Optional natural-language scenario question.
- Curated historical analogues.

Outputs:
- Directional forecast.
- Risk ranking.
- Experimental price range.
- Confidence.
- Invalidating signals.
- Watch indicators.

Price ranges are not quantitative model outputs in v1. They are curated analogue-based estimates and must be labeled:

```text
Experimental range estimate. Not a trading forecast.
```

Future versions may add:
- Time-series baselines.
- Volatility-adjusted ranges.
- Regression or tree-based driver attribution.
- Forecast ensembles.
- Backtesting.

## 10. Data Storage

### V1

Use local JSON files:

```text
data/
  cases/
    red-sea-shipping-risk.json
    opec-supply-discipline.json
    china-demand-slowdown.json
    fed-usd-shock.json
    us-inventory-draw.json
    energy-transition-pressure.json
```

### V2

Add a database:
- Postgres for normalized entities.
- TimescaleDB for price and indicator series.
- pgvector or external vector DB for document/evidence retrieval.

## 11. Real Data Migration Path

### Stage 1: Demo Provider

Curated JSON only.

### Stage 2: Public Data Providers

Add selected public data:
- Oil price series provider.
- EIA-style inventory and production provider.
- Macro indicator provider.
- Central bank statement provider.
- Public news/RSS provider.

### Stage 3: Professional Sources

Add optional premium feeds:
- Market data.
- News wires.
- Shipping/tanker data.
- Satellite or alternative data.
- Analyst research ingestion.

### Stage 4: Quantitative Attribution

Add:
- Historical event tagging.
- Driver features.
- Backtesting.
- Model comparison.
- Explanation calibration.

## 12. Evaluation And Testing

### Frontend Tests

Test:
- Case study switching.
- Layer toggles.
- Event selection.
- Scenario control changes.
- Memo/scenario/chat loading states.
- Empty/error states.

### Schema Tests

Test:
- Every case study validates.
- Every event has evidence.
- Severity/confidence are between 0 and 1.
- Coordinates are valid.
- Impact fields use allowed enums.

### AI Regression Tests

Test prompts:
- Supported question with evidence.
- Unsupported question requiring refusal.
- Scenario with conflicting assumptions.
- Request for trading advice.
- Request for live data not in case study.
- Request for exact causality.

Expected behavior:
- Cite evidence.
- Include uncertainty.
- Refuse or qualify unsupported claims.
- Avoid trading advice.
- Return valid schema.

### Visual Verification

Before considering v1 complete:
- Load desktop viewport.
- Verify map is nonblank.
- Verify layers render.
- Verify hotspots are clickable.
- Verify text does not overflow panels.
- Verify bottom drawer works.
- Verify scenario controls update output.

## 13. Security And Safety

V1 risks are modest because data is curated, but the AI layer still needs guardrails.

Requirements:
- Do not expose API keys to the frontend.
- Server-side AI calls only.
- Validate user input for chat and scenario prompts.
- Prevent prompt injection from source text when real data is added.
- Avoid trading advice.
- Add disclaimer near scenario price ranges.

## 14. Performance Requirements

V1 targets:
- Initial app load under 3 seconds on a modern laptop.
- Case study switch under 500 ms for structured data.
- AI memo generation target under 10 seconds.
- AI chat response target under 8 seconds.
- Map interactions should feel smooth at 60 fps for the curated dataset.

Optimization:
- Lazy-load case details.
- Keep map layers bounded.
- Cache generated memo/scenario outputs per case and assumption set.
- Use streaming for AI responses if available.

## 15. Suggested Implementation Phases

For the detailed TDD work breakdown, test gates, and acceptance criteria, see `docs/IMPLEMENTATION-PLAN-MacroSignal-Oil.md`.

### Phase 1: Static Experience

- App shell.
- Map canvas.
- One curated case study.
- Static panels.
- Layer toggles.

### Phase 2: Data-Driven Map

- Case-study schemas.
- Demo provider.
- Multiple case studies.
- Dynamic hotspots, routes, and regions.

### Phase 3: AI Memo And Scenario

- Backend AI endpoints.
- Structured memo generation.
- Structured scenario forecast.
- Output validation.

### Phase 4: Grounded Chat

- Chat endpoint.
- Evidence retrieval from selected case.
- Suggested prompts.
- Unsupported-answer guardrails.

### Phase 5: Polish And Portfolio

- Visual refinement.
- Animations.
- Error/loading states.
- Regression tests.
- Demo script.

### Phase 6: Real Data Bridge

- Add first public data provider.
- Normalize data into internal schema.
- Compare demo and real provider behavior.

## 16. Open Architecture Decisions

1. Vite React vs Next.js.
2. FastAPI vs Node/Express backend.
3. Mapbox GL vs MapLibre GL.
4. Whether to use deck.gl from the start or add after basic map works.
5. Whether AI responses should stream in v1.
6. Whether generated memos should be cached in files or memory.

## 17. Recommended Initial Decisions

For a strong first build:
- Frontend: Vite React + TypeScript.
- Map: MapLibre GL + deck.gl.
- Backend: FastAPI + Pydantic.
- Styling: Tailwind CSS.
- Charts: ECharts.
- AI outputs: structured JSON with validation.
- Data: curated JSON case studies.
- State: Zustand or lightweight React state.

Rationale:
- Fast prototype velocity.
- Strong long-term path into Python data engineering.
- Avoids map vendor lock-in.
- Keeps the map visually powerful.
- Keeps AI behavior testable and auditable.
