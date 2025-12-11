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

function initAdminPanel() {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    alert('Tenés que iniciar sesión como administrador.');
    window.location.href = './login.html';
    return;
  }

  const user = JSON.parse(userJson);
  if (user.rol !== 'admin') {
    alert('Esta sección es solo para administradores.');
    window.location.href = './usuario.html';
    return;
  }

  const sideMenu = document.getElementById('admin-entities');
  const newBtn = document.getElementById('btn-admin-new');

  sideMenu.innerHTML = '';

  Object.entries(ADMIN_ENTITIES).forEach(([key, entity]) => {
    const li = document.createElement('li');
    li.className = 'list-group-item admin-entity-item';
    li.dataset.entity = key;
    li.textContent = entity.label;
    sideMenu.appendChild(li);
  });

  const items = sideMenu.querySelectorAll('.admin-entity-item');

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const entityKey = item.dataset.entity;
      const entity = ADMIN_ENTITIES[entityKey];
      newBtn.onclick = () => openCreateForm(entityKey, token);
      newBtn.disabled = !entity.canCreate;

      loadEntityList(entityKey, token);
    });
  });

  if (items.length > 0) {
    items[0].click();
  }
}

async function loadEntityList(entityKey, token) {
  const entity = ADMIN_ENTITIES[entityKey];
  if (!entity) return;

  const container = document.getElementById('admin-table-container');
  const formContainer = document.getElementById('admin-form-container');

  container.innerHTML = 'Cargando...';
  formContainer.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE_URL}${entity.endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Error ${response.status}`);
    }

    const data = await response.json();
    const rows = Array.isArray(data) ? data : (data.rows || []);

    renderTable(entityKey, entity, rows, token);
  } catch (error) {
    console.error('Error al cargar datos:', error);
    container.innerHTML = '<div class="text-danger">Error al cargar los datos.</div>';
  }
}

function renderTable(entityKey, entity, rows, token) {
  const container = document.getElementById('admin-table-container');

  const visibleFields =
    entity.listFields ||
    entity.fields.filter(f => !f.isPassword && !f.hiddenOnList);

  const hasRows = rows && rows.length > 0;

  const tableHtml = `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          ${visibleFields.map(f => `<th>${f.label}</th>`).join('')}
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${
          !hasRows
            ? `<tr><td colspan="${visibleFields.length + 1}" class="text-center text-muted">No hay registros.</td></tr>`
            : rows.map(row => `
                <tr data-id="${row[entity.idField]}">
                  ${visibleFields
                    .map(f => `<td>${row[f.name] == null ? '' : row[f.name]}</td>`)
                    .join('')}
                  <td class="text-center">
                    ${entity.canEdit   ? '<button type="button" class="btn btn-sm btn-outline-primary btn-admin-edit">Editar</button>' : ''}
                    ${entity.canDelete ? '<button type="button" class="btn btn-sm btn-outline-danger ms-2 btn-admin-delete">Eliminar</button>' : ''}
                  </td>
                </tr>
              `).join('')
        }
      </tbody>
    </table>
  `;

  container.innerHTML = tableHtml;

  if (!hasRows) return;

  if (entity.canEdit) {
    container.querySelectorAll('.btn-admin-edit').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const row = rows[index];
        openEditForm(entityKey, entity, row, token);
      });
    });
  }

  if (entity.canDelete) {
    container.querySelectorAll('.btn-admin-delete').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const row = rows[index];
        deleteRecord(entityKey, entity, row, token);
      });
    });
  }
}

function openCreateForm(entityKey, token) {
  const entity = ENTITIES[entityKey];
  buildForm(entityKey, entity, null, token);
}

function openEditForm(entityKey, entity, row, token) {
  buildForm(entityKey, entity, row, token);
}

function buildForm(entityKey, entity, row, token) {
  const formContainer = document.getElementById('admin-form-container');

  const isEdit = !!row;
  const fieldsToShow = entity.fields.filter(
    (f) => !(f.onlyOnCreate && isEdit)
  );

  let html = `<div class="card">
    <div class="card-body">
      <h4 class="h6 mb-3">${isEdit ? 'Editar' : 'Crear'} ${entity.label.slice(0, -1)}</h4>
      <form id="admin-form">
  `;

  fieldsToShow.forEach((f) => {
    const value = row ? row[f.name] ?? '' : '';
    const type = f.isPassword ? 'password' : 'text';

    html += `
      <div class="mb-2">
        <label class="form-label">${f.label}${f.required ? ' *' : ''}</label>
        <input
          type="${type}"
          class="form-control form-control-sm"
          name="${f.name}"
          value="${value}"
          ${f.required ? 'required' : ''}
        />
      </div>
    `;
  });

  html += `
        <button type="submit" class="btn btn-primary btn-sm">
          ${isEdit ? 'Guardar cambios' : 'Crear'}
        </button>
        <button type="button" class="btn btn-link btn-sm" id="btn-cancel-form">
          Cancelar
        </button>
      </form>
    </div>
  </div>`;

  formContainer.innerHTML = html;

  const form = document.getElementById('admin-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm(entityKey, entity, row, token, form);
  });

  document.getElementById('btn-cancel-form').onclick = () => {
    formContainer.innerHTML = '';
  };
}