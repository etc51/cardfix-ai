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
          Проверьте карточку Ozon или Wildberries
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Заполните обязательные поля и получите mock-отчет для MVP. Позже сюда можно
          подключить GigaChat или другой AI-провайдер.
        </p>
      </div>
      <AuditForm contactFormUrl={contactFormUrl} />
    </main>
  );
}
