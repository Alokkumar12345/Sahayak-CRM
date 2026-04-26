class Chatbot {
  constructor() {
    this.messages = [
      { role: "assistant", content: "Hi! I will help you file a complaint. (नमस्ते! आपकी शिकायत दर्ज करने में मैं आपकी मदद करूँगा।)" }
    ];
    this.init();
  }

  init() {
    const toggle = document.getElementById('chatToggle');
    const windowEl = document.getElementById('chatWindow');
    const close = document.getElementById('closeChat');
    const sendBtn = document.getElementById('chatSend');
    const input = document.getElementById('chatInput');
    const micBtn = document.getElementById('chatMicBtn');
    const quickReplies = document.querySelectorAll('.chat-quick-replies .chip');

    if (!toggle) return;

    toggle.addEventListener('click', () => {
      windowEl.classList.remove('hidden');
      toggle.classList.add('hidden');
    });

    close.addEventListener('click', () => {
      windowEl.classList.add('hidden');
      toggle.classList.remove('hidden');
    });

    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    quickReplies.forEach(chip => {
      chip.addEventListener('click', (e) => {
        input.value = e.target.getAttribute('data-text');
        this.sendMessage();
      });
    });

    // Chat Voice input
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => micBtn.classList.add('recording');
      recognition.onend = () => micBtn.classList.remove('recording');
      recognition.onresult = (e) => {
        input.value = e.results[0][0].transcript;
        this.sendMessage();
      };

      micBtn.addEventListener('click', () => {
        const langSelect = document.getElementById('langSelect');
        const langMap = { 'english': 'en-IN', 'hindi': 'hi-IN', 'punjabi': 'pa-IN', 'bengali': 'bn-IN', 'tamil': 'ta-IN' };
        recognition.lang = langSelect ? langMap[langSelect.value] || 'en-IN' : 'en-IN';
        try { recognition.start(); } catch(err){}
      });
    } else {
      micBtn.style.display = 'none';
    }
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    this.appendMessage('user', text);
    input.value = '';

    const langSelect = document.getElementById('langSelect');
    const currentLang = langSelect ? langSelect.value : 'english';

    this.messages.push({ role: "user", content: text });

    document.getElementById('typingIndicator').classList.remove('hidden');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: this.messages,
          language: currentLang
        })
      });
      const data = await res.json();
      
      document.getElementById('typingIndicator').classList.add('hidden');

      if (data.reply) {
        this.appendMessage('bot', data.reply);
        this.messages.push({ role: "assistant", content: data.reply });
      } else {
        const errMsg = data.error ? `Error: ${data.error}` : "Sorry, I am facing some technical issues.";
        this.appendMessage('bot', errMsg);
      }
    } catch (error) {
      console.error(error);
      document.getElementById('typingIndicator').classList.add('hidden');
      this.appendMessage('bot', "Connection error.");
    }
  }

  appendMessage(sender, text) {
    const messagesContainer = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
    
    // Insert before typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    messagesContainer.insertBefore(msgDiv, typingIndicator);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  updateLanguage(lang) {
    const dict = window.translations[lang];
    if (!dict) return;

    // Update Chips
    const chipMap = {
      'File a Complaint': 'chipComplaint',
      'Check Status': 'chipStatus',
      'Shop Info': 'chipShop',
      'Talk to Human': 'chipHuman'
    };

    document.querySelectorAll('.chat-quick-replies .chip').forEach(chip => {
      const originalText = chip.getAttribute('data-text');
      const translationKey = chipMap[originalText];
      if (translationKey && dict[translationKey]) {
        chip.textContent = dict[translationKey];
      }
    });

    // Update Welcome Message if it's the only one
    if (this.messages.length === 1 && this.messages[0].role === 'assistant') {
      const chatMessages = document.getElementById('chatMessages');
      const firstMsgBubble = chatMessages.querySelector('.message.bot .msg-bubble');
      if (firstMsgBubble && dict.chatWelcome) {
        firstMsgBubble.textContent = dict.chatWelcome;
        this.messages[0].content = dict.chatWelcome;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('chatWidget')) {
    window.chatbot = new Chatbot();
  }
});
