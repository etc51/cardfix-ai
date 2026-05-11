import { Agent, request as httpsRequest } from "node:https";

export type GigaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GigaChatErrorType =
  | "GIGACHAT_CA_CERT_MISSING_OR_INVALID"
  | "GIGACHAT_TLS_CERT_ERROR"
  | "GIGACHAT_AUTH_ERROR"
  | "GIGACHAT_MODEL_ERROR"
  | "GIGACHAT_HTTP_ERROR"
  | "GIGACHAT_RESPONSE_ERROR";

export type GigaChatSafeError = {
  code?: string;
  message: string;
  statusCode?: number;
  type: GigaChatErrorType;
};

type GigaChatRequestOptions = {
  body?: string;
  headers?: Record<string, string>;
  method: "POST";
  step: "auth" | "chat";
};

type ParsedCaCert = {
  certificates: string[];
  format: "pem" | "escaped_pem" | "base64_pem";
  length: number;
  parsed: true;
};

type CaCertDiagnostics = {
  certificatesFound: number;
  format: "pem" | "escaped_pem" | "base64_pem" | "missing" | "invalid";
  length: number;
  parsed: boolean;
};

const authUrl = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const chatUrl = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";
const certificatePattern = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;
const tlsErrorCodes = new Set([
  "SELF_SIGNED_CERT_IN_CHAIN",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "CERT_HAS_EXPIRED",
  "ERR_TLS_CERT_ALTNAME_INVALID",
]);

export function getGigaChatEnvDiagnostics() {
  return {
    authKeyPresent: Boolean(process.env.GIGACHAT_AUTH_KEY),
    caCertLength: process.env.GIGACHAT_CA_CERT?.length || 0,
    caCertPresent: Boolean(process.env.GIGACHAT_CA_CERT),
    modelPresent: Boolean(process.env.GIGACHAT_MODEL),
  };
}

export function getGigaChatCaDiagnostics(): CaCertDiagnostics {
  const value = process.env.GIGACHAT_CA_CERT;
  const parsed = parseGigaChatCaCert(value);

  if (!value?.trim()) {
    return {
      certificatesFound: 0,
      format: "missing",
      length: 0,
      parsed: false,
    };
  }

  if (!parsed) {
    return {
      certificatesFound: 0,
      format: "invalid",
      length: value.length,
      parsed: false,
    };
  }

  return {
    certificatesFound: parsed.certificates.length,
    format: parsed.format,
    length: parsed.length,
    parsed: true,
  };
}

export function getGigaChatAgentDiagnostics() {
  const ca = parseGigaChatCaCert(process.env.GIGACHAT_CA_CERT);

  return {
    customAgent: Boolean(ca),
    rejectUnauthorized: true,
  };
}

