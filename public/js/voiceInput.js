class VoiceInput {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.currentMicBtn = null;
    this.currentTargetId = null;
    this.init();
  }

  init() {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.isRecording = true;
      if (this.currentMicBtn) {
        this.currentMicBtn.classList.add('recording');
      }
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (this.currentTargetId) {
        const input = document.getElementById(this.currentTargetId);
        if (input) {
          // Append if textarea, replace if input
          input.value = input.value ? input.value + " " + transcript : transcript;
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      this.stopRecording();
    };

    this.recognition.onend = () => {
      this.stopRecording();
    };

    // Attach listeners to mic buttons
    document.querySelectorAll('.mic-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target');
        this.toggleRecording(e.currentTarget, targetId);
      });
    });

    // Full voice mode: Cycle through empty required fields
    const btnFullVoice = document.getElementById('btnFullVoice');
    if (btnFullVoice) {
      btnFullVoice.addEventListener('click', () => {
        const inputs = [
          { id: 'name', label: 'Name' },
          { id: 'phone', label: 'Phone' },
          { id: 'machineId', label: 'Machine ID' },
          { id: 'problem', label: 'Problem' },
          { id: 'address', label: 'Address' }
        ];
        
        let target = inputs.find(i => !document.getElementById(i.id).value);
        if (!target) target = inputs[inputs.length - 1]; // Default to problem if all filled
        
        this.toggleRecording(btnFullVoice, target.id);
      });
    }
  }

  toggleRecording(btnElement, targetId) {
    if (this.isRecording) {
      this.stopRecording();
      // If clicking a different mic, start new
      if (this.currentMicBtn !== btnElement) {
        this.startRecording(btnElement, targetId);
      }
    } else {
      this.startRecording(btnElement, targetId);
    }
  }

  startRecording(btnElement, targetId) {
    if (!this.recognition) return alert("Speech recognition not supported.");
    
    this.currentMicBtn = btnElement;
    this.currentTargetId = targetId;
    
    // Set language based on dropdown
    const langSelect = document.getElementById('langSelect');
    const langMap = {
      'english': 'en-IN',
      'hindi': 'hi-IN',
      'punjabi': 'pa-IN',
      'bengali': 'bn-IN',
      'tamil': 'ta-IN'
    };
    if (langSelect) {
      this.recognition.lang = langMap[langSelect.value] || 'en-IN';
    }

    this.recognition.start();
  }

  stopRecording() {
    this.isRecording = false;
    if (this.currentMicBtn) {
      this.currentMicBtn.classList.remove('recording');
      this.currentMicBtn = null;
    }
    this.currentTargetId = null;
    if (this.recognition) {
        try { this.recognition.stop(); } catch(e) {}
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.voiceInputManager = new VoiceInput();
});
