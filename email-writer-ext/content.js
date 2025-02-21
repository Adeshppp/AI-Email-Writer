console.log("Email Writer Extension - Content Script Loaded");

// Function to extract email content
function getEmailContent() {
    const selectors = ['.a3s.aiL', '.h7', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) return content.innerText.trim();
    }
    return '';
}

// Function to create the AI Reply button
function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = "AI Reply";
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

// Function to find the email compose toolbar
function findComposeToolbar() {
    const selectors = ['.aDh', '.btC', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

// Function to inject the AI Reply button into Gmail's compose toolbar
function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();
    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found!");
        return;
    }

    console.log("Toolbar found, creating AI button.");
    const button = createAIButton();
    button.classList.add('ai-reply-button');


    button.addEventListener("click", async () => {
        try {
            button.innerHTML = "Generating...";
            button.disabled = true;
            const emailContent = getEmailContent();
    
            // Retrieve API key from storage
            chrome.storage.sync.get("apiKey", async function (data) {
                if (!data.apiKey) {
                    alert("API Key is not set. Please enter it in the extension popup.");
                    button.innerHTML = "AI Reply";
                    button.disabled = false;
                    return;
                }
    
                console.log("Retrieved API Key:", data.apiKey); // Print API Key
    
                const response = await fetch("http://localhost:8080/api/email/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${data.apiKey}` // Send API key in headers
                    },
                    body: JSON.stringify({
                        emailContent: emailContent,
                        tone: "professional"
                    }),
                });
    
                if (!response.ok) {
                    throw new Error("API Request Failed.");
                }
    
                const generatedReply = await response.text();
                const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
                if (composeBox) {
                    composeBox.focus();
                    document.execCommand("insertText", false, generatedReply);
                } else {
                    console.error("Compose box was not found!");
                }
            });
        } catch (error) {
            console.error(error);
            alert("Failed to generate reply.");
        } finally {
            button.innerHTML = "AI Reply";
            button.disabled = false;
        }
    });
    
    toolbar.insertBefore(button, toolbar.firstChild);
}

// Function to monitor DOM changes and inject the button when needed
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(
            node =>
                node.nodeType === Node.ELEMENT_NODE &&
                (node.matches('.aDh, .btC,[role="dialog"]') || node.querySelector('.aDh, .btC,[role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

// Start observing Gmail for changes
observer.observe(document.body, {
    childList: true,
    subtree: true
});
