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