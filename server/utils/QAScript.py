from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from server.utils.config import GEMINAI_MODEL, GEMINAI_API_KEY
from server.schemas.QASchema import QASchema


def evaluate_response(question: str, context: str, answer: str):
    """
    Uses an LLM to grade the RAG system's output.
    """

    # Use a specific, strict model for evaluation (Temperature 0 is best for logic)
    eval_llm = ChatGoogleGenerativeAI(
        model=GEMINAI_MODEL,
        google_api_key=GEMINAI_API_KEY,
        temperature=0
    )

    parser = JsonOutputParser(pydantic_object=QASchema)

    eval_template = """
        You are a strict QA evaluator for a RAG system.
        
        **IMPORTANT: Limit your answer to 1000 words.**
        
        Your task is to analyze the following components:
        1. **User Question**: {question}
        2. **Retrieved Context**: {context}
        3. **System Answer**: {answer}

        Step 1: Assess Relevance. Does the System Answer directly address the User Question? 
                NOTE: If the system answers "I cannot find the answer" and the context truly lacks the info, mark Relevance as True.

        Step 2: Assess Faithfulness. Is every claim in the System Answer supported by the Retrieved Context? 
                If the answer contains information NOT present in the context, it is NOT faithful.

        Output your result in JSON format compatible with the schema.
        {format_instructions}
        """

    prompt = PromptTemplate(
        template=eval_template,
        input_variables=["question", "context", "answer"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )

    chain = prompt | eval_llm | parser

    try:
        score = chain.invoke({
            "question": question,
            "context": context,
            "answer": answer
        })
        return score
    except Exception as e:
        return {"error": str(e)}
