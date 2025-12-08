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
    }


    if (origen === 'Buenos Aires' && destino === 'Dallas') {
        mostrarVuelosSimulados([
            { aerolinea: 'Aerolíneas Match', numero: 'MA101', salida: '08:00', llegada: '18:30', precio: 540.50 },
            { aerolinea: 'Global Wings', numero: 'GW777', salida: '14:00', llegada: '00:30', precio: 620.00 },
            { aerolinea: 'Turbo Flight', numero: 'TF222', salida: '20:30', llegada: '06:45', precio: 499.99 }
        ]);
    } else if (origen === 'Buenos Aires' && destino === 'Ciudad de México') {
        mostrarVuelosSimulados([
            { aerolinea: 'Aerolíneas Match', numero: 'MA300', salida: '10:00', llegada: '15:30', precio: 380.00 },
            { aerolinea: 'Sky Connect', numero: 'SC456', salida: '19:00', llegada: '01:00', precio: 450.00 }
        ]);
    } else {
        // No se encontraron resultados
        document.getElementById('lista-vuelos').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center" role="alert">
                    <i class="bi bi-x-circle me-2"></i> No se encontraron vuelos para esta ruta.
                </div>
            </div>
        `;
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