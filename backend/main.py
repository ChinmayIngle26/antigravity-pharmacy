from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables

from .agents import pharmacy_graph, run_predictive_check
from langchain_core.messages import HumanMessage

app = FastAPI(title="Agentic Pharmacy API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "ngrok-skip-browser-warning"],
)

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default_thread"

@app.on_event("startup")
def startup_revent():
    from .rag import initialize_vector_store
    print("Initializing RAG Knowledge Base...")
    initialize_vector_store()
    print("RAG Ready.")

@app.get("/")
def read_root():
    return {"message": "Agentic Pharmacy API is running"}

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    """
    Main chat endpoint.
    Interacts with the LangGraph agent.
    """
    
    # Setup Langfuse handler if keys are present (auto-picked up by LangChain usually, 
    # but explicit callback is good for some integrations)
    # For LangGraph, tracing is often automatic if LANGFUSE_PUBLIC_KEY keys are set.

    config = {"configurable": {"thread_id": req.thread_id}}
    
    from google.api_core.exceptions import ResourceExhausted
    from fastapi import HTTPException

    try:
        # Invoke the agent
        # We pass the input as a dictionary with "messages"
        response = pharmacy_graph.invoke(
            {"messages": [HumanMessage(content=req.message)]},
            config=config
        )
        
        # Get the last message from AI
        ai_msg = response["messages"][-1]
        return {"response": ai_msg.content}
    except ResourceExhausted:
         raise HTTPException(status_code=429, detail="AI Rate limit exceeded. Please try again in a moment.")
    except Exception as e:
         print(f"Error during agent invocation: {e}")
         raise HTTPException(status_code=500, detail=str(e))

@app.get("/alerts")
def get_alerts():
    """
    Trigger predictive check and return alerts.
    """
    alerts = run_predictive_check()
    return {"alerts": alerts}

@app.get("/inventory")
def get_inventory():
    """
    Get current inventory snapshot for frontend admin.
    """
    from .database import SessionLocal
    from .models import Medicine
    
    db = SessionLocal()
    meds = db.query(Medicine).all()
    data = [{"id": m.id, "name": m.name, "stock": m.stock, "unit": m.unit, "price": m.price} for m in meds]
    db.close()
    return data

@app.get("/history")
def get_history():
    """
    Get full order history for admin.
    """
    from .database import SessionLocal
    from .models import OrderHistory
    
    db = SessionLocal()
    history = db.query(OrderHistory).order_by(OrderHistory.id.desc()).all()
    data = [{
        "id": h.id, 
        "patient": h.patient_id, 
        "medicine": h.medicine, 
        "qty": h.quantity, 
        "date": h.date_purchased
    } for h in history]
    db.close()
    return data

@app.post("/upload-prescription")
async def upload_prescription(file: UploadFile = File(...)):
    """
    Endpoint to analyze uploaded prescription images.
    """
    from .vision import analyze_prescription_image
    import json
    
    contents = await file.read()
    
    # Analyze
    try:
        result_json_str = analyze_prescription_image(contents)
        
        # Robust JSON extraction using regex
        import re
        match = re.search(r'\{.*\}', result_json_str, re.DOTALL)
        if match:
            json_str = match.group(0)
            try:
                data = json.loads(json_str)
            except json.JSONDecodeError:
                data = {"raw_text": result_json_str, "error": "Found JSON-like block but failed to parse."}
        else:
             # Fallback if no JSON found
             data = {"raw_text": result_json_str, "error": "No JSON object found in response."}
             
        return data
    except Exception as e:
        return {"error": f"Failed to process image: {str(e)}", "raw_output": str(e)}
