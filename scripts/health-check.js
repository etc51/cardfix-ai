const siteUrl = process.env.SITE_URL || "http://localhost:3000";
const healthUrl = new URL("/api/system-health", siteUrl);

async function main() {
  console.log(`CardFix AI health check: ${healthUrl.toString()}`);

  const response = await fetch(healthUrl);
  const payload = await response.json();

  console.log(`Overall: ${payload.ok ? "OK" : "FAILED"}`);
  console.log("");
  printSection("ENV", payload.env);
  printSection("GigaChat", payload.gigachat);
  printSection("Audit API", payload.auditApi);
  printSection("Integrations", payload.integrations);

  if (Array.isArray(payload.checks)) {
    console.log("");
    console.log("Checks:");
    payload.checks.forEach((check) => {
      const suffix = [check.errorType, check.code, check.statusCode && `status=${check.statusCode}`]
        .filter(Boolean)
        .join(" ");
      console.log(`  ${check.ok ? "OK" : "FAIL"} ${check.name}${suffix ? ` (${suffix})` : ""}`);
    });
  }

  if (!response.ok || !payload.ok) {
    process.exit(1);
  }
}

function printSection(title, value) {
  console.log(`${title}:`);
  Object.entries(value || {}).forEach(([key, item]) => {
    if (typeof item === "boolean") {
      console.log(`  ${key}: ${item ? "OK" : "FAIL"}`);
      return;
    }

    if (item && typeof item === "object" && "ok" in item) {
      const details = [item.errorType, item.code, item.statusCode && `status=${item.statusCode}`]
        .filter(Boolean)
        .join(" ");
      console.log(`  ${key}: ${item.ok ? "OK" : "FAIL"}${details ? ` (${details})` : ""}`);
      return;
    }

    if (item && typeof item === "object" && "exists" in item) {
      console.log(`  ${key}: ${item.exists ? "OK" : "FAIL"} length=${item.length}`);
      return;
    }

    console.log(`  ${key}: ${JSON.stringify(item)}`);
  });
}

main().catch((error) => {
  console.error("Health check failed:", error instanceof Error ? error.message : "unknown error");
  process.exit(1);
});
