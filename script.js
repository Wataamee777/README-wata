async function loadProfile() {
  // Discordプロフィール
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

  // アイコン
  document.getElementById('avatar').src = profile.avatar;

  // 名前
  document.getElementById('global_name').textContent =
    profile.global_name || profile.username;
  document.getElementById('username').textContent = profile.username;

  // リンクデータ
  const resLinks = await fetch('list.json');
  const links = await resLinks.json();

  // ─────────────────────────────────
  // SNSリンク（open_in_new 固定）
  // ─────────────────────────────────
  const snsContainer = document.getElementById('sns-links');
  links.sns.forEach(s => {
    const text = document.createElement('span');
    text.textContent = s.name;

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined link-icon';
    icon.textContent = 'open_in_new';

    a.appendChild(text);
    a.appendChild(icon);
    
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.className = 'btn';
    snsContainer.appendChild(a);
  });

  // ─────────────────────────────────
  // ゲーマータグ（コピー）
  // ─────────────────────────────────
  const tagContainer = document.getElementById('gamer-tags');

  links.games.forEach(t => {
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined copy-icon';
    icon.textContent = 'content_copy';

    const btn = document.createElement('button');
    btn.className = 'btn copy-btn';

    const label = document.createElement('span');
    label.textContent = `${t.name}: ${t.tag}`;

    btn.onclick = () => {
      navigator.clipboard.writeText(t.tag).then(() => {
        icon.textContent = 'check';
        setTimeout(() => (icon.textContent = 'content_copy'), 800);
      });
    };

    btn.appendChild(label);
    btn.appendChild(icon);
    tagContainer.appendChild(btn);
  });

  // ─────────────────────────────────
  // サイトリンク（open_in_new 固定）
  // ─────────────────────────────────
  const siteContainer = document.getElementById('site-links');
  links.sites.forEach(s => {
    const text = document.createElement('span');
    text.textContent = s.name;

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined link-icon';
    icon.textContent = 'open_in_new';

    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.className = 'btn';

    a.appendChild(text);
    a.appendChild(icon);
    siteContainer.appendChild(a);
  });
}

loadProfile();
