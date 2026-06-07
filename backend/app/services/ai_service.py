import json
from groq import Groq
from app.config import settings

# Initialize Groq client
client = Groq(api_key=settings.GROQ_API_KEY)

# Primary and fallback model configuration
PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"

# System Prompt enforces strict JSON schema
SYSTEM_PROMPT = """
You are an expert legal and operational AI assistant. 
You must analyze the provided text and return your analysis STRICTLY as a JSON object.
Do not include any markdown formatting like ```json or any conversational text.
Your JSON must exactly match this structure with string values. 
If a field lacks information based on the text, explicitly write "None identified".

{
    "summary": "Brief executive summary of the content.",
    "parties": "List of individuals, companies, or entities involved.",
    "key_dates": "Important dates, deadlines, or milestones.",
    "obligations": "Key responsibilities or duties mentioned.",
    "action_items": "Specific tasks that need to be completed.",
    "risks": "Potential risks, liabilities, or critical warnings."
}
"""

def analyze_text(text_content: str, analysis_type: str) -> dict:
    """
    Analyzes text using Groq with fallback model support.
    """
    
    # 1. Empty Text Guard
    if not text_content or not text_content.strip():
        raise ValueError("No readable text found in document.")
    
    # 2. Prepare Prompt Context
    if analysis_type == "document":
        user_prompt = f"Perform a Document Analysis on the following text. Extract the key insights into the required JSON format.\n\nTEXT:\n{text_content}"
    elif analysis_type == "case":
        user_prompt = f"Perform a comprehensive Case Analysis on the following combined case documents. Synthesize the information into a single holistic JSON summary.\n\nCOMBINED TEXT:\n{text_content}"
    else:
        raise ValueError("Invalid analysis_type. Must be 'document' or 'case'.")

    # 3. Execution with Fallback Logic
    try:
        response = _call_groq(PRIMARY_MODEL, user_prompt)
    except Exception:
        # Fallback to the instant model if the primary fails (rate limits or availability)
        response = _call_groq(FALLBACK_MODEL, user_prompt)

    # 4. JSON Parsing
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse Groq AI response into structured JSON.")

def _call_groq(model_name: str, user_prompt: str) -> str:
    """Helper to execute the actual Groq API call."""
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
        max_tokens=2048,
    )
    return response.choices[0].message.content