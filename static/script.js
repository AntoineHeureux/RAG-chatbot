document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Fonction pour ajouter un message au chat
    function addMessage(content, isUser, isMarkdown) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message bot-message';

        // Détermine si on doit rendre en Markdown :
        // - les messages utilisateur (isUser=true) sont toujours du texte
        // - pour les messages bot : si isMarkdown === false => texte brut, sinon Markdown (par défaut)
        const renderAsMarkdown = !isUser && (isMarkdown === undefined || isMarkdown === true);

        if (!isUser) {
            // Pour les réponses du bot, on rend le contenu (Markdown -> HTML -> sanitized)
            let html = '';

            if (renderAsMarkdown && typeof marked !== 'undefined') {
                try {
                    html = marked.parse(content);
                } catch (err) {
                    console.warn('Erreur lors du parsing Markdown avec marked:', err);
                    html = `<pre>${escapeHtml(content)}</pre>`;
                }
            } else {
                html = `<pre>${escapeHtml(content)}</pre>`;
            }

            // Sanitize if DOMPurify est disponible
            if (typeof DOMPurify !== 'undefined') {
                html = DOMPurify.sanitize(html);
            } else if (renderAsMarkdown) {
                console.warn('DOMPurify non trouvé : le HTML n\'est pas sanitizé. Ajoutez DOMPurify pour éviter les XSS.');
            }

            messageDiv.innerHTML = `
                <div class="bot-content">${html}</div>
                <div class="sources" id="sources-${Date.now()}"></div>
            `;

            // Highlight code blocks si highlight.js est présent
            if (typeof hljs !== 'undefined') {
                messageDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        } else {
            messageDiv.textContent = content;
        }

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Petit utilitaire pour échapper du texte en fallback
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\'/g, '&#039;');
    }

    // Fonction pour envoyer une question à l'API
    async function sendQuestion() {
        const query = userInput.value.trim();
        if (!query) return;

        // Ajouter la question de l'utilisateur au chat
        addMessage(query, true);
        userInput.value = '';

        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la requête');
            }

            const data = await response.json();

            // Ajouter la réponse du bot
            addMessage(data.answer, false);

            // Ajouter les sources (si elles existent)
            if (data.sources && data.sources.length > 0) {
                const sourcesContainer = document.querySelector('.sources:last-child');
                let sourcesHTML = '<strong>Sources :</strong><ul>';
                data.sources.forEach(source => {
                    sourcesHTML += `
                        <li>
                            <strong>${source.source} (Page ${source.page})</strong>:<br>
                            ${source.content}...
                        </li>
                    `;
                });
                sourcesHTML += '</ul>';
                sourcesContainer.innerHTML = sourcesHTML;
            }

        } catch (error) {
            console.error('Erreur:', error);
            addMessage("Désolé, une erreur est survenue. Veuillez réessayer.", false);
        }
    }

    // Écouter le clic sur le bouton Envoyer
    sendButton.addEventListener('click', sendQuestion);

    // Écouter la touche Entrée dans le champ de saisie
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendQuestion();
        }
    });

    // Message de bienvenue
    addMessage("Bonjour ! Posez-moi une question sur vos documents.", false);
});
