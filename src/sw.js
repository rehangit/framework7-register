console.log('Hello from service-worker.js');

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(VERSION).then((cache) => {
//       return cache.addAll([
//         // './',
//         // './index.html',
//         './manifest.json',
//         './css',
//         './fonts',
//         './static/images',
//       ]);
//     })
//   );
// });

self.addEventListener('fetch', (event) => {
  // const fetchAndCache = (event) =>
  //   fetch(event.request)
  //     .then((response) => {
  //       let responseClone = response.clone();
  //       caches
  //         .open(VERSION)
  //         .then((cache) => {
  //           console.log('[sw]: writing to cache', { cache, event });
  //           cache.put(event.request, responseClone);
  //         })
  //         .catch(console.error);

  //       return response;
  //     })
  //     .catch(() => {
  //       return caches.match('./static/iamges/favicon-196.png');
  //     });

  // event.respondWith(
  //   event.request.url.indexOf('http') === 0 &&
  //     caches
  //       .match(event.request)
  //       .then((resp) => resp || fetchAndCache(event))
  //       .catch((err) => {
  //         console.error('SW: fetch had a cache miss', err);
  //         return fetch(event.request);
  //       })
  // );

  event.respondWith(fetch(event.request));
});

// self.addEventListener('activate', (event) => {
//   var cacheKeeplist = [VERSION];

//   event.waitUntil(
//     caches.keys().then((keyList) => {
//       return Promise.all(
//         keyList.map((key) => {
//           if (cacheKeeplist.indexOf(key) === -1) {
//             return caches.delete(key);
//           }
//         })
//       );
//     })
//   );
// });
