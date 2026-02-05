document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('llm-dropdown');
    const selectedText = document.getElementById('selected-text');
    const iframe = document.getElementById('llm-frame');
    const options = document.querySelectorAll('.option');

    // Toggle dropdown
    dropdown.addEventListener('click', (e) => {
        dropdown.classList.toggle('active');
        e.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
    });

    // Handle selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            const url = option.getAttribute('data-value');
            const name = option.textContent;

            iframe.src = url;
            selectedText.textContent = name;

            // Save preference
            chrome.storage.local.set({ selectedLLM: url, selectedName: name });
        });
    });

    // Load saved preference
    chrome.storage.local.get(['selectedLLM', 'selectedName'], (result) => {
        let savedUrl = result.selectedLLM;
        let savedName = result.selectedName;

        // RESET: If user has ANY legacy Copilot/Bing URL saved, move them to ChatGPT for stability
        if (savedUrl && (savedUrl.includes('microsoft.com') || savedUrl.includes('bing.com'))) {
            savedUrl = 'https://chatgpt.com';
            savedName = 'ChatGPT';
            chrome.storage.local.set({ selectedLLM: savedUrl, selectedName: savedName });
        }

        if (savedUrl) {
            selectedText.textContent = savedName;
            iframe.src = savedUrl;
        }
    });
});
