function typewriterEffect(element, text, delay = 100) {
  let i = 0;
  element.textContent = '';
  const timer = setInterval(() => {
    element.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(timer);
  }, delay);
}

document.addEventListener('DOMContentLoaded', () => {
  const typewriterElem = document.getElementById('typewriter');
  const text = 'Hello world from discord!!'; // 好きな文に変えてOK
  typewriterEffect(typewriterElem, text, 120);
});

const darkModeToggle = document.getElementById('darkModeToggle');

(function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('dark');
    }
  }
})();

darkModeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});

const scrollBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  scrollBtn.style.display = window.scrollY > 200 ? 'block' : 'none';
});

scrollBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
  
function darkModeToggleClick(e) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');

  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  e.currentTarget.appendChild(ripple);

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

function loadJSON(id, url, formatter) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById(id);
      data.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = formatter(item);
        container.appendChild(li);
      });
    })
    .catch(e => console.error(`${id} 読み込み失敗`, e));
}
  
loadJSON(     
  'sns-list',     
  './sns.json',     
item => `${item.emoji} <strong>${item.service}</strong>: <code>${item.id}</code> <button data-copy="${item.copy}">コピー</button>`
  );    
 // loadJSONの中で作るボタンはクリック時イベントつけられないから
// 親ulにイベント委譲する方法がオススメ

document.getElementById('sns-list').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const text = e.target.getAttribute('data-copy');
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => alert('コピーしたよ！'))
        .catch(() => alert('コピー失敗…'));
    }
  }
});

loadJSON(
  'site-list',
  './sites.json',
  item => `${item.emoji} <a href="${item.url}" target="_blank">${item.name}</a>`
);

loadJSON(
  'news-list',
  './news.json',
  item => `${item.emoji} ${item.date} - ${item.text}`
);

function copy(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('コピーしたよ！');
  });
}
window.copy = copy; // ← これでグローバル化
  
function fetchDiscordProfile() {
  const defaultAvatarUrl = "https://cdn.discordapp.com/avatars/1099098129338466385/77e7e6a9bf6d886ebb971fcdc5ec92b6.webp?size=1024";
  const avatarElem = document.getElementById('discord-avatar');

  // 先に固定画像を表示
  avatarElem.src = defaultAvatarUrl;

  const url = 'https://discord-profile-get-api.onrender.com/profile/1099098129338466385';

  setTimeout(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // 取得できたら置き換え（nullや空文字はスキップ）
        if (data.avatar && data.avatar.trim() !== "") {
          avatarElem.src = data.avatar;
        }

        document.getElementById('discord-name').textContent = `👤 ${data.tag}`;

        const statusMap = {
          online: '🟢',
          idle: '🌙',
          dnd: '⛔',
          offline: '🔘',
        };
        const statusEmoji = statusMap[data.status] || '❔';
        document.getElementById('discord-status').textContent = `${statusEmoji} ステータス: ${data.status || '不明'}`;

        if (data.activities && data.activities.length > 0) {
          const custom = data.activities.find(a => a.type === 4);
          if (custom && custom.state) {
            document.getElementById('discord-custom').textContent = `📝 ${custom.state}`;
          }
        }

        const badgeMap = {
          HypeSquadOnlineHouse1: 'https://i.gyazo.com/19661645162acb9fa05d9384a389928c.png',
          HypeSquadOnlineHouse2: 'https://i.gyazo.com/100b90bfd43f22b79c6a6d1bc08ab644.png',
          HypeSquadOnlineHouse3: 'https://i.gyazo.com/75713edd61aaad8400e30b2e1d6bb60b.png',
          ActiveDeveloper: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Discord_Active_Developer_Badge.svg',
        };

        const badgeContainer = document.getElementById('discord-badges');
        badgeContainer.innerHTML = '';
        if (data.flags && data.flags.length > 0) {
          data.flags.forEach(flag => {
            if (badgeMap[flag]) {
              const img = document.createElement('img');
              img.src = badgeMap[flag];
              img.alt = flag;
              img.title = flag;
              img.style.height = '24px';
              img.style.marginRight = '6px';
              badgeContainer.appendChild(img);
            }
          });
        }

        if (data.createdAt) {
          const date = new Date(data.createdAt);
          const jstDate = date.toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          document.getElementById('discord-createdat').textContent = `⏳ アカウント作成日: ${jstDate}`;
        }
      })
      .catch(err => {
        console.error('Discord取得失敗:', err);
        document.getElementById('discord-name').textContent = '❌ Discord取得失敗';
      });
  }, 15000);
}

fetchDiscordProfile();

function triggerEasterEgg() {
  const audio = new Audio('assets/youareanidiot.mp3');
  audio.play();
  alert('💥 YOU ARE AN IDIOT 💥');
}
window.triggerEasterEgg = triggerEasterEgg;

const fadeElems = document.querySelectorAll('.fade-in-scroll');
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-active');
    }
  });
});
fadeElems.forEach(elem => fadeObserver.observe(elem));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log('✅ Service Worker 登録成功'))
    .catch(err => console.warn('❌ SW登録失敗', err));
}
});
