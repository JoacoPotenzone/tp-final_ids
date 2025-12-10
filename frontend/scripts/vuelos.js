const API_BASE_URL = 'http://localhost:3001';

const userJson = localStorage.getItem("user");
const token = localStorage.getItem("token");
let currentUser = null;

if (!userJson || !token) {
    alert("Tenés que iniciar sesión para reservar vuelos.");
    window.location.href = "./login.html";
    console.log("Usuario no logueado, navegación anónima.");
} else {
    currentUser = JSON.parse(userJson);
    console.log("Usuario logueado en vuelos:", currentUser);
}

function mostrarVuelosSimulados(vuelos) {
    const container = document.getElementById('lista-vuelos');
    container.innerHTML = ''; 

    vuelos.forEach(vuelo => {
        const precioNumero = parseFloat(vuelo.precio);
        const vueloHTML = `
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-body d-flex justify-content-between align-items-center p-3">
                        <div class="flight-details">
                            <h5 class="card-title mb-1">
                                ${vuelo.aerolinea} <span class="badge bg-secondary">${vuelo.numero}</span>
                            </h5>
                            <p class="mb-0 text-muted">Desde: <strong>${vuelo.origen_ciudad} </strong><strong> Destino: ${vuelo.destino_ciudad}</strong></p> <p class="card-text mb-0">
                                <i class="bi bi-clock me-1"></i> 
                                Salida: <strong>${vuelo.salida}</strong> | Llegada: <strong>${vuelo.llegada || 'N/A'}</strong>
                            </p>
                        </div>
                        <div class="flight-price text-end">
                            <span class="d-block fs-4 text-primary fw-bold">$${precioNumero.toFixed(2)}</span>
                            <button class="btn btn-sm btn-primary mt-1">Reservar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += vueloHTML;
    });
}


async function buscarVuelosDesdeBackend(origen, destino, fecha) {
    const listaVuelosContainer = document.getElementById('lista-vuelos');
    listaVuelosContainer.innerHTML = 'Cargando opciones de vuelo...'; 
    const params = new URLSearchParams({
        origen: origen,
        destino: destino,
        fecha: fecha 
    }).toString();

    try {
        const response = await fetch(`${API_BASE_URL}/api/vuelos?${params}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            listaVuelosContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center" role="alert">Error al buscar vuelos: ${errorData.error}</div></div>`;
            return;
        }

        const vuelos = await response.json();

        if (vuelos.length === 0) {
            listaVuelosContainer.innerHTML = `<div class="col-12"><div class="alert alert-info text-center" role="alert">No se encontraron vuelos para esta búsqueda.</div></div>`;
        } else {
            mostrarVuelosSimulados(vuelos);
        }

    } catch (error) {
        console.error('Error en la comunicación con el backend:', error);
        listaVuelosContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center" role="alert">Error de conexión: Verifica que tu servidor Node.js esté funcionando en ${API_BASE_URL}.</div></div>`;
    }
}

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

