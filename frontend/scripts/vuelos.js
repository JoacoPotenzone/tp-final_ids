const API_BASE_URL = 'http://localhost:3001';

const searchParams = new URLSearchParams(window.location.search);
const fechaBusqueda = searchParams.get("fecha");

function obtenerUsuarioActual() {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('Error al parsear el usuario guardado:', e);
    return null;
  }
}

function obtenerTokenActual() {
  return localStorage.getItem("token");
}

document.addEventListener('DOMContentLoaded', () => {
  const token = obtenerTokenActual();
  const user = obtenerUsuarioActual();

  if (!token || !user) {
    console.log('Usuario NO logueado en resultados de vuelos');
  } else {
    console.log('Usuario logueado en vuelos:', user);
  }
});

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
              <h4 class="card-title mb-1">
               <strong>  ${vuelo.aerolinea} </strong>
              </h4>
              <p class="mb-0 text-muted">
                Desde: <strong>${vuelo.origen_ciudad} </strong>
                <strong> Destino: ${vuelo.destino_ciudad}</strong>
              </p>
              <p class="card-text mb-0">
                <i class="bi bi-clock me-1"></i>
                Salida: <strong>${vuelo.salida}</strong> | Llegada: <strong>${vuelo.llegada || 'N/A'}</strong>
              </p>
            </div>
            <div class="flight-price text-end">
              <span class="d-block fs-4 text-primary fw-bold">$${precioNumero.toFixed(2)}</span>
              <button class="btn btn-sm btn-primary mt-1 btn-reservar-vuelo">Reservar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += vueloHTML;
  });

  const botones = container.querySelectorAll('.btn-reservar-vuelo');
  botones.forEach((btn, index) => {
    const vuelo = vuelos[index];
    btn.addEventListener('click', () => reservarVueloDesdeResultados(vuelo));
  });
}

function generarCodigoCiudad(ciudad) {
  if (!ciudad) return 'XXX';
  return ciudad.trim().substring(0, 3).toUpperCase();
}

function construirTimestamp(fecha, hora) {
  return `${fecha} ${hora}:00`;
}

function generarAsientoRandom() {
    const codigoAscii = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
    const letra = String.fromCharCode(codigoAscii);
    const numero = Math.floor(Math.random() * 100);
    const numeroFormateado = String(numero).padStart(2, '0');
    return letra + numeroFormateado;
}

async function reservarVueloDesdeResultados(vuelo) {
  const token = obtenerTokenActual();
  const currentUser = obtenerUsuarioActual();
  if (!token || !currentUser) {
      const irLogin = confirm(
          'Tenés que iniciar sesión para reservar un vuelo. ¿Querés ir al login ahora?'
      );
      if (irLogin) {
          window.location.href = './pages/login.html'; 
      }
      return;
  }
  if (vuelo.numero) { 
      const asientoGenerado = generarAsientoRandom();
      
      const simpleBody = {
          id_vuelo: vuelo.numero,
          asiento: asientoGenerado,
      };
      try {
          const response = await fetch(`${API_BASE_URL}/api/reservas`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(simpleBody),
          });
          if (response.ok) {
              alert('Vuelo reservado correctamente. Lo vas a ver en la sección "Mis vuelos" de tu perfil.');
              return;
          }
      } catch (err) {
          console.error('Error de red al intentar reserva simple:', err);
      }
  }
  const horaSalida = vuelo.salida;
  const horaLlegada =
  
  vuelo.llegada && vuelo.llegada !== 'N/A' ? vuelo.llegada : vuelo.salida;
  const departure = construirTimestamp(fechaBusqueda, horaSalida);
  const arrival   = construirTimestamp(fechaBusqueda, horaLlegada);
  const body = {
      airline_name: vuelo.aerolinea,
      airline_code: (vuelo.aerolinea || "GEN").substring(0, 3).toUpperCase(),
      origin_name:  vuelo.origen_ciudad,
      origin_city:  vuelo.origen_ciudad,
      origin_country: "Desconocido",
      origin_code: (vuelo.origen_ciudad || "ORI").substring(0, 3).toUpperCase(),
      dest_name:    vuelo.destino_ciudad,
      dest_city:    vuelo.destino_ciudad,
      dest_country: "Desconocido",
      dest_code: (vuelo.destino_ciudad || "DES").substring(0, 3).toUpperCase(),
      departure,
      arrival,
      seat: generarAsientoRandom(),
      price: Number(vuelo.precio),
  };
  try {
      const response = await fetch(`${API_BASE_URL}/api/user/flights`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
      });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error al reservar vuelo (ruta compleja)', errorData);
          alert(errorData.error || 'No se pudo registrar el vuelo');
          return;
      }
      alert('Vuelo reservado correctamente. Lo vas a ver en la sección "Mis vuelos" de tu perfil.');
  } catch (err) {
      console.error('Error de red al reservar vuelo (ruta compleja)', err);
      alert('Error de conexión al intentar reservar el vuelo');
  }
}

async function buscarVuelosDesdeBackend(origen, destino, fecha) {
  const listaVuelosContainer = document.getElementById('lista-vuelos');
  listaVuelosContainer.innerHTML = 'Cargando opciones de vuelo...';

  const params = new URLSearchParams({
    origen,
    destino,
    fecha,
  }).toString();

  try {
    const response = await fetch(`${API_BASE_URL}/api/vuelos?${params}`);

    if (!response.ok) {
      const errorData = await response.json();
      listaVuelosContainer.innerHTML =
        `<div class="col-12"><div class="alert alert-danger text-center" role="alert">
          Error al buscar vuelos: ${errorData.error}
         </div></div>`;
      return;
    }

    const vuelos = await response.json();

    if (vuelos.length === 0) {
      listaVuelosContainer.innerHTML =
        `<div class="col-12"><div class="alert alert-info text-center" role="alert">
          No se encontraron vuelos para esta búsqueda.
         </div></div>`;
    } else {
      mostrarVuelosSimulados(vuelos);
    }
  } catch (error) {
    console.error('Error en la comunicación con el backend:', error);
    listaVuelosContainer.innerHTML =
      `<div class="col-12"><div class="alert alert-danger text-center" role="alert">
        Error de conexión: verificá que tu servidor Node.js esté funcionando en ${API_BASE_URL}.
       </div></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const origen = params.get('origen');
  const destino = params.get('destino');
  const fecha = params.get('fecha');
  const pasajeros = params.get('pasajeros');

  const resumenBusqueda = document.getElementById('resumen-busqueda');
  if (resumenBusqueda) {
    resumenBusqueda.textContent =
      `De: ${origen} | A: ${destino} | Fecha: ${fecha} | Pasajeros: ${pasajeros}`;
  }

  if (origen && destino && fecha) {
    buscarVuelosDesdeBackend(origen, destino, fecha);
  }
});

