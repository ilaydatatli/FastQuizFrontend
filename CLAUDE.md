# Fast Quiz Frontend — CLAUDE.md

> Bu repo Fast Quiz'in **Vue 3 + Vite** web istemcisidir. Önce ortak dokümanı oku, sonra yalnızca **aktif faz** üzerinde çalış.
> Ortak doküman (konsept, API sözleşmesi, tasarım sistemi, fazlar):

@../PROJE.md

> Backend ayrı bir repoda: `../fast-quiz-backend/`. Bu repoda backend kodu yazılmaz; API'yi değiştirmen gerekiyorsa dur ve kullanıcıya söyle.
> Bu repodaki fazlar: **7–9**, **10**'un frontend kısmı ve **13** (DigitalOcean static site).

---

## 1. Bağımlılıklar

Node.js 22 LTS. `package.json`'da `"engines": { "node": "22.x" }` olsun (DigitalOcean build'i aynı Node sürümünü kullansın) ve `package-lock.json` git'e girsin.
`package.json`:
- **dependencies:** `vue` (3.x), `vue-router` (4.x)
- **devDependencies:** `vite`, `@vitejs/plugin-vue`, `vitest`, `@vue/test-utils`, `jsdom`

Sürümler Faz 7'de kurulum anındaki güncel kararlı sürümler olarak sabitlenir (`npm view <paket> version` ile bak). Bunların dışında paket (Pinia, Axios, UI kütüphanesi, Tailwind, ikon paketi vb.) eklemeden önce kullanıcıya sor. HTTP için tarayıcının yerleşik `fetch`'i kullanılır.

> Proje iskeleti Faz 7'de `npm create vite` sihirbazıyla **değil**, dosyalar elle oluşturularak kurulur (klasörde zaten `CLAUDE.md` var ve sihirbaz etkileşimli). Sonra `npm install`.

---

## 2. Klasör Yapısı (hedef)

```
fast-quiz-frontend/
├── CLAUDE.md
├── README.md
├── package.json
├── vite.config.js            # vue plugin + vitest (environment: jsdom)
├── index.html                # Google Fonts <link>'leri burada
├── .env.example
├── .gitignore                # node_modules/, dist/, .env, .DS_Store
├── .do/
│   └── app.yaml              # Faz 13 — DigitalOcean static site spec'i
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js
│   ├── App.vue               # <RouterView/> + üst bar (logo, "Skor Tablosu")
│   ├── router/
│   │   └── index.js
│   ├── api/
│   │   ├── client.js         # apiFetch(path, {method, body, token}) → JSON | throw ApiError
│   │   └── quiz.js           # getCategories, startQuiz, getCurrent, submitAnswer, getResult, saveScore, getLeaderboard
│   ├── composables/
│   │   ├── useQuiz.js        # aktif quiz durumu + sessionStorage
│   │   └── useCountdown.js   # remaining_ms → kalan süre (requestAnimationFrame)
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── QuizView.vue
│   │   ├── ResultView.vue
│   │   ├── LeaderboardView.vue
│   │   └── NotFoundView.vue
│   ├── components/
│   │   ├── CategoryCard.vue
│   │   ├── QuestionCard.vue
│   │   ├── ChoiceButton.vue
│   │   ├── TimerBar.vue
│   │   ├── QuizHeader.vue    # "Yazılım · 4 / 20" + puan
│   │   ├── CategoryTabs.vue
│   │   ├── LeaderboardTable.vue
│   │   └── NeonButton.vue
│   └── styles/
│       ├── variables.css     # PROJE.md Bölüm 8'deki :root değişkenleri (birebir)
│       └── base.css          # reset, body, font, odak halkası, reduced-motion
└── tests/
    ├── client.spec.js
    └── TimerBar.spec.js
```

---

## 3. Sayfalar ve Rotalar

| Rota | View | Not |
|---|---|---|
| `/` | `HomeView` | Kategori kartları, kısa kurallar |
| `/quiz/:quizId` | `QuizView` | Token `sessionStorage`'da yoksa ana sayfaya yönlendir |
| `/quiz/:quizId/result` | `ResultView` | Sonuç + takma ad |
| `/leaderboard/:slug?` | `LeaderboardView` | `slug` yoksa ilk kategori |
| `/:pathMatch(.*)*` | `NotFoundView` | |

---

## 4. Kodlama Kuralları

- Arayüz metinleri **Türkçe**; kod, değişken, yorum **İngilizce**.
- Bileşenler `<script setup>` + Composition API. Options API yok.
- **Tüm API çağrıları `src/api/quiz.js` üzerinden.** View veya bileşende doğrudan `fetch` yok.
- API base URL yalnızca `import.meta.env.VITE_API_BASE_URL`'den.
- `client.js` hata yanıtlarını `ApiError { status, code, message }`'a çevirir; ağ hatası `code: "NETWORK_ERROR"`, mesaj "Sunucuya ulaşılamadı.". Arayüz `message`'ı gösterir, mantık `code`'a bakar.
- **Sunucu otoritedir:** puanı, doğruluğu, süreyi istemcide **hesaplama**. Gösterilen puan her zaman sunucu yanıtındaki `points`'tir. İstemci asla puan/süre göndermez.
- **Zaman çubuğu:** başlangıç değeri sunucunun `remaining_ms`'i. `Date.now()` farkıyla sayar (yalnızca görsel). 0'a inince bir kez `submitAnswer(questionId, null)` çağrılır; tıklamayla aynı anda tetiklenmemesi için tek bir `isLocked` bayrağı.
- **Çift gönderim yok:** ilk tıklamada şıklar kilitlenir; yanıt gelene kadar başka istek gitmez.
- **Yenileme:** `useQuiz` `{quizId, token, category}`'yi `sessionStorage`'da (`fastquiz.active`) tutar; `QuizView` açılınca `getCurrent` çağırır, sunucu kaldığı soruyu ve kalan süreyi verir. Quiz bitince veya `410` gelince silinir. `localStorage` kullanma (sekme kapanınca quiz de bitmeli).
- Hata kodlarına tepki: `410 QUIZ_EXPIRED` / `401 INVALID_TOKEN` → bilgi mesajıyla ana sayfa; `409 QUESTION_MISMATCH` / `ALREADY_ANSWERED` → sessizce `getCurrent` ile senkronize ol; `429` → "Biraz yavaşla, birazdan tekrar dene."
- Renkler, boşluklar, yarıçaplar yalnızca `variables.css` değişkenleriyle; bileşenlerde sabit hex yazma. Bileşen stilleri `<style scoped>`.
- Kategori rengi API'deki `color` anahtarından: `var(--neon-${category.color})`.
- Erişilebilirlik: şıklar gerçek `<button>`; `1–4` klavye kısayolları; doğru/yanlış için renk + ✓/✗ ikonu; zaman çubuğu `role="progressbar"` + `aria-valuenow`.
- Mobil öncelikli: 375px'te yatay kaydırma yok, şıklar tek sütun; ≥ 640px'te 2×2.

