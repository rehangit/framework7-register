const SW_VERSION = '1.0';
console.log('Hello from service-worker.js');
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './css',
        './fonts',
        './static/images',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return (
        resp ||
        fetch(event.request)
          .then((response) => {
            let responseClone = response.clone();
            caches.open(SW_VERSION).then((cache) => {
              cache.put(event.request, responseClone);
            });

            return response;
          })
          .catch(() => {
            return caches.match('./static/iamges/favicon-196.png');
          })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  var cacheKeeplist = [SW_VERSION];

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (cacheKeeplist.indexOf(key) === -1) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
