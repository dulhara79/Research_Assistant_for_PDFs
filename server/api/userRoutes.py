from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from datetime import datetime, timedelta
from bson import ObjectId
from fastapi_mail import MessageSchema, MessageType, FastMail

from server.utils.db import db_instance
from server.schemas.UserSchema import (UserCreateSchema, UserOutputSchema, UserLoginSchema, TokenSchema,
                                       UserUpdateSchema, OTPVerifySchema, OTPSendSchema)
from server.utils.security import (get_password_hash, verify_password, create_access_token,
                                   generate_otp, encrypt_message, decrypt_message)
from server.utils.auth import get_current_user, oauth2_scheme
from server.utils.mailConfig import conf
from server.utils.emailTemplates import loginTemplate, registrationTemplate

router = APIRouter(tags=["Authentication"])


# @router.post("/register", response_model=UserOutputSchema, status_code=status.HTTP_201_CREATED)
@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreateSchema, background_tasks: BackgroundTasks):
    existing_user = await db_instance.db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()

    # new_user = await db_instance.db["users"].insert_one(user_dict)
    #
    # created_user = await db_instance.db["users"].find_one({"_id": new_user.inserted_id})
    # created_user["_id"] = str(created_user["_id"])
    #
    # return created_user
    # Generate OTP immediately upon registration
    otp_code = generate_otp()

    encripted_otp = encrypt_message(otp_code)

    user_dict["otp_code"] = encripted_otp
    user_dict["otp_expires_at"] = datetime.utcnow() + timedelta(minutes=5)

    await db_instance.db["users"].insert_one(user_dict)

    # 3. Send OTP Email
    message = MessageSchema(
        subject="Verify your account",
        recipients=[user.email],
        body=f"<h3>Welcome! Your verification code is:</h3> <h1>{otp_code}</h1>",
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)

    return {"message": "User created. Check email for OTP."}


# @router.post("/login", response_model=TokenSchema)
@router.post("/login", response_model=dict)
async def login_user(login_data: UserLoginSchema, background_tasks: BackgroundTasks):
    user = await db_instance.db["users"].find_one({"email": login_data.email})

    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT
    # access_token = create_access_token(data={"sub": str(user["_id"])})
    # return {"access_token": access_token, "token_type": "bearer"}

    otp_code = generate_otp()
    expiration_time = datetime.utcnow() + timedelta(minutes=5)

    encripted_otp = encrypt_message(otp_code)

    await db_instance.db["users"].update_one(
        {"email": login_data.email},
        {"$set": {"otp_code": encripted_otp, "otp_expires_at": expiration_time}}
    )

    # 3. Send Email
    message = MessageSchema(
        subject="Login OTP",
        recipients=[login_data.email],
        body=loginTemplate(otp_code),
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)

    return {"message": "OTP sent to email"}


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

@router.post("/send-otp", status_code=status.HTTP_200_OK)
async def send_otp(otp_data: OTPSendSchema, background_tasks: BackgroundTasks):
    email = otp_data.email

    user = await db_instance.db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_code = generate_otp()

    expiration_time = datetime.utcnow() + timedelta(minutes=5)

    await db_instance.db["users"].update_one(
        {"email": email},
        {"$set": {
            "otp": otp_code,
            "otp_expiration": expiration_time
        }}
    )

    message = MessageSchema(
        subject="Your OTP Code",
        recipients=[email],
        body=registrationTemplate(otp_code),
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)

    return {"message": "OTP sent successfully"}

@router.post("/verify-otp", response_model=TokenSchema)
async def verify_otp(otp_data: OTPVerifySchema):
    user = await db_instance.db["users"].find_one({"email": otp_data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stored_otp = user.get("otp_code")
    expiry = user.get("otp_expires_at")

    decrypted_otp = decrypt_message(stored_otp) if stored_otp else None

    if not decrypted_otp or not expiry:
        raise HTTPException(status_code=400, detail="No OTP requested")

        # 3. Validate OTP and Expiry
    if decrypted_otp != otp_data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.utcnow() > expiry:
        raise HTTPException(status_code=400, detail="OTP has expired")

    await db_instance.db["users"].update_one(
        {"email": otp_data.email},
        {"$unset": {"otp_code": "", "otp_expires_at": ""}}
    )


    access_token = create_access_token(data={"sub": str(user["_id"])})

    return {"access_token": access_token, "token_type": "bearer"}


