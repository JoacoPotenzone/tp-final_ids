-- tabla usuarios
CREATE TABLE usuarios (
	id_usuario SERIAL PRIMARY KEY,
	nombre_usuario VARCHAR(20) UNIQUE NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	password_hash VARCHAR(60) NOT NULL,
	rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'cliente'))
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tabla vuelos

CREATE TABLE vuelos (
	id_vuelo SERIAL PRIMARY KEY,
	origen VARCHAR(100) NOT NULL,
	destino VARCHAR(100) NOT NULL,
	fecha_salida TIMESTAMP NOT NULL,
	capacidad INT NOT NULL,
	precio DECIMAL(6,2) NOT NULL
);

-- tabla reservas, la conexión entre vuelos y usuario
CREATE TABLE reservas (
	id_reserva SERIAL PRIMARY KEY,
	id_usuario INT NOT NULL,
	id_vuelo INT NOT NULL,
	asiento VARCHAR(5) NOT NULL,
	fecha_reserva TIMESTAMP NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
	FOREIGN KEY (id_vuelo) REFERENCES vuelos (id_vuelo)
)