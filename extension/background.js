const CLIENT_URL = "https://client-mocha-five-q1k2xjicnj.vercel.app";

chrome.runtime.onInstalled.addListener(() => {
  console.log("CareerFlow extension ready");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "OPEN_GOAL_SESSION") {
    chrome.tabs.create({ url: `${CLIENT_URL}/goal-session?import=extension` });
    sendResponse({ ok: true });
  }
  return true;
});
