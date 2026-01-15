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
    You are an expert pharmacist AI. Analyze this prescription image.
    Extract the following details and return ONLY a valid JSON object. Do not add any markdown formatting or explanation.
    
    Required JSON Structure:
    {
      "medicine_name": "string (name of the drug)",
      "dosage": "string (e.g. 500mg)",
      "quantity": "integer (estimated or stated)",
      "patient_name": "string or null",
      "instructions": "string (frequency, e.g. twice daily)"
    }
    
    If the image is not a prescription or unclear, return: {"error": "Unable to read prescription"}.
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
