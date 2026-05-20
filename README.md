# MacroSignal Oil

MacroSignal Oil is a map-first commodity intelligence MVP for explaining oil price moves. It combines geopolitical/shipping context, official EIA fundamentals, official CFTC futures positioning, local history storage, and evidence-gated analyst workflows.

## What It Does

- Shows global oil shipping routes and route-risk context on an interactive map.
- Loads actual EIA weekly petroleum fundamentals:
  - inventories
  - imports
  - exports
  - production
  - refinery runs
- Loads actual CFTC WTI futures positioning:
  - managed money net positioning
  - open interest
- Stores historical observations in SQLite for trend analysis and future ML.
- Computes ML-ready features:
  - weekly change
  - 4-period change
  - 4-period and 12-period averages
  - z-score
  - percentile
  - trend direction
- Provides an evidence-gated analyst memo tab so unsupported claims are blocked from generated analysis.

## Project Structure

```text
backend/   FastAPI API, EIA/CFTC providers, evidence gates, history backfill
frontend/  Vite + React app with map, memo, scenario, chat, and market data views
e2e/       Playwright smoke tests
docs/      Product, architecture, design, and planning artifacts
```

## Requirements

- Python 3.12+
- Node.js 20+
- GitHub CLI or Git credentials for pushing changes

## Backend

From `backend/`:

```bash
python -m pip install -e .
python -m pytest
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API runs at:

```text
http://127.0.0.1:8000/api
```

Useful endpoints:

```text
GET /api/health
GET /api/cases
GET /api/cases/{case_id}
GET /api/cases/{case_id}/memo
GET /api/market-data/oil
```

## Frontend

From `frontend/`:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

The app runs at:

```text
http://127.0.0.1:5173/
```

To connect the frontend to the backend, create `frontend/.env.local`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## E2E Tests

From `e2e/`:

```bash
npm install
npm run install:browsers
npm test
```

To run against an already-running frontend:

```bash
E2E_BASE_URL=http://127.0.0.1:5173 npm test
```

## Historical Market Data

The market-data endpoint stores raw EIA/CFTC observations in SQLite and returns trend features for model development.

Default database path:

```text
backend/data/market_history.sqlite3
```

The SQLite database is intentionally ignored by Git because it is generated runtime data. Rebuild it with:

```bash
cd backend
python scripts/backfill_market_history.py --eia-periods 100000 --cftc-periods 10000
```

Current backfill coverage in local development:

- EIA inventories: 1982-08-20 to 2026-05-08
- EIA refinery runs: 1982-08-20 to 2026-05-08
- EIA production: 1983-01-07 to 2026-05-08
- EIA imports: 1990-01-05 to 2026-05-08
- EIA exports: 1991-02-08 to 2026-05-08
- CFTC WTI managed money net: 2006-06-13 to 2026-05-12
- CFTC WTI open interest: 2006-06-13 to 2026-05-12

To store the database somewhere else:

```bash
MACROSIGNAL_HISTORY_DB_PATH=/path/to/market_history.sqlite3
```

## EIA API Key

The backend can use the official EIA API when `EIA_API_KEY` is configured. If no key is present, it falls back to EIA public DNav weekly series pages.

```bash
EIA_API_KEY=your-eia-key
```

## Verification

Common verification commands:

```bash
cd backend && python -m pytest
cd frontend && npm test -- --run
cd frontend && npm run build
cd frontend && npm run lint
cd e2e && npm test
```

## Notes

- The current app is an MVP intended for AI engineering practice and product iteration.
- It is not financial advice.
- Generated local screenshots, build artifacts, dependency folders, and SQLite databases are ignored by Git.
