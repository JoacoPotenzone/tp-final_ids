let mapa = null;
let capaRuta = null;

const equiposData = {
    "Argentina": {
        descripcion: "Viaja a Dallas, luego a Nueva York para la fase de grupos. ¡El camino a la final es en Los Ángeles!",
        paradas: ["Dallas, TX", "New York, NY", "Los Angeles, CA"]
    },
    "Brasil": {
        descripcion: "Su camino comienza en Toronto, sigue en Miami y luego a Seattle. Reserva tus vuelos con anticipación.",
        paradas: ["Toronto, Canada", "Miami, FL", "Seattle, WA"]
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
            <div id="mapa-leaflet-container"></div>
        `;
        rutaInfo.classList.add('active');
    }
}

llenarSelector();
selector.addEventListener('change', mostrarRuta);


function verRutaEnMapa(equipo) {
    const data = equiposData[equipo];
    const paradasNombres = data.paradas;
    const mapaContainerId = 'mapa-leaflet-container'
    
    if (mapa == null){
        mapa = L.map(mapaContainerId).setView([40, -100], 3);
        L.tileLayer('http://googleusercontent.com/tile.openstreetmap.org/1{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);
    } else {
        mapa.invalidateSize();
    }; 
    
}

