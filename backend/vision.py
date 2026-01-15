from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage
import base64

def analyze_prescription_image(image_bytes: bytes) -> str:
    """
    Analyzes a prescription image using Llama 3.2 Vision.
    Returns JSON string with medicine details.
    """
    # Initialize Vision Model
    llm = ChatOllama(model="llama3.2-vision", temperature=0)
    
    # Convert bytes to base64
    img_b64 = base64.b64encode(image_bytes).decode("utf-8")
    
    prompt = """
    You are an expert medical AI assistant specialized in reading doctor's handwriting.
    
    CRITICAL TASK:
    1. Scan the image for any handwritten text (cursive or print).
    2. Decipher the medicine name, dosage (mg/ml), and quantity/frequency.
    3. Ignore pre-printed template text (like "Dr." or "Clinic").Focus on the pen-written parts.
    4. Infer common medical abbreviations (e.g., 'QD' = once daily, 'BID' = twice daily) if useful for 'instructions'.
    
    Output Result:
    Return a SINGLE VALID JSON object containing:
    {
      "medicine_name": "string",
      "dosage": "string",
      "quantity": "integer (or null if not found)",
      "instructions": "string (deciphered directions)"
    }
    
    If you are unsure about a specific word, provide your best guess based on medical context.
    RETURN ONLY THE JSON BLOCK.
    """
    
    msg = HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": f"data:image/jpeg;base64,{img_b64}"},
        ]
    )
    
    try:
        response = llm.invoke([msg])
        return response.content
    except Exception as e:
        return f'{{"error": "Vision analysis failed: {str(e)}"}}'
