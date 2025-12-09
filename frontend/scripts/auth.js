const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.textContent = '';

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          loginError.textContent = data.error || 'Error al iniciar sesión';
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        window.location.href = './usuario.html';
      } catch (err) {
        console.error(err);
        loginError.textContent = 'Error de conexión con el servidor';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      registerError.textContent = '';

      const nombre_usuario = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const termsChecked = document.getElementById('termsCheck').checked;

      if (!termsChecked) {
        registerError.textContent = 'Tenés que aceptar los términos y condiciones';
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
          registerError.textContent = data.error || 'Error al registrarse';
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        window.location.href = './usuario.html';
      } catch (err) {
        console.error(err);
        registerError.textContent = 'Error de conexión con el servidor';
      }
    });
  }
});