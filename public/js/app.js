document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const phoneLoginSection = document.getElementById('phoneLoginSection');
  const userDashboard = document.getElementById('userDashboard');
  const complaintFormSection = document.getElementById('complaintFormSection');
  
  const phoneLoginForm = document.getElementById('phoneLoginForm');
  const loginPhoneInput = document.getElementById('loginPhone');
  
  const btnNewComplaint = document.getElementById('btnNewComplaint');
  const btnCancelComplaint = document.getElementById('btnCancelComplaint');
  const userComplaintsList = document.getElementById('userComplaintsList');
  
  const complaintForm = document.getElementById('complaintForm');
  const formPhoneInput = document.getElementById('phone');
  const formMessage = document.getElementById('formMessage');

  const btnLogoutUser = document.getElementById('btnLogoutUser');
  const navAdmin = document.getElementById('navAdmin');

  // Form submission doesn't require login anymore
  // Just show the form
  if (complaintFormSection) {
    complaintFormSection.classList.remove('hidden');
  }

  // --- Handle Form Submission ---
  if (complaintForm) {
    complaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('btnSubmit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        shop: document.getElementById('shop').value,
        product: document.getElementById('product').value,
        machineId: document.getElementById('machineId').value,
        problem: document.getElementById('problem').value,
        severity: document.getElementById('severity').value,
        address: document.getElementById('address').value
      };

      try {
        const response = await fetch('/api/complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          formMessage.innerHTML = `<div style="color: #10b981; margin-top: 1rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
            ✅ <strong>Success!</strong> Your complaint was filed successfully. <br>
            Ticket ID: <strong>${data.ticketId}</strong>
          </div>`;
          complaintForm.reset();
          
          setTimeout(() => {
            formMessage.innerHTML = '';
          }, 5000);

        } else {
          formMessage.innerHTML = `<div style="color: #ef4444; margin-top: 1rem;">❌ Error: ${data.error || 'Failed to submit.'}</div>`;
        }
      } catch (err) {
        formMessage.innerHTML = `<div style="color: #ef4444; margin-top: 1rem;">❌ Connection error. Please try again.</div>`;
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Handle Language Translation (from original logic)
  const langSelect = document.getElementById('langSelect');
  if (langSelect && window.translations) {
    langSelect.addEventListener('change', (e) => {
      const lang = e.target.value;
      const dict = window.translations[lang];
      if (dict) {
        // Update all translatable elements based on ID matching the key
        Object.keys(dict).forEach(key => {
          const el = document.getElementById(key);
          if (el) {
            el.textContent = dict[key];
          }
          
          // Handle placeholders
          if (key.startsWith('placeholder')) {
            const targetId = key.replace('placeholder', '').toLowerCase();
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.placeholder = dict[key];
          }
        });

        // Update Chatbot if it exists
        if (window.chatbot && typeof window.chatbot.updateLanguage === 'function') {
          window.chatbot.updateLanguage(lang);
        }
      }
      
      // Clear relevant input fields when language changes
      const fieldsToClear = ['name', 'machineId', 'problem', 'address', 'chatInput'];
      fieldsToClear.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
      });
    });
  }

});
