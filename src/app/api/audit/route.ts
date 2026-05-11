import { NextResponse } from "next/server";
import {
  AuditApiRequest,
  AuditRequest,
  CreateRequest,
  generateAuditResult,
  generateCreateResult,
  validateAuditPayload,
} from "@/lib/audit-service";
import { getSafeGigaChatError } from "@/lib/gigachat-client";

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
  const validationError = validateAuditPayload(body);

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
