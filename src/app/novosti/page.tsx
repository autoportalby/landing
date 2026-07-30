import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Pager from "@/components/Pager";
import { listPosts, type PostListItem } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Новости — vrum.by",
  description:
    "Автомобильные новости, разборы и советы по покупке б/у авто в Беларуси: цены на рынке, проверка машины, растаможка, надёжные модели.",
  alternates: { canonical: "/novosti" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "vrum.by",
    title: "Новости и советы — vrum.by",
    description: "Автомобильные новости и разборы по покупке авто в Беларуси.",
    url: "/novosti",
    locale: "ru_BY",
  },
};

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function metaLine(post: PostListItem) {
  if (post.kind === "article" && post.readingMin != null) {
    return `🕐 ${post.readingMin} мин`;
  }
  const d = new Date(post.publishedAt);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function NewsCard({ post }: { post: PostListItem }) {
  return (
    <Link
      href={`/novosti/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-r border border-line bg-surface shadow-1 transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-2 min-[721px]:flex-row min-[721px]:gap-5"
    >
      <div className="relative aspect-[16/10] w-full flex-none overflow-hidden bg-surface-2 min-[721px]:w-[240px]">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width:721px) 240px, 100vw"
            unoptimized={post.coverImage.endsWith(".svg")}
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[linear-gradient(150deg,#2D63FF,#0B3FCC)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-[38px] w-[38px]"
              aria-hidden="true"
            >
              <path
                d="M3 16l5-5 4 4 8-8"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 7h4v4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center p-[18px] min-[721px]:py-4 min-[721px]:pl-0 min-[721px]:pr-5">
        <span
          className="text-[11px] font-extrabold uppercase tracking-[0.6px] text-ink-3"
          style={{ color: post.categoryColor }}
        >
          {post.category}
        </span>
        <h3 className="mt-[7px] text-[18px] font-extrabold leading-[1.25] tracking-[-0.3px] text-ink">
          {post.title}
        </h3>
        <p className="mt-2 text-[14px] font-medium leading-[1.5] text-ink-2">
          {post.excerpt}
        </p>
        <div className="mt-[11px] flex flex-wrap gap-[10px] text-[12.5px] font-semibold text-ink-3">
          <span>{metaLine(post)}</span>
          <span>{post.feedTag}</span>
        </div>
      </div>
    </Link>
  );
}

export default async function NovostiPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const { posts, pages, page: cur, unavailable } = await listPosts(Number(page) || 1);

  return (
    <>
      <div id="top" />
      <Nav />
      <main>
        <header className="px-[22px] pb-[30px] pt-[44px] text-center">
          <div className="mx-auto w-full max-w-wrap">
            <span className="text-[12.5px] font-extrabold uppercase tracking-[1.2px] text-blue">
              Новости и советы
            </span>
            <h1 className="mt-3 font-display text-[clamp(30px,4.6vw,46px)] font-extrabold leading-[1.08] tracking-[-1.2px] text-ink">
              Автомобильные новости и разборы
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] text-[16px] font-medium text-ink-2">
              О рынке авто, проверке и покупке машины в Беларуси — свежие
              материалы и практические гайды.
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-wrap px-[22px] pb-16">
          {/* An unreachable feed and an empty feed are different things: telling a
              reader "скоро появятся материалы" during an outage hides it. */}
          {unavailable ? (
            <p className="mx-auto mt-2 max-w-[880px] text-center text-[15px] font-medium text-ink-3">
              Лента временно недоступна. Обновите страницу через минуту.
            </p>
          ) : posts.length === 0 ? (
            <p className="mx-auto mt-2 max-w-[880px] text-center text-[15px] font-medium text-ink-3">
              Скоро здесь появятся материалы.
            </p>
          ) : (
            <div className="mx-auto mt-2 flex max-w-[880px] flex-col gap-4">
              {posts.map((post) => (
                <NewsCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          <Pager page={cur} pages={pages} basePath="/novosti" />
        </div>
      </main>
      <Footer />
    </>
  );
}
