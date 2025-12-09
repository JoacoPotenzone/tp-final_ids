import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "Secretomatchairlines";
const JWT_EXPIRES_IN = "2h";

function generateToken(user) {
  return jwt.sign(
    {
      id_usuario: user.id_usuario,
      email: user.email,
      nombre_usuario: user.nombre_usuario,
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