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
)