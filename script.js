document.addEventListener("DOMContentLoaded", async () => {

  // ──────────────── プロフィール読み込み ────────────────
  async function loadProfile() {

    const resProfile = await fetch('profile.json');
    const profile = await resProfile.json();

// ───────────────────────────────
// 背景（バナー or バナー + アクセント）
// ───────────────────────────────
if (profile.banner) {
  // バナー画像 → そのまま背景に
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

} else if (profile.banner_color && profile.accent_color) {
  // JSON に accent_color が存在する → それを使う
  document.body.style.background = `
    linear-gradient(135deg, ${profile.banner_color}, #111)
  `;
} else if (profile.banner_color) {
  // 念のため fallback：単色
  document.body.style.background = profile.banner_color;
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

  function checkSecretTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // 12時57分（午前・午後どちらでも）に限定
    if (minutes === 57 && (hours === 12 || hours === 0 || hours === 12 + 12)) {
        
        // --- 1. ネオンカラーをディープパープルに変更する ---
        const neonStyle = `
            body {
                /* 背景の雰囲気を少し暗くしても良い */
                transition: background-color 1s;
                background-color: #0d001a !important; 
            }
            /* サイトのネオン要素やハイライト部分のCSS変数を変更 */
            :root {
                --neon-glow-color: #ff00ff !important; /* マゼンタ */
                --neon-text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff !important;
            }
            .neon-text {
                color: var(--neon-glow-color) !important;
                text-shadow: var(--neon-text-shadow);
            }
        `;
        
        // スタイルタグをHTMLに追加してCSSを上書き
        const styleEl = document.createElement('style');
        styleEl.id = 'secret-time-style';
        styleEl.textContent = neonStyle;
        document.head.appendChild(styleEl);

        // --- 2. 秘密のメッセージをコンソールに出力（おまけ） ---
        console.log(
            "%c[SYSTEM ALERT]  ７７７！！.",
            "font-size: 18px; color: #ff00ff; font-weight: bold;"
        );

    } else {
        // 58分になったら元に戻すための処理（スタイルタグを削除）
        const secretStyle = document.getElementById('secret-time-style');
        if (secretStyle) {
            secretStyle.remove();
        }
    }
}

// 1分ごとに時刻をチェックする（パフォーマンスへの影響は極小です）
setInterval(checkSecretTime, 60000); 

// ページロード時にも一度チェック
checkSecretTime();

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
  
    const shareButton = document.getElementById('shareButton');

    // Web Share APIがブラウザで利用可能かチェック
    if (navigator.share) {
        shareButton.addEventListener('click', async () => {
          alert("ボタン押されたよ！");
            try {
                // 共有する内容を定義
                await navigator.share({
                    // 現在のページのタイトル (省略可)
                    title: document.title, 
                    
                    // 共有したいテキストメッセージ
                    text: 'わたあめえの自己紹介!!', 
                    
                    // 共有したいURL (現在のページのURL)
                    url: window.location.href 
                });
                console.log('共有に成功しました。');
            } catch (error) {
                // ユーザーが共有をキャンセルした場合や、エラーが発生した場合
                console.error('共有エラー:', error);
            }
        });
    } else {
        // Web Share API に非対応のブラウザ向け
        shareButton.textContent = '共有機能は非対応です';
        shareButton.disabled = true;
        // または、従来のTwitter/Facebookボタンなどを代わりに表示する処理
        console.log('Web Share API はこのブラウザでサポートされていません。');
    }
});
