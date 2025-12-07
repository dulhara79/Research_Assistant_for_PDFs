from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreateSchema(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class UserUpdateSchema(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class UserOutputSchema(BaseModel):
    id: str = Field(alias="_id")
    username: str
    name: str
    email: EmailStr
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at")

    class Config:
        populate_by_name = True


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
