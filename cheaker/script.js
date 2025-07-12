document.getElementById("checkBtn").addEventListener("click", async () => {
  const input = document.getElementById("htmlInput").value.trim();
  const seoList = document.getElementById("seoList");
  const sslList = document.getElementById("sslList");
  const btnList = document.getElementById("btnList");
  const iframe = document.getElementById("preview");

  seoList.innerHTML = "";
  sslList.innerHTML = "";
  btnList.innerHTML = "";

  let html = "";
  if (input.startsWith("http")) {
    const isHttps = input.startsWith("https://");
    sslList.innerHTML += `<li>HTTPS判定: ${isHttps ? "✅ 対応" : "❌ 非対応"}</li>`;
    try {
      const res = await fetch(input);
      html = await res.text();
      sslList.innerHTML += `<li>接続成功: ✅ OK</li>`;
    } catch (e) {
      sslList.innerHTML += `<li>接続失敗: ❌ ${e.message}</li>`;
      return;
    }
  } else {
    html = input;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const checks = [
    { label: "<title>", ok: !!doc.querySelector("title") },
    { label: "<meta name='description'>", ok: !!doc.querySelector("meta[name='description']") },
    { label: "<h1>", ok: !!doc.querySelector("h1") },
    { label: "<img> alt属性", ok: [...doc.querySelectorAll("img")].every(img => img.alt) },
  ];
  checks.forEach(c => {
    seoList.innerHTML += `<li>${c.label}: ${c.ok ? "✅" : "❌"}</li>`;
  });

  // ボタンサイズチェック
  const tmpFrame = document.createElement("iframe");
  tmpFrame.style.display = "none";
  document.body.appendChild(tmpFrame);
  tmpFrame.srcdoc = html;

  tmpFrame.onload = () => {
    const btns = tmpFrame.contentDocument.querySelectorAll("button, input[type=button], input[type=submit], a");
    btns.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        const text = btn.innerText || btn.value || "(無名)";
        btnList.innerHTML += `<li>「${text}」 → ${Math.round(rect.width)}x${Math.round(rect.height)} ❌</li>`;
      }
    });
    document.body.removeChild(tmpFrame);
  };

  // プレビュー
  iframe.srcdoc = html;
  updatePreviewSize();
});

const deviceMap = {
  "375x667": [375, 667],
  "390x844": [390, 844],
  "430x932": [430, 932],
  "412x915": [412, 915],
  "360x800": [360, 800],
  "360x852": [360, 852],
  "384x880": [384, 880],
  "360x780": [360, 780],
  "414x896": [414, 896],
  "393x852": [393, 852],
  "375x812": [375, 812],
  "768x1032": [768, 1032],
  "360x760": [360, 760],

  "810x1080": [810, 1080],
  "744x1133": [744, 1133],
  "1024x1366": [1024, 1366],
  "800x1280": [800, 1280],
  "800x1340": [800, 1340],

  "1366x768": [1366, 768],
  "1440x900": [1440, 900],
  "1920x1080": [1920, 1080],
  "2560x1440": [2560, 1440],
  "3840x2160": [3840, 2160],
};

const selector = document.getElementById("device");
const rotate = document.getElementById("rotate");
const preview = document.getElementById("preview");
const customBox = document.getElementById("customSize");
const customWidth = document.getElementById("customWidth");
const customHeight = document.getElementById("customHeight");

function updatePreviewSize() {
  let w, h;
  if (selector.value === "custom") {
    w = parseInt(customWidth.value);
    h = parseInt(customHeight.value);
  } else {
    [w, h] = deviceMap[selector.value] || [375, 667];
  }
  if (rotate.checked) [w, h] = [h, w];
  preview.style.width = w + "px";
  preview.style.height = h + "px";
}

selector.addEventListener("change", () => {
  customBox.style.display = selector.value === "custom" ? "inline-block" : "none";
  updatePreviewSize();
});
rotate.addEventListener("change", updatePreviewSize);
customWidth.addEventListener("input", updatePreviewSize);
customHeight.addEventListener("input", updatePreviewSize);
// URLパラメータ対応
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const urlParam = params.get("url");
  const deviceParam = params.get("device");
  const rotateParam = params.get("rotate");

  if (urlParam) {
    document.getElementById("htmlInput").value = urlParam;
    if (deviceParam && deviceMap[deviceParam]) {
      selector.value = deviceParam;
    }
    if (rotateParam === "true") {
      rotate.checked = true;
    }
    updatePreviewSize();
    document.getElementById("checkBtn").click();
  }
});
