const CLIENT_URL = "https://client-mocha-five-q1k2xjicnj.vercel.app";

function deliverImport() {
  if (!window.location.pathname.includes("/goal-session")) return;

  chrome.storage.local.get("pendingImport", (data) => {
    if (!data?.pendingImport) return;
    window.postMessage({ type: "CAREERFLOW_IMPORT_JOB", job: data.pendingImport }, "*");
    chrome.storage.local.remove("pendingImport");
  });
}

if (window.location.hostname.includes("vercel.app") || window.location.hostname === "localhost") {
  deliverImport();
  document.addEventListener("DOMContentLoaded", deliverImport);
  window.addEventListener("load", deliverImport);
  [300, 800, 1500, 3000].forEach((ms) => setTimeout(deliverImport, ms));
}
