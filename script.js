function playSound() {
    const audio = document.getElementById("Yukkurisiteittene");
    audio.currentTime = 0; // 連打でも最初から再生
    audio.play();
  }

function copy(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`${text} をコピーしました！`);
  });
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
