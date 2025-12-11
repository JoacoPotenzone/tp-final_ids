const API_BASE_URL = 'http://localhost:3001';

const ENTITIES = {
  usuarios: {
    label: 'Usuarios',
    endpoint: '/api/admin/usuarios',
    idField: 'id_usuario',
    canCreate: true,        
    fields: [
      { name: 'id_usuario', label: 'ID', isPk: true, readOnly: true, hiddenOnList: true },
      { name: 'nombre_usuario', label: 'Nombre de usuario', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'nacionalidad', label: 'Nacionalidad' },
      { name: 'rol', label: 'Rol (admin / cliente)', required: true },
      { name: 'password',label: 'Contraseña',required: true,isPassword: true,onlyOnCreate: true}
    ]
  },

  aerolinea: {
    label: 'Aerolíneas',
    endpoint: '/api/admin/aerolineas',
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

function initAdminPanel(token) {
  const select = document.getElementById('tabla-select');
  const newBtn = document.getElementById('btn-nuevo-registro');
  const tablaTitulo = document.getElementById('tabla-titulo');
  const tabla = document.getElementById('tabla-admin');
  const formContainer = document.getElementById('form-container');
  const cancelBtn = document.getElementById('btn-cancelar-form');

  if (!select || !newBtn || !tabla || !formContainer) {
    console.error('No se encontraron elementos del DOM para el panel de administración.');
    return;
  }

  const thead = tabla.querySelector('thead');
  const tbody = tabla.querySelector('tbody');

  select.innerHTML = '';
  Object.entries(ENTITIES).forEach(([key, entity]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = entity.label;
    select.appendChild(opt);
  });

  const actualizarEntidadActual = () => {
    const entityKey = select.value;
    const entity = ENTITIES[entityKey];
    if (!entity) return;

    if (tablaTitulo) {
      tablaTitulo.textContent = `Datos de ${entity.label}`;
    }

    newBtn.disabled = !entity.canCreate;
    loadEntityList(entityKey, token);
  };

  select.addEventListener('change', actualizarEntidadActual);

  newBtn.addEventListener('click', () => {
    const entityKey = select.value;
    if (!entityKey) return;
    openCreateForm(entityKey, token);
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      formContainer.classList.add('d-none');
    });
  }


  if (select.options.length > 0) {
    select.selectedIndex = 0;
    actualizarEntidadActual();
  } else {
    if (thead) thead.innerHTML = '';
    if (tbody) tbody.innerHTML = '';
  }
}


async function loadEntityList(entityKey, token) {
  const entity = ENTITIES[entityKey];
  if (!entity) return;

  const tabla = document.getElementById('tabla-admin');
  const formContainer = document.getElementById('form-container');
  if (!tabla) return;

  const thead = tabla.querySelector('thead');
  const tbody = tabla.querySelector('tbody');

  if (formContainer) {
    formContainer.classList.add('d-none'); // ocultar el formulario mientras se lista
  }

  const visibleFields =
    entity.listFields ||
    entity.fields.filter(f => !f.isPassword && !f.hiddenOnList);

  const colCount = visibleFields.length + 1; // +1 por la columna de Acciones

  if (thead) thead.innerHTML = '';
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${colCount}" class="text-center">Cargando...</td>
      </tr>
    `;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${entity.endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${colCount}" class="text-center text-danger">
            Error al cargar los datos.
          </td>
        </tr>
      `;
    }
  }
}

function renderTable(entityKey, entity, rows, token) {
  const tabla = document.getElementById('tabla-admin');
  if (!tabla) return;

  const thead = tabla.querySelector('thead');
  const tbody = tabla.querySelector('tbody');

  const visibleFields =
    entity.listFields ||
    entity.fields.filter(f => !f.isPassword && !f.hiddenOnList);

  if (thead) {
    thead.innerHTML = `
      <tr>
        ${visibleFields.map(f => `<th>${f.label}</th>`).join('')}
        <th class="text-center">Acciones</th>
      </tr>
    `;
  }

  if (!tbody) return;

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${visibleFields.length + 1}" class="text-center text-muted">
          No hay registros.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows
    .map((row, index) => `
      <tr data-index="${index}">
        ${visibleFields.map(f => `<td>${row[f.name] ?? ''}</td>`).join('')}
        <td class="text-center">
          <button type="button" class="btn btn-sm btn-outline-primary btn-admin-edit">
            Editar
          </button>
          ${entity.canDelete === false ? '' : `
          <button type="button" class="btn btn-sm btn-outline-danger ms-1 btn-admin-delete">
            Eliminar
          </button>`}
        </td>
      </tr>
    `)
    .join('');

  tbody.querySelectorAll('.btn-admin-edit').forEach((btn) => {
    const tr = btn.closest('tr');
    const index = tr ? parseInt(tr.dataset.index, 10) : -1;
    if (index < 0) return;
    btn.addEventListener('click', () => {
      const row = rows[index];
      openEditForm(entityKey, ENTITIES[entityKey], row, token);
    });
  });

  if (entity.canDelete !== false) {
    tbody.querySelectorAll('.btn-admin-delete').forEach((btn) => {
      const tr = btn.closest('tr');
      const index = tr ? parseInt(tr.dataset.index, 10) : -1;
      if (index < 0) return;
      btn.addEventListener('click', () => {
        const row = rows[index];
        deleteRecord(entityKey, ENTITIES[entityKey], row, token);
      });
    });
  }
}

