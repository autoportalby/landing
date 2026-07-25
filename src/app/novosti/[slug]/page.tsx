import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PostBody, { Lede } from "@/components/post/PostBody";
import { getPostBySlug } from "@/lib/posts";

// Render per request so post status (draft / archived / published) is always
// respected — a post unpublished after build immediately 404s.
export const dynamic = "force-dynamic";

function formatMonthYear(d: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  })
    .format(new Date(d))
    .replace(/\s*г\.?$/, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const image = post.ogImage ?? post.coverImage ?? undefined;
  const images = image ? [image] : undefined;

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: { canonical: `/novosti/${slug}` },
    openGraph: {
      type: "article",
      siteName: "vrum.by",
      title: post.seoTitle,
      description: post.seoDescription,
      url: `/novosti/${slug}`,
      locale: "ru_BY",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
      images,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Split the body: intro paragraphs before the first heading become the lede
  // (rendered inside the header, above its divider); the rest goes to PostBody.
  const firstHeadingIdx = post.body.findIndex((b) => b.type === "heading");
  const lede = firstHeadingIdx > 0 ? post.body.slice(0, firstHeadingIdx) : [];
  const rest = firstHeadingIdx > 0 ? post.body.slice(firstHeadingIdx) : post.body;

  const image = post.ogImage ?? post.coverImage ?? undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
    inLanguage: "ru-BY",
    datePublished: new Date(post.publishedAt).toISOString(),
    ...(image ? { image: `https://vrum.by${image}` } : {}),
    author: { "@type": "Organization", name: "vrum.by" },
    publisher: {
      "@type": "Organization",
      name: "vrum.by",
      logo: { "@type": "ImageObject", url: "https://vrum.by/og-cover.jpg" },
    },
    mainEntityOfPage: `https://vrum.by/novosti/${slug}`,
  };

  return (
    <>
      <div id="top" />
      <Nav />
      <main className="mx-auto max-w-[760px] px-[22px]">
        {/* JSON-LD rendered as inert text content (no dangerouslySetInnerHTML). */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

        <nav
          aria-label="Хлебные крошки"
          className="mt-[26px] flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink-3"
        >
          <Link href="/" className="hover:text-blue">
            Главная
          </Link>
          <span className="opacity-50">›</span>
          <Link href="/novosti" className="hover:text-blue">
            Новости
          </Link>
          <span className="opacity-50">›</span>
          <span>{post.title}</span>
        </nav>

        {post.coverImage ? (
          <div className="mb-1.5 mt-[22px] aspect-[16/6] overflow-hidden rounded-[20px] border border-line-2 bg-surface-2 max-[560px]:aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <header className="mb-[34px] border-b border-line-2 pb-[26px] pt-[22px]">
          <span
            className="inline-block rounded-pill px-[11px] py-[5px] text-[11.5px] font-extrabold uppercase tracking-[0.8px]"
            style={{
              color: post.categoryColor,
              background: `color-mix(in srgb, ${post.categoryColor} 12%, #fff)`,
            }}
          >
            {post.category}
          </span>
          <h1 className="mt-4 font-display text-[clamp(28px,4.4vw,42px)] font-extrabold leading-[1.1] tracking-[-1px] text-ink">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-[13.5px] font-semibold text-ink-3">
            {post.readingMin ? (
              <span className="flex items-center gap-1.5">
                🕐 {post.readingMin} минут чтения
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              Обновлено: {formatMonthYear(post.updatedAt ?? post.publishedAt)}
            </span>
          </div>
          {lede.length > 0 ? <Lede blocks={lede} /> : null}
        </header>

        <PostBody blocks={rest} />

        <section className="relative my-[52px] overflow-hidden rounded-lg bg-[linear-gradient(140deg,#2D63FF,#0B3FCC)] p-[30px] text-center text-white">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.4px]">
            Скоро это будет делать vrum
          </h2>
          <p className="mt-2 text-[15.5px] font-medium opacity-90">
            Мы готовим сервис, который сам проверит объявление, историю и риски и
            подскажет, стоит ли ехать смотреть. Оставьте email — напишем в день
            запуска.
          </p>
          <Link
            href="/#notify"
            className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-white px-6 py-[14px] text-[15.5px] font-extrabold text-blue-ink transition-transform duration-150 hover:-translate-y-px"
          >
            Сообщить о запуске →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
