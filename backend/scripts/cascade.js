import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
consr __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new pg.Pool({
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB || "matchairlines_db",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    port: process.env.POSTGRES_PORT || 5432,

});

async function getConstraintName(tabla, columna) {
    const res = await pool.query("
        SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = $1 AND column_name = $2 AND table_schema = 'public'"
        , [tabla, columna]);
}
