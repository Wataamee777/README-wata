async function loadProfile() {
  // ────────── Discordプロフィール ──────────
  const resProfile = await fetch('profile.json');
  const profile = await resProfile.json();

  // 背景
  if (profile.banner) {
    document.body.style.backgroundImage = `url(${profile.banner})`;
    document.body.style.backgroundColor = '';
  } else if (profile.banner_color) {
    document.body.style.backgroundColor = profile.banner_color;
    document.body.style.backgroundImage = 'none';
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
