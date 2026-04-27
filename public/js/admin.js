document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');
  const btnLogout = document.getElementById('btnLogout');
  const complaintsTableBody = document.getElementById('complaintsTableBody');
  const adminChatWidget = document.getElementById('adminChatWidget');
  const adminSidebar = document.getElementById('adminSidebar');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  const contentSections = document.querySelectorAll('.content-section');

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
      adminSidebar.classList.add('hidden');
      adminChatWidget.classList.add('hidden');
      
      // Reset sidebar to dashboard internally, but keep it hidden
      contentSections.forEach(sec => sec.classList.add('hidden'));
      sidebarLinks.forEach(l => l.classList.remove('active'));
      document.querySelector('[data-target="dashboardSection"]').classList.add('active');
    });
  }

  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', fetchComplaints);
  }

  function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    adminSidebar.classList.remove('hidden');
    btnLogout.classList.remove('hidden');
    adminChatWidget.classList.remove('hidden');
    fetchComplaints();
  }

  // Sidebar Navigation Logic
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = e.target.getAttribute('data-target');
      
      // Update active class
      sidebarLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');

      // Show target section
      contentSections.forEach(sec => sec.classList.add('hidden'));
      const targetSection = document.getElementById(targetId);
      targetSection.classList.remove('hidden');

      // Fetch data based on section
      if (targetSection.hasAttribute('data-module')) {
        fetchModuleData(targetSection);
      } else if (targetId === 'dashboardSection') {
        fetchComplaints();
      }
    });
  });

  async function fetchModuleData(section) {
    if (!currentToken) return;
    const moduleName = section.getAttribute('data-module');
    try {
      const res = await fetch(`/api/crm/${moduleName}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        renderModuleTable(section, data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${moduleName}`, err);
    }
  }

  // --- CRM CRUD Logic ---
  
  // Close Modals
  document.querySelectorAll('.btn-cancel-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal-overlay').classList.add('hidden');
    });
  });

  // Open "Add New" Modals
  document.querySelectorAll('.btn-add-new').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const section = e.target.closest('.content-section');
      const moduleName = section.getAttribute('data-module');
      const modal = document.getElementById(`${moduleName}Modal`);
      if (modal) {
        modal.querySelector('.modal-title').textContent = `Add ${moduleName.slice(0, -1).replace(/\b\w/g, l => l.toUpperCase())}`;
        modal.querySelector('form').reset();
        modal.querySelector('input[name="id"]').value = '';
        modal.classList.remove('hidden');
      }
    });
  });

  // Handle Form Submissions (Create/Update)
  document.querySelectorAll('.crm-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentToken) return;

      const modal = e.target.closest('.modal-overlay');
      const moduleName = modal.getAttribute('data-module');
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      const id = data.id;
      delete data.id;

      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/crm/${moduleName}/${id}` : `/api/crm/${moduleName}`;

      try {
        const res = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          modal.classList.add('hidden');
          // Refresh the table for this module
          const section = document.getElementById(`${moduleName}Section`);
          fetchModuleData(section);
        } else {
          const err = await res.json();
          alert(`Error saving record: ${err.message}`);
        }
      } catch (err) {
        console.error('Save error', err);
        alert('Failed to save record.');
      }
    });
  });

  // Global Edit Function
  window.editRecord = (moduleName, itemString) => {
    const item = JSON.parse(decodeURIComponent(itemString));
    const modal = document.getElementById(`${moduleName}Modal`);
    if (modal) {
      modal.querySelector('.modal-title').textContent = `Edit ${moduleName.slice(0, -1).replace(/\b\w/g, l => l.toUpperCase())}`;
      const form = modal.querySelector('form');
      
      // Populate fields
      Object.keys(item).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'date' || input.type === 'datetime-local') {
            if (item[key]) {
               const date = new Date(item[key]);
               if (input.type === 'date') {
                 input.value = date.toISOString().split('T')[0];
               } else {
                 input.value = date.toISOString().slice(0,16);
               }
            }
          } else {
            input.value = item[key];
          }
        }
      });
      
      form.querySelector('input[name="id"]').value = item._id;
      modal.classList.remove('hidden');
    }
  };

  // Global Delete Function
  window.deleteRecord = async (moduleName, id) => {
    if (!currentToken) return;
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const res = await fetch(`/api/crm/${moduleName}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const section = document.getElementById(`${moduleName}Section`);
        fetchModuleData(section);
      } else {
        alert('Failed to delete record.');
      }
    } catch (err) {
      console.error('Delete error', err);
      alert('Error deleting record.');
    }
  };

  function renderModuleTable(section, data) {
     const table = section.querySelector('table');
     const thead = table.querySelector('thead tr');
     if (!thead.querySelector('.action-col')) {
       const th = document.createElement('th');
       th.className = 'action-col';
       th.innerText = 'Actions';
       thead.appendChild(th);
     }

     const tbody = section.querySelector('tbody');
     tbody.innerHTML = '';
     if (data.length === 0) {
       tbody.innerHTML = `<tr><td colspan="${thead.children.length}" style="text-align:center;">No records found.</td></tr>`;
       return;
     }
     
     const moduleName = section.getAttribute('data-module');
     data.forEach(item => {
       const tr = document.createElement('tr');
       let html = '';
       if (moduleName === 'contacts') {
         html = `<td>${item.name}</td><td>${item.email || '-'}</td><td>${item.phone}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
       } else if (moduleName === 'accounts') {
         html = `<td>${item.name}</td><td>${item.industry || '-'}</td><td>${item.website || '-'}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
       } else if (moduleName === 'deals') {
         html = `<td>${item.title}</td><td>${item.value}</td><td>${item.stage}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
       } else if (moduleName === 'tasks') {
         html = `<td>${item.title}</td><td>${item.status}</td><td>${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
       } else if (moduleName === 'meetings') {
         html = `<td>${item.title}</td><td>${new Date(item.date).toLocaleDateString()}</td><td>${item.location || '-'}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
       } else if (moduleName === 'calls') {
          html = `<td>${item.caller}</td><td>${item.receiver}</td><td>${item.duration || '-'}</td><td>${new Date(item.date).toLocaleDateString()}</td>`;
       } else if (moduleName === 'campaigns') {
          html = `<td>${item.name}</td><td>${item.status}</td><td>${item.budget || '-'}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
       } else if (moduleName === 'documents') {
          html = `<td>${item.title}</td><td><a href="${item.url}" target="_blank">Link</a></td><td>${new Date(item.uploadedAt).toLocaleDateString()}</td>`;
       } else if (moduleName === 'visits') {
          html = `<td>${item.location}</td><td>${new Date(item.date).toLocaleDateString()}</td><td>${item.purpose || '-'}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
       } else if (moduleName === 'projects') {
          html = `<td>${item.name}</td><td>${item.status}</td><td>${item.deadline ? new Date(item.deadline).toLocaleDateString() : '-'}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
       }

       // Escape quotes in JSON string to avoid breaking HTML attributes
       const itemStr = encodeURIComponent(JSON.stringify(item));
       html += `
         <td>
           <button class="btn-small" onclick="window.editRecord('${moduleName}', '${itemStr}')" style="margin-right: 5px;">Edit</button>
           <button class="btn-small" onclick="window.deleteRecord('${moduleName}', '${item._id}')" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); color: #fca5a5;">Del</button>
         </td>
       `;
       tr.innerHTML = html;
       tbody.appendChild(tr);
     });
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
