import { NextResponse } from "next/server";
import { getSafeGigaChatError, requestGigaChatJson } from "@/lib/gigachat-client";

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
const fallbackError =
  "AI-сервис временно недоступен. Попробуйте повторить запрос позже или оставьте контакт для полного отчета.";

export const runtime = "nodejs";

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

  const validationError =
    mode === "create" ? validateCreateRequest(body as CreateRequest) : validateAuditRequest(body as AuditRequest);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const result =
      mode === "create"
        ? await generateCreateResult(body as CreateRequest)
        : await generateAuditResult(body as AuditRequest);

    return NextResponse.json({ result });
  } catch (error) {
    const safeError = getSafeGigaChatError(error);
    console.error("GigaChat audit request failed:", safeError.type, safeError.code || "");
    return NextResponse.json(
      { code: safeError.code, error: fallbackError, errorType: safeError.type },
      { status: 503 },
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: "Метод GET не поддерживается. Отправьте POST-запрос с данными формы." },
    { status: 405 },
  );
}

function validateAuditRequest(body: AuditRequest) {
  if (!body.productUrl) {
    return "Укажите ссылку на карточку и маркетплейс";
  }

  if (!isValidUrl(body.productUrl)) {
    return "Укажите корректную ссылку на карточку";
  }

  return "";
}

function validateCreateRequest(body: CreateRequest) {
  if (!body.category || !body.productDescription) {
    return "Укажите маркетплейс, категорию и название или краткое описание товара";
  }

  return "";
}

async function generateAuditResult(body: AuditRequest) {
  const prompt = buildAuditPrompt(body);
  const rawResult = await requestGigaChatJson(prompt);

  return {
    mode: "audit" as const,
    score: normalizeScore(rawResult.score),
    summary: normalizeString(rawResult.summary),
    mainProblems: normalizeStringArray(rawResult.mainProblems, 3),
    seoTitle: normalizeString(rawResult.seoTitle),
    blockers: normalizeStringArray(rawResult.blockers, 3),
    recommendations: normalizeStringArray(rawResult.recommendations, 3),
    firstFixes: normalizeStringArray(rawResult.firstFixes, 3),
  };
}

async function generateCreateResult(body: CreateRequest) {
  const prompt = buildCreatePrompt(body);
  const rawResult = await requestGigaChatJson(prompt);

  return {
    mode: "create" as const,
    seoTitle: normalizeString(rawResult.seoTitle),
    improvedDescription: normalizeString(rawResult.improvedDescription),
    keywords: normalizeStringArray(rawResult.keywords, 5),
    infographicIdeas: normalizeStringArray(rawResult.infographicIdeas, 3),
    objections: normalizeStringArray(rawResult.objections, 3),
    characteristicsIdeas: normalizeStringArray(rawResult.characteristicsIdeas, 3),
    improvementPlan: normalizeStringArray(rawResult.improvementPlan, 3),
  };
}

function buildAuditPrompt(body: AuditRequest) {
  return [
    "Ты эксперт по карточкам товаров Ozon и Wildberries.",
    "Проведи аудит существующей карточки. Ответь строго JSON без markdown и пояснений.",
    "Схема JSON:",
    '{"score":75,"summary":"...","mainProblems":["...","...","..."],"seoTitle":"...","blockers":["...","...","..."],"recommendations":["...","...","..."],"firstFixes":["...","...","..."]}',
    "",
    `Маркетплейс: ${body.marketplace}`,
    `Ссылка на карточку: ${body.productUrl}`,
    `Цель: ${body.goal?.trim() || "улучшить продажи и SEO"}`,
    `Описание карточки: ${limitText(body.description, 4000) || "не указано"}`,
    `Отзывы: ${limitText(body.reviews, 8000) || "не указаны"}`,
  ].join("\n");
}

function buildCreatePrompt(body: CreateRequest) {
  return [
    "Ты эксперт по созданию и улучшению карточек товаров Ozon и Wildberries.",
    "Подготовь улучшение карточки. Ответь строго JSON без markdown и пояснений.",
    "Схема JSON:",
    '{"seoTitle":"...","improvedDescription":"...","keywords":["...","...","...","...","..."],"infographicIdeas":["...","...","..."],"objections":["...","...","..."],"characteristicsIdeas":["...","...","..."],"improvementPlan":["...","...","..."]}',
    "",
    `Маркетплейс: ${body.marketplace}`,
    `Категория товара: ${body.category}`,
    `Название или краткое описание товара: ${limitText(body.productDescription, 4000)}`,
    `Преимущества товара: ${limitText(body.benefits, 4000) || "не указаны"}`,
    `Целевая аудитория: ${body.audience?.trim() || "не указана"}`,
    `Отзывы или частые вопросы: ${limitText(body.questions, 8000) || "не указаны"}`,
  ].join("\n");
}

function normalizeScore(value: unknown) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown, fallbackLength: number) {
  if (Array.isArray(value)) {
    return value.map(normalizeString).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return Array.from({ length: fallbackLength }, () => "");
}

function limitText(value: string | undefined, maxLength: number) {
  return (value || "").trim().slice(0, maxLength);
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
