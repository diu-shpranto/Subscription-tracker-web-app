let accounts = [];
let editingIndex = null;

// DOM elements
const emailInput = document.getElementById("email");
const startDateInput = document.getElementById("startDate");
const durationInput = document.getElementById("duration");
const addAccountBtn = document.getElementById("addAccount");
const accountsTableBody = document.getElementById("accountsTableBody");

// Edit modal
const editModal = document.getElementById("editModal");
const editEmail = document.getElementById("editEmail");
const editStartDate = document.getElementById("editStartDate");
const editDuration = document.getElementById("editDuration");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Add account
addAccountBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const startDate = startDateInput.value;
  const duration = parseInt(durationInput.value);

  if (!email || !startDate || !duration) return alert("Please fill all fields");

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration);

  accounts.push({ email, startDate, duration, endDate: endDate.toISOString() });
  saveData();
  renderTable();

  // reset fields
  emailInput.value = "";
  startDateInput.value = "";
  durationInput.value = 30;
});

// Render table
function renderTable() {
  accountsTableBody.innerHTML = "";

  accounts.forEach((acc, index) => {
    const tr = document.createElement("tr");

    const startDate = new Date(acc.startDate);
    const endDate = new Date(acc.endDate);

    tr.innerHTML = `
      <td>${acc.email}</td>
      <td>${startDate.toLocaleString()}</td>
      <td>${endDate.toLocaleString()}</td>
      <td class="time-left">${getTimeLeft(endDate)}</td>
      <td><span class="status ${getStatus(endDate)}">${getStatus(endDate).replace("status-","")}</span></td>
      <td>
        <button class="edit-btn">✏️ Edit</button>
        <button class="remove-btn">🗑 Remove</button>
      </td>
    `;

    // Edit button
    tr.querySelector(".edit-btn").addEventListener("click", () => openEditModal(index));

    // Remove button
    tr.querySelector(".remove-btn").addEventListener("click", () => {
      accounts.splice(index, 1);
      saveData();
      renderTable();
    });

    accountsTableBody.appendChild(tr);
  });
}

// Get time left
function getTimeLeft(endDate) {
  const now = new Date();
  const diff = endDate - now;
  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m`;
}

// Get status
function getStatus(endDate) {
  const now = new Date();
  if (endDate < now) return "status-ended";

  const diffDays = (endDate - now) / (1000 * 60 * 60 * 24);
  if (diffDays <= 3) return "status-ending";
  return "status-active";
}

// Save & Load data
function saveData() {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}
function loadData() {
  const data = localStorage.getItem("accounts");
  if (data) accounts = JSON.parse(data);
}

// Edit modal
function openEditModal(index) {
  editingIndex = index;
  const acc = accounts[index];
  editEmail.value = acc.email;
  editStartDate.value = acc.startDate;
  editDuration.value = acc.duration;
  editModal.style.display = "flex";
}

saveEditBtn.addEventListener("click", () => {
  if (editingIndex === null) return;

  accounts[editingIndex].email = editEmail.value;
  accounts[editingIndex].startDate = editStartDate.value;
  accounts[editingIndex].duration = parseInt(editDuration.value);

  const endDate = new Date(editStartDate.value);
  endDate.setDate(endDate.getDate() + accounts[editingIndex].duration);
  accounts[editingIndex].endDate = endDate.toISOString();

  saveData();
  renderTable();
  editModal.style.display = "none";
  editingIndex = null;
});

cancelEditBtn.addEventListener("click", () => {
  editModal.style.display = "none";
  editingIndex = null;
});

// Auto-update countdown every minute
setInterval(renderTable, 60000);

// Init
loadData();
renderTable();
