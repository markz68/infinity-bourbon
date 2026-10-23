/* v1.3.5: network-first same-origin updates, offline fallback. */
const CACHE='infinity-bourbon-static-v1-3-5';
const PREFIX='infinity-bourbon-static-';
const ASSETS=['./','./index.html','./styles.css','./app.js','./drive-sync.js','./drive-config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(request,{cache:'no-cache'});
   if(response.ok)await cache.put(request,response.clone());
   return response;
  }catch(error){
   const cached=await cache.match(request,{ignoreSearch:request.mode==='navigate'});
   if(cached)return cached;
   if(request.mode==='navigate'){
    const fallback=await cache.match('./index.html');
    if(fallback)return fallback;
   }
   throw error;
  }
 })());
});
