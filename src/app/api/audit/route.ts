import { NextResponse } from "next/server";

type AuditRequest = {
  productUrl?: string;
  marketplace?: string;
  description?: string;
  reviews?: string;
  goal?: string;
};

const marketplaces = new Set(["Ozon", "Wildberries"]);

export async function POST(request: Request) {
  let body: AuditRequest;

  try {
    body = (await request.json()) as AuditRequest;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в запросе" }, { status: 400 });
  }

  if (!body.productUrl || !body.marketplace) {
    return NextResponse.json(
      { error: "Укажите ссылку на карточку и маркетплейс" },
      { status: 400 },
    );
  }

  if (!marketplaces.has(body.marketplace)) {
    return NextResponse.json(
      { error: "Маркетплейс должен быть Ozon или Wildberries" },
      { status: 400 },
    );
  }

  const urlIsValid = isValidUrl(body.productUrl);

  if (!urlIsValid) {
    return NextResponse.json({ error: "Укажите корректную ссылку на карточку" }, { status: 400 });
  }

  const score = body.description || body.reviews ? 78 : 64;
  const marketplace = body.marketplace;
  const goal = body.goal?.trim() || "рост конверсии";

  return NextResponse.json({
    result: {
      score,
      summary: `Карточка на ${marketplace} выглядит рабочей, но сейчас недобирает доверие и поисковый трафик. Главный фокус для следующей итерации: ${goal}.`,
      errors: [
        "В заголовке не хватает конкретного поискового запроса и ключевой характеристики товара.",
        "Описание слабо объясняет выгоду покупателя и не закрывает основные возражения.",
        "Отзывы и боли покупателей не превращены в улучшения фото, инфографики и текста.",
      ],
      seoTitle:
        marketplace === "Ozon"
          ? "Товар для дома с улучшенной комплектацией, надежный вариант для ежедневного использования"
          : "Товар для дома, практичная модель с надежной комплектацией для ежедневного использования",
      recommendations: [
        "Перепишите первый экран карточки вокруг главного сценария покупки и результата для клиента.",
        "Добавьте в описание 3-5 конкретных преимуществ вместо общих формулировок.",
        "Соберите частые вопросы из отзывов и вынесите ответы в фото, характеристики и текст.",
      ],
    },
  });
}

export function GET() {
  return NextResponse.json(
    { error: "Метод GET не поддерживается. Отправьте POST-запрос с данными формы." },
    { status: 405 },
  );
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
