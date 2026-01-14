from datetime import datetime
from sqlalchemy.orm import Session
from .models import Medicine, OrderHistory
from .database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_medicine_stock(medicine_name: str) -> str:
    """Check if a medicine is in stock and return details."""
    db = SessionLocal()
    try:
        med = db.query(Medicine).filter(Medicine.name.ilike(medicine_name)).first()
        
        if not med:
            return f"Medicine '{medicine_name}' not found in inventory."
        
        return f"{med.name}: {med.stock} {med.unit} available. Dosage: {med.dosage}. Prescription Required: {med.prescription_required}"
    finally:
        db.close()

def place_order(patient_id: str, medicine_name: str, quantity: int) -> str:
    """Place an order for a medicine. deducts stock if available."""
    db = SessionLocal()
    try:
        med = db.query(Medicine).filter(Medicine.name.ilike(medicine_name)).first()
        
        if not med:
            return f"Error: Medicine '{medicine_name}' not found."
        
        if med.stock < quantity:
            return f"Error: Insufficient stock. Only {med.stock} {med.unit} remaining."
        
        # Deduct stock
        med.stock -= quantity
        
        # Record history
        history = OrderHistory(
            patient_id=patient_id,
            medicine=med.name,
            dosage=med.dosage,
            quantity=quantity,
            date_purchased=datetime.now().strftime("%Y-%m-%d")
        )
        db.add(history)
        db.commit()
        
        return f"Order success! {quantity} {med.unit} of {med.name} ordered for {patient_id}. Webhook triggered for warehouse fulfillment."
    finally:
        db.close()

def get_patient_history(patient_id: str) -> str:
    """Get recent purchase history for a patient."""
    db = SessionLocal()
    try:
        history = db.query(OrderHistory).filter(OrderHistory.patient_id == patient_id).all()
        
        if not history:
            return f"No history found for patient {patient_id}."
        
        records = []
        for h in history:
            records.append(f"- {h.date_purchased}: {h.medicine} ({h.quantity})")
        
        return "\n".join(records)
    finally:
        db.close()

def check_low_stock_alerts() -> str:
    """Check for medicines with low stock (< 20)."""
    db = SessionLocal()
    try:
        low_stock = db.query(Medicine).filter(Medicine.stock < 20).all()
        
        if not low_stock:
            return "All stock levels are healthy."
            
        alerts = [f"{m.name} is low ({m.stock} left)" for m in low_stock]
        return "ALERTS:\n" + "\n".join(alerts)
    finally:
        db.close()

from .rag import query_knowledge_base

def search_knowledge_base(query: str) -> str:
    """
    Search the medical knowledge base for drug interactions, side effects, and safety guidelines.
    Use this strictly for medical questions (e.g. "Can I take X with Y?", "Side effects of Z").
    """
    return query_knowledge_base(query)
