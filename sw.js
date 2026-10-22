const CACHE='v1792627999';
const STATIC=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png','icons/favicon-32.png','icons/og.png','favicon.ico'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x))))) ;self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url); if(u.origin!==location.origin)return;           // same-origin only
  const page=r.mode==='navigate'||/\/data\/|\.html$|\/$/.test(u.pathname);
  if(page){                                                               // network-first, cache fallback (offline)
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok){const cl=res.clone();caches.open(CACHE).then(c=>c.put(r,cl))}return res}).catch(()=>caches.match(r)));
  } else {                                                                // cache-first static
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cl=res.clone();caches.open(CACHE).then(c=>c.put(r,cl))}return res})));
  }
});
