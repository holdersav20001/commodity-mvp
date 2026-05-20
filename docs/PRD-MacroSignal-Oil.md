# PRD: MacroSignal Oil

## 1. Product Summary

MacroSignal Oil is a map-first AI intelligence application for understanding oil market movements. It combines a cinematic geospatial interface, curated oil-market case studies, structured evidence, and AI-generated analysis to explain why Brent and WTI crude prices moved, what risks are emerging, and what future scenarios could mean for the market.

The first version is a case-study intelligence simulator. It uses curated historical-style scenarios rather than live market feeds, but the data model should be designed so real public and professional data sources can replace the demo provider later.

## 2. Target Users

### Primary Users

Commodity traders and analysts:
- Need fast explanations for Brent and WTI price moves.
- Care about geopolitical risk, OPEC policy, shipping disruptions, supply/demand signals, and macro pressure.
- Need to distinguish market-moving signals from noise.

Energy company strategy teams:
- Need to understand medium-term and long-term market forces.
- Care about demand growth, OPEC behavior, energy transition effects, infrastructure risks, and regional exposure.
- Need scenario thinking, not just daily market commentary.

### Secondary Users

Portfolio managers, energy consultants, procurement teams, students, and recruiters reviewing the project as an AI engineering portfolio artifact.

## 3. Problem Statement

Oil prices move because of overlapping forces: geopolitics, OPEC policy, shipping routes, inventories, refinery utilization, macroeconomic policy, currency moves, demand expectations, and long-term energy transition trends. Existing dashboards often show charts and news separately, leaving users to manually connect events to price movements.

MacroSignal Oil should help users answer:
- Where are oil-relevant risks emerging?
- Why did Brent and WTI move this week or month?
- Which signals are bullish, bearish, mixed, or uncertain?
- What evidence supports the explanation?
- What future scenarios should be monitored?

## 4. Product Goals

### V1 Goals

1. Deliver a visually impressive map-first oil intelligence experience.
2. Explain Brent and WTI price moves using structured evidence.
3. Show oil-relevant events geographically through hotspots, routes, chokepoints, and risk zones.
4. Generate AI analyst memos, scenario forecasts, and grounded chat answers from curated case-study data.
5. Allow users to change scenario assumptions through toggles and natural language.
6. Clearly communicate uncertainty through confidence, counter-signals, and invalidating signals.
7. Keep the data architecture migration-ready for future real public or professional data sources.

### Non-Goals For V1

1. No live trading recommendations.
2. No real-money investment advice.
3. No fully automated live market data pipeline.
4. No claim of precise causal attribution.
5. No production-grade price forecasting model.
6. No multi-commodity expansion beyond Brent and WTI.
7. No user account, billing, or enterprise permissions system.

## 5. Core User Workflows

### Workflow 1: Explore The Global Oil Risk Map

1. User opens the app and sees a global intelligence map.
2. User selects a case study from the top bar.
3. Map animates to relevant regions, routes, and hotspots.
4. Event markers show impact direction, impact type, severity, and confidence.
5. User toggles layers: events, shipping/chokepoints, production/infrastructure, countries/regions.
6. User clicks a hotspot to inspect the event and market impact.

### Workflow 2: Understand Why Oil Moved

1. User reviews Brent and WTI price movement for the selected weekly or monthly period.
2. User opens the analyst memo.
3. AI generates ranked drivers from the selected case-study evidence.
4. Memo includes evidence, counter-signals, confidence, and watch indicators.
5. User can click evidence items to see related map locations and source snippets.

### Workflow 3: Run A Scenario Forecast

1. User opens the scenario panel.
2. User adjusts structured assumptions:
   - OPEC policy
   - Shipping risk
   - China demand
   - Fed/USD stance
   - Inventories
   - Energy transition pressure
3. User optionally asks a natural-language scenario question.
4. AI generates a directional forecast, risk ranking, experimental price range, analogues, and invalidating signals.

### Workflow 4: Ask Grounded Follow-Up Questions

1. User asks a question in chat.
2. Chat answers only using selected case-study evidence.
3. Chat cites evidence IDs or source snippets.
4. If evidence is insufficient, chat says what data would be needed.

## 6. V1 Case Studies

The curated demo dataset should include multiple case studies:

1. Red Sea / Suez shipping disruption
   - Theme: tanker rerouting, chokepoint risk, freight pressure.

2. OPEC+ production cut announcement
   - Theme: supply discipline, spare capacity, quota compliance.

3. China demand slowdown
   - Theme: industrial activity, refinery runs, import demand.

4. Fed hawkish surprise / USD strength
   - Theme: macro pressure, currency impact, risk asset repricing.

5. U.S. inventory draw and refinery utilization rise
   - Theme: physical tightness, EIA data, near-term fundamentals.

6. EV and renewable adoption pressure
   - Theme: long-term demand headwind, strategy horizon, transition risk.

Each case study must include:
- Map events
- Affected regions and routes
- Brent and WTI price moves
- Ranked drivers
- Evidence items
- Counter-signals
- Watch indicators
- Scenario assumptions
- Historical analogues
- Experimental price range assumptions

## 7. Functional Requirements

### Map

The map must:
- Be the primary first-screen experience.
- Show event hotspots with layered visual encoding.
- Support route lines for shipping and chokepoints.
- Support regions or zones for high-impact areas.
- Support layer toggles.
- Support clicking hotspots, routes, and regions.
- Update when case study or time horizon changes.

