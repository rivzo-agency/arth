import mysql, {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { mysqlSchemaStatements } from "./mysql-schema";

type DatabaseValue = string | number | bigint | boolean | Date | Buffer | null;
type Executor = Pool | PoolConnection;

class MySqlStatement {
  constructor(
    private readonly executor: Executor,
    private readonly sql: string,
    private readonly values: DatabaseValue[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new MySqlStatement(
      this.executor,
      this.sql,
      values.map((value) => {
        if (
          value === null ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "bigint" ||
          typeof value === "boolean" ||
          value instanceof Date ||
          Buffer.isBuffer(value)
        ) {
          return value;
        }
        return value === undefined ? null : String(value);
      }),
    );
  }

  async all<T>() {
    const [result] = await this.executor.execute<RowDataPacket[]>(this.sql, this.values);
    return { results: result as T[] };
  }

  async first<T>() {
    const result = await this.all<T>();
    return result.results[0] ?? null;
  }

  async run() {
    return this.execute();
  }

  async execute(executor: Executor = this.executor) {
    const [result] = await executor.execute<ResultSetHeader>(this.sql, this.values);
    return result;
  }
}

class MySqlDatabase {
  constructor(private readonly pool: Pool) {}

  prepare(sql: string) {
    return new MySqlStatement(this.pool, sql);
  }

  async batch(statements: MySqlStatement[]) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const results = [];
      for (const statement of statements) results.push(await statement.execute(connection));
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

declare global {
  var __antrikshMySqlPool: Pool | undefined;
  var __antrikshMySqlSchema: Promise<void> | undefined;
}

function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim() || process.env.MYSQL_URL?.trim();
  if (!value) throw new Error("DATABASE_URL is required. Add your online MySQL connection URL to the server environment.");
  if (!value.startsWith("mysql://")) throw new Error("DATABASE_URL must start with mysql://");
  return value;
}

function connectionLimit() {
  const configured = Number(process.env.MYSQL_CONNECTION_LIMIT ?? "3");
  return Number.isInteger(configured) ? Math.min(Math.max(configured, 1), 10) : 3;
}

function shouldUseSsl(url: string) {
  const configured = process.env.MYSQL_SSL?.trim().toLowerCase();
  if (configured === "true") return true;
  if (configured === "false") return false;
  const hostname = new URL(url).hostname;
  return hostname !== "localhost" && hostname !== "127.0.0.1";
}

function pool() {
  if (!globalThis.__antrikshMySqlPool) {
    const url = databaseUrl();
    const limit = connectionLimit();
    globalThis.__antrikshMySqlPool = mysql.createPool({
      uri: url,
      waitForConnections: true,
      connectionLimit: limit,
      maxIdle: limit,
      idleTimeout: 15_000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: "Z",
      dateStrings: true,
      decimalNumbers: true,
      ssl: shouldUseSsl(url)
        ? { rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false" }
        : undefined,
    });
  }
  return globalThis.__antrikshMySqlPool;
}

export function database() {
  return new MySqlDatabase(pool());
}

export async function ensureDatabaseSchema() {
  if (!globalThis.__antrikshMySqlSchema) {
    globalThis.__antrikshMySqlSchema = (async () => {
      const db = database();
      for (const statement of mysqlSchemaStatements) await db.prepare(statement).run();
    })().catch((error) => {
      globalThis.__antrikshMySqlSchema = undefined;
      throw error;
    });
  }
  await globalThis.__antrikshMySqlSchema;
}
