// VERSION, ROUTES и STATIC_FILES подставляет app/sw.js/route.ts при сборке.
const CACHE = `mindful-${VERSION}`;
const ASSET_PATTERN =
  /(?:\/_next\/)?(static\/(?:chunks|css|media)\/[\w\-.~%@/]+\.(?:js|css|woff2?|ttf|otf|svg|png|jpe?g|webp|avif|ico))/g;

// Клиентские переходы Next запрашивают RSC-данные по тому же URL, что и страницу,
// только с заголовком RSC, поэтому они лежат в кэше под отдельным ключом.
const payloadKey = (path) => `${path}?__rsc`;

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

// skipWaiting нет намеренно: новая версия включается, когда приложение закрыли,
// иначе посреди сессии переход на следующий шаг перезагрузил бы страницу
// и сбросил состояние.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('mindful-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const path = url.pathname.replace(/(.)\/$/, '$1');
  const key = request.headers.has('RSC') ? payloadKey(path) : path;
  event.respondWith(respond(event, key));
});

async function respond(event, key) {
  const { request } = event;
  const cache = await caches.open(CACHE);
  const cached = await cache.match(key);
  if (cached) return cached;

  const response = await fetch(request);
  if (
    response.ok &&
    (request.mode === 'navigate' || key.startsWith('/_next/static/'))
  ) {
    event.waitUntil(cache.put(key, detach(response.clone())));
  }
  return response;
}

async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set(STATIC_FILES);

  await Promise.all(
    ROUTES.flatMap((route) => [
      store(cache, route, route, assets),
      store(cache, route, payloadKey(route), assets, { RSC: '1' }),
    ]),
  );

  const styles = [...assets].filter((path) => path.endsWith('.css'));
  await Promise.all(styles.map((path) => store(cache, path, path, assets)));

  const rest = [...assets].filter((path) => !path.endsWith('.css'));
  await Promise.all(rest.map((path) => store(cache, path, path)));
}

async function store(cache, url, key, assets, headers) {
  const response = await fetch(url, { cache: 'no-cache', headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);

  if (assets) {
    const text = await response.clone().text();
    for (const [, asset] of text.matchAll(ASSET_PATTERN)) {
      assets.add(`/_next/${asset}`);
    }
  }
  await cache.put(key, detach(response));
}

// Ответ после редиректа нельзя отдать на навигацию, поэтому копируем его без флага.
function detach(response) {
  if (!response.redirected) return response;
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
