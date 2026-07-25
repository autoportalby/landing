# Дизайн: перенос статей и «Новостей» в vrum-next (лента из БД)

Дата: 2026-07-25
Статус: одобрено (design), ожидает вычитки спеки перед планом.

## Цель

Портировать в `vrum-next` (Next.js 16 App Router + Prisma/Postgres) 4 статьи и
страницу «Новости» из статических файлов оригинала:
`kak-proverit-avto-pered-pokupkoy.html`, `priznaki-skruchennogo-probega.html`,
`voprosy-prodavcu.html`, `stoimost-vladeniya.html`, `novosti.html`.

Новое требование: **лента новостей и тела статей берутся из базы данных**, а не
из статики. Тело статьи хранится как **типизированные JSON-блоки** и рендерится
типобезопасным рендерером (без `dangerouslySetInnerHTML`). Пагинация ленты —
**серверная** через `?page=N`.

## 1. Модель данных (Prisma)

Единая таблица `Post` (и статьи, и новости — одна лента, разделяются `kind`):

```prisma
enum PostKind {
  article
  news
}

model Post {
  id             String   @id @default(cuid())
  slug           String   @unique
  kind           PostKind
  category       String   // ярлык: "Чек-лист" / "Риски" / "Переговоры" / "Деньги" / "Новость"
  categoryColor  String   // CSS-значение цвета ярлыка (напр. "var(--blue)" / "#9a6300")
  title          String
  excerpt        String   // анонс в ленте
  coverImage     String?  // "/img/guide-*.jpg"; null → плейсхолдер-плитка с иконкой
  readingMin     Int?     // напр. 7 (для "7 мин")
  feedTag        String   // правый ярлык в .news-meta: "Гайд" / "Новость"
  publishedAt    DateTime
  seoTitle       String
  seoDescription String
  ogImage        String?
  body           Json     // Block[] (см. раздел 2)
  createdAt      DateTime @default(now())

  @@index([publishedAt])
}
```

Заметки:
- `body` типизируется на уровне приложения как `Block[]` (Prisma `Json`).
- Индекс по `publishedAt` — под сортировку/пагинацию ленты (desc).

## 2. Блоки тела (`Block[]`)

Типобезопасный union (TS), сериализуется в `Json`. Рендерер сопоставляет
`type` → JSX; никакого `dangerouslySetInnerHTML`.

```ts
type Span = string | { text: string; bold?: boolean; href?: string };

type Block =
  | { type: "heading"; level: 2 | 3; text: string; anchor: string }
  | { type: "paragraph"; spans: Span[] }
  | { type: "list"; ordered: boolean; items: Span[][] }
  | { type: "callout"; variant: "tip" | "warn"; title?: string; body: Span[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "image"; src: string; alt: string; caption?: string };
```

- **TOC** (оглавление) генерируется из `heading`-блоков (по `anchor`), отдельным
  блоком не хранится.
- Инлайн-форматирование (жирный, ссылки) выражается через `Span`.
- `table` — под блок «стоимость владения» (`.costs`).

## 3. Рендеринг

- `src/components/post/PostBody.tsx` — server component, `blocks: Block[]` →
  JSX. По одному под-компоненту на тип блока (Heading, Paragraph, List,
  Callout, Table, Image) + `Toc` (строит оглавление из заголовков).
- Стили `.prose / .callout.tip / .callout.warn / .toc / .costs / .art-banner`
  из оригинала переносятся в `globals.css` (или Tailwind-классы), чтобы вид 1:1.

## 4. Роутинг

- `/novosti` — лента. Server component. Параметр `?page=N` (PER_PAGE = 5).
  Prisma `findMany({ orderBy: publishedAt desc, skip, take })` + `count()`.
  Пагинатор `‹ 1 2 ›` — реальные ссылки на `?page=`; крайние — disabled.
  Разметка/стили `.news-item / .news-cat / .thumb / .pager` из оригинала.
- `/novosti/[slug]` — страница поста (article или news). `generateStaticParams`
  из всех slug; рендер баннера + `PostBody`. 404 (`notFound()`) на неизвестный slug.
