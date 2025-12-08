let mapa = null;
let capaRuta = null;
let marcadores = L.featureGroup();

const equiposData = {
    "Argentina": {
        descripcion: "Viaja a Dallas, luego a Nueva York para la fase de grupos. ¡El camino a la final es en Los Ángeles!",
        paradas: ["Dallas, TX", "New York, NY", "Los Angeles, CA"]
    },
    "Brasil": {
        descripcion: "Su camino comienza en Toronto, sigue en Miami y luego a Seattle. Reserva tus vuelos con anticipación.",
        paradas: ["Toronto, Canada", "Miami, FL", "Seattle, WA"]
    },
    "México": {
        descripcion: "Juega en Ciudad de México y Monterrey, con un posible cruce en Vancouver.",
        paradas: ["Ciudad de México", "Guadalajara, México", "Vancouver, Canada"]
    },
};

const sedesCoordenadas = {
    "Dallas, TX": [32.7767, -96.7970],
    "New York, NY": [40.7128, -74.0060],
    "Los Angeles, CA": [34.0522, -118.2437],
    "Toronto, Canada": [43.6532, -79.3832],
    "Miami, FL": [25.7617, -80.1918],
    "Seattle, WA": [47.6062, -122.3321],
    "Ciudad de México": [19.4326, -99.1332],
    "Vancouver, Canada": [49.2827, -123.1207],
    "Guadalajara, México": [20.6597, -103.3496]
};

const selector = document.getElementById('equipo-selector');
const rutaInfo = document.getElementById('ruta-info');
const tabMundial = document.getElementById('pills-mundial-tab');


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


function llenarSelector() {
    const equiposOrdenados = Object.keys(equiposData).sort();

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "--- Elige tu equipo ---";
    selector.appendChild(defaultOption);

    equiposOrdenados.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo;
        option.textContent = equipo;
        selector.appendChild(option);
    });
}

function mostrarRuta() {
    const equipoSeleccionado = selector.value;
    rutaInfo.innerHTML = ""; 

    if (equipoSeleccionado === "") {
        rutaInfo.textContent = "Selecciona un equipo para ver la mejor ruta para alentarlos.";
        rutaInfo.classList.remove('active');
    } else {
        const data = equiposData[equipoSeleccionado];
        rutaInfo.innerHTML = `
            <h3>🌟 Ruta Recomendada para ${equipoSeleccionado} 🌟</h3>
            <p>${data.descripcion}</p>
            <button onclick="verRutaEnMapa('${equipoSeleccionado}')">Vea la mejor ruta aquí</button>
        `;
        rutaInfo.classList.add('active');
    }
}

function verRutaEnMapa(equipo) {
    const data = equiposData[equipo];
    const paradasNombres = data.paradas;
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
            .bindPopup(`<b>${ciudadNombre}</b> (${isOrigen ? 'Inicio' : 'Parada ' + index})`)
            .addTo(marcadores); 
        }
    });

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

llenarSelector();
selector.addEventListener('change', mostrarRuta);