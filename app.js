document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const emailInput = document.getElementById('email');
    const startDateInput = document.getElementById('startDate');
    const durationInput = document.getElementById('duration');
    const addAccountBtn = document.getElementById('addAccount');
    const accountsTableBody = document.getElementById('accountsTableBody');

    // Set default start date to now
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);
    startDateInput.value = localISOTime;

    // Load accounts from localStorage
    let accounts = JSON.parse(localStorage.getItem('ytPremiumAccounts')) || [];
    
    // Initialize the table
    updateTable();

    // Add account event listener
    addAccountBtn.addEventListener('click', addAccount);

    // Also allow adding with Enter key
    emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addAccount();
    });
    durationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addAccount();
    });

    // Update countdowns every second
    setInterval(updateTable, 1000);

    function addAccount() {
        const email = emailInput.value.trim();
        const startDate = new Date(startDateInput.value);
        const duration = parseInt(durationInput.value);
        
        // Validation
        if (!validateEmail(email)) {
            alert('Please enter a valid Gmail address');
            return;
        }
        if (isNaN(startDate.getTime())) {
            alert('Please select a valid start date and time');
            return;
        }
        if (isNaN(duration) || duration < 1) {
            alert('Please enter a valid duration (at least 1 day)');
            return;
        }

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        const account = {
            email,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            duration
        };

        accounts.push(account);
        saveAccounts();
        updateTable();
        
        // Reset form
        emailInput.value = '';
        emailInput.focus();
        startDateInput.value = localISOTime;
        durationInput.value = '30';
    }

    function updateTable() {
        accountsTableBody.innerHTML = '';
        const now = new Date();
        
        // Sort accounts by time remaining (soonest first)
        accounts.sort((a, b) => {
            return new Date(a.endDate) - new Date(b.endDate);
        });
        
        accounts.forEach((account, index) => {
            const startDate = new Date(account.startDate);
            const endDate = new Date(account.endDate);
            const diff = endDate - now;
            
            // Calculate time remaining
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            // Determine status
            let status, statusClass;
            if (diff <= 0) {
                status = 'Ended';
                statusClass = 'status-ended';
            } else if (days < 1) {
                status = 'Ending Soon';
                statusClass = 'status-ending';
            } else {
                status = 'Active';
                statusClass = 'status-active';
            }
            
            // Create table row
            const row = document.createElement('tr');
            
            // Format dates for display
            const startDateStr = formatDateTime(startDate);
            const endDateStr = formatDateTime(endDate);
            
            // Time left display
            let timeLeftStr;
            if (diff <= 0) {
                timeLeftStr = 'Expired';
            } else {
                timeLeftStr = `<span class="time-left">${days}d ${hours}h ${minutes}m ${seconds}s</span>`;
            }
            
            row.innerHTML = `
                <td>${account.email}</td>
                <td>${startDateStr}</td>
                <td>${endDateStr}</td>
                <td>${timeLeftStr}</td>
                <td><span class="status ${statusClass}">${status}</span></td>
                <td><button class="remove-btn" data-index="${index}">Remove</button></td>
            `;
            
            accountsTableBody.appendChild(row);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                if (confirm('Are you sure you want to remove this account?')) {
                    const index = parseInt(this.getAttribute('data-index'));
                    accounts.splice(index, 1);
                    saveAccounts();
                    updateTable();
                }
            });
        });
    }

    function saveAccounts() {
        localStorage.setItem('ytPremiumAccounts', JSON.stringify(accounts));
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email) && email.includes('gmail.com');
    }

    function formatDateTime(date) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});
const STORAGE_KEY = "myData";

// Example: Save some sample data in LocalStorage if empty
if (!localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: "Pranto", score: 100 }));
}

// Export Data
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = localStorage.getItem(STORAGE_KEY) || "{}";
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "myDataBackup.json";
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
      alert("✅ Data imported successfully!\nCheck console for details.");
      console.log("Imported Data:", importedData);
    } catch (e) {
      alert("❌ Invalid JSON file!");
    }
  };
  reader.readAsText(file);
});
