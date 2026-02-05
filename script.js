document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('llm-selector');
    const iframe = document.getElementById('llm-frame');

    // Load saved preference
    chrome.storage.local.get(['selectedLLM'], (result) => {
        if (result.selectedLLM) {
            selector.value = result.selectedLLM;
            iframe.src = result.selectedLLM;
        }
    });

    selector.addEventListener('change', (e) => {
        const url = e.target.value;
        iframe.src = url;

        // Save preference
        chrome.storage.local.set({ selectedLLM: url });
    });
});
