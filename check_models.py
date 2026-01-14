
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("No API key found in .env")
    exit(1)

genai.configure(api_key=api_key)

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models with google.generativeai: {e}")

# Also try with the new google-genai client if installed
try:
    print("\nTrying google-genai client...")
    from google import genai as new_genai
    client = new_genai.Client(api_key=api_key)
    # The new client might have different traversal, let's just try to init it.
    # We can try to list models if we knew the method, but let's stick to the official one above first.
except ImportError:
    pass
except Exception as e:
    print(f"Error with new google-genai client: {e}")
