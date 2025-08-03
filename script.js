// JSONをfetchしてパース
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

// コピー機能
function copyText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const prevText = btn.textContent;
    btn.textContent = '✅ コピー済み';
    setTimeout(() => {
      btn.textContent = prevText;
    }, 1500);
  });
}

// リスト描画
function renderList(id, data, isSns = false, isNews = false) {
  const ul = document.getElementById(id);
  ul.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    if (isSns) {
      li.innerHTML = `${item.emoji} <strong>${item.service}</strong>: <span class="id">${item.id}</span> <button onclick="copyText(this,'${item.copy}')">コピー</button>`;
    } else if (isNews) {
      li.textContent = `${item.emoji} [${item.date}] ${item.text}`;
    } else {
      li.innerHTML = `${item.emoji} <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name}</a>`;
    }
    ul.appendChild(li);
  });
}

// タイプライター風
const text = "わたあめえ - 自己紹介ページ";
const typewriterElem = document.getElementById("typewriter");
let index = 0;
function typeWriter() {
  if (index < text.length) {
    typewriterElem.textContent += text.charAt(index);
    index++;
    setTimeout(typeWriter, 120);
  }
}
typeWriter();

// ダークモード切替
const darkToggle = document.getElementById("darkModeToggle");
darkToggle.addEventListener("click", () => {
  if (document.documentElement.getAttribute("data-theme") === "dark") {
    document.documentElement.removeAttribute("data-theme");
    darkToggle.textContent = "🌙";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    darkToggle.textContent = "☀️";
  }
});

// スクロールでフェードイン
const faders = document.querySelectorAll(".fade-in-scroll");
const appearOptions = {
  threshold: 0,
  rootMargin: "0px 0px -50px 0px",
};

const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    appearOnScroll.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(fader => {
  appearOnScroll.observe(fader);
});

// トップへスクロールボタン制御
const scrollBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    scrollBtn.classList.add("visible");
  } else {
    scrollBtn.classList.remove("visible");
  }
});
scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// 初期化
async function init() {
  try {
    const sns = await fetchJSON('./sns.json');
    renderList('sns-list', sns, true);
    const news = await fetchJSON('./news.json');
    renderList('news-list', news, false, true);
    const sites = await fetchJSON('./sites.json');
    renderList('site-list', sites);
  } catch (e) {
    console.error(e);
  }
}

init();
