document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("llm-dropdown");
  const selectedText = document.getElementById("selected-text");
  const iframe = document.getElementById("llm-frame");
  const options = document.querySelectorAll(".option");

  // Toggle dropdown
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
    e.stopPropagation();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });

  // Handle clicks inside the iframe (iframes don't bubble events to parent, so we use blur)
  window.addEventListener("blur", () => {
    if (document.activeElement === iframe) {
      dropdown.classList.remove("active");
    }
  });

  // Handle selection
  options.forEach((option) => {
    option.addEventListener("click", () => {
      const url = option.getAttribute("data-value");
      const name = option.textContent.trim();

      iframe.src = url;
      selectedText.textContent = name;

      // Update active state in UI
      options.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");

      // Save preference
      chrome.storage.local.set({ selectedLLM: url, selectedName: name });
    });
  });

  // Load saved preference
  chrome.storage.local.get(["selectedLLM", "selectedName"], (result) => {
    let savedUrl = result.selectedLLM;
    let savedName = result.selectedName;

    // RESET: If user has ANY legacy Copilot/Bing URL saved, move them to ChatGPT for stability
    if (
      savedUrl &&
      (savedUrl.includes("microsoft.com") || savedUrl.includes("bing.com"))
    ) {
      savedUrl = "https://chatgpt.com";
      savedName = "ChatGPT";
      chrome.storage.local.set({
        selectedLLM: savedUrl,
        selectedName: savedName,
      });
    }

    if (savedUrl) {
      selectedText.textContent = savedName;
      iframe.src = savedUrl;

      // Mark active in dropdown
      options.forEach((option) => {
        if (option.getAttribute("data-value") === savedUrl) {
          option.classList.add("active");
        }
      });
    } else {
      // Default to first option if nothing saved
      const defaultOpt = options[0];
      if (defaultOpt) defaultOpt.classList.add("active");
    }
  });
});
