import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

// ---------- local fallback URL (edit this if you want) ----------
const LOCAL_DB_URL = "postgres://postgres:1234@localhost:5432/website";
// ----------------------------------------------------------------

// allow explicit env var overrides for dev convenience
// set these in server/.env if you prefer separate vars
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;

// prefer process.env.DATABASE_URL when available (production)
// fallback to constructing from explicit env vars if provided
// else fallback to LOCAL_DB_URL
const ENV_DB_URL = process.env.DATABASE_URL || "";

// try to build config from explicit parts if they exist
function buildFromParts() {
  if (DB_HOST && DB_USER && DB_NAME) {
    return {
      host: DB_HOST,
      port: DB_PORT ? Number(DB_PORT) : 5432,
      user: DB_USER,
      password: DB_PASSWORD !== undefined ? String(DB_PASSWORD) : undefined,
      database: DB_NAME
    };
  }
  return null;
}

// parse a URL string into components
function parseUrl(conn) {
  try {
    const u = new URL(conn);
    const user = u.username || undefined;
    const pass = u.password !== "" ? u.password : undefined; // empty string -> undefined
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 5432,
      user,
      password: pass,
      database: u.pathname ? u.pathname.replace(/^\//, "") : undefined
    };
  } catch (e) {
    return null;
  }
}

// choose precedence:
// 1. explicit parts via DB_* env vars
// 2. DATABASE_URL if present
// 3. LOCAL_DB_URL hardcoded fallback
let rawConfig = buildFromParts();

if (!rawConfig) {
  const urlToParse = ENV_DB_URL || LOCAL_DB_URL;
  const parsed = parseUrl(urlToParse);
  if (!parsed) {
    console.error("DB error: failed to parse DB URL. Check LOCAL_DB_URL or DATABASE_URL format.");
    process.exit(1);
  }
  rawConfig = parsed;
}

// At this point rawConfig should contain host, port, user, password maybe, database
// Validate required fields
if (!rawConfig.host || !rawConfig.database || !rawConfig.user) {
  console.error("DB config incomplete. Found:", {
    host: rawConfig.host,
    database: rawConfig.database,
    user: rawConfig.user,
    passwordPresent: rawConfig.password !== undefined
  });
  console.error("Fix: provide a full connection string or set DB_HOST, DB_USER, DB_NAME, and DB_PASSWORD in server/.env");
  process.exit(1);
}

// require a password for secure auth by default
if (rawConfig.password === undefined || rawConfig.password === null) {
  console.error("DB error: no password found for DB user. Postgres SCRAM auth requires a password.");
  console.error("Options to fix:")
  console.error("  • Put password into LOCAL_DB_URL like postgres://user:pass@localhost:5432/dbname")
  console.error("  • Or set DB_PASSWORD in server/.env")
  console.error("  • Or remove DATABASE_URL from .env if it unintentionally points to a remote DB")
  process.exit(1);
}

// detect local host to disable SSL automatically
const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(String(rawConfig.host));

// final client config
const clientConfig = {
  host: rawConfig.host,
  port: rawConfig.port || 5432,
  user: rawConfig.user,
  password: String(rawConfig.password),
  database: rawConfig.database,
  ssl: isLocalHost ? false : { rejectUnauthorized: false }
};

// safe debug print
console.log("DB connecting to:", {
  host: clientConfig.host,
  port: clientConfig.port,
  database: clientConfig.database,
  user: clientConfig.user,
  ssl: clientConfig.ssl ? "enabled" : "disabled"
});

const db = new pg.Client(clientConfig);

db.connect()
  .then(() => console.log("Connected to PostgreSQL:", isLocalHost ? "Local (no SSL)" : "Remote (SSL enabled)"))
  .catch(err => {
    console.error("Database Connection Error:", err && err.message ? err.message : err);
    process.exit(1);
  });

export { db };
export default db;
