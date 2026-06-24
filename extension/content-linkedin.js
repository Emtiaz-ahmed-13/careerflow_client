const CLIENT_URL = "https://client-mocha-five-q1k2xjicnj.vercel.app";

function isJobPage() {
  return /linkedin\.com\/jobs\//i.test(window.location.href);
}

function text(el) {
  return el?.innerText?.trim() ?? "";
}

function clickShowMore() {
  const buttons = [...document.querySelectorAll("button, a[role='button']")];
  const showMore = buttons.find((b) => /show more|see more|view more/i.test(b.innerText));
  if (showMore) showMore.click();
}

function scrapeTitle() {
  const selectors = [
    ".job-details-jobs-unified-top-card__job-title",
    ".jobs-unified-top-card__job-title",
    ".jobs-search__job-details h1",
    "h1.t-24",
    "h1.t-20",
    "h1",
  ];
  for (const sel of selectors) {
    const t = text(document.querySelector(sel));
    if (t && t.length > 2 && !/linkedin/i.test(t)) return t;
  }
  return "";
}

function scrapeCompany() {
  const selectors = [
    ".job-details-jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name a",
    ".jobs-unified-top-card__company-name",
    ".jobs-search__job-details a[href*='/company/']",
    "[class*='company-name'] a",
    "[class*='company-name']",
  ];
  for (const sel of selectors) {
    const t = text(document.querySelector(sel));
    if (t && t.length > 1) return t;
  }
  return "";
}

function scrapeDescription() {
  const roots = [
    document.querySelector(".jobs-search__job-details"),
    document.querySelector(".jobs-details"),
    document.querySelector("main"),
    document.body,
  ].filter(Boolean);

  const selectors = [
    ".jobs-description-content__text--stretch",
    ".jobs-description-content__text",
    ".jobs-box__html-content",
    "#job-details",
    ".jobs-description__content",
    "[class*='jobs-description']",
  ];

  let best = "";
  for (const root of roots) {
    for (const sel of selectors) {
      root.querySelectorAll(sel).forEach((el) => {
        const t = text(el);
        if (t.length > best.length) best = t;
      });
    }
  }

  const headings = [...document.querySelectorAll("h2, h3, h4, strong, span")];
  const about = headings.find((h) => /about the job|job description/i.test(h.innerText));
  if (about) {
    let node = about.parentElement;
    for (let i = 0; i < 8 && node; i++) {
      const t = text(node);
      if (t.length > best.length) best = t;
      node = node.parentElement;
    }
  }

  return best;
}

function scrapeJob() {
  clickShowMore();
  return {
    title: scrapeTitle(),
    company: scrapeCompany(),
    description: scrapeDescription(),
    url: window.location.href.split("?")[0],
  };
}

function buildJobPayload(job, descriptionOverride) {
  const desc = descriptionOverride || job.description || "";
  const header = [job.title, job.company].filter(Boolean).join(" @ ");
  let body = desc;

  if (body.length < 80) {
    body = [
      header || "LinkedIn Job",
      "",
      "(Paste full job text in CareerFlow if needed)",
      "",
      `Source: ${job.url}`,
    ].join("\n");
  } else if (!descriptionOverride) {
    body = [header, "", body, "", `Source: ${job.url}`].filter((l) => l !== "").join("\n");
  }

  return {
    url: job.url,
    title: job.title || "Unknown Role",
    company: job.company || "Unknown Company",
    description: body,
    partial: body.length < 200,
  };
}

async function openCareerFlow(payload) {
  await chrome.storage.local.set({ pendingImport: payload });
  const url = `${CLIENT_URL}/goal-session?import=extension`;
  // Direct open — works even when service worker is inactive
  window.open(url, "_blank");
  try {
    chrome.runtime.sendMessage({ type: "OPEN_GOAL_SESSION" });
  } catch {
    /* window.open is enough */
  }
}

function injectButtons() {
  if (!isJobPage()) return;
  if (document.getElementById("careerflow-wrap")) return;

  const wrap = document.createElement("div");
  wrap.id = "careerflow-wrap";
  wrap.style.cssText = [
    "position:fixed",
    "bottom:24px",
    "right:24px",
    "z-index:99999",
    "display:flex",
    "flex-direction:column",
    "gap:8px",
    "font-family:system-ui,sans-serif",
  ].join(";");

  const btnStyle = [
    "padding:12px 16px",
    "font-weight:900",
    "font-size:12px",
    "text-transform:uppercase",
    "border:3px solid #000",
    "box-shadow:4px 4px 0 #000",
    "cursor:pointer",
  ].join(";");

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "⚡ Save to CareerFlow";
  saveBtn.style.cssText = `${btnStyle};background:#a3e635;color:#000;`;

  const pasteBtn = document.createElement("button");
  pasteBtn.type = "button";
  pasteBtn.textContent = "📋 Paste copied & Save";
  pasteBtn.style.cssText = `${btnStyle};background:#fde047;color:#000;`;

  saveBtn.addEventListener("click", async () => {
    saveBtn.textContent = "Opening...";
    clickShowMore();
    await new Promise((r) => setTimeout(r, 500));
    const job = scrapeJob();
    const payload = buildJobPayload(job);
    await openCareerFlow(payload);
    saveBtn.textContent = payload.partial ? "Opened — check CareerFlow" : "✓ Opened!";
    setTimeout(() => {
      saveBtn.textContent = "⚡ Save to CareerFlow";
    }, 3000);
  });

  pasteBtn.addEventListener("click", async () => {
    pasteBtn.textContent = "Reading clipboard...";
    try {
      const copied = await navigator.clipboard.readText();
      if (!copied || copied.length < 40) {
        alert("First: click About the job → Cmd+A → Cmd+C, then click this button again.");
        pasteBtn.textContent = "📋 Paste copied & Save";
        return;
      }
      const job = scrapeJob();
      const payload = buildJobPayload(job, copied);
      await openCareerFlow(payload);
      pasteBtn.textContent = "✓ Opened with paste!";
      setTimeout(() => {
        pasteBtn.textContent = "📋 Paste copied & Save";
      }, 3000);
    } catch {
      alert("Allow clipboard access, or use Cmd+C then try again.");
      pasteBtn.textContent = "📋 Paste copied & Save";
    }
  });

  wrap.appendChild(saveBtn);
  wrap.appendChild(pasteBtn);
  document.body.appendChild(wrap);
}

injectButtons();
const observer = new MutationObserver(() => injectButtons());
observer.observe(document.body, { childList: true, subtree: true });
