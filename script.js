document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('llm-dropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const selectedText = document.getElementById('selected-text');
    const options = dropdown.querySelector('.dropdown-options');
    const iframe = document.getElementById('llm-frame');

    // Toggle dropdown
    selected.addEventListener('click', (e) => {
        dropdown.classList.toggle('active');
        e.stopPropagation();
    });

    // Close dropdown on click outside
    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
    });

    // Handle option selection
    dropdown.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            const url = option.getAttribute('data-value');
            const name = option.textContent;

            selectedText.textContent = name;
            iframe.src = url;
            dropdown.classList.remove('active');

            // Save preference
            chrome.storage.local.set({ selectedLLM: url, selectedName: name });
        });
    });

    // Load saved preference
    chrome.storage.local.get(['selectedLLM', 'selectedName'], (result) => {
        if (result.selectedLLM) {
            selectedText.textContent = result.selectedName || 'ChatGPT';
            iframe.src = result.selectedLLM;
        }
    });

    // Force iframe reload if it fails (basic retry logic for some sites)
    iframe.addEventListener('error', () => {
        console.warn('Iframe load failed, attempting reload...');
        const currentSrc = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => {
            iframe.src = currentSrc;
        }, 500);
    });
});
