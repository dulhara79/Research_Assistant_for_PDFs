import os
from motor.motor_asyncio import AsyncIOMotorClient

from server.utils.config import MONGO_URI, MONGO_DB_NAME


class MongoDB:
    client = AsyncIOMotorClient = None
    db = None


db_instance = MongoDB()


async def connect_to_mongo():
    db_instance.client = AsyncIOMotorClient(
        MONGO_URI,
        maxPoolSize=1000,
        minPoolSize=10)
    db_instance.db = db_instance.client[MONGO_DB_NAME]
    print("[INFO] Connected to MongoDB")


async def close_mongoconnection():
    if db_instance.client:
        db_instance.client.close()
        print("[INFO] MongoDB connection closed")
