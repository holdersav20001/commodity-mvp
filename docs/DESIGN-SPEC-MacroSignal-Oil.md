# Design Spec: MacroSignal Oil

## 1. Design Intent

MacroSignal Oil should feel like a professional geospatial intelligence product for oil markets. The interface should communicate that oil price movements are shaped by geography, infrastructure, shipping, policy, macroeconomics, and demand expectations.

The product should not feel like a landing page or generic AI chat app. The first screen is the product.

Design personality:
- Command-center map.
- Financial analyst dashboard.
- Executive strategy workspace.
- AI-assisted research cockpit.

## 2. Primary Screen

The main screen is a full desktop application layout.

```text
+----------------------------------------------------------------------------+
| Top bar: MacroSignal Oil | Case Study | Weekly/Monthly | Brent | WTI | ... |
+--------------+---------------------------------------------+---------------+
| Left panel   |                                             | Right panel   |
|              |                                             |               |
| Layers       |                                             | Event detail  |
| Filters      |              Global oil map                 | Drivers       |
| Legend       |                                             | Evidence      |
| Timeline     |                                             | Confidence    |
|              |                                             |               |
+--------------+---------------------------------------------+---------------+
| Bottom expandable intelligence drawer: Memo | Scenario | Chat             |
+----------------------------------------------------------------------------+
```

The center map should take visual priority. Panels should support the map rather than compete with it.

## 3. Top Bar

### Purpose

Provide global context and key controls without taking attention away from the map.

### Required Elements

- Product name: `MacroSignal Oil`
- Case study selector
- Time horizon toggle: `Weekly` / `Monthly`
- Brent price chip
- WTI price chip
- Scenario mode button
- Optional evidence/status indicator

### Example Content

```text
MacroSignal Oil
Case: Red Sea Shipping Risk
Weekly | Monthly
Brent +2.8%
WTI +2.1%
Scenario Forecast
```

### Behavior

Changing the case study updates:
- Map focus
- Visible hotspots
- Active routes
- Price chips
- Right panel
- Memo
- Scenario model
- Chat context

Changing the time horizon updates:
- Price movement period
- Active timeline segment
- Driver ranking
- Scenario horizon

## 4. Left Panel

### Purpose

Control the visible intelligence layers and explain map encoding.

### Sections

#### Layer Controls

Layer toggles:
- Event hotspots
- Shipping routes
- Chokepoints
- Production/infrastructure
- Macro regions
- Energy transition signals

Each toggle should have an icon and compact label.

#### Event Filters

Filter chips:
- Bullish
- Bearish
- Mixed
- High confidence
- High severity
- Short-term
- Medium-term
- Long-term

#### Legend

Color:
- Green: bullish oil
- Red: bearish oil
- Amber: mixed
- Blue: macro/indirect
- Gray: uncertain

Shape/icon:
- Shield: geopolitical/security
- Ship: shipping/logistics
- Factory: production/refining
- Bank: macro/central bank
- Gauge: inventory/fundamentals
- Leaf: energy transition

Size:
- Small: low severity
- Medium: moderate severity
- Large: high severity

Opacity/border:
- Solid: higher confidence
- Soft: lower confidence

#### Timeline

The timeline shows the case-study period and key events.

Interaction:
- Hover timeline item to highlight matching map event.
- Click timeline item to select corresponding event.
- Drag or scrub in future versions; v1 may use discrete event selection.

## 5. Map Canvas

### Purpose

The map is the main reasoning surface. It should show where oil-relevant signals originate and how they connect to global oil markets.

### Required Layers

#### Event Hotspots

Markers for:
- Conflict or security incidents.
- OPEC announcements.
- Sanctions or policy changes.
- Refinery outages.
- Inventory data releases.
- Macro releases.
- Demand signals.
- Energy transition events.

#### Shipping And Chokepoints

Routes and chokepoints:
- Red Sea / Bab el-Mandeb
- Suez Canal
- Strait of Hormuz
- Panama Canal
- Major crude export routes
- Key ports or terminals

#### Production And Infrastructure

Regions and markers:
- OPEC production regions.
- U.S. shale / Gulf Coast.
- Major refineries.
- Export terminals.
- Storage hubs.
- Pipeline corridors.

#### Macro Regions

Regions for:
- U.S. policy and inventory data.
- China demand indicators.
- Europe energy policy.
- OPEC policy centers.
- Russia/sanctions exposure.

### Visual Encoding

Marker color = impact direction:
- Green: bullish oil
- Red: bearish oil
- Amber: mixed
- Blue: macro/indirect
- Gray: uncertain

Marker icon = impact type:
- Geopolitical
- Shipping
- Supply
- Demand
- Macro
- Inventory
- Transition

Marker size/intensity = severity.

Marker opacity/border = confidence.

Route style:
- Solid glowing route: active/affected.
- Dashed route: alternative route or rerouting.
- Dim route: contextual route.

Risk zone:
- Soft translucent overlay.
- Color follows net impact direction.
- Border intensity follows severity.

### Map Camera Behavior

When a case study is selected:
- Fly to the primary region.
- Keep enough global context visible.
- Highlight primary affected routes and regions.

When an event is selected:
- Center or pan gently to the event.
- Pulse selected marker.
- Highlight connected routes, regions, and evidence cards.

