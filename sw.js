const CACHE_NAME = 'wataamee-site-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/style.css',
  '/script.js',
  '/manifest.webmanifest',
  '/assets/favicon.png',
  '/assets/favicon.gif',
  '/assets/Yukkuri.png',
  '/assets/Niko.png',
  '/assets/Yukkurisiteittene.mp3',
  '/assets/bg-img.png',
  '/assets/cpulspuls.png',
  '/assets/css.png',
  '/assets/epic games.png',
  '/assets/fortnite.png',
  '/assets/minecraft.png',
  '/assets/pjsekai.png',
  '/assets/pokepoke.png',
  '/assets/qiita.png',
  '/assets/roblox.png',
    // 他にキャッシュしたいファイルがあればここに追加
];

// 🔹 Install：初回キャッシュ登録
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // 即時反映
});

// 🔹 Activate：古いキャッシュ削除
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] 削除:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🔹 Fetch：キャッシュ優先 or オフライン対応
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあればそれを返す
      if (response) return response;
      // なければネットワークに取りに行く
      return fetch(event.request).catch(() => {
        // ネットワークも失敗したときは offline.html を表示
        return caches.match('/offline.html');
      });
    })
  );
});
