# Backend Developer Commands

Use these commands from this directory:

```bash
python -m pip install -e .
python -m pytest
python -m uvicorn app.main:app --reload --port 8000
```

## Live Data

The oil market data endpoint is:

```bash
GET http://127.0.0.1:8000/api/market-data/oil
```

It uses CFTC's public COT JSON data for WTI futures positioning without a key.
EIA petroleum fundamentals use the official EIA API when a key is configured, and
fall back to EIA's public weekly DNav series pages when no key is present.

```bash
$env:EIA_API_KEY="your-eia-key"
python -m uvicorn app.main:app --reload --port 8000
```

Each successful market-data call stores raw EIA/CFTC observations in SQLite and
returns ML-ready trend features such as weekly change, four-period change,
z-score, percentile, and a compact feature vector. The response separates total
stored observations from observations refreshed during the current call. By
default the history database is written to:

```bash
backend/data/market_history.sqlite3
```

To move it elsewhere:

```bash
$env:MACROSIGNAL_HISTORY_DB_PATH="C:\data\macrosignal\market_history.sqlite3"
```

To backfill long historical data before model training:

```bash
python scripts/backfill_market_history.py --eia-periods 100000 --cftc-periods 10000
```
