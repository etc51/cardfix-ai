import { Suspense } from "react";
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
          Выберите режим: проверить уже опубликованную карточку или создать/улучшить
          карточку товара.
        </p>
      </div>
      <Suspense fallback={null}>
        <AuditForm contactFormUrl={contactFormUrl} />
      </Suspense>
    </main>
  );
}
