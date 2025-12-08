from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from server.utils.db import db_instance
from server.schemas.UserSchema import (UserCreateSchema, UserOutputSchema, UserLoginSchema, TokenSchema,
                                       UserUpdateSchema)
from server.utils.security import get_password_hash, verify_password, create_access_token
from server.utils.auth import get_current_user, oauth2_scheme

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=UserOutputSchema, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreateSchema):
    existing_user = await db_instance.db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()

    new_user = await db_instance.db["users"].insert_one(user_dict)

    created_user = await db_instance.db["users"].find_one({"_id": new_user.inserted_id})
    created_user["_id"] = str(created_user["_id"])

    return created_user


@router.post("/login", response_model=TokenSchema)
async def login_user(login_data: UserLoginSchema):
    user = await db_instance.db["users"].find_one({"email": login_data.email})

    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOutputSchema)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.post("/logout", status_code=status.HTTP_201_CREATED)
async def logout(token: str = Depends(oauth2_scheme)):
    # await db_instance.db["token_blacklist"].create_index("blacklisted_at", expireAfterSeconds=86400)

    existing = await db_instance.db["token_blacklist"].find_one({"token": token})
    if not existing:
        await db_instance.db["token_blacklist"].insert_one({
            "token": token,
            "blacklisted_at": datetime.utcnow(),
        })

    return {"message": "Successfully logged out"}

@router.put("/me", response_model=UserOutputSchema)
async def update_user(
        update_data: UserUpdateSchema,
        current_user: dict = Depends(get_current_user)
):
    # Remove None values so we don't overwrite with nulls
    data_to_update = {k: v for k, v in update_data.dict().items() if v is not None}

    if not data_to_update:
        return current_user  # Nothing to update

    data_to_update["updatedAt"] = datetime.utcnow()

    await db_instance.db["users"].update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": data_to_update}
    )

    updated_user = await db_instance.db["users"].find_one({"_id": ObjectId(current_user["_id"])})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(current_user: dict = Depends(get_current_user)):
    await db_instance.db["users"].delete_one({"_id": ObjectId(current_user["_id"])})
    return None
