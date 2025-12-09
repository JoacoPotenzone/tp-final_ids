DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS vuelos;
DROP TABLE IF EXISTS estadios;
DROP TABLE IF EXISTS aeropuertos;
DROP TABLE IF EXISTS aerolinea;
DROP TABLE IF EXISTS usuarios;


CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    nacionalidad VARCHAR(50),
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'cliente')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aerolinea (
    id_aerolinea SERIAL PRIMARY KEY,
    nombre_aerolinea VARCHAR(100) UNIQUE NOT NULL,
    codigo_iata VARCHAR(3) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS aeropuertos (
    id_aeropuerto SERIAL PRIMARY KEY,
    nombre_aeropuerto VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    codigo_iata VARCHAR(3) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS vuelos (
    id_vuelo SERIAL PRIMARY KEY,
    id_aerolinea INT NOT NULL,
    id_aeropuerto_origen INT NOT NULL,
    id_aeropuerto_destino INT NOT NULL,
    fecha_salida TIMESTAMP NOT NULL,
    capacidad INT NOT NULL,
    precio DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (id_aerolinea) REFERENCES aerolinea (id_aerolinea),
    FOREIGN KEY (id_aeropuerto_origen) REFERENCES aeropuertos (id_aeropuerto),
    FOREIGN KEY (id_aeropuerto_destino) REFERENCES aeropuertos (id_aeropuerto),
    CHECK (id_aeropuerto_origen <> id_aeropuerto_destino)
);

CREATE TABLE IF NOT EXISTS reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_vuelo INT NOT NULL,
    asiento VARCHAR(5) NOT NULL,
    fecha_reserva TIMESTAMP NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (id_vuelo) REFERENCES vuelos (id_vuelo),
    UNIQUE (id_vuelo, asiento)
);

CREATE TABLE IF NOT EXISTS estadios (
    id_estadio SERIAL PRIMARY KEY,
    nombre_estadio VARCHAR(50) UNIQUE NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    id_aeropuerto INT NOT NULL,
    pais VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_aeropuerto) REFERENCES aeropuertos (id_aeropuerto)
);

INSERT INTO usuarios (nombre_usuario, email, password_hash, nacionalidad, rol)
VALUES
  ('Ignacio Gracia', 'IG18@gmail.com', '$2a$10$mcBPd7Z2RLfbXZ1LpNu2J.1FWxSsar0aiD58JQ4olE5xcYBAuzGf6','Argentina','admin'),
  ('Joaquin Potenzone', 'J019@gmail.com', '$2a$10$9Lj3sGTNOGnLaxEoYHOZxeWAeUvL5mq4hCOmqymkTJhGvSTh7HAzq','Argentina', 'admin'),
  ('Paco Pozo', 'JP20@gmail.com', '$2a$10$dOiwjoolFzqsaGDXmJXJ3OxcI1RRTiLHAjgUCVphuul52/oIuSGj2','Argentina', 'admin'),
  ('Anakin Skywalker', 'Chosenone@gmail.com', '$2a$10$tqn7y7HgnhsC6Gt72xc8luY.fknuT8ELScB39qfEdqxOwLAKAvize','Tatooine', 'cliente'),
  ('Obi Wan Kenobi', 'Benkenobi@gmail.com', '$2a$10$QSC298G/aJOWv63P3OG9D.wUOmDyJOaqejysh3pnlaBNi6aHVnY.y','Stewjon', 'cliente'),
  ('Han Solo', 'Halonmilenario@gmail.com', '$2a$10$hYsOKkF/66RV2higwOYHtOpIS8hKkw.RE1IlAijm/2IGC9VssUl4q','Corelia', 'cliente');

-- INSERT AEROLINEAS 
INSERT INTO aerolinea (nombre_aerolinea, codigo_iata)
VALUES
  ('Aerolineas Argentinas', 'AR'),
  ('LATAM Airlines', 'LA'),
  ('Gol Linhas Aereas', 'G3'),
  ('Azul Linhas Aereas', 'AD'),
  ('Viva Air Colombia', 'VV'),
  ('Avianca', 'AV'),
  ('Copa Airlines', 'CM'),
  ('Aeromexico', 'AM'),
  ('American Airlines', 'AA'),
  ('United Airlines', 'UA'),
  ('Air Canada', 'AC'),
  ('Iberia', 'IB'),
  ('Air Europa', 'UX'),
  ('Ryanair', 'FR');

