class AdminChat {
  constructor() {
    this.messages = [
      { role: "assistant", content: "Welcome Admin. You can ask me queries like 'Show all pending complaints from Shop 3' or use voice search!" }
    ];
    this.init();
  }

  init() {
    const toggle = document.getElementById('adminChatToggle');
    const windowEl = document.getElementById('adminChatWindow');
    const close = document.getElementById('adminCloseChat');
    const sendBtn = document.getElementById('adminChatSend');
    const input = document.getElementById('adminChatInput');
    const micBtn = document.getElementById('adminChatMicBtn');

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

    // Chat Voice input
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Default to English for Admin usually

      recognition.onstart = () => micBtn.classList.add('recording');
      recognition.onend = () => micBtn.classList.remove('recording');
      recognition.onresult = (e) => {
        input.value = e.results[0][0].transcript;
        this.sendMessage();
      };

      micBtn.addEventListener('click', () => {
        try { recognition.start(); } catch(err){}
      });
    } else {
      micBtn.style.display = 'none';
    }
  }

  async sendMessage() {
    const input = document.getElementById('adminChatInput');
    const text = input.value.trim();
    if (!text) return;

    this.appendMessage('user', text);
    input.value = '';

    this.messages.push({ role: "user", content: text });

    document.getElementById('adminTypingIndicator').classList.remove('hidden');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ 
          messages: this.messages,
          language: 'english'
        })
      });
      const data = await res.json();
      
      document.getElementById('adminTypingIndicator').classList.add('hidden');

      if (data.reply) {
        this.appendMessage('bot', data.reply);
        this.messages.push({ role: "assistant", content: data.reply });
      } else {
        const errMsg = data.error ? `Technical Error: ${data.error}` : "Technical issue processing request.";
        this.appendMessage('bot', errMsg);
      }
    } catch (error) {
      document.getElementById('adminTypingIndicator').classList.add('hidden');
      this.appendMessage('bot', "Connection error.");
    }
  }

  appendMessage(sender, text) {
    const messagesContainer = document.getElementById('adminChatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
    
    // Insert before typing indicator
    const typingIndicator = document.getElementById('adminTypingIndicator');
    messagesContainer.insertBefore(msgDiv, typingIndicator);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('adminChatWidget')) {
    window.adminChatbot = new AdminChat();
  }
});
