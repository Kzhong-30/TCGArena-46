import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

async function testPostgreSQLConnection(connectionString) {
  try {
    const { Client } = await import("pg");
    const client = new Client({ connectionString });
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}

function switchSchema(schemaType) {
  const prismaDir = resolve(projectRoot, "prisma");
  if (!existsSync(prismaDir)) {
    mkdirSync(prismaDir, { recursive: true });
  }

  const targetSchema = resolve(prismaDir, "schema.prisma");
  const sourceSchema = resolve(prismaDir, `schema.${schemaType}.prisma`);

  if (!existsSync(sourceSchema)) {
    console.error(`Schema 文件不存在: ${sourceSchema}`);
    process.exit(1);
  }

  copyFileSync(sourceSchema, targetSchema);
  console.log(`已切换到 ${schemaType} 版本的 schema.prisma`);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  let currentEngine = "SQLite";

  if (databaseUrl && databaseUrl.startsWith("postgresql://")) {
    console.log("检测到 PostgreSQL 配置，尝试连接...");
    const pgAvailable = await testPostgreSQLConnection(databaseUrl);
    if (pgAvailable) {
      currentEngine = "PostgreSQL";
      switchSchema("postgresql");
    } else {
      console.log("PostgreSQL 连接失败，自动回退到 SQLite 引擎");
      process.env.DATABASE_URL = "file:./dev.db";
      switchSchema("sqlite");
    }
  } else {
    console.log("使用 SQLite 引擎");
    if (!databaseUrl || !databaseUrl.startsWith("file:")) {
      process.env.DATABASE_URL = "file:./dev.db";
    }
    switchSchema("sqlite");
  }

  const result = spawnSync("npx", ["prisma", "generate"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    console.error("prisma generate 执行失败");
    process.exit(result.status ?? 1);
  }

  console.log(`数据库引擎初始化完成，当前使用：${currentEngine}`);
}

main().catch((err) => {
  console.error("初始化数据库引擎时发生错误：", err);
  process.exit(1);
});