export async function getGigaChatAccessToken() {
  const authKey = process.env.GIGACHAT_AUTH_KEY;

  if (!authKey) {
    throw createGigaChatError("GIGACHAT_AUTH_ERROR", "GIGACHAT_AUTH_KEY is not configured");
  }

  const data = await requestGigaChatEndpoint<{ access_token?: unknown }>(authUrl, {
    method: "POST",
    step: "auth",
    headers: {
      Authorization: `Basic ${authKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      RqUID: crypto.randomUUID(),
    },
    body: new URLSearchParams({ scope: "GIGACHAT_API_PERS" }).toString(),
  });

  if (typeof data?.access_token !== "string") {
    throw createGigaChatError(
      "GIGACHAT_AUTH_ERROR",
      "GigaChat auth response does not contain access_token",
    );
  }

  return data.access_token;
}

export async function requestGigaChatJson(prompt: string) {
  const accessToken = await getGigaChatAccessToken();
  const content = await requestGigaChatText(accessToken, [
    {
      role: "system",
      content:
        "Ты возвращаешь только валидный JSON. Не используй markdown, кодовые блоки и текст вне JSON.",
    },
    { role: "user", content: prompt },
  ]);

  return parseJsonObject(content);
}

export async function requestGigaChatPing(accessToken: string) {
  await requestGigaChatText(accessToken, [
    {
      role: "user",
      content: "ping",
    },
  ]);
}

export function getSafeGigaChatError(error: unknown): GigaChatSafeError {
  if (isGigaChatSafeError(error)) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      type: error.type,
    };
  }

  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: unknown };
    const code = typeof errorWithCode.code === "string" ? errorWithCode.code : undefined;

    return {
      code,
      message: error.message,
      type: tlsErrorCodes.has(code || "")
        ? "GIGACHAT_TLS_CERT_ERROR"
        : "GIGACHAT_RESPONSE_ERROR",
    };
  }

  return {
    message: "unknown error",
    type: "GIGACHAT_RESPONSE_ERROR",
  };
}

async function requestGigaChatText(accessToken: string, messages: GigaChatMessage[]) {
  const model = process.env.GIGACHAT_MODEL || "GigaChat-Max";
  const data = await requestGigaChatEndpoint<{
    choices?: Array<{ message?: { content?: unknown } }>;
  }>(chatUrl, {
    method: "POST",
    step: "chat",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1800,
    }),
  });

  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw createGigaChatError(
      "GIGACHAT_RESPONSE_ERROR",
      "GigaChat response does not contain message content",
    );
  }

  return content;
}

function requestGigaChatEndpoint<T>(url: string, options: GigaChatRequestOptions) {
  const ca = parseGigaChatCaCert(process.env.GIGACHAT_CA_CERT);

  if (!ca) {
    return Promise.reject(
      createGigaChatError(
        "GIGACHAT_CA_CERT_MISSING_OR_INVALID",
        "GIGACHAT_CA_CERT is missing or invalid",
      ),
    );
  }

  return new Promise<T>((resolve, reject) => {
    const body = options.body || "";
    const parsedUrl = new URL(url);
    const request = httpsRequest(
      {
        agent: createGigaChatHttpsAgent(ca.certificates),
        headers: {
          ...options.headers,
          "Content-Length": String(Buffer.byteLength(body)),
        },
        hostname: parsedUrl.hostname,
        method: options.method,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        port: parsedUrl.port || 443,
        protocol: parsedUrl.protocol,
        timeout: 25000,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf8");
          const statusCode = response.statusCode || 0;

          if (statusCode < 200 || statusCode >= 300) {
            reject(classifyHttpError(statusCode, options.step, responseBody));
            return;
          }

          try {
            resolve(JSON.parse(responseBody) as T);
          } catch {
            reject(createGigaChatError("GIGACHAT_RESPONSE_ERROR", "GigaChat returned invalid JSON"));
          }
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(createGigaChatError("GIGACHAT_HTTP_ERROR", "GigaChat request timeout"));
    });
    request.on("error", (error) => {
      reject(classifyRequestError(error));
    });
    request.end(body);
  });
}

function createGigaChatHttpsAgent(parsedCaCert: string[]) {
  return new Agent({
    ca: parsedCaCert,
    keepAlive: true,
    rejectUnauthorized: true,
  });
}

function parseGigaChatCaCert(value: string | undefined): ParsedCaCert | null {
  const certificate = value?.trim();

  if (!certificate) {
    return null;
  }

  const escapedPem = certificate.replace(/\\n/g, "\n");
  const directCerts = extractCertificates(escapedPem);

  if (directCerts.length > 0) {
    return {
      certificates: directCerts,
      format: certificate.includes("\\n") ? "escaped_pem" : "pem",
      length: certificate.length,
      parsed: true,
    };
  }

  try {
    const decoded = Buffer.from(certificate, "base64").toString("utf8").trim();
    const decodedCerts = extractCertificates(decoded);

    if (decodedCerts.length > 0) {
      return {
        certificates: decodedCerts,
        format: "base64_pem",
        length: certificate.length,
        parsed: true,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function extractCertificates(value: string) {
  return value.match(certificatePattern) || [];
}

function classifyHttpError(statusCode: number, step: "auth" | "chat", responseBody: string) {
  const body = responseBody.slice(0, 500).toLowerCase();

  if (step === "auth" || statusCode === 401 || statusCode === 403) {
    return createGigaChatError("GIGACHAT_AUTH_ERROR", `GigaChat HTTP ${statusCode}`, {
      statusCode,
    });
  }

  if (body.includes("model") || statusCode === 404) {
    return createGigaChatError("GIGACHAT_MODEL_ERROR", `GigaChat HTTP ${statusCode}`, {
      statusCode,
    });
  }

  return createGigaChatError("GIGACHAT_HTTP_ERROR", `GigaChat HTTP ${statusCode}`, {
    statusCode,
  });
}

function classifyRequestError(error: Error) {
  const errorWithCode = error as Error & { code?: unknown };
  const code = typeof errorWithCode.code === "string" ? errorWithCode.code : undefined;

  if (tlsErrorCodes.has(code || "")) {
    return createGigaChatError("GIGACHAT_TLS_CERT_ERROR", error.message, { code });
  }

  return createGigaChatError("GIGACHAT_HTTP_ERROR", error.message, { code });
}

function createGigaChatError(
  type: GigaChatErrorType,
  message: string,
  details: { code?: string; statusCode?: number } = {},
) {
  const error = new Error(message) as Error & {
    code?: string;
    statusCode?: number;
    type: GigaChatErrorType;
  };

  error.type = type;
  error.code = details.code;
  error.statusCode = details.statusCode;

  return error;
}

function isGigaChatSafeError(error: unknown): error is Error & {
  code?: string;
  statusCode?: number;
  type: GigaChatErrorType;
} {
  return (
    error instanceof Error &&
    "type" in error &&
    typeof (error as { type?: unknown }).type === "string"
  );
}

function parseJsonObject(value: string) {
  const trimmed = value.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw createGigaChatError("GIGACHAT_RESPONSE_ERROR", "GigaChat response is not valid JSON");
    }

    return JSON.parse(trimmed.slice(start, end + 1));
  }
}
