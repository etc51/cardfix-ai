import Link from "next/link";

const features = [
  "Проверка карточки по ссылке на Ozon или Wildberries",
  "Быстрый вывод по главным проблемам продаж",
  "SEO-заголовок и рекомендации для следующей правки",
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[#eef3ed]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              MVP для продавцов маркетплейсов
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              CardFix AI находит ошибки в карточках Ozon и Wildberries за одну минуту
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Вставьте ссылку на товар, выберите маркетплейс и получите мини-аудит:
              оценку, ошибки, SEO-заголовок и практичные рекомендации.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit"
                className="rounded-md bg-[var(--accent)] px-5 py-3 text-center font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Получить AI-аудит бесплатно
              </Link>
              <Link
                href="/blog"
                className="rounded-md border border-[var(--line)] bg-white px-5 py-3 text-center font-semibold transition hover:border-[var(--accent)]"
              >
                Читать блог
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <span className="font-semibold">Пример аудита</span>
              <span className="rounded-md bg-[#e3f2eb] px-3 py-1 text-sm font-semibold text-[var(--accent-strong)]">
                78/100
              </span>
            </div>
            <div className="space-y-4 text-sm leading-6 text-[var(--muted)]">
              <p>
                Карточка понятна, но теряет показы из-за слабого заголовка и не
                закрывает главные возражения в описании.
              </p>
              <ul className="space-y-3">
                {features.map((feature) => (
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
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["1", "Вставьте ссылку", "Поддерживаются карточки Ozon и Wildberries."],
            ["2", "Добавьте контекст", "Описание, отзывы и цель помогут сделать вывод точнее."],
            ["3", "Получите план", "Мини-аудит показывает, что исправить в первую очередь."],
          ].map(([number, title, text]) => (
            <article key={number} className="rounded-lg border border-[var(--line)] bg-white p-5">
              <span className="text-sm font-semibold text-[var(--accent)]">{number}</span>
              <h2 className="mt-3 text-xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-[var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
