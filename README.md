# 🧪 FakeStore Lab

Witaj w **FakeStore Lab** — aplikacji do praktycznej nauki testowania REST API, stworzonej przez [AkademiaQA.pl](https://AkademiaQA.pl).

Projekt łączy **symulowane API sklepu komputerowego**, polskojęzyczną dokumentację oraz interaktywny playground. Pozwala poznawać HTTP, ćwiczyć pełny CRUD i testować uwierzytelnianie bez stawiania bazy danych.

Wysyłasz prawdziwe żądania i otrzymujesz prawdziwe odpowiedzi HTTP, ale **żadna operacja nie zmienia danych startowych**. Możesz eksperymentować bez obawy o usunięcie produktów lub zmianę danych innych użytkowników.

> Aplikacja jest udostępniana wyłącznie do indywidualnej, niekomercyjnej nauki. Wykorzystanie zarobkowe oraz prowadzenie przez osoby trzecie szkoleń, kursów, warsztatów lub innych zajęć z jej użyciem wymaga uprzedniej pisemnej zgody AkademiaQA.pl. Dotyczy to również zajęć bezpłatnych.

## 🎓 Czego nauczysz się z tym projektem

- **Podstaw REST API** — zasobów, ścieżek, metod HTTP, nagłówków i odpowiedzi JSON.
- **Pełnego CRUD** — GET, POST, PUT, PATCH i DELETE.
- **Różnicy między PUT i PATCH** — zastępowania pełnego obiektu oraz aktualizacji wybranych pól.
- **Pracy z query params** — wyszukiwania, filtrowania, sortowania i paginacji.
- **Uwierzytelniania JWT** — logowania, przekazywania tokenu Bearer i obsługi 401.
- **Walidacji i testów negatywnych** — błędnych danych, brakujących pól i niepoprawnych żądań.
- **Testowania kontraktu API** — statusów, struktury odpowiedzi i metadanych paginacji.

Do samodzielnych ćwiczeń możesz użyć playgroundu, Postmana, curl lub własnych testów automatycznych.

---

## ✨ Najważniejsze możliwości

### 🔄 API bez zapisu

POST zwraca dane i nowe ID, PUT zastępuje reprezentację, PATCH scala wybrane pola, a DELETE symuluje usunięcie. Kolejny GET zawsze odczytuje niezmienione dane startowe.

### 💻 Realistyczne dane demonstracyjne

24 produkty komputerowe, 12 fikcyjnych użytkowników i 10 koszyków. Konkretne specyfikacje sprzętu, przykładowe ceny w PLN oraz indywidualne dane logowania.

### 🎮 Interaktywny playground

Edytuj JSON i query params, wysyłaj żądania oraz sprawdzaj status, czas odpowiedzi, body i nagłówki. Logowanie automatycznie uzupełnia pole tokenu dla DELETE.

### 📖 Dokumentacja i OpenAPI

Opisy endpointów, schematy danych, przykłady cURL i specyfikacja OpenAPI 3.1 do importu w narzędziach API.

### ☁️ Gotowość do Railway

Dockerfile, konfiguracja Railway, obsługa zmiennej `PORT` i endpoint `/health`. Bez zewnętrznych zależności i usług bazodanowych.

## 📋 Wymagania

- [Node.js](https://nodejs.org/) **24 lub nowszy**.
- **npm** dostarczany z Node.js.
- Opcjonalnie **Docker** do uruchomienia kontenerowego.
- Opcjonalnie **GitHub i Railway** do autoryzowanego wdrożenia.

Nie potrzebujesz konta w zewnętrznym sklepie, bazy danych ani klucza API. Tylko DELETE wymaga tokenu uzyskanego przez wbudowane logowanie.

## 🚀 Uruchomienie

1. Pobierz projekt z repozytorium, do którego masz uprawniony dostęp.
2. Otwórz terminal w głównym katalogu projektu.
3. Uruchom aplikację:

   ```sh
   npm start
   ```

4. Otwórz [http://localhost:3000](http://localhost:3000), dokumentację lub playground.

Projekt nie ma zewnętrznych zależności — nie wymaga `npm install`.

Tryb deweloperski z restartem backendu po zmianach:

```sh
npm run dev
```

`PORT` ustawia port serwera (domyślnie `3000`). Serwer nasłuchuje na `0.0.0.0`.

Instrukcje techniczne nie rozszerzają uprawnień opisanych w sekcji „Własność i warunki korzystania”. Uruchomienie dla innych osób, publiczny hosting i zastosowania szkoleniowe wymagają pisemnej zgody AkademiaQA.pl.

## ✅ Uruchamianie testów

```sh
# Testy integracyjne z prawdziwymi żądaniami HTTP
npm test

# Kontrola składni JavaScript
npm run check
```

Testy korzystają z wbudowanego runnera `node:test`. Uruchamiają własny serwer na losowym wolnym porcie i zamykają go po zakończeniu — nie musisz wcześniej uruchamiać `npm start`.

### 🔍 Sprawdzane scenariusze

- Pełny CRUD dla produktów, użytkowników i koszyków, bez zmiany danych bazowych.
- Paginacja, sortowanie, wyszukiwanie i filtrowanie, także na granicach cen.
- Poprawne logowanie każdego konta oraz odrzucanie błędnych haseł.
- Ochrona DELETE: brak tokenu, zmodyfikowany podpis lub payload, wygaśnięcie tokenu.
- Odpowiedź 204 bez body dla istniejących i nieistniejących ID po autoryzacji.
- Niepoprawny JSON, walidacja danych, limit body i niedozwolone metody.
- CORS, preflight OPTIONS, HEAD i nagłówki paginacji.
- Kontrakt OpenAPI, dostępność stron i lokalnych ilustracji.

## 🛠️ Technologie

| Obszar | Rozwiązanie |
|---|---|
| Backend | Node.js 24+, wbudowany moduł `node:http`, JavaScript ES modules |
| Frontend | HTML, CSS, JavaScript — bez frameworka |
| Wygląd | Mono Lime, responsywny układ, lokalne ilustracje SVG |
| Uwierzytelnianie | JWT HS256, `node:crypto`, token wymagany tylko dla DELETE |
| Dokumentacja | OpenAPI 3.1 i własna strona dokumentacji |
| Testy | `node:test`, `node:assert/strict`, wbudowany `fetch` |
| Wdrożenie | Docker i Railway |
| Dane | Stałe dane demonstracyjne, bez bazy i trwałego zapisu |

## 🗂️ Struktura projektu

```text
src/
  api.js             # Obsługa zasobów, walidacji, zapytań i JWT
  data.js            # Produkty, użytkownicy i koszyki
  openapi.js         # Aktualny kontrakt OpenAPI
public/
  index.html         # Wspólny szkielet strony i stopka
  app.js             # Strona główna, dokumentacja i playground
  styles.css         # Responsywne style
  images/            # Lokalne ilustracje produktów
design/
  design/            # Tokeny i materiały systemu Mono Lime
openapi/
  docs-data.json     # Źródłowa specyfikacja API
test/
  api.test.js        # Testy integracyjne HTTP
server.js            # Serwer HTTP i serwowanie plików
package.json         # Wymagania środowiska i skrypty
Dockerfile           # Obraz aplikacji
railway.json         # Konfiguracja wdrożenia i healthcheck
```

---

## 🚂 Railway

Poniższa instrukcja jest przeznaczona dla AkademiaQA.pl oraz osób posiadających jej pisemną zgodę na wdrożenie. Sama możliwość technicznego wdrożenia nie oznacza zgody na publiczne udostępnianie aplikacji.

1. Umieść projekt w uprawnionym repozytorium GitHub. Bez zgody na redystrybucję nie publikuj kodu w publicznym repozytorium.
2. W Railway wybierz **New Project → Deploy from GitHub repo** i wskaż repozytorium.
3. Railway odczyta `railway.json` i zbuduje aplikację z `Dockerfile` (Node 24).
4. W **Settings → Networking → Generate Domain** utwórz publiczną domenę.
5. Otwórz domenę oraz `/health`, aby potwierdzić działanie.

Nie dodawaj bazy danych ani wolumenu. Railway przekazuje `PORT` automatycznie. Healthcheck `/health` zwraca `{"status":"ok","persistence":false}`. Docker uruchamia aplikację jako użytkownik nieuprzywilejowany. Nie wymaga instalowania pakietów. Opcjonalnie ustaw w Railway `JWT_SECRET` (losowy sekret minimum 32 bajty), aby tokeny działały po restarcie i między replikami. Bez niego aplikacja losuje klucz przy starcie, więc restart unieważnia wcześniejsze tokeny. Sekret przechowuj w zmiennych środowiskowych, nigdy w repozytorium.

Lokalnie z Dockerem:

```sh
docker build -t fakestore-lab .
docker run --rm -p 3000:3000 -e PORT=3000 fakestore-lab
```

## 🌐 Strony i kontrakt API

- `/` — strona główna z prawdziwym odczytem przykładowego produktu.
- `/docs` — dokumentacja, schematy i gotowe przykłady.
- `/playground` — prawdziwe żądania HTTP, edytor JSON, query params, cURL, statusy i nagłówki.
- `/openapi.json` — aktualny OpenAPI 3.1 do importu w Postmanie; alias `/docs-data.json`.

Oryginał `openapi/docs-data.json` pozostaje niezmieniony. `src/openapi.js` rozszerza go o rzeczywiście zaimplementowane zachowania.

### 📦 Zasoby

`/products` (24), `/users` (12), `/carts` (10):

Katalog zawiera fikcyjne marki komputerowe i realistyczne specyfikacje: po 6 produktów w kategoriach `laptops`, `desktops`, `monitors`, `accessories`. Ceny są przykładowymi kwotami w PLN, bez dodawania pola waluty do kontraktu API. Ilustracje SVG odpowiadają kategoriom sprzętu.

Użytkownicy mają imienne loginy, adresy w zarezerwowanej domenie `example.com` i różne hasła szkoleniowe. Każde konto z `GET /users?limit=100` może się zalogować. Przykład: `anna.kowalska` / `Kawa!Rano2026`. Stare konta `demo` i `student…` zostały usunięte. Hasła są jawne wyłącznie do ćwiczeń — nie używaj ich w rzeczywistych usługach. Koszyki zawierają kopie aktualnych produktów i wskazują istniejących użytkowników.

| Metoda | Ścieżka | Wynik |
|---|---|---|
| GET | `/{resource}` | 200, tablica z paginacją |
| GET | `/{resource}/{id}` | 200, obiekt lub 404 |
| POST | `/{resource}` | 201, przesłane dane i losowe nowe ID |
| PUT | `/{resource}/{id}` | 200, pełna reprezentacja; wszystkie edytowalne pola wymagane |
| PATCH | `/{resource}/{id}` | 200, dane bazowe scalone z podzbiorem pól |
| DELETE | `/{resource}/{id}` | Wymaga Bearer JWT; 204 bez body również dla nieistniejącego poprawnego ID i powtórzonych żądań; 401 przy braku/błędzie/wygaśnięciu tokenu |

**Żadna operacja nie zapisuje ani nie aktualizuje danych, również w pamięci kolekcji.** Po POST GET nowego ID zwraca 404. Po PUT, PATCH i DELETE GET zwraca oryginalny obiekt. Udany DELETE nie zwraca body ani Content-Type — nie wywołuj dla niego `response.json()`. Równoległe żądania nie wpływają na siebie. ID z POST jest losowane poza zakresem danych bazowych; nie ma gwarancji globalnej unikalności. URL ID ma pierwszeństwo przed ID z body. Tablice przy PATCH zastępowane są w całości. Zapisy mają nagłówek `X-Simulated: true`.

Wymagane pola:

- Produkt: `title`, `price`, `description`, `category`, `image`.
- Użytkownik: `username`, `email`, `password`.
- Koszyk: `userId`, `products` (tablica pełnych obiektów produktu, **zgodnie z dostarczonym OpenAPI**, nie `productId/quantity`). Referencje nie wymagają istnienia powiązanego obiektu.

POST/PUT/PATCH wymagają `Content-Type: application/json`. Limit body: 1 MB. Walidacja odrzuca nieznane pola, błędne typy, puste ciągi, ujemne ceny i błędne adresy e-mail. ID wejściowe jest opcjonalne.

### 🔎 Query params

Na listach i `/products/category/{category}`:

- `limit`: 1–100, domyślnie 10.
- `page`: od 1 albo `offset`: od 0 (nie oba naraz).
- `q`: wyszukiwanie tekstu we wszystkich polach bez rozróżniania wielkości liter.
- `sort`: `asc` / `desc`, domyślnie `asc`.
- `sortBy`: pole zasobu, domyślnie `id`; tablica `products` w koszyku nie jest sortowalna.
- Produkty: `category`, `minPrice`, `maxPrice` (granice włącznie).
- Użytkownicy: `username`, `email` (dokładne dopasowanie bez rozróżniania wielkości liter).
- Koszyki: `userId`.

Kolejność: filtrowanie → sortowanie → paginacja. Wynik to tablica; metadane w `X-Total-Count`, `X-Limit`, `X-Offset`. Pusta strona: 200 i `[]`. Nieznane lub zduplikowane parametry: 400.

```sh
curl 'http://localhost:3000/products?q=laptop&sortBy=price&sort=desc&limit=5&page=1'
curl -X PATCH http://localhost:3000/products/1 \
  -H 'Content-Type: application/json' -d '{"price":3299}'
curl http://localhost:3000/products/1 # oryginalna cena
```

Dodatkowo: `GET /products/categories`, `GET /products/category/{category}` (nazwa kodowana URL).

### 🔐 Logowanie i błędy

`POST /auth/login` z `{"username":"anna.kowalska","password":"Kawa!Rano2026"}` zwraca JWT HS256 ważny godzinę. **Tylko DELETE** na `/products/{id}`, `/users/{id}` i `/carts/{id}` wymaga `Authorization: Bearer <token>`. Weryfikowany jest podpis, algorytm, data wygaśnięcia i użytkownik. Brak, błędny lub wygasły token zwraca 401 z `WWW-Authenticate: Bearer realm="FakeStoreLab"`. GET, POST, PUT i PATCH pozostają publiczne. Po autoryzacji DELETE zwraca 204 niezależnie od istnienia zasobu.

Nie ma sesji. Podpis korzysta z `JWT_SECRET` lub losowego klucza procesu (patrz Railway). Wszystkie hasła i konta to jawne, fikcyjne dane szkoleniowe. Nie przesyłaj rzeczywistych haseł ani danych osobowych.

Playground automatycznie uzupełnia pole Bearer token po poprawnym logowaniu. Token jest wysyłany tylko z DELETE, uwzględniany w generowanym cURL i przechowywany jedynie w pamięci strony — odświeżenie go usuwa. Pole można edytować lub wyczyścić do ćwiczenia odpowiedzi 401.

```sh
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"anna.kowalska","password":"Kawa!Rano2026"}'
# Skopiuj pole token z odpowiedzi:
curl -i -X DELETE http://localhost:3000/products/999 \
  -H 'Authorization: Bearer <TOKEN_Z_LOGOWANIA>'
```

Błędy JSON: `{"error":{"status":400,"message":"Validation failed.","details":["price is required."]}}`.

Statusy: 400 walidacja/JSON, 401 złe logowanie lub brak/błąd/wygaśnięcie tokenu dla DELETE, 404 brak zasobu, 405 niedozwolona metoda, 413 zbyt duże body, 415 nieprawidłowy Content-Type, 500 nieoczekiwany błąd (logowany po stronie serwera).

CORS jest publiczny, również dla PUT/PATCH/DELETE i nagłówków paginacji. Obsługiwane są OPTIONS i HEAD. Brak cookies, analityki, trwałych logów żądań lub mechanizmu zapisu danych aplikacji. Infrastruktura hostingowa może niezależnie zapisywać logi techniczne.

## 🎨 Design i różnice względem FakeStoreAPI

`design/design/tokens.css` jest źródłem kolorystyki, typografii i kwadratowych kształtów. Aplikacja korzysta z niego bezpośrednio. `public/styles.css` zawiera responsywne komponenty strony i dokumentacji. Własne ilustracje SVG są hostowane lokalnie; brak zewnętrznych fontów i skryptów.

To nie jest zamiennik 1:1: własny katalog danych, polski interfejs, ścisły PUT, PATCH, jawne błędy i domyślna paginacja. Kod strony i treści są niezależną implementacją, nie kopią oryginalnej witryny.

---

## ⚖️ Własność i warunki korzystania

**FakeStore Lab stanowi własność [AkademiaQA.pl](https://AkademiaQA.pl).**

Copyright © 2026 AkademiaQA.pl. Wszelkie prawa zastrzeżone.

Poniższe warunki dotyczą aplikacji FakeStore Lab, jej kodu, interfejsu, dokumentacji oraz autorskich materiałów AkademiaQA.pl zawartych w projekcie. **Projekt nie jest udostępniany na licencji open source ani na licencji ISC.**

### ✅ Dozwolone korzystanie

Użytkownik może korzystać z aplikacji wyłącznie na potrzeby własnej, indywidualnej i niekomercyjnej nauki, w szczególności:

- poznawania HTTP, REST API, JSON i uwierzytelniania JWT;
- samodzielnego ćwiczenia testów manualnych i automatycznych;
- uruchamiania lokalnej kopii oraz modyfikowania jej na własny użytek edukacyjny, bez dalszego udostępniania.

### 📝 Korzystanie wymagające pisemnej zgody

Bez uprzedniej pisemnej zgody AkademiaQA.pl niedozwolone jest:

- wykorzystywanie aplikacji w celach zarobkowych, komercyjnych lub w ramach odpłatnych usług;
- używanie aplikacji przez osoby trzecie do prowadzenia szkoleń, kursów, warsztatów, bootcampów, webinarów, lekcji lub innych zajęć — zarówno płatnych, jak i bezpłatnych;
- włączanie aplikacji, jej kodu, dokumentacji lub autorskich materiałów do produktów, platform i materiałów szkoleniowych przeznaczonych dla innych osób;
- sprzedaż, sublicencjonowanie, redystrybucja lub publiczne udostępnianie aplikacji, jej kopii albo wersji zmodyfikowanych, w tym hostowanie jej jako usługi dla innych osób;
- usuwanie lub zmienianie informacji o autorstwie, własności oraz warunkach korzystania.

Publiczna dostępność kodu lub działającej aplikacji nie stanowi zgody na powyższe zastosowania. Inny zakres wykorzystania wymaga odrębnego, uprzedniego pisemnego uzgodnienia z AkademiaQA.pl — kontakt przez [AkademiaQA.pl](https://AkademiaQA.pl).

Powyższe warunki nie ograniczają uprawnień wynikających z bezwzględnie obowiązujących przepisów prawa. Elementy pochodzące od osób trzecich pozostają objęte prawami ich właścicieli i właściwymi warunkami licencyjnymi; AkademiaQA.pl nie przypisuje sobie praw do tych elementów.

### 🎓 Charakter edukacyjny

Aplikacja nie jest systemem produkcyjnym ani rzeczywistym sklepem. Dane produktów, użytkowników i hasła są fikcyjnymi, publicznymi danymi do ćwiczeń. Nie należy przesyłać rzeczywistych danych osobowych, haseł ani innych informacji poufnych.

Aplikacja jest udostępniana w stanie istniejącym, bez gwarancji dostępności lub przydatności do konkretnego celu, w zakresie dopuszczalnym przez prawo.

---

Stworzone z 💚 przez **[AkademiaQA.pl](https://AkademiaQA.pl)** — poznawaj API poprzez praktykę.
