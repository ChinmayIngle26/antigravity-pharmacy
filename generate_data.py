import pandas as pd
import random
from datetime import datetime, timedelta
import os

# Create data directory
os.makedirs("data", exist_ok=True)

# 1. Medicine Master Data
print("Generating Medicine Master Data...")
medicines = [
    {"Medicine Name": "Paracetamol", "Dosage": "500mg", "Stock": 100, "Unit": "Tablets", "Prescription Required": "No"},
    {"Medicine Name": "Azithromycin", "Dosage": "500mg", "Stock": 50, "Unit": "Tablets", "Prescription Required": "Yes"},
    {"Medicine Name": "Ibuprofen", "Dosage": "400mg", "Stock": 80, "Unit": "Tablets", "Prescription Required": "No"},
    {"Medicine Name": "Amoxicillin", "Dosage": "500mg", "Stock": 30, "Unit": "Capsules", "Prescription Required": "Yes"},
    {"Medicine Name": "Cetirizine", "Dosage": "10mg", "Stock": 120, "Unit": "Tablets", "Prescription Required": "No"},
    {"Medicine Name": "Metformin", "Dosage": "500mg", "Stock": 60, "Unit": "Tablets", "Prescription Required": "Yes"},
    {"Medicine Name": "Atorvastatin", "Dosage": "20mg", "Stock": 45, "Unit": "Tablets", "Prescription Required": "Yes"},
    {"Medicine Name": "Aspirin", "Dosage": "75mg", "Stock": 150, "Unit": "Tablets", "Prescription Required": "No"},
    {"Medicine Name": "Omeprazole", "Dosage": "20mg", "Stock": 90, "Unit": "Capsules", "Prescription Required": "No"},
    {"Medicine Name": "Losartan", "Dosage": "50mg", "Stock": 40, "Unit": "Tablets", "Prescription Required": "Yes"},
]

df_medicines = pd.DataFrame(medicines)
df_medicines.to_csv("data/medicine_data.csv", index=False)
print("Saved data/medicine_data.csv")

# 2. Consumer Order History
print("Generating Consumer Order History...")
users = ["User1", "User2", "User3", "User4", "User5"]
history_data = []

# Generate some history over the last 30 days
for _ in range(50):
    user = random.choice(users)
    med = random.choice(medicines)
    
    # Random date in last 30 days
    days_ago = random.randint(1, 30)
    date_purchased = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
    
    qty = random.randint(1, 3) * 10 # Buying strips of 10
    
    history_data.append({
        "Patient ID": user,
        "Medicine": med["Medicine Name"],
        "Dosage": med["Dosage"],
        "Quantity": qty,
        "Date": date_purchased
    })

df_history = pd.DataFrame(history_data)
df_history.to_csv("data/order_history.csv", index=False)
print("Saved data/order_history.csv")
