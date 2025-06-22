self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installed');
  self.skipWaiting(); // 即反映
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
});

self.addEventListener('fetch', (event) => {
  // キャッシュ処理は今はなしで最低限
});
