from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from unstructured_client.models.errors import Detail

from server.utils.db import db_instance
from server.utils.security import verify_password
from server.utils.config import JWT_SECRET_KEY, JWT_ALGORITHM
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_expectation = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    is_blacklisted = await db_instance.db["token_blacklist"].find_one({
        "token": token
    })
    if is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked (Logged out)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_expectation
    except JWTError:
        raise credentials_expectation

    user = await db_instance.db["users"].find_one({"_id": ObjectId(user_id)})

    if user is None:
        raise credentials_expectation

    user["_id"] = str(user["_id"])
    return user
