import os
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from server.utils.PDFProcess import get_vector_store
from server.utils.config import GEMINAI_MODEL, GEMINAI_API_KEY

llm = ChatGoogleGenerativeAI(
    model=GEMINAI_MODEL,
    google_api_key=GEMINAI_API_KEY,
    temperature=0.3,
    convert_system_message_to_human=True
)

def generate_structured_summary(file_path: str) -> str:
    loader = PyPDFLoader(file_path)
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
        return result.content
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def get_answer_from_pdf(question: str, pdf_id: str, chat_history: list):
    vector_store = get_vector_store(pdf_id)
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})

    # NEW: LCEL retriever
    docs = retriever.invoke(question)

    context = "\n\n".join([d.page_content for d in docs])
    formatted_history = "\n".join([f"{m['role']}: {m['message']}" for m in chat_history])

    template = """
    You are a highly knowledgeable research assistant. Your job is to answer the user's
    question using ONLY the information found in the retrieved context from the research paper.

    Follow these rules strictly:

    1. If the answer IS found in the context → provide a clear, concise explanation.
    2. If the answer is NOT found in the context → reply exactly with:
       "I cannot find the answer in this paper."
    3. Do NOT use outside knowledge.
    4. Use the conversation history only to maintain continuity, not to add new facts.
    5. Avoid hallucination at all costs.

    -----------------------------
    Retrieved Context:
    {context}

    Conversation History:
    {history}

    User Question:
    {question}

    -----------------------------
    Provide the best possible answer based ONLY on the context above.
    """

    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "history", "question"]
    )

    chain = prompt | llm
    final_output = chain.invoke({
        "context": context,
        "history": formatted_history,
        "question": question
    })

    return {
        "result": final_output.content,
        "source_documents": docs
    }
