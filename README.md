# RAG Chatbot

**RAG Chatbot**  Chatbot web léger utilisant le RAG (Retrieval-Augmented Generation) pour fournir des réponses contextuelles à partir de documents locaux (recommendation pour le secourisme).

---

## Description

Ce projet combine un index vectoriel (FAISS) avec LangChain pour retrouver des passages pertinents dans une base de connaissances locale et générer des réponses à l'aide d'un modèle de langage. L'application expose une interface web via **Flask** et des endpoints JSON pour intégration ou tests.

L'index FAISS est stocké dans `data/faiss_index/index.faiss`.

---

## Fonctionnalités

- Recherche et récupération de documents via FAISS
- Assemblage de contexte et génération de réponse (RAG)
- Interface web simple (dans `templates/` et `static/`)
- Endpoints JSON pour automatisation et tests

---

## Stack technique

- Python + Flask
- LangChain / langchain-core
- Pydantic
- FAISS
- HTML/CSS/JS (UI)

---

## Installation rapide (Windows)

1. Installez Python 3.14 : `py -3.14 -m venv venv`
2. Activez l'environnement virtuel : `venv\Scripts\activate`
3. Installez les dépendances : `pip install -r requirements.txt`
4. Lancez l'application : `python app.py`
5. Ouvrez `http://127.0.0.1:5000`

---

## Structure du dépôt

- `app.py`  point d'entrée Flask
- `templates/`  fichiers HTML (UI)
- `static/`  JS / CSS
- `data/faiss_index/`  index FAISS
- `requirements.txt`  dépendances
