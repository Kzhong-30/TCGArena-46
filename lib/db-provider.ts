export type DbProvider = "sqlite" | "postgresql";

export function getDbProvider(): DbProvider {
  const provider = process.env.DATABASE_PROVIDER?.toLowerCase();
  if (provider === "postgresql" || provider === "postgres") {
    return "postgresql";
  }
  return "sqlite";
}

export function isPostgres(): boolean {
  return getDbProvider() === "postgresql";
}

export function isSQLite(): boolean {
  return getDbProvider() === "sqlite";
}
