import { AuditForm } from "@/components/audit-form";

export default function AuditPage() {
  const contactFormUrl = process.env.YANDEX_FORM_URL || "/thanks";

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Бесплатный мини-аудит
        </p>
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
          Проверьте или улучшите карточку Ozon/WB с помощью AI
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Вставьте ссылку на существующую карточку или описание товара — получите аудит,
          SEO-заголовок, улучшенное описание, идеи для инфографики и рекомендации.
        </p>
      </div>
      <AuditForm contactFormUrl={contactFormUrl} />
    </main>
  );
}
