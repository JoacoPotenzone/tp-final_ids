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

        `;
        rutaInfo.classList.add('active');
    }
}

llenarSelector();
selector.addEventListener('change', mostrarRuta);