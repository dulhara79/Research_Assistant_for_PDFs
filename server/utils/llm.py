import os
import glob
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyMuPDFLoader
from server.utils.PDFProcess import get_vector_store
from server.utils.config import GEMINAI_MODEL, GEMINAI_API_KEY, UPLOAD_DIR

llm = ChatGoogleGenerativeAI(
    model=GEMINAI_MODEL,
    google_api_key=GEMINAI_API_KEY,
    temperature=0.3,
    convert_system_message_to_human=True
)

def generate_structured_summary(file_path: str) -> str:
    loader = PyMuPDFLoader(file_path)
    docs = loader.load()

    template = """
    You are an expert academic researcher. Your task is to read the provided research paper 
    content and generate a structured summary following the required format.

    Strictly follow this structure:

    1. **Title & Authors / Abstract**
       - Extract the paper title.
       - Extract the author(s).
       - Provide a clear and concise abstract-style summary.

    2. **Problem Statement**
       - Identify the main research problem or gap the authors aim to address.
       - State it clearly in 2–4 sentences.

    3. **Methodology**
       - Describe the methods, techniques, models, datasets, or experiments used.
       - Summaries should be concise but informative.

    4. **Key Results**
       - Highlight the major findings or outcomes of the study.
       - Mention specific performance metrics or results if present.

    5. **Conclusion**
       - Summarize the authors’ final insights, implications, or next steps.

    --------------------------
    ### Research Paper Text:
    {text}
    """

    prompt = PromptTemplate(template=template, input_variables=["text"])

    full_text = " ".join([d.page_content for d in docs])
    chain = prompt | llm

    try:
        result = chain.invoke({"text": full_text})
        print(f"DBUG Results text: {result.content}")
        return result.content
    except Exception as e:
        return f"Error generating summary: {str(e)}"

# def get_answer_from_pdf(question: str, pdf_id: str, chat_history: list):
#     vector_store = get_vector_store(pdf_id)
#     retriever = vector_store.as_retriever(search_kwargs={"k": 8})
#
#     # ---- UNIVERSAL SAFE RETRIEVAL ----
#     try:
#         raw = retriever.invoke(question)
#     except Exception as e:
#         print("Retriever error:", e)
#         raw = []
#
#     # Normalize everything to a list of documents/text blocks
#     docs = []
#
#     # Case 1: LCEL → {"documents": [...], ...}
#     if isinstance(raw, dict) and "documents" in raw:
#         raw_docs = raw["documents"]
#     else:
#         raw_docs = raw
#
#     # Case 2: ensure list
#     if not isinstance(raw_docs, list):
#         raw_docs = [raw_docs]
#
#     # ---- NORMALIZE EACH ITEM SAFELY ----
#     for item in raw_docs:
#         if hasattr(item, "page_content"):
#             # Proper LangChain Document
#             docs.append({
#                 "text": item.page_content,
#                 "metadata": getattr(item, "metadata", {})
#             })
#         elif isinstance(item, dict):
#             # If dict contains text
#             if "page_content" in item:
#                 docs.append({"text": item["page_content"], "metadata": item.get("metadata", {})})
#             elif "text" in item:
#                 docs.append({"text": item["text"], "metadata": item.get("metadata", {})})
#             else:
#                 # Fallback
#                 docs.append({"text": str(item), "metadata": {}})
#         elif isinstance(item, str):
#             docs.append({"text": item, "metadata": {}})
#         else:
#             docs.append({"text": str(item), "metadata": {}})
#
#     # ---- Build context ----
#     context = "\n\n".join([d["text"] for d in docs if d["text"]])
#
#     # ---- Build history ----
#     formatted_history = "\n".join(
#         [f"{m['role']}: {m['message']}" for m in chat_history]
#     )
#
#     # ---- LLM Prompt ----
#     template = """
#     You are a highly knowledgeable research assistant. Your job is to answer the user's
#     question using ONLY the information found in the retrieved context from the research paper.
#
#     Rules:
#     - If answer IS found → give it clearly.
#     - No outside knowledge.
#
#     -----------------------------
#     Retrieved Context:
#     {context}
#
#     Conversation History:
#     {history}
#
#     User Question:
#     {question}
#     """
#
#     prompt = PromptTemplate(
#         template=template,
#         input_variables=["context", "history", "question"]
#     )
#
#     chain = prompt | llm
#     final_output = chain.invoke({
#         "context": context,
#         "history": formatted_history,
#         "question": question
#     })
#
#     # ---- Build source documents list for API response ----
#     source_documents = [
#         d["text"][:300] + "..." for d in docs if d["text"]
#     ]
#
#     return {
#         "result": final_output.content,
#         "source_documents": source_documents
#     }

