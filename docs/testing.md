# Проверка в браузере

Локальный сервер (открывать файл напрямую нельзя — шрифты упрутся в CORS).
Браузер держит CSS и JS цепко, поэтому сервер лучше поднимать с запретом кеша:

```bash
cd "/Users/administrator/Documents/Lendosi/vebinar-2" && python3 -c "
import http.server, socketserver
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store'); super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
socketserver.TCPServer(('127.0.0.1', 8766), H).serve_forever()"
```

Что проверять после правок (всё ниже пройдено 10.08.2026):

1. **Ширины 1920 / 1440 / 1280 / 1024 / 768 / 375** — нет горизонтальной прокрутки
   (`document.documentElement.scrollWidth === window.innerWidth`), ничего не наезжает.
   ℹ️ Декор (`swirl.webp`, `grid.svg`, `wave.svg`) намеренно выходит за край и обрезается
   `overflow: hidden` — при поиске переполнений абсолютно спозиционированные картинки
   надо отфильтровывать, иначе они дают ложные срабатывания.
2. **Вырезка в hero** — три замера, которые легко сломать правкой:

   ```js
   const i = document.querySelector('.hero__teen').getBoundingClientRect();
   const p = document.querySelector('.hero__panel').getBoundingClientRect();
   const c = document.querySelector('.hero__content').getBoundingClientRect();
   ({ высота: i.height,                       // на 1920 ровно 700, выше = апскейл
      низНаКромке: p.bottom - i.bottom,       // 0 на >1024
      синееСлева: i.left - c.right,           // должно совпадать
      синееСправа: p.right - i.right,         // с предыдущим
      макушкаЦела: i.top >= p.top })          // критично на ≤1024
   ```
3. **Таймер** — тикает; чтобы проверить два других состояния, временно подставьте
   в `WEBINAR_AT` время 10 минут назад («эфир идёт») и вчерашнее («прошёл»).
4. **CTA** — без лоадера Битрикса клик прокручивает к `#reg` и подсвечивает баннер
   (класс `is-flash`). CTA на странице пять.
5. **FAQ** — открывается/закрывается, одновременно открыт только один пункт,
   `aria-expanded` меняется, в ответах нет видимого текста `&nbsp;`.
6. **Бургер (≤1024)** — открывается, закрывается по клику на якорь, страница под ним
   не прокручивается (`body.no-scroll`).
7. **Все якоря шапки, бургера и футера ведут в существующие секции.** `id` почти все
   отличаются от вебинара 1 — это главный источник битых ссылок при переносе правок.
8. **JSON-LD разбирается** (`JSON.parse`), `startDate` совпадает с `WEBINAR_AT`,
   `endDate − startDate = 75 минут`.
9. **Консоль** — без ошибок и 404.
10. **`grep -c '<!--' index.html`** → должно быть 0 (кроме `<!DOCTYPE>`).

ℹ️ Скриншоты Playwright по умолчанию падают в корень проекта — после проверки удалять.
ℹ️ На полностраничном скриншоте картинки с `loading="lazy"` часто выходят пустыми:
это артефакт съёмки, а не дефект. Проверять факт загрузки надо через `naturalWidth`
после прокрутки страницы вниз, а не глазами по скриншоту (на этом уже спотыкались:
фото спикеров выглядели пустыми серыми кругами, хотя грузятся нормально).


---

← [CLAUDE.md](../CLAUDE.md) · [README.md](../README.md)
