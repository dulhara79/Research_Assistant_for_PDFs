import random
import string
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import jwt
from sklearn.utils import deprecated
from cryptography.fernet import Fernet

from server.utils.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_MINUTES, ENCRYPTION_KEY

# key = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    hashed_input = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return pwd_context.verify(hashed_input, hashed_password)


def get_password_hash(password):
    hashed_input = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return pwd_context.hash(hashed_input)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    return encoded_jwt


def encrypt_message(message: str):
    encrypted_bytes = cipher_suite.encrypt(message.encode())
    return encrypted_bytes.decode("utf-8")


def decrypt_message(encrypted_message: str):
    try:
        decrypted_bytes = cipher_suite.decrypt(encrypted_message.encode())
        return decrypted_bytes.decode("utf-8")
    except Exception as e:
        # print(f"[DEBUG] Decryption error: {e}")
        raise ValueError("Invalid Key or Corrupted Data")


def generate_otp(length=6) -> str:
    """Generate a random numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))
