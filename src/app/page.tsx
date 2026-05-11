import Link from "next/link";

const directions = [
  {
    title: "Проверить существующую карточку",
    text: "Вставьте ссылку на карточку Ozon или Wildberries — получите оценку, ошибки, рекомендации и что исправить первым.",
    button: "Проверить карточку",
    href: "/audit?mode=audit",
  },
  {
    title: "Создать / улучшить карточку",
    text: "Опишите товар — получите SEO-заголовок, описание, ключевые фразы, идеи для инфографики и план доработки карточки.",
    button: "Создать улучшение",
    href: "/audit?mode=create",
  },
];

const capabilities = [
  "Аудит опубликованной карточки и оценка 0–100",
  "SEO-заголовок, описание и ключевые фразы для новой карточки",
  "Идеи для инфографики, ответы на возражения и план доработки",
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[#eef3ed]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              AI-сервис для Ozon и Wildberries
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Проверьте, создайте или улучшите карточку Ozon/WB с помощью AI
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              CardFix AI помогает найти ошибки в существующей карточке, создать SEO-заголовок,
              улучшить описание, подготовить идеи для инфографики и понять, что мешает
              продажам.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit?mode=audit"
                className="rounded-md bg-[var(--accent)] px-5 py-3 text-center font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Проверить карточку
              </Link>
              <Link
                href="/audit?mode=create"
                className="rounded-md border border-[var(--line)] bg-white px-5 py-3 text-center font-semibold transition hover:border-[var(--accent)]"
              >
                Создать улучшение
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
            <div className="mb-5 border-b border-[var(--line)] pb-4">
              <span className="font-semibold">CardFix AI закрывает два сценария</span>
            </div>
            <div className="space-y-4 text-sm leading-6 text-[var(--muted)]">
              <p>
                Сервис подходит и для карточек, которые уже опубликованы, и для товаров,
                которые нужно упаковать с нуля или улучшить перед рекламой.
              </p>
              <ul className="space-y-3">
                {capabilities.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {directions.map((direction) => (
            <article key={direction.title} className="rounded-lg border border-[var(--line)] bg-white p-6">
              <h2 className="text-2xl font-semibold">{direction.title}</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">{direction.text}</p>
              <Link
                href={direction.href}
                className="mt-6 inline-block rounded-md bg-[var(--accent)] px-5 py-3 text-center font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                {direction.button}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
