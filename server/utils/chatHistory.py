from datetime import datetime
from server.utils.db import db_instance
from server.utils.security import encrypt_message, decrypt_message


async def save_chat_message(pdf_id: str, role: str, message: str):
    collection = db_instance.db["chat_history"]

    encrypted_message = encrypt_message(message)
    await collection.insert_one({
        "pdf_id": pdf_id,
        "role": role,
        "message": encrypted_message,
        "timestamp": datetime.utcnow()
    })

async def get_chat_history(pdf_id: str):
    collection = db_instance.db["chat_history"]
    chat_history = []
    async for doc in collection.find({"pdf_id": pdf_id}):
        chat_history.append({
            "role": doc["role"],
            "message": decrypt_message(doc["message"])
        })
    return chat_history

async def clear_chat_history(pdf_id: str):
    collection = db_instance.db["chat_history"]
    await collection.delete_many({"pdf_id": pdf_id})
