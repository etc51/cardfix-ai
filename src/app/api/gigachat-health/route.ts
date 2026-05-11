import { NextResponse } from "next/server";
import {
  getGigaChatAccessToken,
  getGigaChatAgentDiagnostics,
  getGigaChatCaDiagnostics,
  getGigaChatEnvDiagnostics,
  getSafeGigaChatError,
  requestGigaChatPing,
} from "@/lib/gigachat-client";

export const runtime = "nodejs";

export async function GET() {
  const env = getGigaChatEnvDiagnostics();
  const ca = getGigaChatCaDiagnostics();
  const agent = getGigaChatAgentDiagnostics();
  const auth = {
    code: undefined as string | undefined,
    errorType: undefined as string | undefined,
    ok: false,
    statusCode: undefined as number | undefined,
  };
  const chat = {
    code: undefined as string | undefined,
    errorType: undefined as string | undefined,
    ok: false,
    statusCode: undefined as number | undefined,
  };

  let accessToken = "";

  try {
    accessToken = await getGigaChatAccessToken();
    auth.ok = true;
  } catch (error) {
    const safeError = getSafeGigaChatError(error);
    auth.code = safeError.code;
    auth.errorType = safeError.type;
    auth.statusCode = safeError.statusCode;
  }

  if (auth.ok) {
    try {
      await requestGigaChatPing(accessToken);
      chat.ok = true;
    } catch (error) {
      const safeError = getSafeGigaChatError(error);
      chat.code = safeError.code;
      chat.errorType = safeError.type;
      chat.statusCode = safeError.statusCode;
    }
  }

  return NextResponse.json({
    agent,
    auth,
    ca,
    chat,
    env,
    ok: Boolean(env.authKeyPresent && env.modelPresent && ca.parsed && agent.customAgent && auth.ok && chat.ok),
  });
}
