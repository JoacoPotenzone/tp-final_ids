const equiposData = {
    "Argentina": "Viaja a Dallas, luego a Nueva York para la fase de grupos. ¡El camino a la final es en Los Ángeles!",
    "Brasil": "Su camino comienza en Toronto, sigue en Miami y luego a Seattle. Reserva tus vuelos con anticipación.",
    "Canadá": "Como anfitrión, su ruta es local: Vancouver, Toronto y un viaje corto a Ciudad de México.",
    "Estados Unidos": "Arranca en Los Ángeles, juega en Atlanta y cierra la fase de grupos en Filadelfia. ¡La ruta más accesible!",
    "Francia": "La fase inicial es en Boston, luego Houston y termina en Guadalajara. ¡Será una ruta larga!",
    "México": "Juega en Ciudad de México, Monterrey y luego un partido clave en Houston. ¡El Azteca te espera!",
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
        const ruta = equiposData[equipoSeleccionado];
        rutaInfo.innerHTML = `
            <h3>🌟 Ruta Recomendada para ${equipoSeleccionado} 🌟</h3>
            <p>${ruta}</p>
            <button>Vea la mejor ruta aquí</button>

        `;
        rutaInfo.classList.add('active');
    }
}

llenarSelector();
selector.addEventListener('change', mostrarRuta);