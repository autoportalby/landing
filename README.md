This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## Страница 404 (`src/app/not-found.tsx`)

### Суть

404 сделана не как «страница ошибки», а как **логичное продолжение сайта**: попав в тупик, пользователь сразу встречается с ядром продукта — умным подбором авто. Посыл вместо «что-то сломалось»: «Не нашли страницу — но найдём вам машину». Оформление полностью в бренде сайта (сине-ведущая палитра, тот же логотип, что в шапке, шрифты Unbounded/Manrope, общие дизайн-токены).

### Как форма работает **сейчас** (пре-лонч)

Живого AI-поиска ещё нет, поэтому поле не имитирует поиск, а **честно собирает заявку**:

1. Пользователь описывает нужную машину (или выбирает готовую подсказку — она подставляется в поле).
2. Нажимает «Найти автомобиль» → поле переключается на ввод **email**, с явной плашкой «AI-подбор ещё в работе».
3. Оставляет email → заявка сохраняется через `POST /api/subscribe` (`source: "404"`, текст запроса — в поле `Subscriber.note`), показывается подтверждение «Заявка принята. Подберём и напишем на запуске».

Статус подписки **общий для всего сайта** (`localStorage` + стор `src/lib/use-subscribe.ts`): если email уже оставлен где угодно (включая формы на главной) — 404 сразу показывает зелёную плашку «Вы уже в списке», и наоборот. До чтения `localStorage` рисуется скелетон, чтобы форма не мигала.

### Как будет работать **после запуска**

То же поле станет **реальным AI-поиском**: запрос будет уходить в подборщик и возвращать подходящие варианты прямо здесь (вместо сбора email), а подсказки станут быстрыми пресетами. Заявки, собранные до запуска (с текстом в `note`), — готовый сигнал спроса: что и в каком бюджете ищут люди.

### Про дизайн

Единственный тёплый акцент на холодном сине-белом поле — **оранжевая линия с точкой**. Это метафора продукта: **линия — дорога, точка — едущая по ней машина**. Поэтому точка не статична — она «едет» по линии и пульсирует, как метка навигации на маршруте. Фоновые светлые контуры — топографическая карта. Крупный контурный «404» намеренно тихий, чтобы не спорить с поисковой строкой (герой экрана). Вся анимация (движение точки, спин звезды логотипа при наведении, прорисовка линии, частицы) — только `transform`/`opacity` и уважает `prefers-reduced-motion`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