-- INSERT AEROPUERTOS 
INSERT INTO aeropuertos (nombre_aeropuerto, ciudad, pais, codigo_iata)
VALUES
    /* Argentina (IDs 1-5) */
    ('Aeropuerto Internacional Ministro Pistarini', 'Buenos Aires', 'Argentina', 'EZE'),
    ('Aeroparque Jorge Newbery', 'Buenos Aires', 'Argentina', 'AEP'),
    ('Aeropuerto Internacional Ingeniero Ambrosio LV Taravella', 'Cordoba', 'Argentina', 'COR'),
    ('Aeropuerto Internacional de Rosario Islas Malvinas', 'Rosario', 'Argentina', 'ROS'),
    ('Aeropuerto Internacional Martin Miguel de Guemes', 'Salta', 'Argentina', 'SLA'),
    /* LATAM (IDs 6-12) */
    ('Aeropuerto Internacional El Dorado', 'Bogota', 'Colombia', 'BOG'),
    ('Aeropuerto Internacional Jorge Chavez', 'Lima', 'Peru', 'LIM'),
    ('Aeropuerto Internacional Comodoro Arturo Merino Benitez', 'Santiago', 'Chile', 'SCL'),
    ('Aeropuerto Internacional Guarulhos', 'Sao Paulo', 'Brasil', 'GRU'),
    ('Aeropuerto Internacional Tocumen', 'Ciudad de Panama', 'Panama', 'PTY'),
    ('Aeropuerto Internacional de Viracopos', 'Campinas', 'Brasil', 'VCP'),
    ('Aeropuerto Internacional de Carrasco', 'Montevideo', 'Uruguay', 'MVD'),
    /* USA 2026 (IDs 13-23) */
    ('Hartsfield Jackson Atlanta International Airport', 'Atlanta', 'Estados Unidos', 'ATL'),
    ('Logan International Airport', 'Boston', 'Estados Unidos', 'BOS'),
    ('Dallas Fort Worth International Airport', 'Dallas', 'Estados Unidos', 'DFW'),
    ('George Bush Intercontinental Airport', 'Houston', 'Estados Unidos', 'IAH'),
    ('Kansas City International Airport', 'Kansas City', 'Estados Unidos', 'MCI'),
    ('Los Angeles International Airport', 'Los Angeles', 'Estados Unidos', 'LAX'),
    ('Miami International Airport', 'Miami', 'Estados Unidos', 'MIA'),
    ('John F Kennedy International Airport', 'Nueva York', 'Estados Unidos', 'JFK'),
    ('Philadelphia International Airport', 'Filadelfia', 'Estados Unidos', 'PHL'),
    ('San Francisco International Airport', 'San Francisco', 'Estados Unidos', 'SFO'),
    ('Seattle Tacoma International Airport', 'Seattle', 'Estados Unidos', 'SEA'),
    /* MEX/CAN 2026 (IDs 24-28) */
    ('Aeropuerto Internacional General Mariano Escobedo', 'Monterrey', 'Mexico', 'MTY'),
    ('Aeropuerto Internacional de Guadalajara', 'Guadalajara', 'Mexico', 'GDL'),
    ('Aeropuerto Internacional Benito Juarez', 'Ciudad de Mexico', 'Mexico', 'MEX'),
    ('Aeropuerto Internacional de Cancun', 'Cancun', 'Mexico', 'CUN'),
    ('Vancouver International Airport', 'Vancouver', 'Canada', 'YVR'),
    ('Toronto Pearson International Airport', 'Toronto', 'Canada', 'YYZ'),
    /* España (IDs 29-30) */
    ('Aeropuerto Adolfo Suarez Madrid-Barajas', 'Madrid', 'Espana', 'MAD'),
    ('Aeropuerto de Barcelona-El Prat', 'Barcelona', 'Espana', 'BCN');

