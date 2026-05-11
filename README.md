# CardFix AI

MVP сайта для бесплатного AI-аудита карточек Ozon и Wildberries.

## Запуск

```bash
npm install
npm run dev
```

Создайте `.env` по примеру `.env.example` и задайте:

```bash
YANDEX_FORM_URL=https://forms.yandex.ru/u/your-form/
NEXT_PUBLIC_YANDEX_METRIKA_ID=109088866
GIGACHAT_AUTH_KEY=
GIGACHAT_MODEL=GigaChat-Max
GIGACHAT_CA_CERT=
```

## Маршруты

- `/` - главная
- `/audit` - форма бесплатного аудита
- `/blog` - список статей
- `/thanks` - страница благодарности
- `/api/audit` - API аудита и улучшения карточек через GigaChat
- `/api/gigachat-health` - безопасная диагностика подключения GigaChat

## GigaChat на Vercel

В Vercel нужны переменные:

```bash
GIGACHAT_AUTH_KEY=
GIGACHAT_MODEL=GigaChat-Max
GIGACHAT_CA_CERT=
```

`GIGACHAT_CA_CERT` должен содержать доверенный CA/cert chain для GigaChat/Sber. Поддерживаются PEM, PEM с escaped `\n`, base64 от PEM и несколько PEM подряд.

После deploy откройте `/api/gigachat-health`. Нормальный статус:

- `env.authKeyPresent: true`
- `env.modelPresent: true`
- `env.caCertPresent: true`
- `ca.parsed: true`
- `ca.certificatesFound >= 1`
- `agent.customAgent: true`
- `agent.rejectUnauthorized: true`
- `auth.ok: true`
- `chat.ok: true`
- `ok: true`

Если `chat.ok: true`, то `/api/audit` использует тот же GigaChat client и должен работать.
