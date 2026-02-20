import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new pg.Pool({
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB || "matchairlines_db",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    port: process.env.POSTGRES_PORT || 5432,

});

async function obtenerNombreRestriccion(nombreTabla, nombreColumna) {
    const res = await pool.query(`
         SELECT constraint_name 
         FROM information_schema.key_column_usage 
         WHERE table_name = $1 AND column_name = $2 
         AND table_schema = 'public'
        `, [nombreTabla, nombreColumna]);

    if (res.rows.length > 0) {
        return res.rows[0].constraint_name;
    }
    return null;
}

async function Cascade() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const constraints = [
            { table: "vuelos", column: "id_aerolinea", refTable: "aerolinea", refColumn: "id_aerolinea" },
            { table: "vuelos", column: "id_aeropuerto_origen", refTable: "aeropuertos", refColumn: "id_aeropuerto" },
            { table: "vuelos", column: "id_aeropuerto_destino", refTable: "aeropuertos", refColumn: "id_aeropuerto" },
            { table: "reservas", column: "id_usuario", refTable: "usuarios", refColumn: "id_usuario" },
            { table: "reservas", column: "id_vuelo", refTable: "vuelos", refColumn: "id_vuelo" },
            { table: "estadios", column: "id_aeropuerto", refTable: "aeropuertos", refColumn: "id_aeropuerto" },
            { table: "partidos_mundial", column: "id_estadio", refTable: "estadios", refColumn: "id_estadio" },
        ];

        for (const c of constraints) {
            console.log(`Procesando ${c.table}.${c.column}..`);
            const constraintName = await obtenerNombreRestriccion(c.table, c.column);

            if (constraintName) {
                console.log(`Restriccion encontrada : ${constraintName}. Eliminando`);
                await client.query(`ALTER TABLE ${c.table} DROP CONSTRAINT "${constraintName}"`);
            } else {
                console.log(`Restriccion no encontrada para ${c.table}.${c.column}, creando una nueva`);
            }

            console.log(`Agregando ON DELETE CASCADE`);
            await client.query(`
                ALTER TABLE ${c.table}
                ADD CONSTRAINT "fk_${c.table}_${c.column}"
                FOREIGN KEY (${c.column}) REFERENCES ${c.refTable} (${c.refColumn})
                ON DELETE CASCADE
                `);
        }

        await client.query("COMMIT");
        console.log("Migracion completada exitosamente");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error("La migracion fallo:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

Cascade();
