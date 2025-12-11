const API_BASE_URL = 'http://localhost:3001';

const ENTITIES = {
  usuarios: {
    label: 'Usuarios',
    endpoint: '/api/admin/usuarios',
    idField: 'id_usuario',
    canCreate: true,        
    fields: [
      { name: 'id_usuario', label: 'ID', isPk: true, readOnly: true },
      { name: 'nombre_usuario', label: 'Nombre de usuario', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'nacionalidad', label: 'Nacionalidad' },
      { name: 'rol', label: 'Rol (admin / cliente)', required: true }
    ]
  },

  aerolinea: {
    label: 'Aerolíneas',
    endpoint: '/api/admin/aerolinea',
    idField: 'id_aerolinea',
    canCreate: true,
    fields: [
      { name: 'id_aerolinea', label: 'ID', isPk: true, readOnly: true },
      { name: 'nombre_aerolinea', label: 'Nombre aerolínea', required: true },
      { name: 'codigo_iata', label: 'Código IATA', required: true }
    ]
  },

  aeropuertos: {
    label: 'Aeropuertos',
    endpoint: '/api/admin/aeropuertos',
    idField: 'id_aeropuerto',
    canCreate: true,
    fields: [
      { name: 'id_aeropuerto', label: 'ID', isPk: true, readOnly: true },
      { name: 'nombre_aeropuerto', label: 'Nombre aeropuerto', required: true },
      { name: 'ciudad', label: 'Ciudad', required: true },
      { name: 'pais', label: 'País', required: true },
      { name: 'codigo_iata', label: 'Código IATA', required: true }
    ]
  },

  vuelos: {
    label: 'Vuelos',
    endpoint: '/api/admin/vuelos',
    idField: 'id_vuelo',
    canCreate: true,
    fields: [
      { name: 'id_vuelo', label: 'ID', isPk: true, readOnly: true },
      { name: 'id_aerolinea', label: 'ID aerolínea', required: true },
      { name: 'id_aeropuerto_origen', label: 'ID aeropuerto origen', required: true },
      { name: 'id_aeropuerto_destino', label: 'ID aeropuerto destino', required: true },
      { name: 'fecha_salida', label: 'Fecha/hora salida (ISO)', required: true },
      { name: 'fecha_llegada', label: 'Fecha/hora llegada (ISO)', required: true },
      { name: 'capacidad', label: 'Capacidad', required: true },
      { name: 'precio', label: 'Precio', required: true }
    ]
  },

  reservas: {
    label: 'Reservas',
    endpoint: '/api/admin/reservas',
    idField: 'id_reserva',
    canCreate: false, 
    fields: [
      { name: 'id_reserva', label: 'ID', isPk: true, readOnly: true },
      { name: 'id_usuario', label: 'ID usuario', required: true },
      { name: 'id_vuelo', label: 'ID vuelo', required: true },
      { name: 'asiento', label: 'Asiento', required: true },
      { name: 'fecha_reserva', label: 'Fecha reserva', readOnly: true }
    ]
  },

   partidos_mundial: {
    label: 'Partidos del Mundial',
    endpoint: '/api/admin/partidos_mundial',
    idField: 'id_partido',
    canCreate: true,
    fields: [
      { name: 'id_partido', label: 'ID', isPk: true, readOnly: true },
      { name: 'equipo_nombre', label: 'Equipo', required: true },
      { name: 'id_estadio', label: 'ID estadio', required: true },
      { name: 'fecha_partido', label: 'Fecha del partido', required: true }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    alert('Tenés que iniciar sesión como admin.');
    window.location.href = './login.html';
    return;
  }

  const user = JSON.parse(userJson);
  if (user.rol !== 'admin') {
    alert('Esta página es solo para administradores.');
    window.location.href = '../index.html';
    return;
  }

  initAdminPanel(token);
});

function initAdminPanel(token) {
  const menu = document.getElementById('entity-menu');
  const items = menu.querySelectorAll('[data-entity]');
  const newBtn = document.getElementById('btn-new-record');

  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const entityKey = item.dataset.entity;
      const entity = ADMIN_ENTITIES[entityKey];

      document.getElementById('entity-title').textContent = entity.label;
      loadEntityList(entityKey, token);

      newBtn.onclick = () => openCreateForm(entityKey, token);
      newBtn.disabled = !entity.canCreate;
    });
  });

  if (items.length > 0) {
    items[0].click();
  }
}