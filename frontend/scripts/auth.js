const API_URL = 'http://localhost:3001';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginError) loginError.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (loginError) {
          loginError.textContent = data.error || 'Error al iniciar sesión';
        }
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = '../pages/usuario.html';
    } catch (err) {
      console.error(err);
      if (loginError) loginError.textContent = 'Error de conexión con el servidor';
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (registerError) registerError.textContent = '';

    const nombre_usuario = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const termsChecked = document.getElementById('termsCheck').checked;

    if (!termsChecked) {
      if (registerError) {
        registerError.textContent = 'Tenés que aceptar los términos y condiciones';
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (registerError) {
          registerError.textContent = data.error || 'Error al registrarse';
        }
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = '../pages/usuario.html';
    } catch (err) {
      console.error(err);
      if (registerError) registerError.textContent = 'Error de conexión con el servidor';
    }
  });
}