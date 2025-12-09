import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
    host: 'db', 
    user: 'postgres',
    database: 'matchairlines_db',
    password: 'postgres', 
    port: 5432, 
});
