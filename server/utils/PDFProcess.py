import os
import re
import shutil
from uuid import uuid4
from fastapi import UploadFile
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from server.utils.config import UPLOAD_DIR, VECTOR_DB_DIR, EMBEDDING_MODEL, GEMINAI_API_KEY

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_DB_DIR, exist_ok=True)

def sanitize_filename(filename: str):
    filename = re.sub(r'[\\/*?:"<>|]', "", filename)
    filename = filename.replace(" ", "_")
    return filename

def get_embeddings():
    # return GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL, google_api_key=GEMINAI_API_KEY)
    return HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

async def save_pdf_file(file: UploadFile) -> tuple[str, str]:
    pdf_id = str(uuid4())
    safe_filename = sanitize_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, f"{pdf_id}_{safe_filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return pdf_id, file_path


def process_pdf_to_vector_db(file_path: str, pdf_id: str):
    loader = PyMuPDFLoader(file_path)
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(docs)

    vector_store = Chroma.from_documents(
        documents=splits,
        embedding=get_embeddings(),
        persist_directory=VECTOR_DB_DIR,
        collection_name=f"collection_{pdf_id}"
    )

    return vector_store

def get_vector_store(pdf_id: str):
    """
    Retrieves the existing vector store for a specific PDF.
    """
    return Chroma(
        persist_directory=VECTOR_DB_DIR,
        embedding_function=get_embeddings(),
        collection_name=f"collection_{pdf_id}"
    )