When a scenario changes:
- Update risk zones and forecast panel.
- Avoid excessive map motion; scenario changes should feel analytical, not chaotic.

## 6. Right Panel

### Purpose

Show focused intelligence for the selected event, route, or region.

### Default State

If no event is selected, show:
- Active case summary.
- Top ranked drivers.
- Confidence.
- Key watch indicators.

### Selected Event State

Show:
- Event title.
- Location.
- Impact direction.
- Impact type.
- Severity.
- Confidence.
- Time horizon.
- Affected benchmark: Brent, WTI, or both.
- Explanation.
- Evidence snippets.
- Counter-signals.
- Related events.

### Driver Ranking

Drivers should be visible as compact ranked rows:

```text
1. Shipping disruption risk        Bullish    High impact
2. OPEC supply discipline          Bullish    Medium impact
3. Fed/USD pressure                Bearish    Medium impact
4. China demand uncertainty        Mixed      Low/medium impact
```

Each row should be clickable and connect to map evidence.

## 7. Bottom Intelligence Drawer

The bottom drawer contains deeper AI-powered analysis. It can be collapsed, expanded, or tabbed.

### Tabs

- Analyst Memo
- Scenario Forecast
- Chat

### Analyst Memo Tab

Content:
- Executive summary.
- Price movement explanation.
- Ranked drivers.
- Evidence by driver.
- Counter-signals.
- Confidence.
- Watch indicators.

Suggested structure:

```text
Brent rose 2.8% and WTI rose 2.1% during the selected period.
The move was likely driven by shipping disruption risk, OPEC supply discipline,
and stronger-than-expected physical market signals, partly offset by USD strength.
```

### Scenario Forecast Tab

Controls:
- OPEC policy: cuts deepen / hold / unwind
- Shipping risk: low / elevated / severe
- China demand: weak / stable / improving
- Fed/USD: dovish / neutral / hawkish
- Inventories: builds / neutral / draws
- Energy transition pressure: low / baseline / accelerating

Outputs:
- Directional Brent forecast.
- Directional WTI forecast.
- Confidence.
- Risk ranking.
- Experimental price range.
- Historical analogues.
- Invalidating signals.
- What to monitor next.

Price range must be visibly labeled:

```text
Experimental range estimate. Not a trading forecast.
```

### Chat Tab

Chat should include:
- Suggested prompts.
- Free-form question input.
- Evidence-grounded responses.
- Evidence IDs or source references.
- Refusal/qualification for unsupported questions.

Suggested prompts:
- Why is this bullish for Brent?
- Which signal has the lowest confidence?
- What would invalidate this scenario?
- How does this affect Europe?
- Show only shipping-related drivers.

## 8. Case Study Selector

The selector should feel like switching intelligence scenes.

Case studies:
- Red Sea Shipping Risk
- OPEC Supply Discipline
- China Demand Slowdown
- Fed/USD Shock
- U.S. Inventory Draw
- Energy Transition Pressure

Each item should include:
- Title.
- Date/period.
- Primary impact direction.
- Primary affected benchmark.
- Main impact type.

## 9. Interaction States

### Loading

Show a subtle skeleton or map shimmer. Do not show a blank map.

### Empty

If no layer is active, show a quiet inline prompt to enable layers.

### Error

If AI generation fails:
- Keep map and structured data visible.
- Show retry action.
- Explain that generated analysis failed, not the whole case study.

### Insufficient Evidence

For unsupported chat or forecast requests:
- Say evidence is insufficient.
- List the missing data needed.
- Offer a relevant supported question.

## 10. Responsive Behavior

V1 can prioritize desktop, but should not break on tablet widths.

Desktop:
- Full three-column command-center layout.

Tablet:
- Left panel collapses into layer drawer.
- Right panel becomes slide-over.
- Bottom drawer remains tabbed.

Mobile:
- Not a V1 priority.
- If supported, use map plus bottom sheet navigation.

## 11. Component Inventory

Core components:
- AppShell
- TopBar
- CaseStudySelector
- TimeHorizonToggle
- PriceChip
- LayerControlPanel
- ImpactLegend
- CaseTimeline
- OilMap
- MapMarker
- RouteLayer
- RiskZoneLayer
- RightInsightPanel
- DriverRankList
- EvidenceCard
- ConfidenceBadge
- IntelligenceDrawer
- AnalystMemo
- ScenarioControls
- ScenarioOutput
- GroundedChat
- SourceReference

## 12. Accessibility And Usability

Requirements:
- Do not rely on color alone; use icons and labels.
- Provide tooltips for map icons.
- Ensure panel text has high contrast.
- Use keyboard-accessible controls.
- Keep font sizes readable in dense panels.
- Avoid tiny unreadable text in charts and map overlays.
- Make selected state visible beyond color.

## 13. Visual Quality Bar

The first demo should feel polished enough that a viewer immediately understands:
- This is a serious AI product.
- The map is the primary reasoning surface.
- Oil market signals are geographically and economically connected.
- The AI analysis is evidence-grounded.
- The scenario tool is conditional and explainable.

Avoid:
- Generic SaaS landing page composition.
- Marketing hero sections.
- Oversized rounded cards.
- Crypto-style neon overload.
- Fake precision.
- Cluttered map markers with no hierarchy.
- Chat-first layout.
