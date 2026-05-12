const STORAGE_KEY = 'passwordManagerEntries';
const isElectron = typeof window.api?.readEntries === 'function';

const state = {
  entries: [],
  showPassword: false,
  darkMode: false,
};

const els = {
  length: document.getElementById('length'),
  uppercase: document.getElementById('uppercase'),
  lowercase: document.getElementById('lowercase'),
  numbers: document.getElementById('numbers'),
  symbols: document.getElementById('symbols'),
  generateBtn: document.getElementById('generateBtn'),
  generatedPassword: document.getElementById('generatedPassword'),
  copyGeneratedBtn: document.getElementById('copyGeneratedBtn'),
  fillGeneratedBtn: document.getElementById('fillGeneratedBtn'),
  saveForm: document.getElementById('saveForm'),
  entryName: document.getElementById('entryName'),
  entryUser: document.getElementById('entryUser'),
  entryPassword: document.getElementById('entryPassword'),
  togglePasswordVisibility: document.getElementById('togglePasswordVisibility'),
  entriesList: document.getElementById('entriesList'),
  searchInput: document.getElementById('searchInput'),
  themeToggle: document.getElementById('themeToggle'),
};

const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>/?',
};

async function loadEntries() {
  try {
    if (isElectron) {
      state.entries = await window.api.readEntries();
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    state.entries = saved ? JSON.parse(saved) : [];
  } catch (error) {
    state.entries = [];
  }
}

async function saveEntries() {
  if (isElectron) {
    await window.api.writeEntries(state.entries);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function generatePassword() {
  const length = Number(els.length.value);
  const options = [];

  if (els.uppercase.checked) options.push(charSets.uppercase);
  if (els.lowercase.checked) options.push(charSets.lowercase);
  if (els.numbers.checked) options.push(charSets.numbers);
  if (els.symbols.checked) options.push(charSets.symbols);

  if (!options.length) {
    alert('Selecciona al menos un tipo de carácter para la contraseña.');
    return '';
  }

  let password = '';
  const allChars = options.join('');
  for (let i = 0; i < length; i += 1) {
    password += allChars[randomInt(allChars.length)];
  }

  return password;
}

function renderEntries() {
  const query = els.searchInput.value.trim().toLowerCase();
  const filtered = state.entries.filter((entry) => {
    const text = `${entry.name} ${entry.user}`.toLowerCase();
    return text.includes(query);
  });

  if (!filtered.length) {
    els.entriesList.innerHTML = `<div class="empty-state">No hay entradas guardadas. Utiliza el formulario para añadir una nueva contraseña segura.</div>`;
    return;
  }

  els.entriesList.innerHTML = filtered
    .map((entry) => {
      return `
        <article class="entry-card">
          <div class="entry-row">
            <div class="entry-meta">
              <h3>${escapeHtml(entry.name)}</h3>
              <div class="tag">${escapeHtml(entry.user || 'Sin usuario')}</div>
            </div>
            <div class="entry-actions">
              <button class="btn-secondary" data-action="copy" data-id="${entry.id}">Copiar</button>
              <button class="btn-secondary" data-action="toggle" data-id="${entry.id}">Mostrar</button>
              <button class="btn-secondary" data-action="delete" data-id="${entry.id}">Eliminar</button>
            </div>
          </div>
          <p style="margin: 14px 0 0; color: #64748b; word-break: break-word;">${maskPassword(entry)}</p>
        </article>
      `;
    })
    .join('');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function maskPassword(entry) {
  if (entry.visible) {
    return `<strong style="color: #0f172a;">${escapeHtml(entry.password)}</strong>`;
  }
  return entry.password.replace(/./g, '•');
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert('Contraseña copiada al portapapeles.');
    })
    .catch(() => {
      prompt('Copia la contraseña manualmente:', text);
    });
}

function toggleVisibility(entryId) {
  const entry = state.entries.find((item) => item.id === entryId);
  if (entry) {
    entry.visible = !entry.visible;
    renderEntries();
  }
}

function deleteEntry(entryId) {
  if (!confirm('¿Eliminar esta entrada de forma permanente?')) return;
  state.entries = state.entries.filter((item) => item.id !== entryId);
  saveEntries();
  renderEntries();
}

function handleEntryAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  const entry = state.entries.find((item) => item.id === id);

  if (!entry) return;

  if (action === 'copy') {
    copyToClipboard(entry.password);
  }
  if (action === 'toggle') {
    toggleVisibility(id);
  }
  if (action === 'delete') {
    deleteEntry(id);
  }
}

function applyTheme() {
  if (state.darkMode) {
    document.documentElement.classList.add('dark');
    els.themeToggle.textContent = 'Modo claro';
  } else {
    document.documentElement.classList.remove('dark');
    els.themeToggle.textContent = 'Modo oscuro';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('passwordManagerTheme');
  state.darkMode = savedTheme === 'dark';
  applyTheme();
}

function saveTheme() {
  localStorage.setItem('passwordManagerTheme', state.darkMode ? 'dark' : 'light');
}

function initEventListeners() {
  els.generateBtn.addEventListener('click', () => {
    const password = generatePassword();
    if (password) {
      els.generatedPassword.value = password;
    }
  });

  els.copyGeneratedBtn.addEventListener('click', () => {
    const text = els.generatedPassword.value.trim();
    if (!text) {
      alert('Genera una contraseña antes de copiarla.');
      return;
    }
    copyToClipboard(text);
  });

  els.fillGeneratedBtn.addEventListener('click', () => {
    if (els.generatedPassword.value) {
      els.entryPassword.value = els.generatedPassword.value;
      els.entryPassword.focus();
    }
  });

  els.saveForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = els.entryName.value.trim();
    const user = els.entryUser.value.trim();
    const password = els.entryPassword.value.trim();

    if (!name || !password) {
      alert('Completa el nombre y la contraseña antes de guardar.');
      return;
    }

    state.entries.unshift({
      id: crypto.randomUUID(),
      name,
      user,
      password,
      visible: false,
      createdAt: Date.now(),
    });

    await saveEntries();
    renderEntries();
    els.saveForm.reset();
  });

  els.togglePasswordVisibility.addEventListener('click', () => {
    state.showPassword = !state.showPassword;
    els.entryPassword.type = state.showPassword ? 'text' : 'password';
    els.togglePasswordVisibility.textContent = state.showPassword ? '🙈' : '👁';
  });

  els.searchInput.addEventListener('input', renderEntries);
  els.entriesList.addEventListener('click', handleEntryAction);
  els.themeToggle.addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    applyTheme();
    saveTheme();
  });
}

async function init() {
  await loadEntries();
  initTheme();
  initEventListeners();
  renderEntries();
}

init();
