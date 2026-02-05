document.addEventListener('DOMContentLoaded', () => {
    console.log("Sidepanel: UI loaded");

    const dropdown = document.getElementById('llm-dropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const selectedText = document.getElementById('selected-text');
    const iframe = document.getElementById('llm-frame');

    // Toggle dropdown
    selected.addEventListener('click', (e) => {
        console.log("Sidepanel: Dropdown clicked");
        dropdown.classList.toggle('active');
        e.stopPropagation();
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
    });

    // Handle option selection
    dropdown.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            const url = option.getAttribute('data-value');
            const name = option.textContent;

            console.log(`Sidepanel: Selecting LLM -> ${name} (${url})`);

            selectedText.textContent = name;
            iframe.src = url;
            dropdown.classList.remove('active');

            chrome.storage.local.set({ selectedLLM: url, selectedName: name });
        });
    });

    // Load saved preference
    chrome.storage.local.get(['selectedLLM', 'selectedName'], (result) => {
        let savedUrl = result.selectedLLM;
        let savedName = result.selectedName;

        // RESET: If user has ANY Copilot/Bing URL saved, move them to ChatGPT for stability
        if (savedUrl && (savedUrl.includes('microsoft.com') || savedUrl.includes('bing.com'))) {
            console.log("Sidepanel: Redirecting legacy Copilot user to ChatGPT");
            savedUrl = 'https://chatgpt.com';
            savedName = 'ChatGPT';
            chrome.storage.local.set({ selectedLLM: savedUrl, selectedName: savedName });
        }

        if (savedUrl) {
            console.log("Sidepanel: Restoring saved LLM:", savedName);
            selectedText.textContent = savedName;
            iframe.src = savedUrl;
        } else {
            console.log("Sidepanel: No saved LLM, using default (ChatGPT)");
        }
    });

    // Monitor Iframe Loading
    iframe.addEventListener('load', () => {
        console.log("Iframe: Content LOADED successfully from", iframe.src);
    });

    // Errors in iframes are notoriously hard to catch cross-origin, 
    // but we can monitor if it fails to trigger the load event.
    setTimeout(() => {
        // Simple check: if after 5 seconds the frame is still blank/not loaded
        // Note: Real error catching for cross-origin iframes is blocked by browser security.
        console.log("Iframe: 5s load check for", iframe.src);
    }, 5000);
});
