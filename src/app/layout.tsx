import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CardFix AI",
  description:
    "AI-сервис для проверки, создания и улучшения карточек Ozon и Wildberries.",
};

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/audit?mode=audit", label: "Проверить карточку" },
  { href: "/audit?mode=create", label: "Создать карточку" },
  { href: "/blog", label: "Блог" },
];

const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {yandexMetrikaId ? (
          <>
            <Script id="yandex-metrika" strategy="afterInteractive">
              {`
                (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                    if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                ym(${yandexMetrikaId}, "init", {
                  clickmap: true,
                  trackLinks: true,
                  accurateTrackBounce: true,
                  webvisor: true
                });
              `}
            </Script>
            <noscript>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc.yandex.ru/watch/${yandexMetrikaId}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        ) : null}
        <header className="border-b border-[var(--line)] bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-xl font-semibold tracking-normal">
              CardFix AI
            </Link>
            <nav className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 transition hover:bg-[#edf1ea] hover:text-[var(--foreground)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-[var(--line)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              CardFix AI — AI-сервис для проверки, создания и улучшения карточек Ozon и
              Wildberries.
            </p>
            <Link href="/audit" className="font-medium text-[var(--accent)]">
              Выбрать режим
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
