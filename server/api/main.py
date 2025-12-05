from fastapi import FastAPI
import uvicorn
import os
from starlette.middleware.cors import CORSMiddleware

from server.api.routes import router as api_router
from server.utils.db import connect_to_mongo, close_mongoconnection

app = FastAPI(title="Research Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:1573"],
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    try:
        await connect_to_mongo()
        print("[SUCCESS] Research Assistant API is starting up.")
    except Exception as e:
        print(f"[ERROR] An error occurred during startup: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    try:
        await close_mongoconnection()
        print("[SUCCESS] Research Assistant API is shutting down.")
    except Exception as e:
        print(f"[ERROR] An error occurred during shutdown: {e}")

if __name__ == "__main__":
    try:
        uvicorn.run("server.api.main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"[ERROR] An error occurred while running the server: {e}")