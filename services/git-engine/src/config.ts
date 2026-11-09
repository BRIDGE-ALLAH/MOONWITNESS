function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 3200),
  pbUrl: process.env.PB_URL ?? process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8091",
  pbSuperuserEmail: process.env.PB_SUPERUSER_EMAIL ?? "",
  pbSuperuserPassword: process.env.PB_SUPERUSER_PASSWORD ?? "",
  tokenPepper: process.env.TOKEN_PEPPER ?? "",
  dataDir: process.env.GIT_DATA_DIR ?? "/data/git",
  publicGitBaseUrl: (process.env.PUBLIC_GIT_BASE_URL ?? "http://127.0.0.1:3200").replace(/\/$/, ""),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000").split(",").map((v) => v.trim()).filter(Boolean),
  gitBackend: process.env.GIT_HTTP_BACKEND,
};

export function assertRuntimeConfig() {
  if (!config.pbSuperuserEmail || !config.pbSuperuserPassword) {
    throw new Error("PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD must be configured. Create the PocketBase superuser first.");
  }
  if (config.tokenPepper.length < 32 || config.tokenPepper.startsWith("replace-")) {
    throw new Error("TOKEN_PEPPER must be a stable random secret of at least 32 characters.");
  }
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }
}