function openCreateForm(entityKey, token) {
  const entity = ENTITIES[entityKey];
  buildForm(entityKey, entity, null, token, 'create');
}

function openEditForm(entityKey, entity, row, token) {
  buildForm(entityKey, entity, row, token, 'edit');
}

function buildForm(entityKey, entity, data, token, mode) {
  const formContainer = document.getElementById('form-container');
  const formTitle = document.getElementById('form-titulo');
  const form = document.getElementById('admin-form');
  const fieldsWrapper = document.getElementById('admin-form-fields');
  const cancelBtn = document.getElementById('btn-cancelar-form');

  if (!formContainer || !form || !fieldsWrapper) return;

  const isEdit = mode === 'edit';
  const singular = entity.label.replace(/s$/, '');
  formTitle.textContent = isEdit ? `Editar ${singular}` : `Nuevo ${singular}`;

  formContainer.classList.remove('d-none');
  formContainer.scrollIntoView({
    behavior: 'smooth',
    block: 'start' 
  });
  fieldsWrapper.innerHTML = '';

  const fieldsToShow = entity.fields.filter(field => {
    if (field.onlyOnCreate && isEdit) return false;
    if (field.hideOnForm) return false;
    return true;
  });

  fieldsToShow.forEach(field => {
    const value = data ? (data[field.name] ?? '') : '';

    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-6';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.setAttribute('for', `field-${field.name}`);
    label.textContent = field.label;

    let input;
    let fieldType = field.type || 'text';
    if (field.isPassword && !field.type) {
      fieldType = 'text'; 
    }

    if (fieldType === 'textarea') {
      input = document.createElement('textarea');
      input.rows = field.rows || 3;
      input.className = 'form-control';
      input.value = value;
    } else if (fieldType === 'select' && Array.isArray(field.options)) {
      input = document.createElement('select');
      input.className = 'form-select';
      field.options.forEach(optDef => {
        const opt = document.createElement('option');
        if (typeof optDef === 'object') {
          opt.value = optDef.value;
          opt.textContent = optDef.label;
        } else {
          opt.value = optDef;
          opt.textContent = optDef;
        }
        if (String(opt.value) === String(value)) {
          opt.selected = true;
        }
        input.appendChild(opt);
      });
    } else {
      input = document.createElement('input');
      input.type = fieldType;
      input.className = 'form-control';
      input.value = value;
    }

    input.id = `field-${field.name}`;
    input.name = field.name;

    if (field.required) {
      input.required = true;
    }

    if (field.readOnly || (field.isPk && isEdit)) {
      input.readOnly = true;
      input.disabled = true;
    }

    colDiv.appendChild(label);
    colDiv.appendChild(input);
    fieldsWrapper.appendChild(colDiv);
  });

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      formContainer.classList.add('d-none');
    };
  }

  form.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = {};

    fieldsToShow.forEach(field => {
      const raw = formData.get(field.name);
      if (raw === null) return;

      if (field.isPassword && raw === '' && isEdit) {
        return;
      }

      payload[field.name] = raw;
    });

    try {
      const isEditMode = isEdit;
      const method = isEditMode ? 'PUT' : 'POST';
      const idValue = data ? data[entity.idField] : null;

      const url = isEditMode
        ? `${API_BASE_URL}${entity.endpoint}/${idValue}`
        : `${API_BASE_URL}${entity.endpoint}`;

      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || `Error ${resp.status}`);
      }
      
      const action = isEdit ? 'actualizado' : 'agregado';
      const entityLabel = entity.label;
      alert(`¡Éxito! El registro ha sido ${action} correctamente a la tabla ${entityLabel}.`);

      formContainer.classList.add('d-none');
      await loadEntityList(entityKey, token);
    } catch (error) {
      console.error(error);
      alert('No se pudo guardar el registro.');
    }
  };
}

async function deleteRecord(entityKey, entity, row, token) {
  if (!confirm('¿Seguro que querés eliminar este registro?')) return;

  const url = `${API_BASE_URL}${entity.endpoint}/${row[entity.idField]}`;

  try {
    const resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `Error ${resp.status}`);
    }

    await loadEntityList(entityKey, token);
  } catch (error) {
    console.error(error);
    alert('No se pudo eliminar el registro.');
  }
}

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

