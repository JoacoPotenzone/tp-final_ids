-- tabla usuarios
CREATE TABLE usuarios (
	id_usuario SERIAL PRIMARY KEY,
	nombre_usuario VARCHAR(20) UNIQUE NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	password_hash VARCHAR(60) NOT NULL,
	rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'cliente')),
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tabla aerolinea

CREATE TABLE aerolinea (
	id_aerolinea SERIAL PRIMARY KEY,
	nombre_aerolinea VARCHAR(100) UNIQUE NOT NULL,
	codigo_iata VARCHAR(3) UNIQUE NOT NULL
);

-- tabla aeropuertos

CREATE TABLE aeropuertos (
	id_aeropuerto SERIAL PRIMARY KEY,
	nombre_aeropuerto VARCHAR(100) NOT NULL,
	ciudad VARCHAR(100) NOT NULL,
	pais VARCHAR(100) NOT NULL,
	codigo_iata VARCHAR(3) UNIQUE NOT NULL
);
-- tabla vuelos

CREATE TABLE vuelos (
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

-- tabla reservas, la conexión entre vuelos y usuario
CREATE TABLE reservas (
	id_reserva SERIAL PRIMARY KEY,
	id_usuario INT NOT NULL,
	id_vuelo INT NOT NULL,
	asiento VARCHAR(5) NOT NULL,
	fecha_reserva TIMESTAMP NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
	FOREIGN KEY (id_vuelo) REFERENCES vuelos (id_vuelo),
	UNIQUE (id_vuelo, asiento)
);

CREATE TABLE estadios (
	id_estadio SERIAL PRIMARY KEY,
	nombre_estadio VARCHAR(50) UNIQUE NOT NULL,
	ciudad VARCHAR(50) NOT NULL,
	id_aeropuerto INT NOT NULL,
	pais VARCHAR(50) NOT NULL,
	FOREIGN KEY (id_aeropuerto) REFERENCES aeropuertos (id_aeropuerto)
);

INSERT INTO usuarios (nombre_usuario, email, password_hash, rol)
VALUES
  ('Ignacio Gracia', 'IG18@gmail.com', '$2a$10$mcBPd7Z2RLfbXZ1LpNu2J.1FWxSsar0aiD58JQ4olE5xcYBAuzGf6', 'admin'),
  ('Joaquin Potenzone', 'J019@gmail.com', '$2a$10$9Lj3sGTNOGnLaxEoYHOZxeWAeUvL5mq4hCOmqymkTJhGvSTh7HAzq', 'admin'),
  ('Paco Pozo', 'JP20@gmail.com', '$2a$10$dOiwjoolFzqsaGDXmJXJ3OxcI1RRTiLHAjgUCVphuul52/oIuSGj2', 'admin'),
  ('Anakin Skywalker', 'Chosenone@gmail.com', '$2a$10$tqn7y7HgnhsC6Gt72xc8luY.fknuT8ELScB39qfEdqxOwLAKAvize', 'cliente'),
  ('Obi Wan Kenobi', 'Benkenobi@gmail.com', '$2a$10$QSC298G/aJOWv63P3OG9D.wUOmDyJOaqejysh3pnlaBNi6aHVnY.y', 'cliente'),
  ('Han Solo', 'Halonmilenario@gmail.com', '$2a$10$hYsOKkF/66RV2higwOYHtOpIS8hKkw.RE1IlAijm/2IGC9VssUl4q', 'cliente');

INSERT INTO aerolinea (nombre_aerolinea, codigo_iata)
VALUES
  ('Aerolineas Argentinas', 'AR'),
  ('LATAM Airlines', 'LA'),
  ('Gol Linhas Aéreas', 'G3'),
  ('Azul Linhas Aéreas', 'AD'),
  ('Viva Air Colombia', 'VV');
  ('Avianca', 'AV'),
  ('Copa Airlines', 'CM'),
  ('Aeromexico', 'AM'),
  ('American Airlines', 'AA'),
  ('United Airlines', 'UA'),
  ('Air Canada', 'AC'),
  ('Iberia', 'IB'),
  ('Air Europa', 'UX'),
  ('Ryanair', 'FR');

INSERT INTO aeropuertos (nombre_aeropuerto, ciudad, pais, codigo_iata)
VALUES
						---Argentina----
  ('Aeropuerto Internacional Ministro Pistarini', 'Buenos Aires', 'Argentina', 'EZE'),
  ('Aeroparque Jorge Newbery', 'Buenos Aires', 'Argentina', 'AEP'),
  ('Aeropuerto Internacional Ingeniero Ambrosio LV Taravella', 'Cordoba', 'Argentina', 'COR'),
  ('Aeropuerto Internacional de Rosario Islas Malvinas', 'Rosario', 'Argentina', 'ROS'),
  ('Aeropuerto Internacional Martin Miguel de Guemes', 'Salta', 'Argentina', 'SLA'),
						----LATAM----
  ('Aeropuerto Internacional El Dorado', 'Bogota', 'Colombia', 'BOG'),
  ('Aeropuerto Internacional Jorge Chavez', 'Lima', 'Peru', 'LIM'),
  ('Aeropuerto Internacional Comodoro Arturo Merino Benitez', 'Santiago', 'Chile', 'SCL'),
  ('Aeropuerto Internacional Guarulhos', 'Sao Paulo', 'Brasil', 'GRU')
  ('Aeropuerto Internacional Tocumen', 'Ciudad de Panama', 'Panama', 'PTY'),
  ('Aeropuerto Internacional de Viracopos', 'Campinas', 'Brasil', 'VCP'),
  ('Aeropuerto Internacional de Carrasco', 'Montevideo', 'Uruguay', 'MVD'),
						----USA 2026----
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
						----MEX 2026----
  ('Aeropuerto Internacional General Mariano Escobedo', 'Monterrey', 'Mexico', 'MTY'),
  ('Aeropuerto Internacional de Guadalajara', 'Guadalajara', 'Mexico', 'GDL'),
  ('Aeropuerto Internacional Benito Juarez', 'Ciudad de Mexico', 'Mexico', 'MEX'),
  ('Aeropuerto Internacional de Cancún', 'Cancun', 'Mexico', 'CUN'),
						----CAN 2026----
  ('Vancouver International Airport', 'Vancouver', 'Canada', 'YVR'),
  ('Toronto Pearson International Airport', 'Toronto', 'Canada', 'YYZ'),
						----España
  ('Aeropuerto Adolfo Suarez Madrid-Barajas', 'Madrid', 'Espana', 'MAD'),
  ('Aeropuerto de Barcelona-El Prat', 'Barcelona', 'Espana', 'BCN');
  ;

INSERT INTO vuelos (id_aerolinea, id_aeropuerto_origen, id_aeropuerto_destino, fecha_salida, capacidad, precio) 
VALUES 
	(1, 1, 2, '2026-01-01 10:00:00', 180, 250.00),
	(2, 2, 3, '2026-02-02 15:30:00', 200, 300.00),
	(3, 3, 4, '2026-04-03 08:45:00', 150, 220.00),
	(4, 4, 5, '2026-03-04 12:20:00', 170, 280.00),
	(5, 5, 1, '2026-011-05 18:10:00', 190, 320.00);
	/* Vuelo 6: Mexico a USA (Aeromexico) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Aeromexico'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MEX'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'ATL'),
   '2024-09-01 07:00:00', 220, 380.00),

  /* Vuelo 7: USA a Canada (Air Canada) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Air Canada'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'LAX'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'YYZ'),
   '2024-09-02 12:45:00', 190, 450.00),

  /* Vuelo 8: Brasil a Chile (LATAM Airlines) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'LATAM Airlines'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'GRU'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'SCL'),
   '2024-09-03 16:30:00', 250, 310.00),

  /* Vuelo 9: USA a USA (American Airlines) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'American Airlines'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'DFW'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MIA'),
   '2024-09-04 09:15:00', 160, 190.00),

  /* Vuelo 10: España a Mexico (Iberia) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Iberia'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MAD'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'CUN'),
   '2024-09-05 21:00:00', 300, 750.00),

  /* Vuelo 11: Panama a Colombia (Copa Airlines) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Copa Airlines'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'PTY'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'BOG'),
   '2024-09-06 14:00:00', 140, 210.00),

  /* Vuelo 12: Argentina a Peru (Aerolineas Argentinas) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Aerolineas Argentinas'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'AEP'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'LIM'),
   '2024-09-07 10:30:00', 170, 330.00),

  /* Vuelo 13: USA Costa Oeste a Este (United Airlines) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'United Airlines'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'SFO'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'JFK'),
   '2024-09-08 18:00:00', 280, 490.00),

  /* Vuelo 14: Canada a USA Mundial (Air Canada) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Air Canada'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'YVR'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'SEA'),
   '2024-09-09 11:20:00', 120, 150.00),

  /* Vuelo 15: Conexión clave Europea (Ryanair) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Ryanair'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'BCN'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MAD'),
   '2024-09-10 13:50:00', 189, 45.00),
   /* Vuelo 16: España a USA (Iberia) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Iberia'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MAD'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'PHL'),
   '2024-10-01 15:30:00', 250, 650.00),

  /* Vuelo 17: USA a México (American Airlines) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'American Airlines'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'BOS'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'GDL'),
   '2024-10-02 11:00:00', 180, 420.00),

  /* Vuelo 18: Perú a Argentina (LATAM Airlines) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'LATAM Airlines'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'LIM'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'EZE'),
   '2024-10-03 08:45:00', 200, 300.00),

  /* Vuelo 19: Colombia a USA (Avianca) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Avianca'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'BOG'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'JFK'),
   '2024-10-04 13:20:00', 230, 480.00),

  /* Vuelo 20: Canadá a USA (Air Canada) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Air Canada'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'YVR'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'LAX'),
   '2024-10-05 16:10:00', 150, 250.00),

  /* Vuelo 21: Argentina a Chile (Aerolineas Argentinas) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Aerolineas Argentinas'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'AEP'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'SCL'),
   '2024-10-06 06:00:00', 170, 190.00),

  /* Vuelo 22: Conexión entre sedes USA (United Airlines) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'United Airlines'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'ATL'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'SEA'),
   '2024-10-07 19:00:00', 280, 510.00),

  /* Vuelo 23: México a Panamá (Aeromexico) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Aeromexico'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MTY'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'PTY'),
   '2024-10-08 10:40:00', 160, 350.00),

  /* Vuelo 24: España a España Low Cost (Ryanair) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Ryanair'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'BCN'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MAD'),
   '2024-10-09 14:55:00', 189, 50.00),

  /* Vuelo 25: Brasil Interno (Gol Linhas Aéreas) */
  ((SELECT id_aerolinea FROM aerolinea WHERE nombre_aerolinea = 'Gol Linhas Aéreas'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'GRU'),
   (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'VCP'),
   '2024-10-10 18:25:00', 150, 95.00);


INSERT INTO reservas (id_usuario, id_vuelo, asiento, fecha_reserva)
VALUES
  (4, 1, '12A', '2024-06-15 09:00:00'),
  (5, 2, '14B', '2024-06-16 10:30:00'),
  (3, 3, '16C', '2024-06-17 11:45:00'),
  (1, 4, '18D', '2024-06-18 12:00:00'),
  (5, 5, '20E', '2024-06-19 13:10:00');

INSERT INTO estadios (nombre_estadio, ciudad, id_aeropuerto, pais)
VALUES
  /* MEXICO */
  ('Estadio Azteca', 'Ciudad de Mexico', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MEX'), 'Mexico'),
  ('Estadio Akron', 'Guadalajara', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'GDL'), 'Mexico'),
  ('Estadio BBVA', 'Monterrey', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MTY'), 'Mexico'),

  /* CANADA */
  ('Toronto Stadium', 'Toronto', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'YYZ'), 'Canada'),
  ('BC Place', 'Vancouver', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'YVR'), 'Canada'),

  /* ESTADOS UNIDOS */
  ('Mercedes-Benz Stadium', 'Atlanta', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'ATL'), 'Estados Unidos'),
  ('Gillette Stadium', 'Boston', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'BOS'), 'Estados Unidos'),
  ('AT&T Stadium', 'Dallas', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'DFW'), 'Estados Unidos'),
  ('NRG Stadium', 'Houston', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'IAH'), 'Estados Unidos'),
  ('Arrowhead Stadium', 'Kansas City', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MCI'), 'Estados Unidos'),
  ('SoFi Stadium', 'Los Angeles', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'LAX'), 'Estados Unidos'),
  ('Hard Rock Stadium', 'Miami', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'MIA'), 'Estados Unidos'),
  ('MetLife Stadium', 'Nueva York', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'JFK'), 'Estados Unidos'),
  ('Lincoln Financial Field', 'Filadelfia', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'PHL'), 'Estados Unidos'),
  ('Levi`s Stadium', 'San Francisco', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'SFO'), 'Estados Unidos'),
  ('Lumen Field', 'Seattle', (SELECT id_aeropuerto FROM aeropuertos WHERE codigo_iata = 'SEA'), 'Estados Unidos');