### Panels

The app must include:
- Top bar with product name, case study selector, time horizon selector, Brent/WTI price chips, and scenario mode entry.
- Left sidebar with layer controls, event filters, legend, and timeline.
- Right panel with selected event detail, ranked drivers, evidence, counter-signals, and confidence.
- Bottom expandable area for analyst memo, scenario forecast, and chat.

### AI Analyst Memo

The memo must include:
- Plain-language summary of the price move.
- Ranked likely drivers.
- Evidence for each driver.
- Counter-signals.
- Confidence score.
- Short-term and medium-term implications.
- Watch indicators.

### Scenario Forecast

Scenario output must include:
- Directional forecast for Brent and WTI: bullish, neutral, bearish, or mixed.
- Confidence.
- Time horizon: 2-6 weeks or 3-6 months.
- Risk ranking.
- Experimental price range.
- Historical analogues.
- Invalidating signals.
- Signals to monitor next.

### Chat

Chat must:
- Be scoped to the selected case study.
- Use evidence-grounded answers.
- Cite evidence IDs.
- Refuse or qualify unsupported answers.
- Support suggested questions and free-form questions.

## 8. AI Behavior Requirements

The AI must:
- Act like a disciplined commodity analyst.
- Use only selected case-study evidence for factual claims.
- Distinguish evidence from inference.
- Use "likely", "suggests", and "could" when causality is uncertain.
- Include counter-signals when available.
- Include confidence and invalidating signals.
- Avoid giving trading instructions.
- Label price range forecasts as experimental.

The AI must not:
- Invent sources.
- Invent live data.
- Claim certainty about future prices.
- Recommend specific trades.
- Answer outside the evidence without qualification.

## 9. Visual Requirements

The product should feel like a hybrid of:
- Geopolitical command center.
- Professional financial dashboard.
- Strategy intelligence workspace.

Visual rules:
- The map is the dominant visual element.
- Dark refined interface.
- Crisp data panels.
- Restrained glow effects for routes and hotspots.
- Color communicates market impact.
- Icons communicate impact type.
- Size/intensity communicates severity.
- Border/opacity communicates confidence.

Impact encoding:
- Green: bullish oil.
- Red: bearish oil.
- Amber: mixed.
- Blue: macro or indirect.
- Gray: uncertain.

Impact icons:
- Geopolitical/security.
- Shipping/logistics.
- Production/refining.
- Macro/central bank.
- Inventory/fundamentals.
- Energy transition.

## 10. Success Criteria

### Visual Demo Success

The user can switch between case studies and immediately see the map, hotspots, routes, panels, memo, scenarios, and chat update in a compelling way.

### AI Reliability Success

Generated memos, forecasts, and chat responses cite evidence, include uncertainty, avoid unsupported claims, and remain consistent across repeated runs.

### Architecture Success

The curated demo provider can later be replaced by real data providers that produce the same internal schema.

### Portfolio Success

A viewer should understand within 30 seconds that the project demonstrates:
- AI product thinking.
- Geospatial visualization.
- Structured data modeling.
- LLM grounding and validation.
- Scenario reasoning.
- Business and market intelligence.

## 11. Risks And Mitigations

### Risk: Visual polish outruns evidence quality

Mitigation:
- Every hotspot must link to structured evidence.
- Event cards must show confidence and source snippets.

### Risk: Forecasts look like trading advice

Mitigation:
- Use directional outlooks as the primary output.
- Label price ranges as experimental.
- Avoid "buy", "sell", or trade recommendation language.

### Risk: Chat hallucinates

Mitigation:
- Restrict chat to selected case-study evidence.
- Use structured prompts and evidence IDs.
- Add regression tests for unsupported questions.

### Risk: Map becomes cluttered

Mitigation:
- Use layer toggles.
- Prioritize active case-study signals.
- Use zoom-dependent marker detail.

### Risk: Migration to real data is difficult

Mitigation:
- Build a provider interface.
- Keep UI and AI dependent on normalized internal schema, not raw source formats.

## 12. MVP Scope

V1 should include:
- One polished desktop web experience.
- Brent and WTI only.
- Six curated case studies.
- Interactive global map.
- Event hotspot layer.
- Shipping/chokepoint layer.
- Region/infrastructure layer.
- Analyst memo generation.
- Scenario forecast generation.
- Grounded follow-up chat.
- Data provider interface with demo provider.

## 13. Future Roadmap

### V2

- Real public data integration.
- EIA, FRED, central bank, OPEC, and public news ingestion.
- User-created watchlists.
- Saved scenario runs.
- Timeline playback.
- More rigorous AI eval suite.

### V3

- Paid market data and shipping APIs.
- Quantitative attribution model.
- Real-time alerts.
- Team workspaces.
- Enterprise permissions.
- Additional commodities: natural gas, copper, gold, wheat, lithium.

## 14. Open Questions

1. Confirm the recommended initial stack: Vite React, TypeScript, MapLibre GL, deck.gl, FastAPI, Pydantic, Tailwind, and ECharts.
2. Decide whether the first prototype should use a real LLM immediately or mock AI output before integration.
3. Decide how much historical data should be embedded in each curated case study.
4. Decide whether AI responses should stream in v1 or return after completion.
5. Decide how polished tablet/mobile behavior needs to be for the portfolio demo.
