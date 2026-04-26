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

  let currentUserPhone = localStorage.getItem('userPhone');

  // Initialization
  if (currentUserPhone) {
    showDashboard();
  } else {
    showLogin();
  }

  // --- View toggles ---
  function showLogin() {
    phoneLoginSection.classList.remove('hidden');
    userDashboard.classList.add('hidden');
    complaintFormSection.classList.add('hidden');
    if (navAdmin) navAdmin.classList.remove('hidden');
  }

  function showDashboard() {
    phoneLoginSection.classList.add('hidden');
    userDashboard.classList.remove('hidden');
    complaintFormSection.classList.add('hidden');
    if (navAdmin) navAdmin.classList.add('hidden');
    fetchUserComplaints(currentUserPhone);
  }

  function showForm() {
    phoneLoginSection.classList.add('hidden');
    userDashboard.classList.add('hidden');
    complaintFormSection.classList.remove('hidden');
    if (navAdmin) navAdmin.classList.add('hidden');
    // Auto-fill hidden phone input
    formPhoneInput.value = currentUserPhone;
  }

  // --- OTP Logic ---
  let generatedOtp = null;
  const btnGetOtp = document.getElementById('btnGetOtp');
  const btnLoginPhone = document.getElementById('btnLoginPhone');
  const otpSection = document.getElementById('otpSection');
  const loginOtpInput = document.getElementById('loginOtp');

  if (btnGetOtp) {
    btnGetOtp.addEventListener('click', () => {
      const phone = loginPhoneInput.value.trim();
      if (phone.length < 10) {
        alert('Please enter a valid 10-digit phone number.');
        return;
      }
      // Generate a random 6-digit OTP
      generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      // Show OTP via alert (fake SMS)
      alert(`📱 OTP for ${phone}: ${generatedOtp}\n\n(This is a demo OTP)`);
      // Show OTP input and Verify button
      otpSection.classList.remove('hidden');
      btnLoginPhone.classList.remove('hidden');
      btnGetOtp.textContent = 'Resend OTP';
    });
  }

  if (phoneLoginForm) {
    phoneLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = loginPhoneInput.value.trim();
      const enteredOtp = loginOtpInput ? loginOtpInput.value.trim() : '';
      if (!generatedOtp) {
        alert('Please request an OTP first.');
        return;
      }
      if (enteredOtp !== generatedOtp) {
        alert('❌ Invalid OTP. Please try again.');
        loginOtpInput.value = '';
        return;
      }
      // OTP verified
      localStorage.setItem('userPhone', phone);
      currentUserPhone = phone;
      generatedOtp = null;
      showDashboard();
    });
  }

  if (btnNewComplaint) {
    btnNewComplaint.addEventListener('click', showForm);
  }

  if (btnCancelComplaint) {
    btnCancelComplaint.addEventListener('click', showDashboard);
  }

  if (btnLogoutUser) {
    btnLogoutUser.addEventListener('click', () => {
      localStorage.removeItem('userPhone');
      currentUserPhone = null;
      showLogin();
    });
  }

  // --- Fetch User Complaints ---
  async function fetchUserComplaints(phone) {
    userComplaintsList.innerHTML = '<p>Loading complaints...</p>';
    try {
      const res = await fetch(`/api/complaints/user/${phone}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      renderComplaints(data);
    } catch (error) {
      userComplaintsList.innerHTML = '<p style="color: #ef4444;">Failed to load complaints. Please try again.</p>';
    }
  }

  function renderComplaints(complaints) {
    if (!complaints || complaints.length === 0) {
      userComplaintsList.innerHTML = '<div class="glass-card"><p>No complaints found for this number.</p></div>';
      return;
    }
    
    userComplaintsList.innerHTML = '';
    complaints.forEach(c => {
      const isResolved = c.status === 'Resolved';
      const badgeClass = isResolved ? 'resolved' : 'pending';
      const card = document.createElement('div');
      card.className = 'glass-card complaint-card';
      
      let remarksHtml = '';
      if (c.remarks) {
        remarksHtml = `<div class="complaint-remarks"><strong>Admin Remarks:</strong> ${c.remarks}</div>`;
      }
      
      card.innerHTML = `
        <div class="complaint-card-header">
          <h3>${c.product} Issue</h3>
          <span class="badge ${badgeClass}">${c.status}</span>
        </div>
        <div class="complaint-card-body">
          <p><strong>Ticket ID:</strong> ${c.ticketId || c._id.substring(0,8)}</p>
          <p><strong>Problem:</strong> ${c.problem}</p>
          ${remarksHtml}
        </div>
      `;
      userComplaintsList.appendChild(card);
    });
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
        phone: currentUserPhone, // ensure we use logged in phone
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
          
          // Go back to dashboard after 2 seconds
          setTimeout(() => {
            formMessage.innerHTML = '';
            showDashboard();
          }, 2500);

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