def get_answer_from_pdf(question: str, pdf_id: str, chat_history: list):
    if not pdf_id:
        return {
            "result": "Error: pdf_id is missing.",
            "source_documents": []
        }

    # 1. Standard MMR Retrieval
    vector_store = get_vector_store(pdf_id)
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "fetch_k": 20, "lambda_mult": 0.5}
    )

    try:
        docs = retriever.invoke(question)
    except Exception as e:
        print("Retriever error:", e)
        docs = []

    first_page_text = ""
    found_file_path = None

    try:
        # Construct the pattern to find the file
        # ensure UPLOAD_DIR does not end with a slash to avoid double slashes
        clean_dir = UPLOAD_DIR.rstrip("/")
        search_pattern = f"{clean_dir}/{pdf_id}_*.pdf"

        files = glob.glob(search_pattern)

        if files:
            file_path = files[0]
            loader = PyMuPDFLoader(file_path)
            # Load the first 2 pages (in case Title is on page 2 or cover sheet exists)
            pages = loader.load()

            if len(pages) > 0:
                p1 = pages[0].page_content
                p2 = pages[1].page_content if len(pages) > 1 else ""
                first_page_text = f"--- START OF DOCUMENT METADATA ---\n{p1}\n{p2}\n--- END OF DOCUMENT METADATA ---\n"
        else:
            print(f"Error: No file found for ID {pdf_id} in {clean_dir}")

    except Exception as e:
        print(f"Error loading first page: {e}")

    # 3. Combine Context
    # We strip newlines to help Gemini process dense text better
    retrieved_content = "\n\n".join([d.page_content.replace("\n", " ") for d in docs])

    # Prepend the first page text. If empty, it adds nothing.
    full_context = first_page_text + "\n\n" + retrieved_content

    # 4. Format History
    formatted_history = "\n".join(
        [f"{m['role']}: {m['message']}" for m in chat_history]
    )

    # 5. Prompting
    template = """
    You are a research assistant. Answer the User Question using ONLY the provided context.

    CRITICAL INSTRUCTIONS:
    1. The context starts with the **Document Metadata** (Title, Abstract, Authors). USE THIS for questions about the paper itself.
    2. Do NOT mistake names in the 'References' or 'Bibliography' section for the paper's actual authors.
    3. If the answer is found in the Metadata section, state it clearly.
    4. If the answer is not in the context, say "I cannot find the answer."

    -----------------------------
    Conversation History:
    {history}

    Context:
    {context}

    User Question:
    {question}
    """

    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "history", "question"]
    )

    chain = prompt | llm

    try:
        final_output = chain.invoke({
            "context": full_context,
            "history": formatted_history,
            "question": question
        })
        answer_text = final_output.content
    except Exception as e:
        answer_text = "I encountered an error generating the response."

    # --- FIX SOURCE DOCUMENTS RETURN ---
    # Now we return the ACTUAL text of the first page snippet so you can see if it worked.
    # We take the first 150 chars of page 1, or a specific error message.
    header_preview = first_page_text[:150].replace("\n",
                                                   " ") + "..." if first_page_text else "(Error: Could not load Page 1 Text)"

    source_documents = [header_preview] + [d.page_content[:300] + "..." for d in docs]

    return {
        "result": answer_text,
        "source_documents": source_documents
    }
