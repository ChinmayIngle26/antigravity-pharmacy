import os
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document

# Persistence directory for the vector store
DB_DIR = os.path.join(os.path.dirname(__file__), "../data/chroma_db")
DATA_FILE = os.path.join(os.path.dirname(__file__), "../data/drug_interactions.txt")

def get_embeddings():
    # Using 'nomic-embed-text' if available, otherwise 'llama3.1'
    # 'nomic-embed-text' is recommended for Ollama embeddings
    return OllamaEmbeddings(model="nomic-embed-text")

def initialize_vector_store():
    """Reads the text file and ingests it into ChromaDB if not already present."""
    
    # Check if DB exists already (simple check)
    if os.path.exists(DB_DIR) and os.listdir(DB_DIR):
        print("Vector store already exists. Loading...")
        return Chroma(persist_directory=DB_DIR, embedding_function=get_embeddings())

    print("Creating new vector store from data...")
    if not os.path.exists(DATA_FILE):
        print(f"Warning: Data file not found at {DATA_FILE}")
        return None

    with open(DATA_FILE, "r") as f:
        text = f.read()

    # Simple chunks by drug sections (splitting by double newline for this simple format)
    # or just simple character splitting
    sections = text.split("\n\n")
    docs = [Document(page_content=s.strip(), metadata={"source": "drug_interactions.txt"}) for s in sections if s.strip()]

    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=get_embeddings(),
        persist_directory=DB_DIR
    )
    return vector_store

def get_retriever():
    vector_store = Chroma(persist_directory=DB_DIR, embedding_function=get_embeddings())
    return vector_store.as_retriever(search_kwargs={"k": 2})

def query_knowledge_base(query: str) -> str:
    """Entry point for the agent tool."""
    try:
        retriever = get_retriever()
        docs = retriever.invoke(query)
        if not docs:
            return "No relevant information found in the knowledge base."
        
        return "\n\n".join([d.page_content for d in docs])
    except Exception as e:
        return f"Error querying knowledge base: {str(e)}"
