"use client";

import { FormEvent, useState } from "react";

type Marketplace = "Ozon" | "Wildberries";

type AuditResult = {
  score: number;
  summary: string;
  errors: string[];
  seoTitle: string;
  recommendations: string[];
};

type AuditResponse = {
  result: AuditResult;
};

const initialForm = {
  productUrl: "",
  marketplace: "Ozon" as Marketplace,
  description: "",
  reviews: "",
  goal: "",
};

export function AuditForm({ contactFormUrl }: { contactFormUrl: string }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showContactButton, setShowContactButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setShowContactButton(false);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as AuditResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Не удалось получить аудит");
      }

      setResult(data.result);
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось получить аудит. Попробуйте еще раз.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--line)] bg-white p-5">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Ссылка на карточку *</span>
            <input
              required
              type="url"
              value={form.productUrl}
              onChange={(event) => setForm({ ...form, productUrl: event.target.value })}
              placeholder="https://www.ozon.ru/product/..."
              className="w-full rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Маркетплейс *</span>
            <select
              required
              value={form.marketplace}
              onChange={(event) =>
                setForm({ ...form, marketplace: event.target.value as Marketplace })
              }
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-3 outline-none transition focus:border-[var(--accent)]"
            >
              <option value="Ozon">Ozon</option>
              <option value="Wildberries">Wildberries</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Описание</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
              placeholder="Вставьте описание карточки, если оно есть"
              className="w-full resize-y rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Отзывы</span>
            <textarea
              value={form.reviews}
              onChange={(event) => setForm({ ...form, reviews: event.target.value })}
              rows={4}
              placeholder="Добавьте частые жалобы или цитаты из отзывов"
              className="w-full resize-y rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Цель</span>
            <input
              value={form.goal}
              onChange={(event) => setForm({ ...form, goal: event.target.value })}
              placeholder="Например: поднять конверсию или улучшить SEO"
              className="w-full rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full rounded-md bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Готовим AI-аудит..." : "Получить AI-аудит бесплатно"}
        </button>
      </form>

      <section className="rounded-lg border border-[var(--line)] bg-white p-5">
        {result ? (
          <div>
            <div className="mb-5 flex flex-col gap-3 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                  Мини-аудит
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Результат проверки</h2>
              </div>
              <div className="rounded-md bg-[#e3f2eb] px-4 py-3 text-center">
                <span className="block text-3xl font-semibold text-[var(--accent-strong)]">
                  {result.score}
                </span>
                <span className="text-sm text-[var(--muted)]">из 100</span>
              </div>
            </div>

            <div className="space-y-5">
              <AuditBlock title="Краткий вывод">
                <p className="leading-7 text-[var(--muted)]">{result.summary}</p>
              </AuditBlock>

              <AuditBlock title="3 ошибки">
                <ul className="space-y-2 text-[var(--muted)]">
                  {result.errors.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </AuditBlock>

              <AuditBlock title="SEO-заголовок">
                <p className="rounded-md bg-[#f4f6f1] p-3 font-medium leading-7">
                  {result.seoTitle}
                </p>
              </AuditBlock>

              <AuditBlock title="3 рекомендации">
                <ul className="space-y-2 text-[var(--muted)]">
                  {result.recommendations.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </AuditBlock>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowContactButton(true)}
                className="rounded-md border border-[var(--accent)] px-5 py-3 font-semibold text-[var(--accent)] transition hover:bg-[#eef7f2]"
              >
                Открыть полный отчет за 199 ₽
              </button>
              {showContactButton ? (
                <a
                  href={contactFormUrl}
                  className="rounded-md bg-[var(--accent)] px-5 py-3 text-center font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  Оставить контакт
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[520px] flex-col justify-center rounded-md border border-dashed border-[var(--line)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              Результат появится здесь
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Мини-аудит из 5 блоков</h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              После отправки формы вы увидите оценку, краткий вывод, ошибки,
              SEO-заголовок и рекомендации. Сейчас API возвращает mock-ответ.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function AuditBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
        {title}
      </h3>
      {children}
    </section>
  );
}
