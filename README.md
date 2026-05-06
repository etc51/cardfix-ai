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
```

## Маршруты

- `/` - главная
- `/audit` - форма бесплатного аудита
- `/blog` - список статей
- `/thanks` - страница благодарности
- `/api/audit` - mock API аудита
