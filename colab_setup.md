# Running Pharmacy Agent on Google Colab

Since your local machine might struggle with heavy Vision models like `llama3.2-vision`, running the **Backend** on Google Colab (which provides free T4 GPUs) is a great idea.

## Strategy
1.  **Backend on Colab**: We will run the FastAPI server and Ollama on Colab.
2.  **Frontend Locally**: You can keep the React Frontend running on your Mac.
3.  **Tunneling**: We will use `ngrok` to expose the Colab backend to the internet so your local Frontend can talk to it.

---

## Step 1: Push to GitHub
1.  Initialize Git in your project folder (if not already):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a repository on GitHub and push your code.

## Step 2: Create a Colab Notebook
Create a new notebook and run these cells:

### Cell 1: Setup Workspace & Install Ollama (Run this first!)
```python
# 1. Update System & Install Zstd (Required for Ollama)
!sudo apt-get update && sudo apt-get install -y zstd

# 2. Clone Repo
!git clone https://github.com/ChinmayIngle26/antigravity-pharmacy.git project
%cd project

# 3. Install Python Deps
!pip install -r backend/requirements.txt
!pip install pyngrok uvicorn nest-asyncio langchain-ollama langchain-chroma

# 4. Install Ollama
print("Installing Ollama...")
!curl -fsSL https://ollama.com/install.sh | sh

# 5. Start Ollama
import subprocess
import time

print("Starting Ollama Server...")
# Run using absolute path
process = subprocess.Popen("/usr/local/bin/ollama serve", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
time.sleep(10)  # Wait for it to boot

# Verify it's running
!ps aux | grep ollama

# 6. Pull Models
print("Pulling Models (This may take a few minutes)...")
!/usr/local/bin/ollama pull llama3.1
!/usr/local/bin/ollama pull nomic-embed-text
!/usr/local/bin/ollama pull llama3.2-vision
print("✅ Setup Complete!")
```

### Cell 3: Setup Ngrok (External Access)
*You need a free ngrok account token from [dashboard.ngrok.com](https://dashboard.ngrok.com).*
```python
from pyngrok import ngrok
import nest_asyncio

# Set your token
ngrok.set_auth_token("YOUR_NGROK_TOKEN_HERE")

# Connect to port 8000
public_url = ngrok.connect(8000).public_url
print(f"🚀 Backend Public URL: {public_url}")
```

### Cell 4: Run FastAPI Backend
```python
# Run uvicorn as a shell command to avoid asyncio loop errors in Colab
!uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Step 3: Update Local Frontend
Once the Colab backend is running, copy the **Public URL** (e.g., `https://1234-abcd.ngrok-free.app`).

1.  Open `frontend/src/api.js` on your Mac.
2.  Change `API_BASE_URL`:
    ```javascript
    const API_BASE_URL = 'https://1234-abcd.ngrok-free.app'; // Your Colab URL
    ```
3.  Restart your local frontend (`npm run dev`).

Now your local UI talks to the powerful GPU-backed Colab backend!
