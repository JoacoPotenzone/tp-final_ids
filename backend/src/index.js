import express from "express";
import cors from 'cors';
import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:" + PORT);
});


app.get("/usuarios", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/usuarios`);
});

app.get("/aerolinea", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM aerolinea");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/aerolinea`);
});

app.get("/aeropuertos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM aeropuertos");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/aeropuertos`);
});

app.get("/vuelos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM vuelos");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/vuelos`);
});

app.get("/reservas", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM reservas");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/reservas`);
});

app.get("/estadios", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM estadios");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/estadios`);
});

{ path: '.env' }

app.get('/api/vuelos', async (req, res) => {
    const { origen, destino, fecha } = req.query;
    
    const origenBusqueda = `%${origen.trim()}%`; 
    const destinoBusqueda = `%${destino.trim()}%`; 
    
    if (!origen || !destino || !fecha) {
         return res.status(400).json({ error: 'Faltan parámetros de búsqueda (origen, destino o fecha).' });
    }

    try {
        const query = `
            SELECT
                a.nombre_aerolinea AS aerolinea,
                v.id_vuelo AS numero, 
                TO_CHAR(v.fecha_salida, 'HH24:MI') AS salida, 
                v.precio,
                v.fecha_salida
            FROM
                vuelos v
            INNER JOIN
                aerolinea a ON v.id_aerolinea = a.id_aerolinea
            INNER JOIN
                aeropuertos apo ON v.id_aeropuerto_origen = apo.id_aeropuerto
            INNER JOIN
                aeropuertos apd ON v.id_aeropuerto_destino = apd.id_aeropuerto
            WHERE
                apo.ciudad ILIKE $1 
                AND apd.ciudad ILIKE $2 
            ORDER BY
                (v.fecha_salida::DATE = $3::DATE) DESC,
                v.fecha_salida ASC
        `;
        
        const result = await pool.query(query, [origenBusqueda, destinoBusqueda, fecha]);
        res.json(result.rows);

    } catch (err) {
        console.error('Error al buscar vuelos:', err);
        res.status(500).json({ error: 'Error interno del servidor al consultar la DB.' });
    }
});

app.get('/api/ciudades-origen', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT ciudad, codigo_iata FROM aeropuertos ORDER BY ciudad ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener ciudades:', err);
        res.status(500).json({ error: 'Error interno del servidor al consultar la DB.' });
    }
});
