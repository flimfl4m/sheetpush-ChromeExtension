document.addEventListener("DOMContentLoaded", () => {
  const previewDiv = document.getElementById("preview");
  const statusDiv = document.getElementById("status");

  function refreshPreview() {
    chrome.storage.local.get("currentData", ({ currentData }) => {
      const missing = [];
      ["Company", "Role", "Job Description"].forEach(key => {
        if (!currentData[key]) missing.push(key);
      });

      previewDiv.innerHTML = `<pre>${JSON.stringify(currentData, null, 2)}</pre>`;

      if (missing.length > 0) {
        statusDiv.innerText = `Missing: ${missing.join(", ")}`;
        statusDiv.style.color = "red";
      } else {
        statusDiv.innerText = "Ready to push.";
        statusDiv.style.color = "green";
      }
    });
  }

  document.getElementById("push").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "push" });
    statusDiv.innerText = "Pushing...";
    setTimeout(() => refreshPreview(), 1000);
  });

  document.getElementById("clear").addEventListener("click", () => {
    chrome.storage.local.set({ currentData: { "Company": "", "Role": "", "Job Description": "" } }, refreshPreview);
    statusDiv.innerText = "Fields cleared.";
  });

  refreshPreview();
});