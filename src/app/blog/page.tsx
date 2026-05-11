import Link from "next/link";

const sections = [
  "Аудит карточек",
  "Создание карточек",
  "SEO и заголовки",
  "Описание и инфографика",
  "Отзывы и возражения",
];

const posts = [
  {
    title: "Как проверить карточку Wildberries перед запуском рекламы",
    section: "Аудит карточек",
    excerpt:
      "Что посмотреть до пополнения рекламного бюджета: заголовок, первый экран, отзывы, характеристики и причины низкой конверсии.",
  },
  {
    title: "Как создать карточку товара для Ozon с помощью AI",
    section: "Создание карточек",
    excerpt:
      "Как из описания товара получить структуру карточки, SEO-заголовок, преимущества и план доработки.",
  },
  {
    title: "SEO-заголовок для карточки Ozon/WB",
    section: "SEO и заголовки",
    excerpt:
      "Как собрать ключевые фразы и превратить их в понятный заголовок без переспама.",
  },
  {
    title: "Как улучшить описание товара на маркетплейсе",
    section: "Описание и инфографика",
    excerpt:
      "Описание должно объяснять пользу, закрывать возражения и помогать покупателю быстрее принять решение.",
  },
  {
    title: "Что добавить в инфографику карточки товара",
    section: "Описание и инфографика",
    excerpt:
      "Идеи для слайдов: сценарии использования, состав комплекта, сравнение, размеры и ответы на частые вопросы.",
  },
  {
    title: "Как отвечать на негативные отзывы",
    section: "Отзывы и возражения",
    excerpt:
      "Как превращать негатив в улучшения карточки, ответы для покупателей и новые блоки инфографики.",
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
          Аудит, создание и улучшение карточек Ozon/WB
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Материалы для продавцов: как проверять существующие карточки, создавать новые
          карточки, улучшать SEO, описание, инфографику и работу с отзывами.
        </p>
      </div>

      <section className="mb-8 flex flex-wrap gap-2">
        {sections.map((section) => (
          <span
            key={section}
            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--muted)]"
          >
            {section}
          </span>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <p className="text-sm font-semibold text-[var(--accent)]">{post.section}</p>
            <h2 className="mt-3 text-xl font-semibold leading-7">{post.title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{post.excerpt}</p>
            <div className="mt-5 rounded-md border border-[var(--line)] bg-[#f4f6f1] p-4">
              <p className="font-semibold">Хотите проверить или улучшить карточку?</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Выберите режим:</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/audit?mode=audit"
                  className="rounded-md bg-[var(--accent)] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  Проверить карточку
                </Link>
                <Link
                  href="/audit?mode=create"
                  className="rounded-md border border-[var(--accent)] px-4 py-2 text-center text-sm font-semibold text-[var(--accent)] transition hover:bg-[#eef7f2]"
                >
                  Создать / улучшить карточку
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
