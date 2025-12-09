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


{ path: '.env' }
