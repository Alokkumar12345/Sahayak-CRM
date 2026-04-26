document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');
  const btnLogout = document.getElementById('btnLogout');
  const complaintsTableBody = document.getElementById('complaintsTableBody');
  const adminChatWidget = document.getElementById('adminChatWidget');
  
  // Filters
  const filterShop = document.getElementById('filterShop');
  const filterStatus = document.getElementById('filterStatus');
  const btnApplyFilters = document.getElementById('btnApplyFilters');

  let currentToken = localStorage.getItem('adminToken');

  if (currentToken) {
    showDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUsername').value;
      const pass = document.getElementById('adminPassword').value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        
        if (res.ok && data.token) {
          localStorage.setItem('adminToken', data.token);
          currentToken = data.token;
          showDashboard();
        } else {
          loginMessage.innerHTML = `<div style="color: #ef4444;">❌ ${data.error || 'Invalid credentials'}</div>`;
        }
      } catch (err) {
         loginMessage.innerHTML = `<div style="color: #ef4444;">❌ Connection error</div>`;
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      currentToken = null;
      loginSection.classList.remove('hidden');
      dashboardSection.classList.add('hidden');
      btnLogout.classList.add('hidden');
      adminChatWidget.classList.add('hidden');
    });
  }

  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', fetchComplaints);
  }

  function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    btnLogout.classList.remove('hidden');
    adminChatWidget.classList.remove('hidden');
    fetchComplaints();
  }

  async function fetchComplaints() {
    if (!currentToken) return;

    let url = '/api/complaints';
    const params = new URLSearchParams();
    if (filterShop.value) params.append('shop', filterShop.value);
    if (filterStatus.value) params.append('status', filterStatus.value);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (res.status === 401 || res.status === 403) {
        // Token expired or invalid
        btnLogout.click();
        return;
      }
      
      const data = await res.json();
      renderTable(data);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    }
  }

  // Remarks Modal Elements
  const remarksModal = document.getElementById('remarksModal');
  const adminRemarksInput = document.getElementById('adminRemarksInput');
  const btnCancelResolve = document.getElementById('btnCancelResolve');
  const btnConfirmResolve = document.getElementById('btnConfirmResolve');
  let resolvingComplaintId = null;

  if (btnCancelResolve) {
    btnCancelResolve.addEventListener('click', () => {
      remarksModal.classList.add('hidden');
      resolvingComplaintId = null;
      adminRemarksInput.value = '';
    });
  }

  if (btnConfirmResolve) {
    btnConfirmResolve.addEventListener('click', async () => {
      if (!resolvingComplaintId || !currentToken) return;
      
      const remarks = adminRemarksInput.value.trim();
      
      try {
        const res = await fetch(`/api/complaints/${resolvingComplaintId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify({ status: 'Resolved', remarks })
        });
        if (res.ok) {
          remarksModal.classList.add('hidden');
          resolvingComplaintId = null;
          adminRemarksInput.value = '';
          fetchComplaints(); // Refresh
        } else {
          alert("Failed to update status");
        }
      } catch (err) {
        alert("Error updating status");
      }
    });
  }

  function renderTable(complaints) {
    complaintsTableBody.innerHTML = '';
    
    // Update table headers to include Remarks if it doesn't already
    const theadRow = document.querySelector('.complaints-table thead tr');
    // We now have 8 base columns (with Problem added).
    if (theadRow.children.length === 8 && !theadRow.querySelector('.remarks-col')) {
       const th = document.createElement('th');
       th.className = 'remarks-col';
       th.innerText = 'Remarks';
       theadRow.insertBefore(th, theadRow.lastElementChild);
    }

    if (complaints.length === 0) {
      complaintsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No complaints found.</td></tr>';
      return;
    }

    complaints.forEach(c => {
      const tr = document.createElement('tr');
      const isResolved = c.status === 'Resolved';
      const remarkText = c.remarks ? c.remarks : '-';
      
      tr.innerHTML = `
        <td>${c.ticketId || c._id.substring(0,8)}</td>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.shop}</td>
        <td>${c.product}</td>
        <td>${c.problem}</td>
        <td><span class="badge ${isResolved ? 'resolved' : 'pending'}">${c.status}</span></td>
        <td>${remarkText}</td>
        <td>
          ${!isResolved ? `<button class="btn-small" onclick="window.markResolved('${c._id}')">Mark Resolved</button>` : 'N/A'}
        </td>
      `;
      complaintsTableBody.appendChild(tr);
    });
  }

  window.markResolved = (id) => {
    if (!currentToken) return;
    resolvingComplaintId = id;
    remarksModal.classList.remove('hidden');
  };
});
