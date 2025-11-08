let observer;
let isRunning = false;

// Function to parse a single table row (<tr>) and extract data
function parseRow(row) {
    try {
        const countryEl = row.querySelector('h6 a');
        const phoneEl = row.querySelector('p.CopyText');
        const serviceEl = row.querySelector('td:nth-child(2) div div');
        const messageEl = row.querySelector('td:nth-child(3)');

        if (!countryEl || !phoneEl || !serviceEl || !messageEl) {
            return null;
        }

        const data = {
            id: phoneEl.innerText.trim() + '_' + new Date().getTime(), // Create a pseudo-unique ID
            country: countryEl.innerText.trim(),
            phone: phoneEl.innerText.trim(),
            service: serviceEl.innerText.trim(),
            message: messageEl.innerText.trim(),
            timestamp: new Date().toISOString()
        };
        
        return data;
    } catch (error) {
        console.error("Error parsing row:", error);
        return null;
    }
}

// Function to send data to the background script for storage
function storeData(data) {
    if (data) {
        console.log("Sending data to store:", data);
        chrome.runtime.sendMessage({ action: "storeData", data: data });
    }
}

// The main function that sets up the observer
function startObserver() {
    const targetNode = document.getElementById('LiveTestSMS');
    if (!targetNode) {
        console.log("Target table with id 'LiveTestSMS' not found.");
        return;
    }

    console.log("Starting observer on #LiveTestSMS");

    const config = { childList: true, subtree: true };

    const callback = function(mutationsList, observer) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                 mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'TR') {
                        const parsedData = parseRow(node);
                        storeData(parsedData);
                    }
                });
            }
        }
    };

    observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

function stopObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
        console.log("Observer stopped.");
    }
}

// Listen for state changes from storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.isRunning) {
        isRunning = !!changes.isRunning.newValue;
        if (isRunning) {
            startObserver();
        } else {
            stopObserver();
        }
    }
});

// Check initial state when the script loads
chrome.storage.local.get('isRunning', (data) => {
    isRunning = !!data.isRunning;
    if (isRunning) {
        startObserver();
    }
});

// Listener for manual fetch requests from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchNow") {
        console.log("Manual fetch triggered.");
        const targetNode = document.getElementById('LiveTestSMS');
        if (targetNode) {
            targetNode.querySelectorAll('tr').forEach(row => {
                const parsedData = parseRow(row);
                storeData(parsedData);
            });
        }
    }
});