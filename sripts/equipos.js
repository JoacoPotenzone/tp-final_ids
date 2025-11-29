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
    "Dallas, TX": { x: 450, y: 380 },
    "New York, NY": { x: 700, y: 250 },
    "Los Angeles, CA": { x: 250, y: 350 },
    "Toronto, Canada": { x: 650, y: 150 },
    "Miami, FL": { x: 600, y: 550 },
    "Seattle, WA": { x: 300, y: 100 },
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
            <div id="mapa-interactivo-container"></div>
        `;
        rutaInfo.classList.add('active');
    }
}

llenarSelector();
selector.addEventListener('change', mostrarRuta);


function verRutaEnMapa(equipo) {
    const data = equiposData[equipo];
    const paradas = data.paradas;
    const mapaContainer = document.getElementById('mapa-interactivo-container');
    
    const baseUrl = "https://www.google.com/maps/dir/";
    const mapQuery = paradas.join('/');
    
    const fullMapsUrl = `${baseUrl}${mapQuery}`;
    const embedUrl = `https://maps.google.com/maps?q=${paradas.join('+to+')}&output=embed`;

    mapaContainer.innerHTML = `
        <div class="mapa-titulo">📍 Trayecto de ${equipo} en el Mundial</div>
        <iframe
            width="100%" 
            height="450" 
            frameborder="0" 
            style="border:0; margin-top: 15px;"
            src="${embedUrl}" 
            allowfullscreen>
        </iframe>
        <a href="${fullMapsUrl}" target="_blank" class="mapa-link">
            Abrir ruta detallada en Google Maps (Nueva Pestaña)
        </a>
    `;
    
    mapaContainer.scrollIntoView({ behavior: 'smooth' });
}

