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
    You are an artificial intelligence assistant that specializes in OCR (Optical Character Recognition) for medical prescriptions.
    
    Task: Identify the medication details in this image.
    If the text is handwritten, do your best to decipher it.
    
    Return the result as a strictly valid JSON object with these keys:
    {
      "medicine_name": "Name of the drug (e.g. Amoxicillin)",
      "dosage": "Dosage string (e.g. 500mg)",
      "quantity": "Quantity integer (e.g. 10)",
      "instructions": "Directions (e.g. Take one tablet daily)"
    }
    
    Constraint: Return ONLY the JSON object. Do not output markdown code blocks (like ```json). Do not output any conversational text.
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
