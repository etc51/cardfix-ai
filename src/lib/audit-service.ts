import { requestGigaChatJson } from "@/lib/gigachat-client";

export type Marketplace = "Ozon" | "Wildberries";

export type AuditRequest = {
  mode?: "audit";
  productUrl?: string;
  marketplace?: string;
  description?: string;
  reviews?: string;
  goal?: string;
};

export type CreateRequest = {
  mode?: "create";
  marketplace?: string;
  category?: string;
  productDescription?: string;
  benefits?: string;
  audience?: string;
  questions?: string;
};

export type AuditApiRequest = AuditRequest | CreateRequest;

export type AuditResult = {
  blockers: string[];
  firstFixes: string[];
  mainProblems: string[];
  mode: "audit";
  recommendations: string[];
  score: number;
  seoTitle: string;
  summary: string;
};

export type CreateResult = {
  characteristicsIdeas: string[];
  improvedDescription: string;
  improvementPlan: string[];
  infographicIdeas: string[];
  keywords: string[];
  mode: "create";
  objections: string[];
  seoTitle: string;
};

const marketplaces = new Set(["Ozon", "Wildberries"]);

export function validateAuditPayload(body: AuditApiRequest) {
  const mode = body.mode || "audit";

  if (!marketplaces.has(body.marketplace || "")) {
    return "Маркетплейс должен быть Ozon или Wildberries";
  }

  if (mode === "create") {
    return validateCreateRequest(body as CreateRequest);
  }

  return validateAuditRequest(body as AuditRequest);
}

export async function generateAuditResult(body: AuditRequest): Promise<AuditResult> {
  const prompt = buildAuditPrompt(body);
  const rawResult = await requestGigaChatJson(prompt);

  return {
    mode: "audit",
    score: normalizeScore(rawResult.score),
    summary: normalizeString(rawResult.summary),
    mainProblems: normalizeStringArray(rawResult.mainProblems, 3),
    seoTitle: normalizeString(rawResult.seoTitle),
    blockers: normalizeStringArray(rawResult.blockers, 3),
    recommendations: normalizeStringArray(rawResult.recommendations, 3),
    firstFixes: normalizeStringArray(rawResult.firstFixes, 3),
  };
}

export async function generateCreateResult(body: CreateRequest): Promise<CreateResult> {
  const prompt = buildCreatePrompt(body);
  const rawResult = await requestGigaChatJson(prompt);

  return {
    mode: "create",
    seoTitle: normalizeString(rawResult.seoTitle),
    improvedDescription: normalizeString(rawResult.improvedDescription),
    keywords: normalizeStringArray(rawResult.keywords, 5),
    infographicIdeas: normalizeStringArray(rawResult.infographicIdeas, 3),
    objections: normalizeStringArray(rawResult.objections, 3),
    characteristicsIdeas: normalizeStringArray(rawResult.characteristicsIdeas, 3),
    improvementPlan: normalizeStringArray(rawResult.improvementPlan, 3),
  };
}

export function isValidAuditResult(result: unknown): result is AuditResult {
  const value = result as Partial<AuditResult>;

  return (
    value?.mode === "audit" &&
    typeof value.score === "number" &&
    typeof value.summary === "string" &&
    Array.isArray(value.mainProblems) &&
    typeof value.seoTitle === "string" &&
    Array.isArray(value.blockers) &&
    Array.isArray(value.recommendations) &&
    Array.isArray(value.firstFixes)
  );
}

export function isValidCreateResult(result: unknown): result is CreateResult {
  const value = result as Partial<CreateResult>;

  return (
    value?.mode === "create" &&
    typeof value.seoTitle === "string" &&
    typeof value.improvedDescription === "string" &&
    Array.isArray(value.keywords) &&
    Array.isArray(value.infographicIdeas) &&
    Array.isArray(value.objections) &&
    Array.isArray(value.characteristicsIdeas) &&
    Array.isArray(value.improvementPlan)
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
