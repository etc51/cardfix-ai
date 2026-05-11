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
