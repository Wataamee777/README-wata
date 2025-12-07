async function loadProfile() {
  // ────────── Discordプロフィール ──────────
  const resProfile = await fetch('profile.json');
  const profile = await resProfile.json();

  // ---------------------------------------
  // バナー or バナー色 → グラデ背景作成
  // ---------------------------------------

  if (profile.banner) {
    // バナー画像がある → 画像をぼかしてグラデに合わせる
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
    // バナー色のままだと単色で地味 → アクセント色を自動生成

    const base = profile.banner_color;
    const accent = generateAccentColor(base);

    document.body.style.background = `
      linear-gradient(135deg, ${base}, ${accent})
    `;
  }

  // アイコン & 名前
  document.getElementById('avatar').src = profile.avatar;
  document.getElementById('global_name').textContent =
    profile.global_name || profile.username;
  document.getElementById('username').textContent = profile.username;

  // ────────── リンクデータ読み込み ──────────
  const resLinks = await fetch('list.json');
  const links = await resLinks.json();


  // ---------------------------------------------------------
  //  SNSリンク（アイコン → テキスト）
  // ---------------------------------------------------------
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

    a.appendChild(icon);  // ← アイコン先
    a.appendChild(text);  // ← テキスト後
    snsContainer.appendChild(a);
  });


  // ---------------------------------------------------------
  //  ゲーマータグ（コピー）アイコン → テキスト
  // ---------------------------------------------------------
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

    btn.appendChild(icon);  // ← アイコン先
    btn.appendChild(label); // ← テキスト後
    tagContainer.appendChild(btn);
  });


  // ---------------------------------------------------------
  //  サイトリンク（アイコン → テキスト）
  // ---------------------------------------------------------
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

let lastTap = 0;
const linuxCard = document.getElementById("linux-card");
const overlay = document.getElementById("nyan-overlay");
const nyanAudio = document.getElementById("nyan-audio");

linuxCard.addEventListener("click", () => {
  const now = Date.now();

  // ダブルタップ判定（400ms以内）
  if (now - lastTap < 400) {
    overlay.classList.add("show");

    nyanAudio.pause();
    nyanAudio.currentTime = 0;
    nyanAudio.play();

    // 3秒で自動消える（ここ調整可）
    setTimeout(() => {
      overlay.classList.remove("show");
      nyanAudio.pause();
    }, 30000);
  }

  lastTap = now;
});

// オーバーレイクリックで閉じる
overlay.addEventListener("click", () => {
  overlay.classList.remove("show");
  nyanAudio.pause();
});
let pressCount = 0;
let konamiMode = false;

document.getElementById("gamertag-btn").addEventListener("click", () => {
  pressCount++;
  if (pressCount >= 5) {
    konamiMode = true;
    pressCount = 0;
    console.log("Konami mode ON");
    // スマホはキーボードON（任意で）
  }
});
// コナミコード: ↑↑↓↓←→←→BA
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
function showCoinOverlay() {
  const overlay = document.getElementById("coin-overlay");
  const img = document.getElementById("coin-img");

  img.src = "assets/coin1.gif"; // 最初のコイン
  overlay.style.display = "flex";

  const handler = () => {
    img.src = "assets/coin2.gif"; // 2回目のコイン
    img.removeEventListener("click", handler);

    // coin2が終わったら閉じる（任意で）
    setTimeout(() => {
      overlay.style.display = "none";
    }, 1200); // GIF 長さに合わせて調整
  };

  img.addEventListener("click", handler);
}
