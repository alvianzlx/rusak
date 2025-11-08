chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "storeData") {
        chrome.storage.local.get({ storedSmsData: [] }, (result) => {
            let dataArray = result.storedSmsData;

            // Prevent duplicates based on our pseudo-unique ID
            const isDuplicate = dataArray.some(item => item.id === request.data.id);
            
            if (!isDuplicate) {
                dataArray.unshift(request.data); // Add new data to the beginning
                chrome.storage.local.set({ storedSmsData: dataArray });
            }
        });
    }
});