import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-5 py-12">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        Спасибо
      </p>
      <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
        Заявка отправлена
      </h1>
      <p className="mt-4 leading-7 text-[var(--muted)]">
        Мы получили ваш контакт и вернемся с полным отчетом по карточке. Пока можно
        запустить еще один бесплатный мини-аудит.
      </p>
      <Link
        href="/audit"
        className="mt-8 w-full rounded-md bg-[var(--accent)] px-5 py-3 text-center font-semibold text-white transition hover:bg-[var(--accent-strong)] sm:w-fit"
      >
        Проверить другую карточку
      </Link>
    </main>
  );
}
