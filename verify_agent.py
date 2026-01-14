import os
import sys
from dotenv import load_dotenv

# Add current directory to path so we can import backend
sys.path.append(os.getcwd())

load_dotenv()

# Verify GOOGLE_API_KEY is present
if not os.getenv("GOOGLE_API_KEY"):
    print("Error: GOOGLE_API_KEY not found in environment variables.")
    # For testing purposes, we might want to fail gracefully or prompt
    # But strictly for this verification, we need it.
else:
    print(f"GOOGLE_API_KEY found: {os.getenv('GOOGLE_API_KEY')[:5]}...")

try:
    from backend.agents import pharmacy_graph
    
    print("Agent loaded successfully.")
    
    # Test message
    config = {"configurable": {"thread_id": "test_thread"}}
    input_message = {"messages": [("user", "Hello, do you have Paracetamol in stock?")]}
    
    print("Sending query to agent...")
    result = pharmacy_graph.invoke(input_message, config=config)
    
    print("\nResponse:")
    for m in result['messages']:
        print(f"{m.type}: {m.content}")
        
except Exception as e:
    print(f"Error running agent: {e}")
    import traceback
    traceback.print_exc()
