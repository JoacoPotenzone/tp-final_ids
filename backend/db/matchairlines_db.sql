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
	(1, 1, 2, '2024-07-01 10:00:00', 180, 250.00),
	(2, 2, 3, '2024-07-02 15:30:00', 200, 300.00),
	(3, 3, 4, '2024-07-03 08:45:00', 150, 220.00),
	(4, 4, 5, '2024-07-04 12:20:00', 170, 280.00),
	(5, 5, 1, '2024-07-05 18:10:00', 190, 320.00);


INSERT INTO reservas (id_usuario, id_vuelo, asiento, fecha_reserva)
VALUES
  (4, 1, '12A', '2024-06-15 09:00:00'),
  (5, 2, '14B', '2024-06-16 10:30:00'),
  (3, 3, '16C', '2024-06-17 11:45:00'),
  (1, 4, '18D', '2024-06-18 12:00:00'),
  (5, 5, '20E', '2024-06-19 13:10:00');

INSERT INTO estadios (nombre_estadio, ciudad, id_aeropuerto, pais)
VALUES
  ('Estadio Monumental', 'Buenos Aires', 1, 'Argentina'),
  ('Estadio El Campín', 'Bogota', 2, 'Colombia'),
  ('Estadio Nacional', 'Lima', 3, 'Peru'),
  ('Estadio Nacional de Chile', 'Santiago', 4, 'Chile'),
  ('Estadio Morumbi', 'Sao Paulo', 5, 'Brasil');

