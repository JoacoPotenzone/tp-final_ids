import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "Secretomatchairlines";
const JWT_EXPIRES_IN = "2h";

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = decoded; 
    next();
  });
}

function generateToken(user) {
  return jwt.sign(
    {
      id_usuario: user.id_usuario,
      email: user.email,
      nombre_usuario: user.nombre_usuario,
      nacionalidad: user.nacionalidad,
      rol: user.rol,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}


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

    if (!origen || !destino) {
        return res.status(400).json({ error: 'Faltan parámetros de búsqueda (origen y destino son obligatorios).' });
    }

    const origenBusqueda = origen.trim();
    const destinoBusqueda = destino.trim();

    let fechaFiltro = fecha ? fecha.trim() : null;
    let fechaActual = new Date().toISOString(); 

  try {
      const query = `
          SELECT
              a.nombre_aerolinea AS aerolinea,
              v.id_vuelo AS numero, 
              TO_CHAR(v.fecha_salida, 'HH24:MI') AS salida, 
              TO_CHAR(v.fecha_llegada, 'HH24:MI') AS llegada, 
              v.precio,
              v.fecha_salida,
              apd.ciudad AS destino_ciudad,
              apo.ciudad AS origen_ciudad 
          FROM
              vuelos v
          INNER JOIN aerolinea a ON v.id_aerolinea = a.id_aerolinea
          INNER JOIN aeropuertos apo ON v.id_aeropuerto_origen = apo.id_aeropuerto
          INNER JOIN aeropuertos apd ON v.id_aeropuerto_destino = apd.id_aeropuerto
          WHERE
              TRIM(apo.ciudad) ILIKE $1 
              AND v.fecha_salida >= $3
          ORDER BY
              (TRIM(apd.ciudad) ILIKE $2) DESC,
              ($4::TIMESTAMP IS NOT NULL AND v.fecha_salida::DATE = $4::DATE) DESC,
              v.fecha_salida ASC
      `;
        
        const result = await pool.query(query, [
            `%${origenBusqueda}%`, 
            `%${destinoBusqueda}%`,
            fechaActual,
            fechaFiltro 
        ]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al ejecutar la consulta SQL:', err); 
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
app.post("/api/register", async (req, res) => {
  const { nombre_usuario, email, password } = req.body;

  if (!nombre_usuario || !email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const existing = await pool.query(
      "SELECT 1 FROM usuarios WHERE email = $1 OR nombre_usuario = $2",
      [email, nombre_usuario]
    );

    if (existing.rowCount > 0) {
      return res
        .status(409)
        .json({ error: "El usuario o el email ya existe" });
    }

    const password_hash = await bcrypt.hash(password, 10);


    const result = await pool.query(
      `INSERT INTO usuarios (nombre_usuario, email, password_hash, rol)
       VALUES ($1, $2, $3, 'cliente')
       RETURNING id_usuario, nombre_usuario, email, rol, nacionalidad, fecha_creacion`,
      [nombre_usuario, email, password_hash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Error en /api/register", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query(
    "SELECT id_usuario, nombre_usuario, email, password_hash, rol, nacionalidad FROM usuarios WHERE email = $1",
    [email]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = generateToken(user);
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    console.error("Error en /api/login", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.put("/api/user", authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const { nombre_usuario, email, nacionalidad } = req.body;

  if (!nombre_usuario || !email) {
    return res.status(400).json({ error: "Nombre y email son obligatorios" });
  }

  try {
    const result = await pool.query(
      `UPDATE usuarios
       SET nombre_usuario = $1,
           email = $2,
           nacionalidad = $3
       WHERE id_usuario = $4
       RETURNING id_usuario, nombre_usuario, email, rol, nacionalidad, fecha_creacion`,
      [nombre_usuario, email, nacionalidad || null, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const updatedUser = result.rows[0];
    const newToken = generateToken(updatedUser);

    res.json({ user: updatedUser, token: newToken });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Email o nombre de usuario ya está en uso" });
    }
    console.error("Error en /api/user", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/user/flights", authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;

  const {
    airline_name,
    airline_code,
    origin_name,
    origin_city,
    origin_country,
    origin_code,
    dest_name,
    dest_city,
    dest_country,
    dest_code,
    departure, 
    arrival,   
    capacity,
    price,
    seat
  } = req.body;

  if (
    !airline_name || !airline_code ||
    !origin_name || !origin_city || !origin_country || !origin_code ||
    !dest_name   || !dest_city   || !dest_country   || !dest_code   ||
    !departure   || !arrival     || !price         || !seat
  ) {
    return res.status(400).json({ error: "Faltan datos del vuelo" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const airlineResult = await client.query(
      `
      INSERT INTO aerolinea (nombre_aerolinea, codigo_iata)
      VALUES ($1, $2)
      ON CONFLICT (codigo_iata)
      DO UPDATE SET nombre_aerolinea = EXCLUDED.nombre_aerolinea
      RETURNING id_aerolinea;
      `,
      [airline_name, airline_code]
    );
    const id_aerolinea = airlineResult.rows[0].id_aerolinea;

    const originResult = await client.query(
      `
      INSERT INTO aeropuertos (nombre_aeropuerto, ciudad, pais, codigo_iata)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (codigo_iata)
      DO UPDATE SET nombre_aeropuerto = EXCLUDED.nombre_aeropuerto,
                    ciudad            = EXCLUDED.ciudad,
                    pais              = EXCLUDED.pais
      RETURNING id_aeropuerto;
      `,
      [origin_name, origin_city, origin_country, origin_code]
    );
    const id_origen = originResult.rows[0].id_aeropuerto;

    const destResult = await client.query(
      `
      INSERT INTO aeropuertos (nombre_aeropuerto, ciudad, pais, codigo_iata)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (codigo_iata)
      DO UPDATE SET nombre_aeropuerto = EXCLUDED.nombre_aeropuerto,
                    ciudad            = EXCLUDED.ciudad,
                    pais              = EXCLUDED.pais
      RETURNING id_aeropuerto;
      `,
      [dest_name, dest_city, dest_country, dest_code]
    );
    const id_destino = destResult.rows[0].id_aeropuerto;

    const vueloResult = await client.query(
      `
      INSERT INTO vuelos (
        id_aerolinea,
        id_aeropuerto_origen,
        id_aeropuerto_destino,
        fecha_salida,
        fecha_llegada,
        capacidad,
        precio
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_vuelo, fecha_salida, fecha_llegada, precio;
      `,
      [
        id_aerolinea,
        id_origen,
        id_destino,
        departure,
        arrival,
        capacity || 180,
        price
      ]
    );
    const vuelo = vueloResult.rows[0];

    const reservaResult = await client.query(
      `
      INSERT INTO reservas (id_usuario, id_vuelo, asiento, fecha_reserva)
      VALUES ($1, $2, $3, NOW())
      RETURNING id_reserva, asiento;
      `,
      [userId, vuelo.id_vuelo, seat]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Vuelo reservado correctamente",
      reserva: reservaResult.rows[0],
      vuelo: vuelo,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error en POST /api/user/flights", err);
    res.status(500).json({ error: "Error al registrar el vuelo" });
  } finally {
    client.release();
  }
});

app.get('/api/mundial/ruta', async (req, res) => {
    const { pais } = req.query;

    if (!pais) {
        return res.status(400).json({ error: 'Falta el parámetro del país.' });
    }

    let rutaPartidos = [];
    if (pais === 'Argentina') {
         rutaPartidos = [
            { ciudad: 'Kansas City', fecha: '2026-06-18' },
            { ciudad: 'Dallas', fecha: '2026-06-25' }
        ];
    } else if (pais === 'Brasil') {
         rutaPartidos = [
            { ciudad: 'Nueva York', fecha: '2026-06-13' },
            { ciudad: 'Boston', fecha: '2026-06-20' },
            { ciudad: 'Atlanta', fecha: '2026-06-24' }
        ];
    } else if (pais === 'Mexico') {
        rutaPartidos = [
            { ciudad: 'Ciudad de Mexico', fecha: '2026-06-11' },
            { ciudad: 'Guadalajara', fecha: '2026-06-18' },
            { ciudad: 'Ciudad de Mexico', fecha: '2026-06-24' }
        ];
    } else {
        return res.status(404).json({ error: 'Ruta no definida para este país.' });
    }
    
    res.json(rutaPartidos);
});


app.get("/api/user/flights", authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;

  try {
    const result = await pool.query(
      `
      SELECT
        r.id_reserva,
        r.asiento,
        v.fecha_salida,
        v.fecha_llegada,
        v.precio,
        a.nombre_aerolinea,
        apo.ciudad  || ' (' || apo.codigo_iata || ')' AS origen,
        apd.ciudad  || ' (' || apd.codigo_iata || ')' AS destino
      FROM reservas r
      JOIN vuelos v          ON r.id_vuelo = v.id_vuelo
      JOIN aerolinea a       ON v.id_aerolinea = a.id_aerolinea
      JOIN aeropuertos apo   ON v.id_aeropuerto_origen  = apo.id_aeropuerto
      JOIN aeropuertos apd   ON v.id_aeropuerto_destino = apd.id_aeropuerto
      WHERE r.id_usuario = $1
      ORDER BY v.fecha_salida DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /api/user/flights", err);
    res.status(500).json({ error: "Error al obtener los vuelos" });
  }
});

{ path: '.env' }
