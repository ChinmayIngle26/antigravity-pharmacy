import os
import sys
from unittest.mock import MagicMock, patch

sys.path.append(os.getcwd())

# Mock os.getenv to return multiple keys
original_getenv = os.getenv
def mock_getenv(key, default=None):
    if key == "GOOGLE_API_KEY": return "key1"
    if key == "GOOGLE_API_KEY_1": return "key2"
    if key == "GOOGLE_API_KEY_2": return "key3"
    return original_getenv(key, default)

with patch("os.getenv", side_effect=mock_getenv):
    from backend.agents import RotatingGeminiWrapper, RotatingBoundModel

    # Patch _create_model to return mocks
    with patch.object(RotatingGeminiWrapper, '_create_model') as mock_create:
        mock_llm = MagicMock()
        mock_llm.bind_tools.return_value = mock_llm 
        mock_create.return_value = mock_llm
        
        wrapper = RotatingGeminiWrapper()
        
        # We need distinct mocks for distinct keys if we want to simulate one failing
        # Redo manual setup
        mock_llm1 = MagicMock()
        mock_llm1.bind_tools.return_value = mock_llm1
        mock_llm1.invoke.side_effect = Exception("429 RESOURCE_EXHAUSTED")
        
        mock_llm2 = MagicMock()
        mock_llm2.bind_tools.return_value = mock_llm2
        mock_llm2.invoke.return_value = "Success"
        
        wrapper.models = [mock_llm1, mock_llm2]
        # ensure keys are adequate length for logic
        wrapper.keys = ["k1", "k2"] 
        
        print("Invoking wrapper...")
        bound_wrapper = wrapper.bind_tools([])
        
        try:
            res = bound_wrapper.invoke("test")
            print(f"Result: {res}")
            print(f"Final key index: {wrapper.current_key_idx}")
            
            if res == "Success" and wrapper.current_key_idx == 1:
                print("✅ Rotation test PASSED")
            else:
                print(f"❌ Rotation test FAILED (result={res}, idx={wrapper.current_key_idx})")
        except Exception as e:
             print(f"❌ Rotation test FAILED with exception: {e}")
