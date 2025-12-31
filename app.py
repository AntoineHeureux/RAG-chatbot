from flask import Flask, render_template, request, jsonify, Response
import json
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mistralai import ChatMistralAI
from langchain.agents.middleware import dynamic_prompt, ModelRequest
from langchain.agents import create_agent
from dotenv import load_dotenv
import os

# Charger clé API Mistral depuis .env
load_dotenv() 
API_KEY = os.getenv("API_KEY")

@dynamic_prompt
def prompt_with_context(request: ModelRequest) -> str:

    # Modèle d'embedding
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

    # Charger la vectorbase FAISS
    vectorstore = FAISS.load_local(
        "./data/faiss_index",
        embedding_model,
        allow_dangerous_deserialization=True
    )

    """Inject context into state messages."""
    last_query = request.state["messages"][-1].text
    retrieved_docs = vectorstore.similarity_search(last_query)

    docs_content = "\n\n".join(doc.page_content for doc in retrieved_docs)

    system_message = (
        "Tu es un sauveteur professionnel et tu donnes des instructions à un apprenti sauveteur. Utilise ce contexte pour répondre:"
        f"\n\n{docs_content}"
    )
    return system_message

# Lancer l'API
app = Flask(__name__)
llm = ChatMistralAI(mistral_api_key=API_KEY, model="mistral-small")
agent = create_agent(llm, tools=[], middleware=[prompt_with_context])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    query = data.get("query")

    if not query:
        return jsonify({"error": "Aucune question posée"}), 400

    print("question:", query)

    for step in agent.stream(
        {"messages": [{"role": "user", "content": query}]},
        stream_mode="values"
        ):

        print(step["messages"])
        message = step["messages"][-1].text

    print("réponse:", message)

    return jsonify({"answer": message})

if __name__ == '__main__':
    app.run(debug=True)