import { NextResponse } from "next/server";

type AuditRequest = {
  mode?: "audit";
  productUrl?: string;
  marketplace?: string;
  description?: string;
  reviews?: string;
  goal?: string;
};

type CreateRequest = {
  mode?: "create";
  marketplace?: string;
  category?: string;
  productDescription?: string;
  benefits?: string;
  audience?: string;
  questions?: string;
};

type AuditApiRequest = AuditRequest | CreateRequest;

const marketplaces = new Set(["Ozon", "Wildberries"]);

export async function POST(request: Request) {
  let body: AuditApiRequest;

  try {
    body = (await request.json()) as AuditApiRequest;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в запросе" }, { status: 400 });
  }

  const mode = body.mode || "audit";

  if (!marketplaces.has(body.marketplace || "")) {
    return NextResponse.json(
      { error: "Маркетплейс должен быть Ozon или Wildberries" },
      { status: 400 },
    );
  }

  if (mode === "create") {
    return createCardResponse(body as CreateRequest);
  }

  return auditCardResponse(body as AuditRequest);
}

export function GET() {
  return NextResponse.json(
    { error: "Метод GET не поддерживается. Отправьте POST-запрос с данными формы." },
    { status: 405 },
  );
}

function auditCardResponse(body: AuditRequest) {
  if (!body.productUrl) {
    return NextResponse.json(
      { error: "Укажите ссылку на карточку и маркетплейс" },
      { status: 400 },
    );
  }

  if (!isValidUrl(body.productUrl)) {
    return NextResponse.json({ error: "Укажите корректную ссылку на карточку" }, { status: 400 });
  }

  const marketplace = body.marketplace || "Ozon";
  const goal = body.goal?.trim() || "рост конверсии";
  const score = body.description || body.reviews ? 78 : 64;

  return NextResponse.json({
    result: {
      mode: "audit",
      score,
      summary: `Карточка на ${marketplace} выглядит рабочей, но недобирает доверие и поисковый трафик. Главный фокус для следующей итерации: ${goal}.`,
      errors: [
        "В заголовке не хватает конкретного поискового запроса и ключевой характеристики товара.",
        "Описание слабо объясняет выгоду покупателя и не закрывает основные возражения.",
        "Отзывы и боли покупателей не превращены в улучшения фото, инфографики и текста.",
      ],
      seoTitle:
        marketplace === "Ozon"
          ? "Товар для дома с улучшенной комплектацией, надежный вариант для ежедневного использования"
          : "Товар для дома, практичная модель с надежной комплектацией для ежедневного использования",
      salesBlockers: [
        "Покупателю сложно быстро понять, почему этот товар лучше соседних предложений.",
        "Нет явного ответа на вопросы о размере, комплектации, уходе или сценарии использования.",
        "Первый экран карточки не показывает главный результат для покупателя.",
      ],
      recommendations: [
        "Перепишите первый экран карточки вокруг главного сценария покупки и результата для клиента.",
        "Добавьте в описание 3–5 конкретных преимуществ вместо общих формулировок.",
        "Соберите частые вопросы из отзывов и вынесите ответы в фото, характеристики и текст.",
      ],
      firstFixes: [
        "Сначала обновите SEO-заголовок и первые 2 изображения.",
        "Затем добавьте блок с ответами на частые возражения.",
        "После этого проверьте характеристики на полноту и точные формулировки.",
      ],
    },
  });
}

function createCardResponse(body: CreateRequest) {
  if (!body.category || !body.productDescription) {
    return NextResponse.json(
      { error: "Укажите маркетплейс, категорию и название или краткое описание товара" },
      { status: 400 },
    );
  }

  const marketplace = body.marketplace || "Ozon";
  const category = body.category.trim();
  const product = body.productDescription.trim();
  const audience = body.audience?.trim() || "покупателей, которые выбирают практичное решение";

  return NextResponse.json({
    result: {
      mode: "create",
      seoTitle: `${category}: ${product} для ${audience} — надежный выбор на ${marketplace}`,
      improvedDescription: `Этот товар помогает быстро решить повседневную задачу без лишних сложностей. В карточке стоит показать ключевую пользу, понятную комплектацию, сценарии использования и доказательства надежности: материалы, размеры, уход, гарантию и ответы на частые вопросы.`,
      keyPhrases: [
        `${category} для дома`,
        `${category} ${marketplace}`,
        "практичный товар на каждый день",
        "подарок для ежедневного использования",
        "надежная комплектация товара",
      ],
      infographicIdeas: [
        "Первый слайд: главный результат для покупателя и 3 коротких преимущества.",
        "Сравнение: что входит в комплект и чем товар отличается от обычных аналогов.",
        "Сценарии применения: где, кому и в каких ситуациях товар особенно полезен.",
      ],
      objections: [
        "Подойдет ли размер, материал или комплектация под мою задачу.",
        "Будет ли товар выглядеть так же, как на фото.",
        "Насколько товар надежен при регулярном использовании.",
      ],
      characteristics: [
        "Точные размеры, вес, материал и состав комплекта.",
        "Правила ухода, ограничения по использованию и гарантийные условия.",
        "Совместимость, сезонность, назначение и страна производства, если это важно для категории.",
      ],
      refinementPlan: [
        "Собрать SEO-ядро и выбрать 5–7 главных ключевых фраз.",
        "Написать заголовок, описание и характеристики под сценарий покупки.",
        "Подготовить ТЗ для 5 слайдов инфографики и добавить ответы на возражения.",
      ],
    },
  });
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
