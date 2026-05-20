from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.cases import router as cases_router
from app.api.health import router as health_router
from app.api.market_data import router as market_data_router


def create_app() -> FastAPI:
    app = FastAPI(title="MacroSignal Oil API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://192.168.0.154:5173",
        ],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router, prefix="/api")
    app.include_router(cases_router, prefix="/api")
    app.include_router(market_data_router, prefix="/api")
    return app


app = create_app()
