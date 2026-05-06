import Link from "next/link";

const posts = [
  {
    title: "Как понять, что карточка теряет показы",
    excerpt: "Проверяем заголовок, характеристики, фото и первые отзывы перед запуском рекламы.",
  },
  {
    title: "Что писать в SEO-заголовке для Ozon",
    excerpt: "Короткая схема: ключевой запрос, тип товара, важная характеристика и сценарий покупки.",
  },
  {
    title: "Три ошибки в описании, которые снижают конверсию",
    excerpt: "Описание должно закрывать сомнения покупателя, а не повторять характеристики без пользы.",
  },
];

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Блог
        </p>
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
          Практика роста карточек на маркетплейсах
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Короткие материалы для продавцов Ozon и Wildberries: SEO, конверсия,
          отзывы и упаковка товара.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <h2 className="text-xl font-semibold leading-7">{post.title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{post.excerpt}</p>
            <Link href="/audit" className="mt-5 inline-block font-semibold text-[var(--accent)]">
              Проверить карточку
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
