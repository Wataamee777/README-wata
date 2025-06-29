const scrollTopBtn = document.getElementById("scrollTopBtn");

// スクロールしたらボタン表示
window.addEventListener("scroll", () => {
  if (document.documentElement.scrollTop > 200) {
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
});

// クリックでページトップへスムーズに移動
scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

function playSound() {
    const audio = document.getElementById("Yukkurisiteittene");
    audio.currentTime = 0; // 連打でも最初から再生
    audio.play();
  }

function toggleSites() {
  const siteList = document.getElementById("siteList");
  siteList.classList.toggle("hidden");
}
function KaihatuLanguage() {
  const KaihatuLanguageList = document.getElementById("KaihatuLanguageList");
  KaihatuLanguageList.classList.toggle("hidden");
}
let tapCount = 0;
const icon = document.getElementById("main-icon");
const secretMessage = document.getElementById("secret-message");

icon.addEventListener("click", () => {
  tapCount++;
  if (tapCount === 3) {
    // 3回目タップ時の処理
    icon.classList.add("glow-effect");
    secretMessage.classList.remove("hidden");

    // 5秒後に光りとメッセージを消す
    setTimeout(() => {
      icon.classList.remove("glow-effect");
      secretMessage.classList.add("hidden");
      tapCount = 0; // カウントリセット
    }, 5000);
  }
});
// GitHub Secrets から注入（ビルド時に置換される）
const allowedPassword = "${{ secrets.SECRET_PASS }}";
const secretUrls = [
  "${{ secrets.SECRET_URL_1 }}",
  "${{ secrets.SECRET_URL_2 }}",
  "${{ secrets.SECRET_URL_3 }}",
  "${{ secrets.SECRET_URL_4 }}",
  "${{ secrets.SECRET_URL_5 }}"
];

function requestSecretLink() {
  const input = prompt("パスワードを入力してください");

  if (input !== allowedPassword) {
    alert("パスワードが違います");
    return;
  }

  const randomUrl = secretUrls[Math.floor(Math.random() * secretUrls.length)];
  const secretContainer = document.getElementById("secret-container");
  const secretUrl = document.getElementById("secret-url");

  secretUrl.textContent = randomUrl;
  secretContainer.classList.add("active");

  navigator.clipboard.writeText(randomUrl).then(() => {
    alert("URLをコピーしました！");
  });
}
function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.className = 'toast-notification';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function copy(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${text} をコピーしました！`);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const visitEl = document.getElementById('visitTimes');
  if (!visitEl) return; // 要素がないなら何もしない

  let visits = localStorage.getItem('visitCount');
  visits = visits ? parseInt(visits) + 1 : 1;
  localStorage.setItem('visitCount', visits);
  visitEl.textContent = visits;
});
