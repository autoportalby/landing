# TODO — vrum-next

- [ ] **Заменить плейсхолдер-контакты.** В `src/components/Footer.tsx` стоит заглушка `hello@vrum.by` (mailto). Перед запуском заменить на реальный контактный адрес/канал.
- [ ] **Включить аналитику.** Создать счётчики и задать в env хостинга `NEXT_PUBLIC_YM_ID` (Яндекс.Метрика) и `NEXT_PUBLIC_GA_ID` (GA4, `G-…`). Без них аналитика инертна (код готов: `src/components/Analytics.tsx`, `src/lib/analytics.ts`).


Рунбук деплоя

1. Supabase → строки подключения (Project → Settings → Database):
- Pooled (Transaction, порт 6543) → это DATABASE_URL, допиши ?pgbouncer=true&connection_limit=1
- Direct (Session, порт 5432) → это DIRECT_URL
(в обеих подставь пароль проекта)

2. Залить схему + данные в Supabase (один раз, из твоего терминала — секреты остаются локально). В vrum-next/:
DATABASE_URL="<pooled...>" DIRECT_URL="<direct...>" npx prisma migrate deploy
DATABASE_URL="<pooled...>" DIRECT_URL="<direct...>" npx prisma db seed   # 10 постов
Делай это до первого деплоя — тогда Vercel пререндерит страницы статей.

3. Код в GitHub (для авто-деплоя). В vrum-next/:
git init && git add -A && git commit -m "vrum.by Next.js app"
git branch -M main
git remote add origin git@github.com:<ты>/vrum-by.git
git push -u origin main
(Могу выполнить git init + первый коммит прямо сейчас — скажи.)

4. Vercel → New Project → Import этот репозиторий:
- Framework определится как Next.js (build по умолчанию).
- Environment Variables (Production + Preview): DATABASE_URL, DIRECT_URL (и позже NEXT_PUBLIC_YM_ID, NEXT_PUBLIC_GA_ID для аналитики). Задать до деплоя.
- Deploy.

5. Домен (Vercel → Settings → Domains): добавь vrum.by (+www). У регистратора пропиши DNS, что покажет Vercel (обычно A @ → 76.76.21.21 и CNAME www → cname.vercel-dns.com). SSL Vercel выпустит сам.

6. Проверка после деплоя: открыть https://vrum.by, оставить email (появится строка в таблице Subscriber в Supabase), проголосовать, глянуть /novosti + статью, /sitemap.xml, /robots.txt.