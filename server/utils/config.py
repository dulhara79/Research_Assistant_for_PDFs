import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DOTENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=DOTENV_PATH)

DOTENV_PATH = DOTENV_PATH
# Directories for data storage
VECTOR_DB_DIR = "data/vector_db"
UPLOAD_DIR = "data/uploads"

# Gemini AI configuration
GEMINAI_API_KEY = os.getenv("GEMINAI_API_KEY")
GEMINAI_MODEL = os.getenv("GEMINAI_MODEL")
EMBEDDING_MODEL = "models/embedding-001"

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "60"))

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_PORT = 587
MAIL_SERVER = os.getenv("MAIL_SERVER")
