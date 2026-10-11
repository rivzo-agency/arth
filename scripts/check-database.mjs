import mysql from "mysql2/promise";

const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (!connectionUrl) {
  console.error("DATABASE_URL is missing from .env.local.");
  process.exit(1);
}

const hostname = new URL(connectionUrl).hostname;
const sslEnabled = process.env.MYSQL_SSL === "true" || (
  process.env.MYSQL_SSL !== "false" && hostname !== "localhost" && hostname !== "127.0.0.1"
);

const pool = mysql.createPool({
  uri: connectionUrl,
  connectionLimit: 1,
  ssl: sslEnabled
    ? { rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false" }
    : undefined,
});

try {
  const [rows] = await pool.query("SELECT DATABASE() AS database_name, VERSION() AS server_version");
  const status = rows[0];
  console.log(`Connected to MySQL database: ${status.database_name}`);
  console.log(`Server version: ${status.server_version}`);
} finally {
  await pool.end();
}
