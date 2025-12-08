import os
import glob
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.tools import WikipediaQueryRun, DuckDuckGoSearchRun
from langchain_community.utilities import WikipediaAPIWrapper
from server.utils.PDFProcess import get_vector_store
from server.utils.QAScript import evaluate_response
from server.utils.config import GEMINAI_MODEL, GEMINAI_API_KEY, UPLOAD_DIR

llm = ChatGoogleGenerativeAI(
    model=GEMINAI_MODEL,
    google_api_key=GEMINAI_API_KEY,
    temperature=0.3,
    convert_system_message_to_human=True
)

wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
search = DuckDuckGoSearchRun()


def generate_structured_summary(file_path: str) -> str:
    loader = PyMuPDFLoader(file_path)
    docs = loader.load()

    template = """
    You are an expert academic researcher. Your task is to read the provided research paper 
    content and generate a structured summary following the required format.
    
    **IMPORTANT: Limit your answer to 1000 words.**

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


def get_external_context(question: str) -> str:
    print(f"[DEBUG] Fetching external context for: {question}")
    external_context = ""

    # 1. Try Wikipedia first
    try:
        wiki_res = wikipedia.run(question)
        external_context += f"\n\n--- WIKIPEDIA RESULTS ---\n{wiki_res}"
    except Exception as e:
        print(f"Wiki Error: {e}")

    # 2. Try DuckDuckGo
    try:
        ddg_res = search.run(question)
        external_context += f"\n\n--- INTERNET SEARCH RESULTS ---\n{ddg_res}"
    except Exception as e:
        print(f"DDG Error: {e}")

    return external_context


def get_answer_from_pdf(question: str, pdf_id: str, chat_history: list, study_mode: bool = False):
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
        pdf_context = ""

    external_context = ""
    if study_mode:
        external_context = get_external_context(question)

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
    full_context = first_page_text + "\n\n" + retrieved_content + "\n\n" + external_context

    # 4. Format History
    formatted_history = "\n".join(
        [f"{m['role']}: {m['message']}" for m in chat_history]
    )

    MAX_RETRIES = 3
    current_answer = ""
    feedback = ""

    for attempt in range(MAX_RETRIES):
        print(f"[DEBUG] Generate Attempt {attempt + 1}/{MAX_RETRIES}")

        # 5. Prompting
        if study_mode:
            # TEACHER PROMPT
            template = """
                You are an expert AI Tutor. Your goal is to TEACH the user about the topic using the provided content.

                Sources Available:
                1. A PDF Document uploaded by the user.
                2. Wikipedia and Internet Search results.

                Instructions:
                - Prioritize the **PDF Content** as the primary source of truth.
                - Use the **External Context** (Wikipedia/Internet) to explain concepts that are difficult, define terms, or provide broader examples not found in the PDF.
                - If the PDF mentions a concept briefly, use the external info to expand on it comprehensively.
                - Structure your answer like a tutorial or a lesson. Use bullet points and clear headings.
                - If the answer is not in any of the sources, admit it.

                -----------------------------
                Conversation History:
                {history}

                Combined Context:
                {context}

                User Question:
                {question}
                """
        else:
            # STANDARD RAG PROMPT (Your existing one, slightly cleaned)
            template = """
                You are a research assistant. Answer the User Question using ONLY the provided context.

                1. The context comes from a PDF document.
                2. If the answer is not in the context, say "I cannot find the answer in the document."
                3. Do NOT hallucinate.

                -----------------------------
                Conversation History:
                {history}

                Context:
                {context}

                User Question:
                {question}
                """

        feedback_section = ""
        if feedback:
            feedback_section = f"""
            !!! PREVIOUS ATTEMPT FAILED !!!
            Your previous answer was rejected for the following reason:
            "{feedback}"
            
            Please correct your approach and generate a new answer that addresses this critique.
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
                "question": question,
                "feedback_section": feedback_section
            })
            current_answer = final_output.content

            eval_result = evaluate_response(question, full_context, current_answer)

            if "error" in eval_result:
                feedback = f"Evaluation Error: {eval_result['error']}"
                print(feedback)
                break

            is_relevant = eval_result.get("is_relevant", False)
            is_faithful = eval_result.get("is_faithful", False)
            reasoning = eval_result.get("reasoning", "No reasoning provided.")

            if is_relevant and is_faithful:
                print("[DEBUG] Answer accepted by evaluator.")
                break
            else:
                print(f"[DEBUG] Answer rejected. Relevant: {is_relevant}, Faithful: {is_faithful}")
                print(f"[DEBUG] Reasoning: {reasoning}")
                feedback = reasoning
        except Exception as e:
            current_answer = f"Error generating answer: {str(e)}"
            print(current_answer)
            break

    header_preview = first_page_text[:150].replace("\n",
                                                   " ") + "..." if first_page_text else "(Error: Could not load Page 1 Text)"

    source_documents = [header_preview] + [d.page_content[:300] + "..." for d in docs]

    return {
        "result": current_answer,
        "source_documents": source_documents,
        "debug_eval": feedback
    }
