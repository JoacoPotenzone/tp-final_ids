const userJson = localStorage.getItem('user');
const token = localStorage.getItem('token');
const API_URL = 'http://localhost:3001'

if (!userJson || !token) {
  window.location.href = 'frontend/pages/login.html';
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

const adminLinkWrapper = document.getElementById('admin-link-wrapper');

if (adminLinkWrapper) {
  if (user.rol === 'admin') {
    adminLinkWrapper.classList.remove('d-none');
  } else {
    adminLinkWrapper.classList.add('d-none');
  }
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
    window.location.href = 'frontend/pages/login.html';
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

        const salidaLocal  = new Date(f.fecha_salida).toLocaleString();
        const llegadaLocal = f.fecha_llegada
        ? new Date(f.fecha_llegada).toLocaleString()
        : '';

        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <strong>${f.nombre_aerolinea}</strong> – Asiento ${f.asiento}<br>
              ${f.origen} → ${f.destino}<br>
              <span class="text-muted small">Reserva #${f.id_reserva}</span>
              <p class="mt-1 small text-muted mb-0">
                Salida: ${salidaLocal}${llegadaLocal ? ` | Llegada: ${llegadaLocal}` : ''}
              </p>
            </div>

            <div class="text-end">
              <p class="mb-1 fw-bold text-success">USD ${Number(f.precio).toFixed(2)}</p>
              <button 
                class="btn btn-sm btn-danger btn-cancelar-vuelo"
                data-id-reserva="${f.id_reserva}"
                data-aerolinea="${f.nombre_aerolinea}"
              >
                Cancelar
              </button>
            </div>
          </div>
        `;
      flightsContainer.appendChild(div);
    });
    flightsContainer.querySelectorAll('.btn-cancelar-vuelo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idReserva = e.currentTarget.dataset.idReserva; 
        const aerolinea = e.currentTarget.dataset.aerolinea;
        confirmarCancelacion(idReserva, aerolinea); 
      });
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
      arrival:         formData.get('arrival'),
      seat:            formData.get('seat').trim(),
      price:           Number(formData.get('price')),
      capacity:        180  
    };

    if (!body.airline_name || !body.airline_code || !body.origin_name || !body.dest_name || !body.departure || !body.arrival || !body.seat || !body.price) {
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

const changePasswordBtn = document.getElementById("btn-change-password");
const deleteAccountBtn = document.getElementById("btn-delete-account");
const changePasswordForm = document.getElementById("change-password-form");
const deleteAccountForm = document.getElementById("delete-account-form");

if (changePasswordBtn && changePasswordForm) {
  changePasswordBtn.addEventListener("click", () => {
    const visible = changePasswordForm.style.display === "block";
    changePasswordForm.style.display = visible ? "none" : "block";
    deleteAccountForm.style.display = "none";
  });
}

if (deleteAccountBtn && deleteAccountForm) {
  deleteAccountBtn.addEventListener("click", () => {
    const visible = deleteAccountForm.style.display === "block";
    deleteAccountForm.style.display = visible ? "none" : "block";
    changePasswordForm.style.display = "none";
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al cambiar la contraseña");
        return;
      }

      alert("Contraseña actualizada correctamente");
      changePasswordForm.reset();
      changePasswordForm.style.display = "none";
    } catch (err) {
      console.error(err);
      alert("Error de red al cambiar la contraseña");
    }
  });
}

if (deleteAccountForm) {
  deleteAccountForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("delete-password").value;

    const seguro = confirm(
      "¿Estás seguro de que querés eliminar tu cuenta? Esta acción es permanente."
    );
    if (!seguro) return;

    try {
      const res = await fetch("http://localhost:3001/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al eliminar la cuenta");
        return;
      }

      alert("Cuenta eliminada correctamente");

      localStorage.removeItem("token");
      window.location.href = "/pages/login.html";
    } catch (err) {
      console.error(err);
      alert("Error de red al eliminar la cuenta");
    }
  });
}

function confirmarCancelacion(idReserva, aerolinea) {
  const isMundial = aerolinea.includes('Fan Flight');
  let mensaje = `¿Estás seguro de que quieres cancelar la reserva #${idReserva} con ${aerolinea}?`;
  if (isMundial) {
    mensaje += "\n\nAVISO: Este es un tramo del Paquete Mundial. Solo se cancelará este tramo específico.";
  }
  const confirmacion = confirm(mensaje);
  if (confirmacion) {
      cancelarReserva(idReserva);
  }
}

async function cancelarReserva(idReserva) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/api/reservas/${idReserva}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.ok) {
        alert(`Reserva #${idReserva} cancelada con éxito.`);
        loadFlights(); 
    } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || `Error al cancelar la reserva #${idReserva}.`);
    }
  } catch (error) {
      console.error('Error de red al cancelar la reserva:', error);
      alert('Error de conexión con el servidor.');
  }
}