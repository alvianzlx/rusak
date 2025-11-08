const filterInput = document.getElementById('filterInput');
const clearDataBtn = document.getElementById('clearDataBtn');
const dataBody = document.getElementById('dataBody');
const noDataMessage = document.getElementById('noDataMessage');
let allData = [];

// Function to render data in the table
function renderTable(dataToRender) {
    dataBody.innerHTML = ''; // Clear existing table
    if (dataToRender.length === 0) {
        noDataMessage.style.display = 'block';
    } else {
        noDataMessage.style.display = 'none';
    }

    dataToRender.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(item.timestamp).toLocaleString()}</td>
            <td>${item.country}</td>
            <td>${item.phone}</td>
            <td>${item.service}</td>
            <td>${item.message}</td>
        `;
        dataBody.appendChild(row);
    });
}

// Load data when the page opens
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get({ storedSmsData: [] }, (result) => {
        allData = result.storedSmsData;
        renderTable(allData);
    });
});

// Filter data as the user types
filterInput.addEventListener('keyup', () => {
    const filterText = filterInput.value.toLowerCase();
    const filteredData = allData.filter(item => {
        return item.country.toLowerCase().includes(filterText) ||
               item.phone.toLowerCase().includes(filterText) ||
               item.service.toLowerCase().includes(filterText) ||
               item.message.toLowerCase().includes(filterText);
    });
    renderTable(filteredData);
});

// Clear all data when the button is clicked
clearDataBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete ALL stored data? This cannot be undone.")) {
        allData = [];
        chrome.storage.local.set({ storedSmsData: [] }, () => {
            renderTable([]);
            console.log("All data cleared.");
        });
    }
});

// Also update the table if data changes in storage while the page is open
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.storedSmsData) {
        allData = changes.storedSmsData.newValue || [];
        filterInput.dispatchEvent(new Event('keyup')); // Re-apply filter
    }
});