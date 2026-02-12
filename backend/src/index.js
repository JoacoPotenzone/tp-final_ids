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

function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ error: "Solo administradores pueden acceder a esta ruta" });
  }
  next();
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

function createAdminCrudRoutes({ key, table, idField, fields, listQuery }) {
  const basePath = `/api/admin/${key}`;

  app.get(basePath, authMiddleware, requireAdmin, async (req, res) => {
    try {
      const query = listQuery || `SELECT ${idField}, ${fields.join(", ")} FROM ${table} ORDER BY ${idField}`;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(`Error listando ${table}`, err);
      res.status(500).json({ error: `Error obteniendo ${key}` });
    }
  });

  app.post(basePath, authMiddleware, requireAdmin, async (req, res) => {
    try {
      const values = fields.map((f) => (req.body[f] === "" ? null : req.body[f]));
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");

      const result = await pool.query(
        `INSERT INTO ${table} (${fields.join(", ")})
         VALUES (${placeholders})
         RETURNING ${idField}, ${fields.join(", ")}`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(`Error creando en ${table}`, err);
      res.status(500).json({ error: `Error creando registro en ${key}` });
    }
  });

  app.put(`${basePath}/:id`, authMiddleware, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
      const setClauses = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
      const values = fields.map((f) => (req.body[f] === "" ? null : req.body[f]));
      values.push(id);

      const result = await pool.query(
        `UPDATE ${table}
         SET ${setClauses}
         WHERE ${idField} = $${fields.length + 1}
         RETURNING ${idField}, ${fields.join(", ")}`,
        values
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: `${key} no encontrado` });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(`Error actualizando ${table}`, err);
      res.status(500).json({ error: `Error actualizando ${key}` });
    }
  });

  app.delete(`${basePath}/:id`, authMiddleware, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM ${table}
         WHERE ${idField} = $1
         RETURNING ${idField}`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: `${key} no encontrado` });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(`Error borrando de ${table}`, err);
      res.status(409).json({ error: `No se puede borrar porque tiene datos relacionados` });
    }
  });
}

app.get("/api/admin/usuarios", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         id_usuario,
         nombre_usuario,
         email,
         nacionalidad,
         rol,
         fecha_creacion
       FROM usuarios
       ORDER BY id_usuario`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error listando usuarios", err);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

app.post("/api/admin/usuarios", authMiddleware, requireAdmin, async (req, res) => {
  const { nombre_usuario, email, nacionalidad, rol, password } = req.body;

  if (!nombre_usuario || !email || !rol || !password) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const existing = await pool.query(
      "SELECT 1 FROM usuarios WHERE email = $1 OR nombre_usuario = $2",
      [email, nombre_usuario]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "El usuario o el email ya existe" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre_usuario, email, password_hash, nacionalidad, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre_usuario, email, nacionalidad, rol, fecha_creacion`,
      [nombre_usuario, email, password_hash, nacionalidad || null, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando usuario desde admin", err);
    res.status(500).json({ error: "Error creando usuario" });
  }
});

app.delete("/api/admin/usuarios/:id", authMiddleware, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM usuarios
       WHERE id_usuario = $1
       RETURNING id_usuario`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error borrando usuario desde admin", err);
    res.status(409).json({ error: "No se puede borrar porque tiene datos relacionados" });
  }
});

createAdminCrudRoutes({
  key: "aerolineas",
  table: "aerolinea",
  idField: "id_aerolinea",
  fields: ["nombre_aerolinea", "codigo_iata"],
});


createAdminCrudRoutes({
  key: "aeropuertos",
  table: "aeropuertos",
  idField: "id_aeropuerto",
  fields: ["nombre_aeropuerto", "ciudad", "pais", "codigo_iata"],
});


createAdminCrudRoutes({
  key: "vuelos",
  table: "vuelos",
  idField: "id_vuelo",
  fields: [
    "id_aerolinea",
    "id_aeropuerto_origen",
    "id_aeropuerto_destino",
    "fecha_salida",
    "fecha_llegada",
    "capacidad",
    "precio",
  ],
  listQuery: `
    SELECT 
      v.id_vuelo, 
      al.nombre_aerolinea, 
      ao.nombre_aeropuerto AS aeropuerto_origen, 
      ad.nombre_aeropuerto AS aeropuerto_destino, 
      v.fecha_salida, 
      v.fecha_llegada, 
      v.capacidad, 
      v.precio
    FROM vuelos v
    LEFT JOIN aerolinea al ON v.id_aerolinea = al.id_aerolinea
    LEFT JOIN aeropuertos ao ON v.id_aeropuerto_origen = ao.id_aeropuerto
    LEFT JOIN aeropuertos ad ON v.id_aeropuerto_destino = ad.id_aeropuerto
    ORDER BY v.id_vuelo
  `
});


createAdminCrudRoutes({
  key: "reservas",
  table: "reservas",
  idField: "id_reserva",
  fields: ["id_usuario", "id_vuelo", "asiento", "fecha_reserva"],
  listQuery: `
    SELECT 
      r.id_reserva, 
      u.nombre_usuario, 
      u.email, 
      r.id_vuelo, 
      al.nombre_aerolinea, 
      r.asiento, 
      r.fecha_reserva
    FROM reservas r
    LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
    LEFT JOIN vuelos v ON r.id_vuelo = v.id_vuelo
    LEFT JOIN aerolinea al ON v.id_aerolinea = al.id_aerolinea
    ORDER BY r.id_reserva DESC
  `
});


createAdminCrudRoutes({
  key: "estadios",
  table: "estadios",
  idField: "id_estadio",
  fields: ["nombre_estadio", "ciudad", "pais", "id_aeropuerto"],
});


createAdminCrudRoutes({
  key: "partidos_mundial",
  table: "partidos_mundial",
  idField: "id_partido",
  fields: ["equipo_nombre", "id_estadio", "fecha_partido"],
  listQuery: `
    SELECT 
      pm.id_partido, 
      pm.equipo_nombre, 
      e.nombre_estadio, 
      pm.fecha_partido
    FROM partidos_mundial pm
    LEFT JOIN estadios e ON pm.id_estadio = e.id_estadio
    ORDER BY pm.fecha_partido DESC
  `
});




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
    const result = await pool.query("SELECT * FROM vuelos"); //v.id_vuelos,al.nombre_aerolinea,ao.nombre_aeropuerto AS aeropuerto_origen,ad.nombre_aeropuerto AS aeropierto_destino,v.fecha_salida,v.capacidad,v.precio FROM vuelos v JOIN aerolinea al ON v.id_aereolinea = al.id_aereolinea JOIN aeropuertos ao ON v.id_aeropuerto_origen = ao.id_aeropuerto JOIN aeropuertos ad ON v.id_aeropuerto_destino = ad.id_aeropuerto");
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
}
);

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
    !dest_name || !dest_city || !dest_country || !dest_code ||
    !departure || !arrival || !price || !seat
  ) {
    return res.status(400).json({ error: "Faltan datos del vuelo" });
  }
  if (origin_code === dest_code) {
    return res.status(400).json({ error: "El código IATA del origen no puede ser el mismo que el de destino." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existingAirlineResult = await client.query(
      `SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = $1 OR codigo_iata = $2`,
      [airline_name, airline_code]
    );
    let id_aerolinea;
    if (existingAirlineResult.rowCount > 0) {
      id_aerolinea = existingAirlineResult.rows[0].id_aerolinea;
      await client.query(
        `UPDATE aerolinea SET nombre_aerolinea = $1, codigo_iata = $2 WHERE id_aerolinea = $3`,
        [airline_name, airline_code, id_aerolinea]
      );
    } else {
      const newAirlineResult = await client.query(
        `
            INSERT INTO aerolinea (nombre_aerolinea, codigo_iata)
            VALUES ($1, $2)
            RETURNING id_aerolinea;
            `,
        [airline_name, airline_code]
      );
      id_aerolinea = newAirlineResult.rows[0].id_aerolinea;
    }
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

app.get('/api/mundial/equipos', async (req, res) => {
  try {
    const query = `
          SELECT DISTINCT equipo_nombre FROM partidos_mundial ORDER BY equipo_nombre ASC
      `;
    const result = await pool.query(query);
    const equipos = result.rows.map(row => row.equipo_nombre);
    res.json(equipos);
  } catch (err) {
    console.error('Error al obtener equipos:', err);
    res.status(500).json({ error: 'Error al consultar la lista de equipos.' });
  }
});


app.get('/api/mundial/ruta', async (req, res) => {
  const { pais } = req.query;
  if (!pais) {
    return res.status(400).json({ error: 'Falta el parámetro del país.' });
  }
  const paisBusqueda = pais.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  try {
    const query = `
      SELECT
        TO_CHAR(pm.fecha_partido, 'YYYY-MM-DD') AS fecha,
        e.ciudad
      FROM
        partidos_mundial pm
      JOIN
        estadios e ON pm.id_estadio = e.id_estadio
      WHERE
        pm.equipo_nombre ILIKE $1
      ORDER BY
        pm.fecha_partido ASC
    `;
    const result = await pool.query(query, [paisBusqueda]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no definida para este país.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ruta del mundial:', err);
    res.status(500).json({ error: 'Error interno del servidor al consultar la DB.' });
  }
}
);


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
      ORDER BY v.fecha_salida ASC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /api/user/flights", err);
    res.status(500).json({ error: "Error al obtener los vuelos" });
  }
});

app.post("/api/user/change-password", authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query(
      "SELECT password_hash FROM usuarios WHERE id_usuario = $1",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { password_hash } = result.rows[0];

    const ok = await bcrypt.compare(currentPassword, password_hash);
    if (!ok) {
      return res.status(401).json({ error: "La contraseña actual no es correcta" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2",
      [newHash, userId]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error en /api/user/change-password:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.delete("/api/user/delete-account", authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const { currentPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ error: "Falta la contraseña actual" });
  }

  try {
    const result = await pool.query(
      "SELECT password_hash FROM usuarios WHERE id_usuario = $1",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { password_hash } = result.rows[0];

    const ok = await bcrypt.compare(currentPassword, password_hash);
    if (!ok) {
      return res.status(401).json({ error: "La contraseña actual no es correcta" });
    }
    await pool.query("BEGIN");

    await pool.query("DELETE FROM reservas WHERE id_usuario = $1", [userId]);

    await pool.query("DELETE FROM usuarios WHERE id_usuario = $1", [userId]);

    await pool.query("COMMIT");

    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (err) {
    console.error("Error en /api/user/delete-account:", err);
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Error al eliminar la cuenta" });
  }
});

app.post("/api/reservas", authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const { id_vuelo, asiento } = req.body;

  if (!id_vuelo || !asiento) {
    return res.status(400).json({ error: "Faltan datos de vuelo o asiento." });
  }

  try {
    const asientoCheck = await pool.query(
      "SELECT 1 FROM reservas WHERE id_vuelo = $1 AND asiento = $2",
      [id_vuelo, asiento]
    );

    if (asientoCheck.rowCount > 0) {
      return res.status(409).json({ error: "El asiento ya está reservado." });
    }

    const result = await pool.query(
      `
            INSERT INTO reservas (id_usuario, id_vuelo, asiento, fecha_reserva)
            VALUES ($1, $2, $3, NOW())
            RETURNING id_reserva, id_vuelo, asiento;
            `,
      [userId, id_vuelo, asiento]
    );

    res.status(201).json({
      message: "Reserva creada con éxito.",
      reserva: result.rows[0],
      vuelo: { id_vuelo: id_vuelo }
    });

  } catch (err) {
    console.error("Error en POST /api/reservas", err);
    res.status(500).json({ error: "Error al crear la reserva." });
  }
});

app.delete("/api/reservas/:id", authMiddleware, async (req, res) => {
  const userId = req.user.id_usuario;
  const idReserva = req.params.id;
  try {
    await pool.query("BEGIN");
    const deleteResult = await pool.query(
      "DELETE FROM reservas WHERE id_reserva = $1 AND id_usuario = $2 RETURNING id_vuelo",
      [idReserva, userId]
    );
    if (deleteResult.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Reserva no encontrada o no pertenece al usuario." });
    }
    await pool.query("COMMIT");
    res.json({ message: `Reserva ${idReserva} cancelada correctamente.` });
  } catch (err) {
    console.error("Error en DELETE /api/reservas/:id", err);
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Error al cancelar la reserva." });
  }
});

{ path: '.env' }
