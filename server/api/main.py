import os
import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sympy.codegen import Print

from server.api.routes import router as api_router
from server.api.userRoutes import router as user_router
from server.utils.db import connect_to_mongo, close_mongoconnection
from server.utils.config import DOTENV_PATH, GEMINAI_API_KEY, GEMINAI_MODEL, EMBEDDING_MODEL, MONGO_URI, MONGO_DB_NAME

app = FastAPI(title="Research Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Ensure data directory exists
os.makedirs("data", exist_ok=True)
app.mount("/data", StaticFiles(directory="data"), name="data")

app.include_router(api_router, prefix="/api")
app.include_router(user_router, prefix="/api/auth")

@app.get("/")
def read_root():
    return {"message": "Research Assistant Backend is Running"}


if __name__ == "__main__":
    try:
        uvicorn.run("server.api.main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"[ERROR] An error occurred while running the server: {e}")
