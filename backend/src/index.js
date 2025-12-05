import express from "express";
import cors from 'cors';
import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

const PORT = process.env.PORT || 3000;
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