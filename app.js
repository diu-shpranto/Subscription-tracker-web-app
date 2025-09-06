// ===================
// Global Variables
// ===================
const STORAGE_KEY = "accountsData";
let accounts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Elements
const emailInput = document.getElementById("email");
const startDateInput = document.getElementById("startDate");
const durationInput = document.getElementById("duration");
const addAccountBtn = document.getElementById("addAccount");
const tableBody = document.getElementById("accountsTableBody");

// Save to LocalStorage
function saveAccounts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// Render Table
function renderTable() {
  tableBody.innerHTML = "";
  accounts.forEach((acc, index) => {
    const row = document.createElement("tr");

    const endDate = new Date(acc.startDate);
    endDate.setDate(endDate.getDate() + parseInt(acc.duration));

    const now = new Date();
    const timeLeftMs = endDate - now;

    let statusClass = "status-active";
    let statusText = "Active";

    if (timeLeftMs <= 0) {
      statusClass = "status-ended";
      statusText = "Ended";
    } else if (timeLeftMs < 3 * 24 * 60 * 60 * 1000) {
      // less than 3 days left
      statusClass = "status-ending";
      statusText = "Ending Soon";
    }

    const timeLeft = timeLeftMs > 0 ? msToTime(timeLeftMs) : "Expired";

    // ✅ Date + Time formatting (like your photo)
    const dateOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    };
    const startFormatted = new Date(acc.startDate).toLocaleString("en-US", dateOptions);
    const endFormatted = endDate.toLocaleString("en-US", dateOptions);

    row.innerHTML = `
      <td>${acc.email}</td>
      <td>${startFormatted}</td>
      <td>${endFormatted}</td>
      <td class="time-left">${timeLeft}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td><button class="remove-btn" data-index="${index}">Remove</button></td>
    `;

    tableBody.appendChild(row);
  });

  // Attach remove button events
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      accounts.splice(idx, 1);
      saveAccounts();
      renderTable();
    });
  });
}

// Convert ms → Days, Hours, Minutes, Seconds
function msToTime(duration) {
  let days = Math.floor(duration / (1000 * 60 * 60 * 24));
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let seconds = Math.floor((duration / 1000) % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Add Account
addAccountBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const startDate = startDateInput.value;
  const duration = parseInt(durationInput.value);

  if (!email || !startDate || !duration) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  accounts.push({ email, startDate, duration });
  saveAccounts();
  renderTable();

  emailInput.value = "";
  startDateInput.value = "";
  durationInput.value = 30;
});

// Update countdown every second
setInterval(renderTable, 1000);

// First render
renderTable();


// ===================
// Export & Import
// ===================

// Export Data
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = JSON.stringify(accounts, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "accountsBackup.json";
  a.click();

  URL.revokeObjectURL(url);
});

// Import Data
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const importedData = JSON.parse(event.target.result);
      if (Array.isArray(importedData)) {
        accounts = importedData;
        saveAccounts();
        renderTable();
        alert("✅ Data imported successfully!");
      } else {
        alert("❌ Invalid data format!");
      }
    } catch (e) {
      alert("❌ Error reading file!");
    }
  };
  reader.readAsText(file);
});
