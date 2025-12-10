let mapa = null;
let capaRuta = null;
let marcadores = L.featureGroup();
const API_BASE_URL = 'http://localhost:3001';

const sedesCoordenadas = {
    "Ciudad de Mexico": [19.4326, -99.1332],
    "Guadalajara": [20.6597, -103.3496],
    "Monterrey": [25.6869, -100.3161], 
    "Toronto": [43.6532, -79.3832],
    "Vancouver": [49.2827, -123.1207],
    "Atlanta": [33.7490, -84.3880],
    "Boston": [42.3601, -71.0589],
    "Dallas": [32.7767, -96.7970],
    "Houston": [29.7604, -95.3698], 
    "Kansas City": [39.0997, -94.5786],
    "Los Angeles": [34.0522, -118.2437],
    "Miami": [25.7617, -80.1918],
    "Nueva York": [40.7128, -74.0060],
    "Filadelfia": [39.9526, -75.1652], 
    "San Francisco": [37.7749, -122.4194],
    "Seattle": [47.6062, -122.3321],
};

const selector = document.getElementById('equipo-selector');
const rutaInfo = document.getElementById('ruta-info');
const tabMundial = document.getElementById('pills-mundial-tab');

// Inicialización de Leaflet
function initializeMap() {
    const containerId = 'mapa-leaflet-container';
    
    mapa = L.map(containerId).setView([40, -100], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);
    
    marcadores.addTo(mapa);
}

if (tabMundial) {
    tabMundial.addEventListener('shown.bs.tab', function (e) {
        if (mapa === null) {
            initializeMap();
        } else {
            mapa.invalidateSize();
        }
    });
}

// Función para obtener la ruta de partidos (nueva lógica asíncrona)
async function obtenerRutaPartidos() {
    const equipoSeleccionado = selector.value;
    rutaInfo.innerHTML = ""; 

    if (!equipoSeleccionado || equipoSeleccionado === "") {
        rutaInfo.textContent = "Selecciona un equipo para ver la mejor ruta para alentarlos.";
        rutaInfo.classList.remove('active');
        return;
    } 
    
    rutaInfo.innerHTML = '<h3>Cargando ruta y partidos...</h3>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/mundial/ruta?pais=${encodeURIComponent(equipoSeleccionado)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            rutaInfo.innerHTML = `<h3 class="text-danger">Error: No se pudo obtener la ruta del ${equipoSeleccionado}: ${errorData.error}</h3>`;
            return;
        }

        const partidos = await response.json(); 
        
        if (partidos.length === 0) {
            rutaInfo.innerHTML = `<h3 class="text-info">No se encontraron partidos definidos para ${equipoSeleccionado}.</h3>`;
            return;
        }
        
        renderizarRutaPartidos(equipoSeleccionado, partidos);

    } catch (error) {
        console.error("Error de comunicación con el backend:", error);
        rutaInfo.innerHTML = '<h3 class="text-danger">Error de conexión: Verifica que tu servidor esté corriendo.</h3>';
    }
}

// Función para renderizar la información de los partidos y el botón del mapa
function renderizarRutaPartidos(equipo, partidos) {
    let descripcionHTML = `<h3 class="mb-3">🌟 Ruta de Partidos para ${equipo} 🌟</h3>`;
    let paradasNombres = [];
    
    partidos.forEach((p, index) => {
        descripcionHTML += `
            <div class="card mb-2">
                <div class="card-body">
                    <h5 class="card-title">Partido ${index + 1}</h5>
                    <p class="mb-1"><strong>Ciudad:</strong> ${p.ciudad}</p>
                    <p class="mb-1"><strong>Fecha:</strong> ${p.fecha}</p>
                </div>
            </div>
        `;
        paradasNombres.push(p.ciudad);
    });

    descripcionHTML += `
        <p class="mt-3">Visualiza el recorrido y planifica tus vuelos:</p>
        <button id="btn-ver-mapa" class="btn btn-warning">
            Ver Ruta en el Mapa
        </button>
    `;

    rutaInfo.innerHTML = descripcionHTML;
    rutaInfo.classList.add('active');

    const btnMapa = document.getElementById('btn-ver-mapa');
    if (btnMapa) {
        btnMapa.addEventListener('click', () => {
             verRutaEnMapaBackend(equipo, paradasNombres);
        });
    }
}

// Función para dibujar la ruta en el mapa (modificada para usar los datos del backend)
function verRutaEnMapaBackend(equipo, paradasNombres) {
    const mapaContainerIdString = 'mapa-leaflet-container';

    if (mapa === null) {
        initializeMap();
    }
    
    mapa.invalidateSize();
    
    if (capaRuta) {
        mapa.removeLayer(capaRuta);
    }
    marcadores.clearLayers();
    
    let rutaCoordenadas = [];
    
    paradasNombres.forEach((ciudadNombre, index) => {
        const coords = sedesCoordenadas[ciudadNombre]; 
        
        if (coords) {
            rutaCoordenadas.push(coords);
            
            const isOrigen = index === 0;
            const colorRelleno = isOrigen ? '#FFD700' : '#D81B60'; 
            
            L.circleMarker(coords, {
                radius: isOrigen ? 12 : 8,
                color: '#333',
                weight: 2,
                fillColor: colorRelleno,
                fillOpacity: 0.9
            })
            .bindPopup(`<b>${ciudadNombre}</b> (${isOrigen ? 'Primer Partido' : 'Parada ' + (index + 1)})`)
            .addTo(marcadores); 
        } else {
            console.warn(`Coordenadas no encontradas para la ciudad: ${ciudadNombre}`);
            console.error(`ERROR DE COORDENADAS: La ciudad "${ciudadNombre}" no tiene coordenadas definidas.`);
        }
    });
    console.log("Coordenadas finales para dibujar:", rutaCoordenadas);

    if (rutaCoordenadas.length > 1) {
        capaRuta = L.polyline(rutaCoordenadas, {
            color: '#D81B60',
            weight: 5,
            opacity: 0.9,
            dashArray: '10, 10'
        }).addTo(mapa);
        
        mapa.fitBounds(capaRuta.getBounds(), { padding: [50, 50] });
    }
    
    document.getElementById(mapaContainerIdString).scrollIntoView({ behavior: 'smooth' });
}

selector.addEventListener('change', obtenerRutaPartidos);

async function llenarSelectorDinamico() {
    const selector = document.getElementById('equipo-selector');
    selector.innerHTML = '<option selected disabled value="">--- Elige un equipo ---</option>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/mundial/equipos`);
        const equipos = await response.json(); 
        
        equipos.forEach(equipo => {
            const option = document.createElement('option');
            
            const valorSinAcento = equipo.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
            
            option.value = valorSinAcento;
            option.textContent = equipo; 
            selector.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar la lista de equipos:", error);
    }
}

llenarSelectorDinamico();