# Agentic Pharmacy System - Run Guide

## Prerequisites
- Node.js & npm
- Python 3.10+
- Google Gemini API Key
- Langfuse Keys (Optional, for observability)

## Setup Backend
1. Navigate to the project root:
   ```bash
   cd "Pharmacy antigravity"
   ```
2. Create and activate a virtual environment (if not already done):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Configure Environment:
   - Create a `.env` file in the project root (or copy `backend/.env.example` and rename/move it).
   - Add your `GOOGLE_API_KEY` and optional `LANGFUSE` keys.
   ```bash
   # Example .env content
   GOOGLE_API_KEY=your_gemini_key_here
   ```
   *Note: OpenAI API is no longer used.*

5. Initialize Database:
   ```bash
   python3 backend/init_db.py
   ```
6. Start the Backend Server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

## Setup Frontend
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Frontend:
   ```bash
   npm run dev
   ```
4. Open the link (usually http://localhost:5173) in your browser.

## Features to Test
- **Voice Ordering**: Click the mic icon and say "I need Azithromycin 500mg".
- **Safety**: Try to order "Azithromycin" without a prescription (it should ask for one).
- **Proactive Alerts**: Check the Admin Dashboard "Alerts" tab to see if any patients need refills (based on mock history).
- **Inventory Updates**: Order "Paracetamol" and watch the stock decrease in the Admin View.