INSERT INTO vuelos (id_aerolinea, id_aeropuerto_origen, id_aeropuerto_destino, fecha_salida, capacidad, precio) 
VALUES 
    -- 5 Vuelos Originales
    (1, 1, 6, '2026-01-01 10:00:00', 180, 250.00),
    (2, 6, 7, '2026-02-02 15:30:00', 200, 300.00),
    (3, 7, 8, '2026-04-03 08:45:00', 150, 220.00),
    (4, 8, 9, '2026-03-04 12:20:00', 170, 280.00),
    (5, 9, 1, '2026-11-05 18:10:00', 190, 320.00), 

    -- Vuelos 6-25 (Con IDs secuenciales)
    (8, 26, 13, '2026-09-01 07:00:00', 220, 380.00),   -- 6: Aeromexico (MEX 26 -> ATL 13)
    (11, 18, 29, '2025-12-20 12:45:00', 190, 450.00),  -- 7: Air Canada (LAX 18 -> YYZ 29)
    (2, 9, 8, '2026-02-11 16:30:00', 250, 310.00),    -- 8: LATAM (GRU 9 -> SCL 8)
    (9, 15, 19, '2026-11-30 09:15:00', 160, 190.00),  -- 9: American (DFW 15 -> MIA 19)
    (12, 30, 27, '2026-09-05 21:00:00', 300, 750.00),  -- 10: Iberia (MAD 30 -> CUN 27)
    (7, 10, 6, '2026-05-06 14:00:00', 140, 210.00),    -- 11: Copa (PTY 10 -> BOG 6)
    (1, 2, 7, '2026-10-07 10:30:00', 170, 330.00),    -- 12: Aerolineas Arg (AEP 2 -> LIM 7)
    (10, 22, 20, '2026-11-08 18:00:00', 280, 490.00),  -- 13: United (SFO 22 -> JFK 20)
    (11, 28, 23, '2026-09-09 11:20:00', 120, 150.00),  -- 14: Air Canada (YVR 28 -> SEA 23)
    (14, 31, 30, '2026-06-10 13:50:00', 189, 45.00),   -- 15: Ryanair (BCN 31 -> MAD 30)
    (12, 30, 21, '2024-10-01 15:30:00', 250, 650.00),  -- 16: Iberia (MAD 30 -> PHL 21)
    (9, 14, 25, '2026-01-02 11:00:00', 180, 420.00),  -- 17: American (BOS 14 -> GDL 25)
    (2, 7, 1, '2026-11-04 08:45:00', 200, 300.00),    -- 18: LATAM (LIM 7 -> EZE 1)
    (6, 6, 20, '2026-12-19 13:20:00', 230, 480.00),  -- 19: Avianca (BOG 6 -> JFK 20)
    (11, 28, 18, '2026-12-01 16:10:00', 150, 250.00),  -- 20: Air Canada (YVR 28 -> LAX 18)
    (1, 2, 8, '2026-02-03 06:00:00', 170, 190.00),    -- 21: Aerolineas Arg (AEP 2 -> SCL 8)
    (10, 13, 23, '2026-06-02 19:00:00', 280, 510.00),  -- 22: United (ATL 13 -> SEA 23)
    (8, 24, 10, '2026-10-08 10:40:00', 160, 350.00),   -- 23: Aeromexico (MTY 24 -> PTY 10)
    (14, 31, 30, '2026-10-09 14:55:00', 189, 50.00),   -- 24: Ryanair (BCN 31 -> MAD 30)
    (3, 9, 11, '2026-10-10 18:25:00', 150, 95.00),    -- 25: Gol Linhas Aereas (GRU 9 -> VCP 11)

    -- Vuelos Mundial (ARG, MEX, BRA)
    (1, 1, 17, '2026-06-14 10:00:00', 180, 850.00),   -- 26: ARG (EZE 1 -> MCI 17)
    (6, 17, 15, '2026-06-17 14:00:00', 150, 150.00),   -- 27: ARG (MCI 17 -> DFW 15)
    (8, 26, 25, '2026-06-15 11:00:00', 160, 110.00),   -- 28: MEX (MEX 26 -> GDL 25)
    (8, 25, 26, '2026-06-20 17:30:00', 160, 125.00),   -- 29: MEX (GDL 25 -> MEX 26)
    (2, 9, 20, '2026-06-11 23:00:00', 300, 780.00),   -- 30: BRA (GRU 9 -> JFK 20)
    (10, 20, 14, '2026-06-14 08:30:00', 120, 95.00),  -- 31: BRA (JFK 20 -> BOS 14)
    (3, 13, 9, '2026-06-25 21:30:00', 250, 690.00);   -- 32: BRA (ATL 13 -> GRU 9)


INSERT INTO estadios (nombre_estadio, ciudad, id_aeropuerto, pais)
VALUES
  /* MEXICO */
  ('Estadio Azteca', 'Ciudad de Mexico', 26, 'Mexico'),
  ('Estadio Akron', 'Guadalajara', 25, 'Mexico'),
  ('Estadio BBVA', 'Monterrey', 24, 'Mexico'),

  /* CANADA */
  ('Toronto Stadium', 'Toronto', 29, 'Canada'),
  ('BC Place', 'Vancouver', 28, 'Canada'),

  /* ESTADOS UNIDOS */
  ('Mercedes-Benz Stadium', 'Atlanta', 13, 'Estados Unidos'),
  ('Gillette Stadium', 'Boston', 14, 'Estados Unidos'),
  ('AT&T Stadium', 'Dallas', 15, 'Estados Unidos'),
  ('NRG Stadium', 'Houston', 16, 'Estados Unidos'),
  ('Arrowhead Stadium', 'Kansas City', 17, 'Estados Unidos'),
  ('SoFi Stadium', 'Los Angeles', 18, 'Estados Unidos'),
  ('Hard Rock Stadium', 'Miami', 19, 'Estados Unidos'),
  ('MetLife Stadium', 'Nueva York', 20, 'Estados Unidos'),
  ('Lincoln Financial Field', 'Filadelfia', 21, 'Estados Unidos'),
  ('Levi`s Stadium', 'San Francisco', 22, 'Estados Unidos'),
  ('Lumen Field', 'Seattle', 23, 'Estados Unidos');


INSERT INTO reservas (id_usuario, id_vuelo, asiento, fecha_reserva)
VALUES
  (4, 1, '12A', '2024-06-15 09:00:00'),
  (5, 2, '14B', '2024-06-16 10:30:00'),
  (3, 3, '16C', '2024-06-17 11:45:00'),
  (1, 4, '18D', '2024-06-18 12:00:00'),
  (5, 5, '20E', '2024-06-19 13:10:00');