import os
# from langchain_google_genai import ChatGoogleGenerativeAI 
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import SystemMessage, HumanMessage
from typing import Annotated, List
from .tools import check_medicine_stock, place_order, get_patient_history, check_low_stock_alerts, SessionLocal, search_knowledge_base
from .models import OrderHistory, Medicine
from datetime import datetime

from langchain_ollama import ChatOllama

# Initialize LLM
# Using local Ollama model (llama3)
llm = ChatOllama(
    model="llama3.1",
    temperature=0,
)

# Define Tools
tools = [check_medicine_stock, place_order, get_patient_history, check_low_stock_alerts, search_knowledge_base]

# System Prompt
SYSTEM_PROMPT = """You are an Expert Pharmacist Agent for 'AntiGravity Pharmacy'.
Your goal is to assist users with ordering medicines, checking stock, and answering health questions safely.

RULES & SAFETY:
1. ALWAYS check the stock before confirming an order. Use `check_medicine_stock`.
2. IF a medicine requires a prescription (you will see 'Prescription Required: True' in the stock check), YOU MUST ASK the user to upload or confirm they have a prescription before proceeding. (For this mock, just ask "Do you have a valid prescription?" and proceed if they say yes).
3. IF stock is low or empty, apologize and suggest alternatives or say it's out of stock.
4. When placing an order, use `place_order`. You need the patient_id (ask the user for their name/ID if not known) and quantity.
5. Be professional, empathetic, and concise.

PREDICTIVE & PROACTIVE:
- If the user asks "What do I usually buy?", use `get_patient_history`.

CHAIN OF THOUGHT:
- Always think before you act.
- "Checking stock for X..." -> Call tool.
- "Stock is available. Checking prescription requirements..." -> Logic.
- "Placing order..." -> Call tool.
"""

# Create the graph
memory = MemorySaver()
pharmacy_graph = create_react_agent(
    llm, 
    tools, 
    prompt=SYSTEM_PROMPT,
    checkpointer=memory
)

def run_predictive_check():
    """
    Scans order history to find patients who might need a refill.
    Logic: If (Quantity / Dosage_per_day) days have passed + margin.
    For this mock, we'll just check if the last purchase was > 25 days ago and stock > 0.
    """
    db = SessionLocal()
    # simplifed logic: find last purchase for each user/med
    # In a real app we'd query simpler.
    orders = db.query(OrderHistory).all()
    
    alerts = []
    today = datetime.now()
    
    # helper to track last purchase
    user_last_purchase = {} # key: "user|med", value: date
    
    for order in orders:
        key = f"{order.patient_id}|{order.medicine}"
        p_date = datetime.strptime(order.date_purchased, "%Y-%m-%d")
        if key not in user_last_purchase or p_date > user_last_purchase[key]:
            user_last_purchase[key] = p_date
            
    # Check for refill needs (assuming 30 day supply roughly)
    for key, last_date in user_last_purchase.items():
        days_diff = (today - last_date).days
        if 25 <= days_diff <= 35:
            user, med = key.split("|")
            alerts.append(f"Patient {user} purchased {med} {days_diff} days ago. Refill might be needed.")
            
    db.close()
    return alerts
