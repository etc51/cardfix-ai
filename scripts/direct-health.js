const fs = require("node:fs");
const path = require("node:path");

const envPath = path.join(process.cwd(), ".env.local");
const directUrl = "https://api.direct.yandex.com/json/v5/clients";

async function main() {
  const env = readLocalEnv(envPath);
  const token = env.YANDEX_DIRECT_TOKEN;
  const clientLogin = env.YANDEX_DIRECT_CLIENT_LOGIN || "etc00051";

  if (!token || !clientLogin) {
    printResult(false, clientLogin, "MISSING_ENV");
    process.exit(1);
  }

  try {
    const response = await fetch(directUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": "ru",
        "Client-Login": clientLogin,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        method: "get",
        params: {
          FieldNames: ["Login"],
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    const errorCode = data?.error?.error_code || data?.error?.error_detail || response.status;
    const ok = response.ok && Boolean(data?.result?.Clients);

    printResult(ok, clientLogin, ok ? undefined : String(errorCode));
    process.exit(ok ? 0 : 1);
  } catch (error) {
    printResult(false, clientLogin, getSafeErrorCode(error));
    process.exit(1);
  }
}

function readLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return env;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return env;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
      env[key] = value;

      return env;
    }, {});
}

function printResult(ok, clientLogin, errorCode) {
  console.log(`DIRECT_AUTH_OK=${ok ? "true" : "false"}`);
  console.log(`CLIENT_LOGIN=${clientLogin || ""}`);

  if (errorCode) {
    console.log(`ERROR_CODE=${errorCode}`);
  }
}

function getSafeErrorCode(error) {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }

  return error instanceof Error ? error.name : "UNKNOWN_ERROR";
}

main();
