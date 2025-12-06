async function loadProfile() {
  // Discordプロフィール
  const resProfile = await fetch('profile.json');
  const profile = await resProfile.json();

    if (profile.banner) {
      document.body.style.backgroundImage = `url(${profile.banner})`;
      document.body.style.backgroundColor = '';
    } else if (profile.banner_color) {
      document.body.style.backgroundColor = `${profile.banner_color}`;
      document.body.style.backgroundImage = 'none';
    }
  
  // アイコン
  const avatarEl = document.getElementById('avatar');
  avatarEl.src = profile.avatar;

  // ユーザー名
  document.getElementById('global_name').textContent = profile.global_name || profile.username;
  document.getElementById('username').textContent = profile.username;

  // SNS / ゲームタグ / サイト集
  const resLinks = await fetch('list.json');
  const links = await resLinks.json();

  // SNSリンク
  const snsContainer = document.getElementById('sns-links');
  links.sns.forEach(s => {
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.className = 'btn';
    a.textContent = s.name;
    snsContainer.appendChild(a);
    
    const br = document.createElement('br');
    snsContainer.appendChild(br);
  });

  // ゲームタグ（クリックでコピー）
  const tagContainer = document.getElementById('gamer-tags');
  links.games.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = `${t.name}: ${t.tag}`;
    btn.onclick = () => {
      navigator.clipboard.writeText(t.tag).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = `${t.name}: ${t.tag}`, 1000);
      });
    };
    tagContainer.appendChild(btn);
  });

  // サイト集
  const siteContainer = document.getElementById('site-links');
  links.sites.forEach(s => {
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.className = 'btn';
    a.textContent = s.name;
    siteContainer.appendChild(a);
  });
}

loadProfile();
