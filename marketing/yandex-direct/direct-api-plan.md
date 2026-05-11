# Yandex Direct API plan

## Safety order

1. Run `npm run direct:health`.
2. Confirm `DIRECT_AUTH_OK=true`.
3. Only after API health is OK, create or update campaigns.
4. Never print, commit, or log `YANDEX_DIRECT_TOKEN`.

## Campaigns

- Search campaign: audit existing Ozon/Wildberries cards.
- Search campaign: create or improve marketplace product cards.
- Retargeting campaign: users who visited `/audit` but did not leave a contact.

## Ad groups

- Ozon card audit.
- Wildberries card audit.
- AI product card creation.
- SEO title and description improvement.
- Infographics and reviews improvement.

## Key phrases

- аудит карточки ozon
- аудит карточки wildberries
- проверка карточки товара
- улучшить карточку ozon
- улучшить карточку wildberries
- создать карточку товара ozon
- seo заголовок карточки ozon
- seo заголовок карточки wildberries
- инфографика для карточки товара
- ответы на отзывы маркетплейс

## Ads

- CardFix AI: проверить карточку Ozon/WB бесплатно.
- Найдите ошибки карточки перед запуском рекламы.
- Создайте SEO-заголовок, описание и идеи для инфографики с AI.
- Улучшите карточку товара и получите план правок.

## UTM

- `utm_source=yandex`
- `utm_medium=cpc`
- `utm_campaign={campaign_id}`
- `utm_content={ad_id}`
- `utm_term={keyword}`

Final URL examples:

- `https://cardfix-ai.vercel.app/audit?mode=audit&utm_source=yandex&utm_medium=cpc&utm_campaign={campaign_id}&utm_content={ad_id}&utm_term={keyword}`
- `https://cardfix-ai.vercel.app/audit?mode=create&utm_source=yandex&utm_medium=cpc&utm_campaign={campaign_id}&utm_content={ad_id}&utm_term={keyword}`
