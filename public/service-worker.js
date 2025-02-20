const CACHE_NAME = "task-app-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/styles.css",
    "/main.js",
    "/icons/icon192x192.png",
    "/icon/icon512x512.png"
];

self.addEventListener("install", (event) =>{
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>{
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", (event) =>{
    event.respondWith(
        caches.match(event.request).then((response) =>{
            return response  || fetch(event.request);
        })
    );
});

self.addEventListener("activate", (event) =>{
    event.waitUntil(
        caches.keys().then((cacheNames) =>{
            return Promise.all(
                cacheNames.map((cache)=>{
                    if (cache !== CACHE_NAME){
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});