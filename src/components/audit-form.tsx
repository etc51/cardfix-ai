"use client";

import { FormEvent, useState } from "react";

type Marketplace = "Ozon" | "Wildberries";
type AuditMode = "audit" | "create";

type AuditResult = {
  mode: "audit";
  score: number;
  summary: string;
  errors: string[];
  seoTitle: string;
  salesBlockers: string[];
  recommendations: string[];
  firstFixes: string[];
};

type CreateResult = {
  mode: "create";
  seoTitle: string;
  improvedDescription: string;
  keyPhrases: string[];
  infographicIdeas: string[];
  objections: string[];
  characteristics: string[];
  refinementPlan: string[];
};

type AuditResponse = {
  result: AuditResult | CreateResult;
};

declare global {
  interface Window {
    ym?: (counterId: string, action: "reachGoal", goalName: string) => void;
  }
}

const initialAuditForm = {
  productUrl: "",
  marketplace: "Ozon" as Marketplace,
  description: "",
  reviews: "",
  goal: "",
};

const initialCreateForm = {
  marketplace: "Ozon" as Marketplace,
  category: "",
  productDescription: "",
  benefits: "",
  audience: "",
  questions: "",
};

export function AuditForm({ contactFormUrl }: { contactFormUrl: string }) {
  const [mode, setMode] = useState<AuditMode>("audit");
  const [auditForm, setAuditForm] = useState(initialAuditForm);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [result, setResult] = useState<AuditResult | CreateResult | null>(null);
  const [showContactButton, setShowContactButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function switchMode(nextMode: AuditMode) {
    setMode(nextMode);
    setResult(null);
    setError("");
    setShowContactButton(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reachYandexGoal("audit_submit");
    setIsLoading(true);
    setError("");
    setShowContactButton(false);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "audit" ? { mode, ...auditForm } : { mode, ...createForm }),
      });

      const data = (await response.json()) as AuditResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Не удалось получить результат");
      }

      setResult(data.result);
      reachYandexGoal("audit_result");
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось получить результат. Попробуйте еще раз.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-white p-2 sm:grid-cols-2">
        <ModeButton
          isActive={mode === "audit"}
          title="Проверить существующую карточку"
          onClick={() => switchMode("audit")}
        />
        <ModeButton
          isActive={mode === "create"}
          title="Создать / улучшить карточку"
          onClick={() => switchMode("create")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--line)] bg-white p-5">
          <h2 className="mb-5 text-xl font-semibold">
            {mode === "audit" ? "Проверить существующую карточку" : "Создать / улучшить карточку"}
          </h2>

          {mode === "audit" ? (
            <AuditFields form={auditForm} setForm={setAuditForm} />
          ) : (
            <CreateFields form={createForm} setForm={setCreateForm} />
          )}

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
            {isLoading
              ? "Готовим результат..."
              : mode === "audit"
                ? "Проверить карточку бесплатно"
                : "Создать улучшение бесплатно"}
          </button>
        </form>

        <section className="rounded-lg border border-[var(--line)] bg-white p-5">
          {result ? (
            <div>
              {result.mode === "audit" ? (
                <AuditResultView result={result} />
              ) : (
                <CreateResultView result={result} />
              )}
              <Paywall
                contactFormUrl={contactFormUrl}
                showContactButton={showContactButton}
                onFullReportClick={() => {
                  reachYandexGoal("full_report_click");
                  setShowContactButton(true);
                }}
              />
            </div>
          ) : (
            <div className="flex min-h-[520px] flex-col justify-center rounded-md border border-dashed border-[var(--line)] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Результат появится здесь
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {mode === "audit" ? "Аудит существующей карточки" : "Создание и улучшение карточки"}
              </h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">
                {mode === "audit"
                  ? "После отправки формы вы увидите оценку, ошибки, новый SEO-заголовок, причины потерь продаж и приоритет исправлений."
                  : "После отправки формы вы получите SEO-заголовок, описание, ключевые фразы, идеи для инфографики и план доработки карточки."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ModeButton({
  isActive,
  title,
  onClick,
}: {
  isActive: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-3 text-left font-semibold transition ${
        isActive
          ? "bg-[var(--accent)] text-white"
          : "bg-[#f4f6f1] text-[var(--foreground)] hover:bg-[#edf1ea]"
      }`}
    >
      {title}
    </button>
  );
}

function AuditFields({
  form,
  setForm,
}: {
  form: typeof initialAuditForm;
  setForm: (form: typeof initialAuditForm) => void;
}) {
  return (
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

      <MarketplaceField
        value={form.marketplace}
        onChange={(marketplace) => setForm({ ...form, marketplace })}
      />

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
  );
}

function CreateFields({
  form,
  setForm,
}: {
  form: typeof initialCreateForm;
  setForm: (form: typeof initialCreateForm) => void;
}) {
  return (
    <div className="space-y-5">
      <MarketplaceField
        value={form.marketplace}
        onChange={(marketplace) => setForm({ ...form, marketplace })}
      />

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Категория товара *</span>
        <input
          required
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          placeholder="Например: товары для дома, косметика, одежда"
          className="w-full rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">
          Название или краткое описание товара *
        </span>
        <textarea
          required
          value={form.productDescription}
          onChange={(event) => setForm({ ...form, productDescription: event.target.value })}
          rows={4}
          placeholder="Что это за товар, для чего он нужен и чем отличается"
          className="w-full resize-y rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Преимущества товара</span>
        <textarea
          value={form.benefits}
          onChange={(event) => setForm({ ...form, benefits: event.target.value })}
          rows={3}
          placeholder="Материалы, комплектация, гарантия, удобство, результат"
          className="w-full resize-y rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Целевая аудитория</span>
        <input
          value={form.audience}
          onChange={(event) => setForm({ ...form, audience: event.target.value })}
          placeholder="Например: мамы, дачники, владельцы авто, офисные сотрудники"
          className="w-full rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Отзывы или частые вопросы</span>
        <textarea
          value={form.questions}
          onChange={(event) => setForm({ ...form, questions: event.target.value })}
          rows={3}
          placeholder="Что обычно спрашивают или в чем сомневаются покупатели"
          className="w-full resize-y rounded-md border border-[var(--line)] px-3 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </label>
    </div>
  );
}

function MarketplaceField({
  value,
  onChange,
}: {
  value: Marketplace;
  onChange: (marketplace: Marketplace) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">Маркетплейс *</span>
      <select
        required
        value={value}
        onChange={(event) => onChange(event.target.value as Marketplace)}
        className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-3 outline-none transition focus:border-[var(--accent)]"
      >
        <option value="Ozon">Ozon</option>
        <option value="Wildberries">Wildberries</option>
      </select>
    </label>
  );
}

function AuditResultView({ result }: { result: AuditResult }) {
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Результат аудита
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Проверка существующей карточки</h2>
        </div>
        <div className="rounded-md bg-[#e3f2eb] px-4 py-3 text-center">
          <span className="block text-3xl font-semibold text-[var(--accent-strong)]">
            {result.score}
          </span>
          <span className="text-sm text-[var(--muted)]">из 100</span>
        </div>
      </div>

      <div className="space-y-5">
        <AuditBlock title="Оценка карточки">
          <p className="leading-7 text-[var(--muted)]">
            Текущая оценка: <span className="font-semibold text-[var(--foreground)]">{result.score}/100</span>
          </p>
        </AuditBlock>
        <AuditBlock title="Краткий вывод">
          <p className="leading-7 text-[var(--muted)]">{result.summary}</p>
        </AuditBlock>
        <ListBlock title="Главные ошибки" items={result.errors} markerClassName="bg-red-500" />
        <AuditBlock title="Новый SEO-заголовок">
          <p className="rounded-md bg-[#f4f6f1] p-3 font-medium leading-7">{result.seoTitle}</p>
        </AuditBlock>
        <ListBlock title="Что мешает продаже" items={result.salesBlockers} markerClassName="bg-red-500" />
        <ListBlock title="Рекомендации" items={result.recommendations} />
        <ListBlock title="Что исправить первым" items={result.firstFixes} />
      </div>
    </>
  );
}

function CreateResultView({ result }: { result: CreateResult }) {
  return (
    <>
      <div className="mb-5 border-b border-[var(--line)] pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Результат улучшения
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Создание / улучшение карточки</h2>
      </div>

      <div className="space-y-5">
        <AuditBlock title="SEO-заголовок">
          <p className="rounded-md bg-[#f4f6f1] p-3 font-medium leading-7">{result.seoTitle}</p>
        </AuditBlock>
        <AuditBlock title="Улучшенное описание">
          <p className="leading-7 text-[var(--muted)]">{result.improvedDescription}</p>
        </AuditBlock>
        <ListBlock title="5 ключевых фраз" items={result.keyPhrases} />
        <ListBlock title="3 идеи для инфографики" items={result.infographicIdeas} />
        <ListBlock title="Возражения покупателей" items={result.objections} markerClassName="bg-red-500" />
        <ListBlock title="Что добавить в характеристики" items={result.characteristics} />
        <ListBlock title="План доработки карточки" items={result.refinementPlan} />
      </div>
    </>
  );
}

function Paywall({
  contactFormUrl,
  showContactButton,
  onFullReportClick,
}: {
  contactFormUrl: string;
  showContactButton: boolean;
  onFullReportClick: () => void;
}) {
  return (
    <div className="mt-6 rounded-lg border border-[var(--line)] bg-[#f4f6f1] p-5">
      <h3 className="text-xl font-semibold">Полный отчет за 199 ₽</h3>
      <p className="mt-3 leading-7 text-[var(--muted)]">
        В полном отчете будут SEO-ключи, 3–5 вариантов заголовка, улучшенное описание,
        анализ отзывов, ТЗ для инфографики, ответы на отзывы и план на 7 дней.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onFullReportClick}
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
  );
}

function ListBlock({
  title,
  items,
  markerClassName = "bg-[var(--accent)]",
}: {
  title: string;
  items: string[];
  markerClassName?: string;
}) {
  return (
    <AuditBlock title={title}>
      <ul className="space-y-2 text-[var(--muted)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${markerClassName}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </AuditBlock>
  );
}

function reachYandexGoal(goalName: string) {
  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  if (!counterId || typeof window === "undefined" || typeof window.ym !== "function") {
    return;
  }

  try {
    window.ym(counterId, "reachGoal", goalName);
  } catch {
    // Analytics must not block the audit flow.
  }
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
