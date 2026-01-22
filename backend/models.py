from sqlalchemy import Column, Integer, String, Boolean, Float
from .database import Base

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    dosage = Column(String)
    stock = Column(Integer)
    unit = Column(String)
    price = Column(Float, default=0.0)
    category = Column(String, default="General")
    description = Column(String, default="")
    prescription_required = Column(Boolean, default=False)

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    allergies = Column(String, default="") # Comma separated
    conditions = Column(String, default="") # Comma separated

class OrderHistory(Base):
    __tablename__ = "order_history"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    medicine = Column(String)
    dosage = Column(String)
    quantity = Column(Integer)
    date_purchased = Column(String)
