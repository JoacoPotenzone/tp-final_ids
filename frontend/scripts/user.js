const userJson = localStorage.getItem('user');
const token = localStorage.getItem('token');

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
if (inputPais) inputPais.value = user.pais || ''; 

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = './login.html';
  });
}