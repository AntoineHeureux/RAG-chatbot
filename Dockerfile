# Utilise une image Python officielle légère
FROM python:3.14-slim

# Définit le répertoire de travail
WORKDIR /app

# Copie uniquement les fichiers nécessaires pour l'installation des dépendances
COPY requirements.txt .

# Installe les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copie le reste du projet (en excluant ce qui est dans .dockerignore)
COPY . .

# Expose le port utilisé par ton application
EXPOSE 5000

# Commande pour lancer l'application
CMD ["python", "app.py"]
