
function getSession() {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) return null;

  try {
    const user = JSON.parse(userJson);
    return { token, user };
  } catch (e) {
    console.error('Error obteniendo user de localStorage', e);
    return null;
  }
}

function requireSession() {
  const session = getSession();
  if (!session) {
    window.location.href = 'frontend/pages/login.html';
    return null;
  }
  return session;
}

window.getSession = getSession;
window.requireSession = requireSession;