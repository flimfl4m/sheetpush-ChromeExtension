const fields = ["Company", "Role", "Job Description"];
const fieldKeys = { "Company": "A", "Role": "B", "Job Description": "E" };
let currentData = { "Company": "", "Role": "", "Job Description": "" };

chrome.runtime.onInstalled.addListener(() => {
  fields.forEach(field => {
    chrome.contextMenus.create({
      id: field,
      title: `Save as ${field}`,
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const field = info.menuItemId;
  if (fields.includes(field)) {
    currentData[field] = info.selectionText;
    chrome.storage.local.set({ currentData });

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: `${field} Saved`,
      message: `Saved text to field: ${field}`
    });

    chrome.action.setBadgeText({ text: "●" });
    chrome.action.setBadgeBackgroundColor({ color: "#e74c3c" });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "push-to-sheet") {
    chrome.storage.local.get("currentData", async ({ currentData }) => {
      await pushToSheet(currentData);
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "push") {
    chrome.storage.local.get("currentData", async ({ currentData }) => {
      await pushToSheet(currentData);
    });
  }
});

async function pushToSheet(data) {
  const url = "https://script.google.com/macros/s/AKfycbwlnFwPHKM4YRGq806y8sDFwg0pbos85W5-Ofz6-FZ437fLUroh8gUeveKwkFuNOazu/exec";

  if (!data["Company"] || !data["Role"] || !data["Job Description"]) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Missing Field",
      message: "Please ensure all fields are filled before pushing."
    });
    return;
  }

  const formData = new FormData();
  formData.append("company", data["Company"]);
  formData.append("role", data["Role"]);
  formData.append("description", data["Job Description"]);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    const text = await res.text();

    if (!res.ok || !text.includes("success")) {
      throw new Error(text);
    }

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Success",
      message: "Data pushed to Google Sheet!"
    });

    chrome.storage.local.set({ currentData: { "Company": "", "Role": "", "Job Description": "" } });
    chrome.action.setBadgeText({ text: "" });
  } catch (err) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Error",
      message: `Push failed: ${err.message}`
    });
  }
}
