console.log("JS alive 1");
document.addEventListener("DOMContentLoaded", async () => {
console.log("JS alive 2");

  // ──────────────── プロフィール読み込み ────────────────
  async function loadProfile() {

    const resProfile = await fetch('profile.json');
    const profile = await resProfile.json();

    // ───────────────────────────────
    // 背景（バナー or バナー色 → グラデ生成）
    // ───────────────────────────────
    if (profile.banner) {
      document.body.style.background = `
        linear-gradient(
          135deg,
          rgba(0,0,0,0.6) 0%,
          rgba(0,0,0,0.4) 40%,
          rgba(0,0,0,0.6) 100%
        ),
        url(${profile.banner})
      `;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";

    } else if (profile.banner_color) {
      const base = profile.banner_color;
      const accent = generateAccentColor(base);

      document.body.style.background = `
        linear-gradient(135deg, ${base}, ${accent})
      `;
    }

    // アイコンと名前
    document.getElementById('avatar').src = profile.avatar;
    document.getElementById('global_name').textContent =
      profile.global_name || profile.username;
    document.getElementById('username').textContent = profile.username;

    // ──────────────── リンクデータ読み込み ────────────────
    const resLinks = await fetch('list.json');
    const links = await resLinks.json();


    // ───────────────── SNSリンク生成 ─────────────────
    const snsContainer = document.getElementById('sns-links');
    links.sns.forEach(s => {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.className = 'btn';

      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined link-icon';
      icon.textContent = 'open_in_new';

      const text = document.createElement('span');
      text.textContent = s.name;

      a.appendChild(icon);
      a.appendChild(text);
      snsContainer.appendChild(a);
    });


    // ──────────────── ゲーマータグ（コピー） ────────────────
    const tagContainer = document.getElementById('gamer-tags');

    links.games.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'btn copy-btn';

      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined copy-icon';
      icon.textContent = 'content_copy';

      const label = document.createElement('span');
      label.textContent = `${t.name}: ${t.tag}`;

      btn.onclick = () => {
        navigator.clipboard.writeText(t.tag).then(() => {
          icon.textContent = 'check';
          setTimeout(() => (icon.textContent = 'content_copy'), 800);
        });
      };

      btn.appendChild(icon);
      btn.appendChild(label);
      tagContainer.appendChild(btn);
    });


    // ──────────────── サイトリンク ────────────────
    const siteContainer = document.getElementById('site-links');
    links.sites.forEach(s => {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.className = 'btn';

      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined link-icon';
      icon.textContent = 'open_in_new';

      const text = document.createElement('span');
      text.textContent = s.name;

      a.appendChild(icon);
      a.appendChild(text);
      siteContainer.appendChild(a);
    });
  }

  loadProfile();


  // ──────────────── Linuxカード（NyanCat） ────────────────
  let lastTap = 0;
  const linuxCard = document.getElementById("linux-card");
  const overlay = document.getElementById("nyan-overlay");
  const nyanAudio = document.getElementById("nyan-audio");

  linuxCard.addEventListener("click", () => {
    const now = Date.now();

    if (now - lastTap < 400) {
      overlay.classList.add("show");

      nyanAudio.pause();
      nyanAudio.currentTime = 0;
      nyanAudio.play();

      setTimeout(() => {
        overlay.classList.remove("show");
        nyanAudio.pause();
      }, 30000); // 30秒
    }

    lastTap = now;
  });

  overlay.addEventListener("click", () => {
    overlay.classList.remove("show");
    nyanAudio.pause();
  });


  // ──────────────── コナミ&ボタン5連打 ────────────────
  let pressCount = 0;
  let konamiMode = false;

  document.getElementById("gamertag-btn").addEventListener("click", () => {
    pressCount++;
    if (pressCount >= 5) {
      konamiMode = true;
      pressCount = 0;
      console.log("Konami mode ON");
    }
  });

  const KONAMI = [38,38,40,40,37,39,37,39,66,65];
  let input = [];

  window.addEventListener("keydown", (e) => {
    if (!konamiMode) return;

    input.push(e.keyCode);
    if (input.length > KONAMI.length) {
      input.shift();
    }

    if (JSON.stringify(input) === JSON.stringify(KONAMI)) {
      showCoinOverlay();
      konamiMode = false;
      input = [];
    }
  });


  // ──────────────── コイン表示 ────────────────
  function showCoinOverlay() {
    const overlay = document.getElementById("coin-overlay");
    const img = document.getElementById("coin-img");

    img.src = "assets/coin1.gif";
    overlay.style.display = "flex";

    const handler = () => {
      img.src = "assets/coin2.gif";
      img.removeEventListener("click", handler);

      setTimeout(() => {
        overlay.style.display = "none";
      }, 1200);
    };

    img.addEventListener("click", handler);
  }
console.log("JS alive 3");
});
console.log("JS alive 4");
