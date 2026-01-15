import pandas as pd
import sys
import os

# Add current directory to path to allow imports
sys.path.append(os.getcwd())

from backend.database import engine, Base, SessionLocal
from backend.models import Medicine, OrderHistory

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    
    # Load Medicines
    med_count = session.query(Medicine).count()
    if med_count == 0:
        print("Importing medicines from CSV...")
        try:
            df_med = pd.read_csv("data/medicine_data.csv")
            for _, row in df_med.iterrows():
                # Handle potential missing columns gracefully
                med = Medicine(
                    name=row.get("name", row.get("Medicine Name")),
                    dosage=row.get("dosage", "N/A"), # CSV might not have dosage column
                    stock=int(row.get("stock", 0)),
                    unit=row.get("unit", "units"),
                    price=float(row.get("price", 0.0)),
                    prescription_required=(str(row.get("prescription_required", "No")) == "Yes")
                )
                session.add(med)
            print(f"Added {len(df_med)} medicines.")
        except Exception as e:
            print(f"Error loading medicines: {e}")
    else:
        print(f"Medicines already exist: {med_count}")
    
    # Load History
    hist_count = session.query(OrderHistory).count()
    if hist_count == 0:
        print("Importing order history from CSV...")
        try:
            df_hist = pd.read_csv("data/order_history.csv")
            for _, row in df_hist.iterrows():
                hist = OrderHistory(
                    patient_id=row["Patient ID"],
                    medicine=row["Medicine"],
                    dosage=row["Dosage"],
                    quantity=int(row["Quantity"]),
                    date_purchased=row["Date"]
                )
                session.add(hist)
            print(f"Added {len(df_hist)} history records.")
        except Exception as e:
            print(f"Error loading history: {e}")
    else:
        print(f"History already exist: {hist_count}")
            
    session.commit()
    session.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