- Обновление ссылок лендинга:
  - `Guides.tsx`: карточки ведут на `/novosti/<slug>` (вместо `*.html`).
  - `Nav.tsx` / `Footer.tsx`: «Новости» → `/novosti` (вместо `novosti.html`).

## 5. Сидинг

- `prisma/seed.ts` заливает 10 постов, подключается через `package.json`
  → `"prisma": { "seed": "tsx prisma/seed.ts" }`; запуск `npx prisma db seed`.
- 4 статьи (`kind=article`): полные `Block[]`, извлечённые из оригинальных HTML
  (заголовки, абзацы, списки, врезки tip/warn, таблица, кросс-ссылки).
- 6 новостей (`kind=news`): короткое тело (1–2 абзаца), плейсхолдер-обложка.
- Идемпотентность: `upsert` по `slug` (повторный сид не плодит дубли).
- Маппинг статей (slug → категория / цвет / обложка / чтение):
  - `kak-proverit-avto-pered-pokupkoy` — Чек-лист / `var(--blue)` / guide-inspect.jpg / 7
  - `priznaki-skruchennogo-probega` — Риски / `#9a6300` / guide-odometer.jpg / 5
  - `voprosy-prodavcu` — Переговоры / `#0a7a48` / guide-questions.jpg / 6
  - `stoimost-vladeniya` — Деньги / `var(--blue-ink)` / guide-cost.jpg / 8
    (цвет «Деньги» = blue-ink — консистентно со сведённой палитрой лендинга)
- Обложки статей уже скопированы в `public/img/` (guide-*.jpg).

## 6. SEO

- `/novosti/[slug]` → `generateMetadata` из `seoTitle/seoDescription/ogImage`
  (+ canonical `/novosti/<slug>`), JSON-LD `Article` (headline, datePublished,
  image, author/publisher vrum.by).
- `/novosti` → свои title/description + JSON-LD `ItemList` первых элементов.
- `metadataBase` уже задан (`https://vrum.by`).

## 7. Исполнение роем (superpowers: dispatching-parallel-agents)

- **Фаза 1 — фундамент (последовательно):** Prisma-модель + миграция; типы
  `Block`; `PostBody` + под-компоненты; стили `.prose/.callout/.toc/.costs` в
  globals; роуты `/novosti` и `/novosti/[slug]`; пагинатор; правка ссылок
  лендинга (Guides/Nav/Footer). Барьер: без этого рой контент-агентов не соберётся.
- **Фаза 2 — контент (параллельно, рой):** 4 агента, каждый читает свой
  исходный HTML и выдаёт `Block[]` + SEO-поля для одной статьи; +1 агент — 6
  новостей. Задачи независимы → параллельно.
- **Фаза 3 — сборка:** собрать `prisma/seed.ts` из результатов фазы 2; поднять
  БД (docker compose), `prisma migrate` + `db seed`; `tsc` + `lint` + `build`;
  прогнать локально: лента + пагинация + 4 страницы статей + мета; скриншот-сверка
  статьи с оригиналом.
- **Фаза 4 — ревью (адверсариально):** паритет рендера статьи vs оригинал,
  корректность блоков (врезки/таблица/оглавление), SEO-мета, a11y.
- Статус пользователю каждые ~5 минут (ScheduleWakeup), финальный отчёт по
  завершении.

## 8. Вне скоупа

- Админка/CMS для редактирования постов (только сидинг сейчас).
- Реальные тексты 6 новостей (сид — короткие заглушки в тон pre-launch).
- Полнотекстовый поиск, теги/фильтры ленты, RSS.
- Перенос спеки в git (репозиторий — домашняя папка; коммит не делаем).

## 9. Критерии готовности

- `/novosti` отдаёт ленту из БД, серверная пагинация `?page=` работает (5/стр).
- 4 статьи доступны на `/novosti/<slug>`, тело рендерится из `Block[]` 1:1 с
  оригиналом (заголовки, врезки, таблица, оглавление, баннер).
- 6 новостей присутствуют в ленте.
- Ссылки лендинга (Guides/Nav/Footer) ведут на новые роуты, «мёртвых» `.html` нет.
- SEO-мета и JSON-LD присутствуют на ленте и на страницах постов.
- `tsc` 0, `lint` чисто, `build` зелёный; горизонтального оверфлоу нет на мобиле.
