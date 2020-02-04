var VERSION = '2020-2-4 15:07:19';
var CACHE_NAME_PREFIX = "congzhou-blog-cache-",
  CACHE_NAME = CACHE_NAME_PREFIX + VERSION;
var urlsToCache = [
  "/",
  "tiger.ico",
  "img/brand.jpg",
  "img/avatar.jpg",
  "css/style.css",
  "css/fonts/fontawesome/fontawesome-webfont.woff2",
  "css/fonts/roboto/Roboto-Medium.woff2",
  "css/fonts/roboto/Roboto-Regular.woff2",
  "js/main.min.js",
  "js/search.min.js",
  "js/busuanzi.pure.min.js",
  "js/waves.min.js",
  "archives/",
  "tags/",
  "categories/",
  "categories/handbook/",
  "categories/practice/",
  "categories/knowledge/",
  "/page/2/",
  "/page/3/"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log("cache opened");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName.indexOf(CACHE_NAME_PREFIX) >= 0
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    //此方法查看请求，并从ServiceWorker缓存中查找已缓存结果
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      var fetchRequest = event.request.clone();
      var isArticleUrl = event.request.url.match(/[\w%]*.(html|png|jpg)/);

      //文章资源动态添加到缓存
      return fetch(fetchRequest).then(secondResponse => {
        if (isArticleUrl) {
          var responseToCache = secondResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return secondResponse;
      });
    })
  );
});