---

## 5. Test Yaklaşımı

- **Vitest + @vue/test-utils**, yalnızca kritik ve saf parçalar:
  - `client.spec.js`: başarılı JSON, `{"error": {...}}` → `ApiError`, ağ hatası, Bearer başlığı (`fetch` `vi.fn()` ile taklit edilir).
  - `TimerBar.spec.js`: renk eşikleri (>2 sn, 2–1 sn, <1 sn), süre bitince `expire` olayının **bir kez** yayılması (`vi.useFakeTimers()`).
- Ekran akışları için her faz sonunda **manuel test listesi** (backend açıkken tarayıcıda).
- Her faz sonunda:
  ```bash
  npm run test -- --run
  ```
  ```bash
  npm run build
  ```

---

## 6. Lokal Kurulum

Backend'in `http://localhost:8000`'de çalıştığını varsay (`../fast-quiz-backend/CLAUDE.md` Bölüm 6). Sonra:
```bash
cd ~/Desktop/fast-quiz/fast-quiz-frontend
```
```bash
cp .env.example .env
```
```bash
npm install
```
```bash
npm run dev
```
Tarayıcı: `http://localhost:5173`

`.env.example`:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
> CORS hatası görürsen: backend `.env`'inde `CORS_ALLOWED_ORIGINS=http://localhost:5173` olmalı (sonunda `/` yok) ve backend yeniden başlatılmalı.

---

## 7. Mobil Uygulama İçin Not

Mobil uygulama bu repodan kod paylaşmayacak; ama `src/api/quiz.js` API'nin "nasıl kullanıldığının" en net örneği olacak. Fonksiyon adları ve akış `PROJE.md` Bölüm 6'daki "Akış özeti" ile birebir aynı kalsın.

---

## 8. DigitalOcean Static Site (Faz 13)

Frontend sunucu kodu olmayan bir **statik site**dir: DigitalOcean repoyu çeker, `npm run build` çalıştırır ve `dist/` klasörünü CDN'den yayınlar. Docker gerekmez.

### `.do/app.yaml` (hedef — `GITHUB_KULLANICI` ve backend adresi doldurulacak)
```yaml
name: fast-quiz-web
region: fra

static_sites:
  - name: web
    github:
      repo: GITHUB_KULLANICI/fast-quiz-frontend
      branch: main
      deploy_on_push: true
    build_command: npm run build        # bağımlılıkları DO'nun Node buildpack'i package-lock.json'dan kurar
    output_dir: dist
    catchall_document: index.html       # Vue Router: /quiz/..., /leaderboard/... yenilenince 404 olmasın
    error_document: index.html
    envs:
      - key: VITE_API_BASE_URL
        value: https://BACKEND-ADRESI.ondigitalocean.app/api/v1
        scope: BUILD_TIME               # Vite bu değeri build anında JS'e gömer
```
- `catchall_document` olmadan, `/leaderboard/biyoloji` gibi bir adres doğrudan açılınca 404 alınır (sunucuda öyle bir dosya yok; rotayı Vue Router tarayıcıda çözüyor).
- `VITE_API_BASE_URL` değişirse panelden değiştir ve **yeniden deploy** et; yalnızca ortam değişkenini kaydetmek çalışan sitedeki JS'i değiştirmez.
- `VITE_` ile başlayan her değişken **herkese açık** JS'e girer: buraya asla gizli bilgi koyma (zaten yok — token'lar quiz başlarken sunucudan gelir).

### İlk kurulum sırası (kullanıcı yapar, Claude tarif eder)
1. Backend canlıda olmalı (Faz 12) ve adresi bilinmeli.
2. GitHub'da `fast-quiz-frontend` reposunu oluştur ve push et (`package-lock.json` dahil).
3. DO panelinde **Apps → Create App** → GitHub reposu → türü **Static Site** seç → build komutu `npm run build`, çıktı klasörü `dist`, catchall `index.html`, `VITE_API_BASE_URL` (build time).
4. Deploy bitince frontend adresini kopyala → **backend** app'inde `CORS_ALLOWED_ORIGINS`'e yaz (sonunda `/` yok) → backend'i yeniden deploy et.
5. Canlı adreste bir quiz oyna; tarayıcı konsolunda (F12) CORS hatası olmamalı.

Lokalde canlı build'i denemek için:
```bash
npm run build
```
```bash
npm run preview
```
