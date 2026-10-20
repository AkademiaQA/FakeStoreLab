const main = document.querySelector('#main');
const origin = location.origin;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const pretty = value => JSON.stringify(value, null, 2);
const product = { title: 'Northstar Air 14', price: 3499, description: 'Laptop 14" IPS 1920x1200, AMD Ryzen 5 7530U, 16 GB RAM, SSD 512 GB, Windows 11 Home. Aluminiowa obudowa, masa 1,4 kg.', category: 'laptops', image: '/images/product-0.svg' };
const examples = {
  products: product,
  users: { username: 'anna.kowalska', email: 'anna.kowalska@example.com', password: 'Kawa!Rano2026' },
  carts: { userId: 1, products: [{ ...product, id: 1 }] },
};
const labels = { products: 'Produkty', carts: 'Koszyki', users: 'Użytkownicy' };
const descriptions = { products: 'Katalog produktów, ceny i kategorie. Idealny punkt startowy do pierwszych testów.', carts: 'Koszyki powiązane z użytkownikami. Ćwicz zagnieżdżone obiekty i tablice.', users: 'Fikcyjne konta, dane logowania i profile. Poznaj walidację i uwierzytelnianie.' };
const methodBadge = method => `<span class="method ${method.toLowerCase()}">${method}</span>`;
let toastTimer;
function toast(message) {
  const node = document.querySelector('#toast');
  node.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.textContent = ''; }, 4000);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Skopiowano do schowka.'); }
  catch (error) { console.error('Clipboard error:', error); toast('Nie można skopiować. Zaznacz tekst i skopiuj go ręcznie.'); }
}
function syntax(value) {
  return escape(pretty(value)).replace(/(&quot;.*?&quot;)(\s*:)?|\b(\d+(?:\.\d+)?)\b/g, (match, string, colon, number) => {
    if (string) return `<span class="${colon ? 'syntax-key' : 'syntax-string'}">${string}</span>${colon ?? ''}`;
    return `<span class="syntax-number">${number}</span>`;
  });
}
function playgroundLink(method, path, body) {
  const params = new URLSearchParams({ method, path });
  if (body) params.set('body', pretty(body));
  return `/playground?${params}`;
}
function snippet(language, method = 'GET', path = '/products?limit=2', body, token = '') {
  if (language === 'curl') return `curl -X ${method} '${origin}${path}'${method === 'DELETE' ? ` \\\n  -H 'Authorization: Bearer ${(token || '<TOKEN_Z_LOGOWANIA>').replaceAll("'", "'\\''")}'` : ''}${body ? ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${pretty(body).replaceAll("'", "'\\''")}'` : ''}`;
  if (language === 'python') return `import requests\n\nresponse = requests.${method.toLowerCase()}(\n    "${origin}${path}"${body ? `,\n    json=${pretty(body)}` : ''}\n)\nprint(response.status_code)\nif response.status_code != 204:\n    print(response.json())`;
  return `const response = await fetch(\n  '${origin}${path}'${method !== 'GET' ? `,\n  {\n    method: '${method}'${body ? `,\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(${pretty(body).replaceAll('\n', '\n    ')})` : ''}\n  }` : ''}\n);\nif (response.status !== 204) {\n  const data = await response.json();\n  console.log(data);\n}`;
}

function home() {
  main.innerHTML = `<div class="container">
    <section class="hero">
      <div class="hero-copy"><span class="eyebrow">Twoje środowisko do nauki API</span>
        <h1>Prawdziwe API.<br>Fikcyjne dane.<br><span class="highlight">Zero ryzyka.</span></h1>
        <p>Buduj, testuj i eksperymentuj z REST API. Produkty, koszyki i użytkownicy — gotowe do użycia, bez konfiguracji i bez bazy danych.</p>
        <div class="actions"><a class="btn accent" href="/docs">Zacznij testować <span>→</span></a><a class="btn secondary" href="/playground">Otwórz playground ↗</a></div>
        <p class="hero-note">✓ Bez klucza API &nbsp; ✓ Bez rejestracji &nbsp; ✓ Zawsze za darmo</p>
      </div>
      <div class="hero-demo"><div class="terminal">
        <div class="terminal-head"><div class="terminal-dots"><i></i><i></i><i></i></div><span>TWÓJ PIERWSZY REQUEST</span><span>REST / JSON</span></div>
        <div class="terminal-body"><div class="request-line">${methodBadge('GET')}<span>/products/1</span></div><div class="code-rule"></div><pre id="hero-json">${syntax({ id: 1, title: product.title, price: product.price, category: product.category })}</pre></div>
        <div class="terminal-bottom"><span id="hero-status">PRZYKŁADOWA ODPOWIEDŹ</span><span>application/json</span></div>
      </div><div class="live-note"><span class="status-dot"></span> Prawdziwy endpoint. Prawdziwa odpowiedź. Spróbuj sam.</div></div>
    </section>
    <div class="stats"><div class="stat"><strong>3</strong><span>Gotowe zasoby</span></div><div class="stat"><strong>5</strong><span>Metod HTTP</span></div><div class="stat"><strong>100%</strong><span>Stateless · bez zapisu</span></div><div class="stat"><strong>∞</strong><span>Możliwości nauki</span></div></div>
    <section class="section"><div class="section-title"><div><h2>Mały sklep. Duże możliwości.</h2><p>Wszystko, czego potrzebujesz, żeby zrozumieć, jak działa API.</p></div><a class="text-link" href="/docs#resources">Wszystkie endpointy ↗</a></div>
      <div class="resource-grid">${Object.entries(labels).map(([resource, label], index) => `<a class="resource-card" href="/docs#${resource}"><div class="resource-icon" aria-hidden="true">${['▧', '⌑', '♙'][index]}</div><span class="card-index">0${index + 1} / RESOURCE</span><h3>${label}</h3><p>${descriptions[resource]}</p><div class="mini-methods">${['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(methodBadge).join('')}</div><div class="resource-card-bottom"><code>/${resource}</code><span>↗</span></div></a>`).join('')}</div>
    </section>
    <section class="learning-grid"><div><span class="eyebrow">Mniej teorii. Więcej praktyki.</span><h2 class="learning-title">Od pierwszego GET<br>do pełnego CRUD.</h2><p>Nie musisz stawiać backendu, żeby nauczyć się go testować.</p><div class="steps"><div class="step"><div><h3>Wybierz swój zasób</h3><p>Produkty, użytkownicy lub koszyki. Dane już na Ciebie czekają.</p></div></div><div class="step"><div><h3>Wyślij żądanie</h3><p>Użyj playgroundu, Postmana, curl lub własnego kodu.</p></div></div><div class="step"><div><h3>Sprawdź odpowiedź</h3><p>Testuj statusy, nagłówki, walidację i strukturę JSON.</p></div></div></div></div>
    <div><div class="example-card"><div class="panel-head"><h3>Tak proste, jak fetch()</h3><button class="copy-btn" id="copy-example">Kopiuj</button></div><div class="code-tabs" id="home-tabs"><button class="active" data-lang="javascript">JavaScript</button><button data-lang="curl">cURL</button><button data-lang="python">Python</button></div><div class="example-content"><pre id="home-code"></pre></div><div class="panel-foot">Żadnych zależności. Tylko Ty i API.</div></div><div class="info-box"><strong>Symulacja, nie baza danych.</strong>POST zwraca nowe ID, PUT zastępuje, PATCH scala, a DELETE symuluje usunięcie. Kolejny GET? Zawsze te same dane startowe.</div></div></section>
    <section class="cta"><div><h2>Najlepiej uczysz się, robiąc.</h2><p>Wyślij pierwsze żądanie. Niczego tu nie zepsujesz.</p></div><a class="btn accent" href="/playground">Przejdź do playgroundu ↗</a></section>
  </div>`;
  let language = 'javascript';
  document.querySelector('#home-code').textContent = snippet(language);
  document.querySelector('#home-tabs').addEventListener('click', event => {
    if (!event.target.dataset.lang) return;
    language = event.target.dataset.lang;
    document.querySelectorAll('#home-tabs button').forEach(button => button.classList.toggle('active', button === event.target));
    document.querySelector('#home-code').textContent = snippet(language);
  });
  document.querySelector('#copy-example').onclick = () => copy(snippet(language));
  const start = performance.now();
  fetch('/products/1').then(async response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    document.querySelector('#hero-json').innerHTML = syntax(await response.json());
    document.querySelector('#hero-status').textContent = `200 OK · ${Math.round(performance.now() - start)} ms`;
  }).catch(error => {
    console.error('Hero request failed:', error);
    document.querySelector('#hero-status').textContent = 'BŁĄD POŁĄCZENIA · POKAZANO PRZYKŁAD';
  });
}

const queryRows = [
  ['q', 'string', 'Wyszukiwanie tekstu we wszystkich polach, bez rozróżniania wielkości liter.'],
  ['limit', '1–100', 'Rozmiar strony. Domyślnie 10.'],
  ['page', 'integer ≥ 1', 'Numer strony (od 1). Łącz z limit.'],
  ['offset', 'integer ≥ 0', 'Liczba pominiętych rekordów. Nie łącz z page.'],
  ['sort', 'asc / desc', 'Kierunek sortowania. Domyślnie asc.'],
  ['sortBy', 'string', 'Pole sortowania, np. id, title, price, username. Domyślnie id.'],
  ['category', 'string', 'Produkty: dokładna nazwa kategorii (bez rozróżniania wielkości liter).'],
  ['minPrice / maxPrice', 'number ≥ 0', 'Produkty: dolna i górna cena, włącznie z granicami.'],
  ['username / email', 'string', 'Użytkownicy: dokładne dopasowanie (bez rozróżniania wielkości liter).'],
  ['userId', 'integer ≥ 1', 'Koszyki: ID właściciela.'],
];
function operation(resource, method, single) {
  const path = `/${resource}${single ? '/1' : ''}`;
  const displayPath = `/${resource}${single ? '/{id}' : ''}`;
  const names = { GET: single ? 'Pobierz jeden zasób' : 'Pobierz listę', POST: 'Utwórz · symulacja', PUT: 'Zastąp · pełny obiekt', PATCH: 'Zmień wybrane pola', DELETE: 'Usuń · wymagany Bearer JWT' };
  const body = ['POST', 'PUT'].includes(method) ? examples[resource] : method === 'PATCH' ? resource === 'products' ? { price: 3299 } : resource === 'users' ? { username: 'anna.nowak' } : { userId: 2 } : undefined;
  return `<details class="endpoint"><summary>${methodBadge(method)}<code>${displayPath}</code><span class="endpoint-title">${names[method]}</span></summary><div class="endpoint-body"><p>${method === 'GET' ? single ? 'Zwraca obiekt o wskazanym ID. Brak zasobu: 404.' : 'Zwraca tablicę JSON. Domyślnie 10 rekordów. Użyj query params i nagłówków paginacji opisanych poniżej.' : method === 'PUT' ? 'Wymagane są wszystkie edytowalne pola. Zwraca nową reprezentację z ID z adresu, bez zmiany danych bazowych.' : method === 'PATCH' ? 'Przyjmuje co najmniej jedno edytowalne pole. Zwraca dane bazowe scalone z przesłanymi polami. Tablice są zastępowane w całości.' : method === 'POST' ? 'Zwraca 201, przesłane dane i nowe, losowe ID. Zasób nie zostaje zapisany — GET tego ID zwróci 404.' : 'Zwraca 204 No Content bez body dla istniejącego i nieistniejącego poprawnego ID, także przy powtórzeniu żądania. Nie wywołuj response.json(). Dane startowe pozostają bez zmian.'}</p><pre>${escape(snippet('curl', method, path, body))}</pre><div class="actions"><span class="mono">${method === 'DELETE' ? '204 No Content · bez body' : `${method === 'POST' ? '201 Created' : '200 OK'} · application/json`}</span><a class="btn secondary small" href="${escape(playgroundLink(method, path, body))}">Wypróbuj ↗</a></div></div></details>`;
}
function docs() {
  main.innerHTML = `<div class="container">
    <div class="page-heading"><span class="eyebrow">REST API · v1.0</span><h1>Dokumentacja API</h1><p>Wszystko, czego potrzebujesz do testowania. Tylko DELETE wymaga tokenu Bearer JWT. Bez konfiguracji i bez trwałych zmian.</p></div>
    <div class="docs-layout"><aside class="docs-sidebar" aria-label="Spis treści"><h3>Pierwsze kroki</h3><a href="#intro">Wprowadzenie</a><a href="#simulation">Jak działa symulacja</a><h3>Zasoby</h3>${Object.entries(labels).map(([key, label]) => `<a href="#${key}">${label}</a>`).join('')}<a href="#auth">Logowanie</a><h3>Podstawy</h3><a href="#query">Query params</a><a href="#schemas">Schematy danych</a><a href="#errors">Błędy i statusy</a><a href="#faq">Pytania i odpowiedzi</a></aside>
    <div class="docs-content"><section id="intro"><h2>Witaj w FakeStore Lab.</h2><p>Szkoleniowe API inspirowane FakeStoreAPI. Korzystaj z Postmana, curl, przeglądarki lub dowolnego klienta HTTP. Odpowiedzi z body mają format JSON; udany DELETE zwraca 204 No Content bez body. CORS jest włączony dla każdej domeny.</p><label class="field-label">Base URL</label><div class="base-url"><code>${escape(origin)}</code><button class="copy-btn" id="copy-base">Kopiuj</button></div><div class="info-box"><strong>Dane wyłącznie demonstracyjne</strong>24 produkty, 12 użytkowników i 10 koszyków. Konta i hasła są fikcyjne i celowo publiczne. Nie wysyłaj rzeczywistych danych osobowych ani prawdziwych haseł.</div></section>
    <section id="simulation"><h2>CRUD bez śladów.</h2><p>Każde żądanie jest niezależne. Nic nie zapisujemy — nawet tymczasowo w kolekcjach w pamięci. Nie da się wykonać sekwencji „POST → GET nowego zasobu”.</p><div class="table-wrap"><table><thead><tr><th>Metoda</th><th>Zachowanie</th><th>Status</th></tr></thead><tbody><tr><td>${methodBadge('GET')}</td><td>Odczytuje stałe dane demonstracyjne</td><td>200</td></tr><tr><td>${methodBadge('POST')}</td><td>Dane wejściowe + nowe losowe ID</td><td>201</td></tr><tr><td>${methodBadge('PUT')}</td><td>Pełne zastąpienie; wszystkie pola wymagane</td><td>200</td></tr><tr><td>${methodBadge('PATCH')}</td><td>Scalenie pól z danymi bazowymi</td><td>200</td></tr><tr><td>${methodBadge('DELETE')}</td><td>Wymaga tokenu; symuluje usunięcie, bez body</td><td>204 / 401</td></tr></tbody></table></div><p>Zapisy zwracają <code>X-Simulated: true</code>. ID w adresie ma pierwszeństwo nad ID w body. POST ignoruje ID wejściowe. PUT/PATCH wymagają istniejącego ID. Z poprawnym tokenem DELETE zwraca 204 dla każdego poprawnego ID, niezależnie od istnienia zasobu i liczby powtórzeń. Brak, błędny lub wygasły token: 401.</p></section>
    <div id="resources">${Object.entries(labels).map(([resource, label]) => `<section id="${resource}"><h2>${label} <code>/${resource}</code></h2><p>${descriptions[resource]}</p>${operation(resource, 'GET', false)}${operation(resource, 'GET', true)}${operation(resource, 'POST', false)}${operation(resource, 'PUT', true)}${operation(resource, 'PATCH', true)}${operation(resource, 'DELETE', true)}${resource === 'products' ? `<details class="endpoint"><summary>${methodBadge('GET')}<code>/products/categories</code></summary><div class="endpoint-body"><p>Lista nazw kategorii. Dodatkowo <code>/products/category/{category}</code> zwraca produkty wybranej kategorii z obsługą query params. Nazwę w ścieżce zakoduj za pomocą encodeURIComponent.</p><a class="btn secondary small" href="${escape(playgroundLink('GET', '/products/categories'))}">Pobierz kategorie ↗</a></div></details>` : ''}</section>`).join('')}</div>
    <section id="auth"><h2>Logowanie i autoryzacja DELETE</h2><p><code>POST /auth/login</code> zwraca podpisany token JWT ważny godzinę. Dane: <code>anna.kowalska / Kawa!Rano2026</code>. Błędne dane zwracają 401. Tylko DELETE na produktach, użytkownikach i koszykach wymaga nagłówka <code>Authorization: Bearer &lt;token&gt;</code>. Sprawdzamy podpis, datę wygaśnięcia i użytkownika. Brak, błędny lub wygasły token zwraca 401 z nagłówkiem WWW-Authenticate. GET, POST, PUT i PATCH pozostają publiczne. Nie ma sesji ani trwałego zapisu.</p><p>W playgroundzie wyślij żądanie „Logowanie” — token automatycznie trafi do pola Bearer token i będzie wysyłany tylko z DELETE. Możesz wkleić własny token albo wyczyścić pole, żeby przetestować 401. Token pozostaje w pamięci strony, nie w localStorage ani cookies. Bez konfiguracji JWT_SECRET restart serwera unieważnia tokeny; stały sekret pozwala współdzielić tokeny między replikami.</p><div class="inline-code"><pre>${escape(snippet('curl', 'POST', '/auth/login', { username: 'anna.kowalska', password: 'Kawa!Rano2026' }))}</pre></div><a class="btn secondary small" href="${escape(playgroundLink('POST', '/auth/login', { username: 'anna.kowalska', password: 'Kawa!Rano2026' }))}">Przetestuj logowanie ↗</a></section>
    <section id="query"><h2>Szukaj. Filtruj. Stronicuj.</h2><p>Parametry działają na listach i można je łączyć. Najpierw filtrowanie, potem sortowanie, na końcu paginacja. Nieznane, zduplikowane lub nieprawidłowe parametry zwracają 400.</p><div class="table-wrap"><table><thead><tr><th>Parametr</th><th>Typ</th><th>Działanie</th></tr></thead><tbody>${queryRows.map(row => `<tr>${row.map((cell, index) => `<td>${index === 0 ? `<code>${cell}</code>` : cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="inline-code"><pre>GET /products?q=laptop&amp;maxPrice=5000&amp;sortBy=price&amp;sort=desc&amp;page=1&amp;limit=5</pre></div><p>Odpowiedź to tablica, nie obiekt z polem data. Nagłówki <code>X-Total-Count</code> (liczba po filtrowaniu), <code>X-Limit</code> i <code>X-Offset</code> opisują paginację. Pusta strona zwraca <code>[]</code> i 200. Liczba stron: <code>Math.ceil(total / limit)</code>.</p><a class="btn secondary small" href="${escape(playgroundLink('GET', '/products?sortBy=price&sort=desc&page=2&limit=5'))}">Wypróbuj paginację ↗</a></section>
    <section id="schemas"><h2>Struktury danych</h2><p>POST i PUT wymagają wszystkich pól pokazanych poniżej, z wyjątkiem id. PATCH przyjmuje dowolny niepusty podzbiór pól. Nieznane pola są odrzucane. Koszyk zawiera pełne obiekty produktów zgodnie z dostarczoną specyfikacją, a nie pary productId/quantity.</p>${Object.entries(examples).map(([name, value]) => `<details class="endpoint schema-box"><summary><code>${labels[name]}</code></summary><pre>${escape(pretty({ id: 1, ...value }))}</pre></details>`).join('')}<p>Ceny muszą być nieujemne, userId dodatnią liczbą całkowitą, email poprawnym adresem, a pola tekstowe nie mogą być puste. image przyjmuje HTTP(S) URL lub ścieżkę względną. Tablica products może być pusta; wypełniona musi zawierać poprawne obiekty produktów. Referencje w koszyku nie są sprawdzane w bazie — to API bez zapisu.</p></section>
    <section id="errors"><h2>Czytelne błędy</h2><p>400 — walidacja lub zły JSON · 401 — błędne logowanie lub brak, błędny albo wygasły token dla DELETE · 404 — brak zasobu · 405 — zła metoda · 413 — body powyżej 1 MB · 415 — brak Content-Type: application/json · 500 — błąd serwera.</p><div class="inline-code"><pre>${escape(pretty({ error: { status: 400, message: 'Validation failed.', details: ['price is required.'] } }))}</pre></div></section>
    <section id="faq" class="faq"><h2>Dobrze wiedzieć</h2><details><summary>Czy to dokładna kopia oryginalnego FakeStoreAPI?</summary><p>Nie. To niezależna implementacja szkoleniowa z własnymi danymi i wyglądem Mono Lime. Dodaje PATCH, ścisły PUT, walidację, paginację i filtrowanie. Domyślna lista ma 10 elementów.</p></details><details><summary>Dlaczego zmieniony produkt wygląda tak samo po GET?</summary><p>To celowe. Odpowiedź zapisu jest symulowana. Stałe dane nie zmieniają się między żądaniami, uczestnikami szkolenia ani restartami.</p></details><details><summary>Czy ID z POST jest unikalne?</summary><p>ID jest losowane z zakresu 1 000 000–1 999 999 999, poza zakresem danych startowych. Nie ma centralnego licznika ani gwarancji globalnej unikalności, ponieważ nic nie przechowujemy.</p></details></section>
    </div></div></div>`;
  document.querySelector('#copy-base').onclick = () => copy(origin);
}

function playground() {
  const requests = [
    ['GET', '/products?limit=5', 'Lista produktów'],
    ['GET', '/products/1', 'Jeden produkt'],
    ['POST', '/products', 'Utwórz produkt', product],
    ['PUT', '/products/1', 'Zastąp produkt', { ...product, price: 3199 }],
    ['PATCH', '/products/1', 'Zmień cenę', { price: 3299 }],
    ['DELETE', '/products/1', 'Usuń produkt'],
    ['GET', '/carts?userId=1', 'Koszyki'],
    ['GET', '/users?limit=5', 'Użytkownicy'],
    ['POST', '/auth/login', 'Logowanie', { username: 'anna.kowalska', password: 'Kawa!Rano2026' }],
  ];
  main.innerHTML = `<div class="container"><div class="page-heading"><span class="eyebrow">Żywe API · bez zapisywania</span><div class="heading-row"><h1>Twój API Playground</h1><a class="text-link" href="/docs">Zajrzyj do dokumentacji ↗</a></div><p>Wybierz żądanie, zmień parametry i sprawdź odpowiedź. Wszystkie operacje wykonują prawdziwe zapytania HTTP do tego serwera.</p></div>
    <div class="playground-layout"><aside class="request-list" aria-label="Przykładowe żądania"><h3>Kolekcja żądań</h3>${requests.map(([method, , title], index) => `<button data-request="${index}">${methodBadge(method)}<span>${title}</span></button>`).join('')}</aside>
    <div class="request-panel"><form id="request-form"><div class="request-bar"><select id="request-method" aria-label="Metoda HTTP">${['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(method => `<option>${method}</option>`).join('')}</select><input id="request-path" aria-label="Ścieżka endpointu" placeholder="/products?limit=5" required spellcheck="false"><button class="btn accent" type="submit" id="send">Wyślij ↗</button></div>
    <div class="request-options"><div class="code-tabs" id="request-tabs" role="tablist" aria-label="Opcje żądania"><button type="button" role="tab" aria-selected="true" aria-controls="request-editor" class="active" data-editor="params">Query params</button><button type="button" role="tab" aria-selected="false" aria-controls="request-editor" data-editor="body">Body (JSON)</button><button type="button" role="tab" aria-selected="false" aria-controls="request-editor" data-editor="code">cURL</button></div><div class="request-editor" id="request-editor" role="tabpanel"></div><div class="request-editor"><label for="bearer-token">Bearer token · wymagany tylko dla DELETE</label><input id="bearer-token" type="text" spellcheck="false" autocomplete="off" placeholder="Wklej sam token JWT, bez prefiksu Bearer"><p>Wyślij „Logowanie” z danymi anna.kowalska / Kawa!Rano2026 — token uzupełni się automatycznie. Pozostaje tylko w pamięci tej strony; odświeżenie go usuwa. Ważność: 1 godzina.</p><button type="button" class="copy-btn" id="clear-token">Wyczyść token</button></div></div><p class="playground-tip">ⓘ Operacje zapisu są symulowane. DELETE wymaga tokenu; pozostałe metody są publiczne. Każdy GET czyta niezmienione dane startowe.</p><p class="error-inline" id="request-error" role="alert"></p></form>
    <div class="response"><div class="panel-head"><h3>Odpowiedź serwera</h3><span id="response-status">GOTOWY NA ŻĄDANIE</span><button class="copy-btn" id="copy-response">Kopiuj</button></div><div class="response-tabs"><button class="active" data-response="body">Body</button><button data-response="headers">Headers</button></div><pre id="response-body" aria-live="polite">Naciśnij „Wyślij”, aby zobaczyć odpowiedź.</pre></div></div></div></div>`;
  const methodInput = document.querySelector('#request-method');
  const pathInput = document.querySelector('#request-path');
  const editor = document.querySelector('#request-editor');
  const tokenInput = document.querySelector('#bearer-token');
  let currentBody = pretty(product);
  let editorTab = 'params';
  let responseTab = 'body';
  let responseBody = '';
  let responseHeaders = '';
  let responseReceived = false;
  const displayedBody = () => responseBody || (responseReceived ? 'Brak body odpowiedzi (0 B).' : 'Brak odpowiedzi. Wyślij żądanie.');
  let activeRequest = -1;
  const safePath = () => {
    if (!pathInput.value.startsWith('/') || pathInput.value.startsWith('//') || pathInput.value.includes('\\')) throw new Error('Podaj lokalną ścieżkę zaczynającą się od /, np. /products.');
    const url = new URL(pathInput.value, origin);
    if (url.origin !== origin || !/^\/(products|carts|users|auth)(\/|$)/.test(url.pathname)) throw new Error('Playground obsługuje tylko lokalne endpointy /products, /carts, /users i /auth.');
    return url;
  };
  function saveEditor() {
    if (editorTab === 'body') currentBody = document.querySelector('#json-input').value;
  }
  function drawEditor() {
    document.querySelectorAll('#request-tabs button').forEach(button => {
      button.classList.toggle('active', button.dataset.editor === editorTab);
      button.setAttribute('aria-selected', String(button.dataset.editor === editorTab));
    });
    if (editorTab === 'body') {
      editor.innerHTML = `<label for="json-input">Request body · application/json</label><textarea id="json-input" spellcheck="false"></textarea><p>${['GET', 'DELETE'].includes(methodInput.value) ? 'Ta metoda nie wysyła body. Wybierz POST, PUT lub PATCH.' : 'PUT: wszystkie pola wymagane. PATCH: tylko zmieniane pola.'}</p>`;
      document.querySelector('#json-input').value = currentBody;
    } else if (editorTab === 'params') {
      editor.innerHTML = `<label for="query-input">Parametry po znaku ?</label><input id="query-input" spellcheck="false" placeholder="limit=5&amp;page=1"><p>Zmiany parametrów aktualizują adres żądania. Dla pojedynczego obiektu i operacji zapisu pozostaw puste.</p><div class="query-presets"><button type="button" data-query="limit=5&page=2">Strona 2</button><button type="button" data-query="sortBy=price&sort=desc&limit=5">Cena malejąco</button><button type="button" data-query="q=laptop&limit=5">Szukaj: laptop</button><button type="button" data-query="category=laptops&maxPrice=5000">Laptopy do 5000</button></div>`;
      document.querySelector('#query-input').value = pathInput.value.split('?').slice(1).join('?').split('#')[0];
      document.querySelector('#query-input').oninput = event => {
        pathInput.value = pathInput.value.split('?')[0].split('#')[0] + (event.target.value ? `?${event.target.value}` : '');
      };
      editor.querySelectorAll('[data-query]').forEach(button => {
        button.onclick = () => {
          pathInput.value = `/products?${button.dataset.query}`;
          methodInput.value = 'GET';
          drawEditor();
        };
      });
    } else {
      editor.innerHTML = '<div class="actions"><span class="field-label">Uruchom w terminalu</span><button type="button" class="copy-btn" id="copy-curl">Kopiuj</button></div><pre id="curl-preview"></pre><p>Przykład generowany z aktualnej metody, adresu i body.</p>';
      let code;
      try { code = snippet('curl', methodInput.value, pathInput.value, ['POST', 'PUT', 'PATCH'].includes(methodInput.value) ? JSON.parse(currentBody) : undefined, tokenInput.value.trim()); }
      catch (error) { code = `Niepoprawny JSON: ${error.message}`; }
      document.querySelector('#curl-preview').textContent = code;
      document.querySelector('#copy-curl').onclick = () => copy(code);
    }
  }
  function selectRequest(index) {
    const [method, path, , body] = requests[index];
    activeRequest = index;
    methodInput.value = method;
    pathInput.value = path;
    if (body) currentBody = pretty(body);
    editorTab = ['POST', 'PUT', 'PATCH'].includes(method) ? 'body' : 'params';
    document.querySelectorAll('[data-request]').forEach(button => button.classList.toggle('active', Number(button.dataset.request) === activeRequest));
    document.querySelector('#request-error').textContent = '';
    drawEditor();
  }
  document.querySelectorAll('[data-request]').forEach(button => { button.onclick = () => selectRequest(Number(button.dataset.request)); });
  document.querySelector('#request-tabs').onclick = event => {
    if (!event.target.dataset.editor) return;
    saveEditor();
    editorTab = event.target.dataset.editor;
    drawEditor();
  };
  methodInput.onchange = () => { saveEditor(); editorTab = ['POST', 'PUT', 'PATCH'].includes(methodInput.value) ? 'body' : 'params'; drawEditor(); };
  pathInput.oninput = () => { saveEditor(); drawEditor(); };
  tokenInput.oninput = () => { if (editorTab === 'code') drawEditor(); };
  document.querySelector('#clear-token').onclick = () => {
    tokenInput.value = '';
    if (editorTab === 'code') drawEditor();
    toast('Token został usunięty z pola autoryzacji.');
  };
  document.querySelectorAll('[data-response]').forEach(button => {
    button.onclick = () => {
      responseTab = button.dataset.response;
      document.querySelectorAll('[data-response]').forEach(item => item.classList.toggle('active', item === button));
      document.querySelector('#response-body').textContent = responseTab === 'body' ? displayedBody() : responseHeaders || 'Brak nagłówków. Wyślij żądanie.';
    };
  });
  document.querySelector('#copy-response').onclick = () => copy(responseTab === 'body' ? responseBody : responseHeaders);
  document.querySelector('#request-form').onsubmit = async event => {
    event.preventDefault();
    saveEditor();
    const errorNode = document.querySelector('#request-error');
    const status = document.querySelector('#response-status');
    errorNode.textContent = '';
    let url;
    try { url = safePath(); }
    catch (error) { errorNode.textContent = error.message; return; }
    const method = methodInput.value;
    const send = document.querySelector('#send');
    send.disabled = true;
    send.textContent = 'Wysyłanie…';
    status.textContent = 'OCZEKIWANIE…';
    status.classList.remove('response-error');
    const start = performance.now();
    try {
      const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
      const response = await fetch(url, {
        method,
        headers: {
          ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
          ...(method === 'DELETE' && tokenInput.value.trim() ? { Authorization: `Bearer ${tokenInput.value.trim()}` } : {}),
        },
        ...(hasBody ? { body: currentBody } : {}),
        signal: AbortSignal.timeout(15000),
      });
      const text = await response.text();
      if (response.status === 204) responseBody = '';
      else {
        try { responseBody = pretty(JSON.parse(text)); }
        catch { responseBody = text; }
      }
      responseReceived = true;
      if (response.ok && method === 'POST' && url.pathname === '/auth/login') {
        const login = JSON.parse(text);
        if (typeof login.token === 'string') {
          tokenInput.value = login.token;
          if (editorTab === 'code') drawEditor();
          toast('Token logowania ustawiony. Możesz wykonać DELETE.');
        }
      }
      responseHeaders = [...response.headers].map(([name, value]) => `${name}: ${value}`).join('\n');
      status.textContent = `${response.status} ${response.statusText} · ${Math.round(performance.now() - start)} ms · ${new TextEncoder().encode(text).length} B`;
      status.classList.toggle('response-error', !response.ok);
      document.querySelector('#response-body').textContent = responseTab === 'body' ? displayedBody() : responseHeaders;
    } catch (error) {
      console.error('Playground request failed:', error);
      status.textContent = 'BŁĄD POŁĄCZENIA';
      status.classList.add('response-error');
      responseBody = `Nie udało się wysłać żądania: ${error.message}`;
      responseHeaders = '';
      document.querySelector('#response-body').textContent = responseBody;
      errorNode.textContent = 'Sprawdź połączenie i spróbuj ponownie.';
    } finally { send.disabled = false; send.textContent = 'Wyślij ↗'; }
  };
  selectRequest(0);
  const params = new URLSearchParams(location.search);
  if (params.has('path')) {
    pathInput.value = params.get('path');
    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(params.get('method'))) methodInput.value = params.get('method');
    if (params.has('body')) currentBody = params.get('body');
    editorTab = ['POST', 'PUT', 'PATCH'].includes(methodInput.value) ? 'body' : 'params';
    document.querySelectorAll('[data-request]').forEach(button => button.classList.remove('active'));
    drawEditor();
  }
}

const path = location.pathname.replace(/\/+$/, '') || '/';
document.querySelectorAll('[data-nav]').forEach(link => {
  const active = link.dataset.nav === path;
  link.classList.toggle('active', active);
  if (active) link.setAttribute('aria-current', 'page');
});
if (path === '/docs') { document.title = 'Dokumentacja API — FakeStore Lab'; docs(); }
else if (path === '/playground') { document.title = 'Playground — FakeStore Lab'; playground(); }
else home();
if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
