/* ============================================================
   chatbot.js — Chat UI logic
   Open/close, messages, POST /api/chat, history management.
   ============================================================ */

(function () {
  'use strict';

  const trigger = document.getElementById('chatbotTrigger');
  const window_ = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const messages = document.getElementById('chatbotMessages');
  const input = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSend');
  const typing = document.getElementById('chatbotTyping');

  if (!trigger || !window_) return;

  let isOpen = false;
  let firstOpen = true;
  let history = [];
  const MAX_HISTORY = 10;

  const WELCOME = "Bonjour ! Je suis l'assistant LAGUA Solaire. Je peux vous aider à dimensionner votre installation, vous renseigner sur nos produits ou planifier une visite. Comment puis-je vous aider ?";

  /** Toggle chat window open/closed */
  function toggleChat() {
    isOpen = !isOpen;
    window_.classList.toggle('chatbot__window--open', isOpen);
    if (isOpen && firstOpen) {
      firstOpen = false;
      appendBubble(WELCOME, 'ai');
    }
    if (isOpen) {
      setTimeout(function () { input.focus(); }, 350);
    }
  }

  /** Create and append a message bubble */
  function appendBubble(text, type) {
    var bubble = document.createElement('div');
    bubble.className = 'chatbot__bubble chatbot__bubble--' + type;
    bubble.textContent = text;
    messages.insertBefore(bubble, typing);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  /** Show / hide typing indicator */
  function setTyping(show) {
    typing.classList.toggle('chatbot__typing--visible', show);
    if (show) messages.scrollTop = messages.scrollHeight;
  }

  /** Send user message to API */
  async function sendMessage() {
    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendBubble(text, 'user');
    history.push({ role: 'user', content: text });

    // Cap history
    if (history.length > MAX_HISTORY * 2) {
      history = history.slice(-MAX_HISTORY * 2);
    }

    setTyping(true);

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history })
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      var data = await res.json();
      setTyping(false);
      appendBubble(data.reply || 'Pas de réponse.', 'ai');
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      setTyping(false);
      appendBubble("Une erreur s'est produite. Veuillez réessayer.", 'error');
    }
  }

  // Event listeners
  trigger.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });
})();
