import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.historical_backfill import HistoricalBackfillService


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill MacroSignal oil market history.")
    parser.add_argument("--eia-periods", type=int, default=100_000)
    parser.add_argument("--cftc-periods", type=int, default=10_000)
    args = parser.parse_args()

    result = HistoricalBackfillService().run(
        eia_periods=args.eia_periods,
        cftc_periods=args.cftc_periods,
    )
    print(json.dumps(result.model_dump(by_alias=True), indent=2))


if __name__ == "__main__":
    main()
