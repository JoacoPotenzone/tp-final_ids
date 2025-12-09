const API_BASE_URL = 'http://localhost:3001'; 

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const origen = params.get('origen');
    const destino = params.get('destino');
    const fecha = params.get('fecha');
    const pasajeros = params.get('pasajeros');

    const resumenElement = document.getElementById('resumen-busqueda');
    if (origen && destino) {
        resumenElement.innerHTML = `
            <strong>De:</strong> ${origen} | 
            <strong>A:</strong> ${destino} | 
            <strong>Fecha:</strong> ${fecha || 'N/A'} | 
            <strong>Pasajeros:</strong> ${pasajeros || '1'}
        `;
        
        buscarVuelosDesdeBackend(origen, destino, fecha);

    } else {
        document.getElementById('lista-vuelos').innerHTML = `
            <div class="col-12"><div class="alert alert-warning text-center" role="alert">
                Realiza una búsqueda desde la página principal.
            </div></div>
        `;
    }
});

app.get('/api/vuelos', async (req, res) => {
    const { origen, destino, fecha } = req.query; 

    if (!origen || !destino || !fecha) {
        return res.status(400).json({ error: 'Faltan parámetros de búsqueda.' });
    }

    const origenBusqueda = origen.trim();
    const destinoBusqueda = destino.trim();

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
                -- USAMOS IGUALDAD ESTRICTA (=) con TRIM para coincidencia de nombre exacto
                TRIM(apo.ciudad) = $1 
                AND TRIM(apd.ciudad) = $2
            ORDER BY
                (v.fecha_salida::DATE = $3::DATE) DESC,
                v.fecha_salida ASC
        `;


        const result = await pool.query(query, [origenBusqueda, destinoBusqueda, fecha]);
        res.json(result.rows);

    } catch (err) {
        console.error('Error FATAL al extraer datos:', err);
        res.status(500).json({ error: 'Error interno del servidor al consultar la DB.' });
    }
});
function mostrarVuelosSimulados(vuelos) {
    const container = document.getElementById('lista-vuelos');
    container.innerHTML = ''; 

    vuelos.forEach(vuelo => {
        const vueloHTML = `
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-body d-flex justify-content-between align-items-center p-3">
                        <div class="flight-details">
                            <h5 class="card-title mb-1">${vuelo.aerolinea} <span class="badge bg-secondary">${vuelo.numero}</span></h5>
                            <p class="card-text mb-0">
                                <i class="bi bi-clock me-1"></i> 
                                Salida: <strong>${vuelo.salida}</strong> | Llegada: <strong>${vuelo.llegada}</strong>
                            </p>
                        </div>
                        <div class="flight-price text-end">
                            <span class="d-block fs-4 text-primary fw-bold">$${vuelo.precio.toFixed(2)}</span>
                            <button class="btn btn-sm btn-primary mt-1">Reservar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += vueloHTML;
    });
}