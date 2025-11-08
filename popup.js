const toggleSwitch = document.getElementById('toggleSwitch');
const statusText = document.getElementById('statusText');
const fetchNowBtn = document.getElementById('fetchNowBtn');
const viewDataBtn = document.getElementById('viewDataBtn');

// Load the current state when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('isRunning', (data) => {
        toggleSwitch.checked = !!data.isRunning;
        updateStatusText(!!data.isRunning);
    });
});

// Handle the toggle switch change
toggleSwitch.addEventListener('change', () => {
    const isRunning = toggleSwitch.checked;
    chrome.storage.local.set({ isRunning: isRunning });
    updateStatusText(isRunning);
});

// Handle the "Fetch Now" button click
fetchNowBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes("https://www.ivasms.com/portal/live/test_sms")) {
             chrome.tabs.sendMessage(tabs[0].id, { action: "fetchNow" });
             window.close(); // Close popup after clicking
        } else {
            alert("This feature only works on the target IVASMS page.");
        }
    });
});

// Handle the "View Data" button click
viewDataBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

function updateStatusText(isRunning) {
    if (isRunning) {
        statusText.textContent = 'Running';
        statusText.style.color = 'green';
    } else {
        statusText.textContent = 'Stopped';
        statusText.style.color = 'red';
    }
}