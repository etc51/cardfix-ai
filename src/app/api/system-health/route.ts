import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  generateAuditResult,
  generateCreateResult,
  isValidAuditResult,
  isValidCreateResult,
} from "@/lib/audit-service";
import {
  getGigaChatAccessToken,
  getSafeGigaChatError,
  requestGigaChatPing,
} from "@/lib/gigachat-client";

type Check = {
  code?: string;
  errorType?: string;
  name: string;
  ok: boolean;
  statusCode?: number;
};

export const runtime = "nodejs";

export async function GET() {
  const checks: Check[] = [];
  const env = {
    GIGACHAT_AUTH_KEY: summarizeEnv("GIGACHAT_AUTH_KEY"),
    GIGACHAT_CA_CERT: summarizeEnv("GIGACHAT_CA_CERT"),
    GIGACHAT_MODEL: summarizeEnv("GIGACHAT_MODEL"),
    NEXT_PUBLIC_YANDEX_METRIKA_ID: summarizeEnv("NEXT_PUBLIC_YANDEX_METRIKA_ID"),
    YANDEX_FORM_URL: summarizeEnv("YANDEX_FORM_URL"),
  };

  Object.entries(env).forEach(([name, value]) => {
    checks.push({ name: `env.${name}`, ok: value.exists });
  });

  const integrations = {
    metrikaGoals: await checkMetrikaGoals(),
    metrikaId: Boolean(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID),
    metrikaLayout: await checkLayoutMetrika(),
    yandexForm: checkYandexForm(),
  };

  checks.push({ name: "integrations.yandexForm", ok: integrations.yandexForm });
  checks.push({ name: "integrations.metrikaId", ok: integrations.metrikaId });
  checks.push({ name: "integrations.metrikaLayout", ok: integrations.metrikaLayout });
  checks.push({ name: "integrations.metrikaGoals", ok: integrations.metrikaGoals });

  const gigachat = {
    auth: { ok: false } as Check,
    chat: { ok: false } as Check,
    ok: false,
  };

  let accessToken = "";

  try {
    accessToken = await getGigaChatAccessToken();
    gigachat.auth = { name: "gigachat.auth", ok: true };
  } catch (error) {
    gigachat.auth = toCheck("gigachat.auth", error);
  }

  try {
    if (!accessToken) {
      throw new Error("GigaChat auth did not return an access token");
    }

    await requestGigaChatPing(accessToken);
    gigachat.chat = { name: "gigachat.chat", ok: true };
  } catch (error) {
    gigachat.chat = toCheck("gigachat.chat", error);
  }

  gigachat.ok = Boolean(gigachat.auth.ok && gigachat.chat.ok);
  checks.push(gigachat.auth, gigachat.chat);

  const auditApi = {
    auditMode: false,
    createMode: false,
  };

  try {
    const auditResult = await generateAuditResult({
      mode: "audit",
      marketplace: "Ozon",
      productUrl: "https://www.ozon.ru/product/test",
    });
    auditApi.auditMode = isValidAuditResult(auditResult);
  } catch (error) {
    checks.push(toCheck("auditApi.auditMode", error));
  }

  if (checks.every((check) => check.name !== "auditApi.auditMode")) {
    checks.push({
      errorType: auditApi.auditMode ? undefined : "INVALID_AUDIT_RESULT",
      name: "auditApi.auditMode",
      ok: auditApi.auditMode,
    });
  }

  try {
    const createResult = await generateCreateResult({
      mode: "create",
      marketplace: "Wildberries",
      category: "Товары для дома",
      productDescription: "Органайзер для хранения вещей",
    });
    auditApi.createMode = isValidCreateResult(createResult);
  } catch (error) {
    checks.push(toCheck("auditApi.createMode", error));
  }

  if (checks.every((check) => check.name !== "auditApi.createMode")) {
    checks.push({
      errorType: auditApi.createMode ? undefined : "INVALID_CREATE_RESULT",
      name: "auditApi.createMode",
      ok: auditApi.createMode,
    });
  }

  const ok = checks.every((check) => check.ok);

  return NextResponse.json({
    ok,
    env,
    gigachat: {
      auth: withoutName(gigachat.auth),
      chat: withoutName(gigachat.chat),
      ok: gigachat.ok,
    },
    auditApi,
    integrations,
    checks,
  });
}

function summarizeEnv(name: string) {
  const value = process.env[name] || "";

  return {
    exists: Boolean(value),
    length: value.length,
  };
}

function checkYandexForm() {
  const value = process.env.YANDEX_FORM_URL;

  if (!value) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

async function checkLayoutMetrika() {
  const content = await readSourceFile("src/app/layout.tsx");

  return (
    content.includes("NEXT_PUBLIC_YANDEX_METRIKA_ID") &&
    content.includes("mc.yandex.ru/metrika/tag.js") &&
    content.includes("mc.yandex.ru/watch")
  );
}

async function checkMetrikaGoals() {
  const content = await readSourceFile("src/components/audit-form.tsx");

  return ["audit_submit", "audit_result", "full_report_click"].every((goal) =>
    content.includes(goal),
  );
}

async function readSourceFile(relativePath: string) {
  try {
    return await readFile(path.join(process.cwd(), relativePath), "utf8");
  } catch {
    return "";
  }
}

function toCheck(name: string, error: unknown): Check {
  const safeError = getSafeGigaChatError(error);

  return {
    code: safeError.code,
    errorType: safeError.type,
    name,
    ok: false,
    statusCode: safeError.statusCode,
  };
}

function withoutName(check: Check) {
  return {
    code: check.code,
    errorType: check.errorType,
    ok: check.ok,
    statusCode: check.statusCode,
  };
}
