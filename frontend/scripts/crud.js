const API_BASE_URL = 'http://localhost:3001';

const userJson = localStorage.getItem('user');
const token = localStorage.getItem('token');

let currentUser = null;

if (!userJson || !token) {
  alert('Tenés que iniciar sesión.');
  window.location.href = './login.html';
} else {
  currentUser = JSON.parse(userJson);
  if (currentUser.rol !== 'admin') {
    alert('No tenés permisos para acceder al panel de administración.');
    window.location.href = './index.html';
  }
}