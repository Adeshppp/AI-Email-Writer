
document.addEventListener("DOMContentLoaded", function () {
    const apiKeyInput = document.getElementById("apiKeyInput");
    const saveButton = document.getElementById("saveApiKey");

    // Load saved API key
    chrome.storage.sync.get("apiKey", function (data) {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey; // Pre-fill if available
        }
    });

    // Save API key when button is clicked
    saveButton.addEventListener("click", function () {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ apiKey: apiKey }, function () {
                alert("API Key saved successfully!");
            });
        } else {
            alert("Please enter a valid API Key.");
        }
    });
});
