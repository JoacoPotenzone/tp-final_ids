const userJson = localStorage.getItem('user');
const token = localStorage.getItem('token');
const API_URL = 'http://localhost:3001'

if (!userJson || !token) {
  window.location.href = './login.html';
}

const user = JSON.parse(userJson);

function getInitials(nombreCompleto, email) {
  if (nombreCompleto && nombreCompleto.trim().length > 0) {
    const partes = nombreCompleto.trim().split(/\s+/);
    const primera = partes[0][0].toUpperCase();
    const ultima = partes.length > 1 ? partes[partes.length - 1][0].toUpperCase() : '';
    return primera + (ultima || '');
  }

    if (email) {
    const usuarioMail = email.split('@')[0];
    return usuarioMail.slice(0, 2).toUpperCase();
  }

  return 'U';
}

const avatarEl = document.getElementById('user-avatar');
const nameEl = document.getElementById('user-name');
const emailEl = document.getElementById('user-email');

if (nameEl) nameEl.textContent = user.nombre_usuario || 'Usuario';
if (emailEl) emailEl.textContent = user.email || 'usuario@ejemplo.com';

if (avatarEl) {
  avatarEl.textContent = getInitials(user.nombre_usuario, user.email);
}

const inputNombre = document.getElementById('nombre');
const inputEmail = document.getElementById('email');
const inputPais = document.getElementById('pais');

if (inputNombre) inputNombre.value = user.nombre_usuario || '';
if (inputEmail) inputEmail.value = user.email || '';
if (inputPais) inputPais.value = user.nacionalidad || ''; 

const userForm = document.getElementById('user-form');

if (userForm) {
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreActualizado = inputNombre.value.trim();
    const emailActualizado = inputEmail.value.trim();
    const paisActualizado = inputPais.value.trim(); 

    try {
      const res = await fetch(`${API_URL}/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_usuario: nombreActualizado,
          email: emailActualizado,
          nacionalidad: paisActualizado,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'No se pudieron guardar los cambios');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      if (nameEl) nameEl.textContent = data.user.nombre_usuario;
      if (emailEl) emailEl.textContent = data.user.email;
      if (avatarEl) {
        avatarEl.textContent = getInitials(
          data.user.nombre_usuario,
          data.user.email
        );
      }

      alert('Datos actualizados correctamente');
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor');
    }
  });
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = './login.html';
  });
}

const flightsContainer = document.getElementById('flights-container');

async function loadFlights() {
  if (!flightsContainer) return;

  try {
    const res = await fetch(`${API_URL}/api/user/flights`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      flightsContainer.classList.add('alert', 'alert-danger');
      flightsContainer.textContent = data.error || 'Error al cargar los vuelos';
      return;
    }

    if (!data.length) {
      flightsContainer.className = 'flights-list alert alert-info';
      flightsContainer.textContent = 'Todavía no tenés vuelos asociados a tu cuenta.';
      return;
    }

    flightsContainer.className = 'flights-list';
    flightsContainer.innerHTML = '';

    data.forEach(f => {
      const div = document.createElement('div');
      div.className = 'flight-item';

      const fechaLocal = new Date(f.fecha_salida).toLocaleString();

      div.innerHTML = `
        <strong>${f.nombre_aerolinea}</strong> – Asiento ${f.asiento}<br>
        ${f.origen} → ${f.destino}<br>
        ${fechaLocal} · USD ${Number(f.precio).toFixed(2)}
      `;

      flightsContainer.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    flightsContainer.classList.add('alert', 'alert-danger');
    flightsContainer.textContent = 'Error de conexión al cargar los vuelos';
  }
}

loadFlights();

const addFlightBtn = document.getElementById('add-flight-btn');
const flightForm = document.getElementById('flight-form');

if (addFlightBtn && flightForm) {

  addFlightBtn.addEventListener('click', () => {
    flightForm.classList.toggle('d-none');
  });

  
  flightForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(flightForm);

    const body = {
      airline_name:    formData.get('airline_name').trim(),
      airline_code:    formData.get('airline_code').trim().toUpperCase(),
      origin_name:     formData.get('origin_name').trim(),
      origin_city:     formData.get('origin_city').trim(),
      origin_country:  formData.get('origin_country').trim(),
      origin_code:     formData.get('origin_code').trim().toUpperCase(),
      dest_name:       formData.get('dest_name').trim(),
      dest_city:       formData.get('dest_city').trim(),
      dest_country:    formData.get('dest_country').trim(),
      dest_code:       formData.get('dest_code').trim().toUpperCase(),
      departure:       formData.get('departure'),
      seat:            formData.get('seat').trim(),
      price:           Number(formData.get('price')),
      capacity:        180  
    };

    if (!body.airline_name || !body.airline_code || !body.origin_name || !body.dest_name || !body.departure || !body.seat || !body.price) {
      alert('Completá los campos obligatorios');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/flights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'No se pudo guardar el vuelo');
        return;
      }

      alert('Vuelo guardado correctamente');

      flightForm.reset();
      flightForm.classList.add('d-none');

      loadFlights();
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar el vuelo');
    }
  });
}

