/**
 * ==============================================================================
 * ECLIPSE STUDIO APP - Core Application Logic
 * Integración con Firebase Realtime Database (Nube en Tiempo Real) & LocalStorage
 * ==============================================================================
 */

// ==================== DEFAULT INITIAL SEED DATA ====================
const DEFAULT_INITIAL_USER = {
  id: 'user_alex_owner',
  username: 'AlexCAC',
  password: 'Campeondlsiglo0',
  name: 'Alex (Owner)',
  role: 'moderator',
  created_at: new Date().toISOString()
};

// ==================== STATE ====================
let db = null;
let useFirebase = false;
let currentUser = null;
let appUsers = [];
let appTasks = [];
let currentModView = 'cards'; // 'cards' | 'kanban' | 'table'
let userActiveTab = 'all'; // 'all' | 'pending' | 'completed'
let currentDetailTaskId = null;

// ==================== DOM ELEMENTS ====================
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const loginErrorText = document.getElementById('login-error-text');
const btnTogglePw = document.getElementById('toggle-password-visibility');
const btnLogout = document.getElementById('btn-logout');

// Nav
const navUserName = document.getElementById('nav-user-name');
const navUserRole = document.getElementById('nav-user-role');
const navUserAvatar = document.getElementById('nav-user-avatar');
const roleBadgeText = document.getElementById('role-badge-text');
const connectionStatus = document.getElementById('connection-status');
const statusLabel = document.getElementById('status-label');

// Views
const moderatorView = document.getElementById('moderator-view');
const userView = document.getElementById('user-view');

// Mod View Elements
const statTotalTasks = document.getElementById('stat-total-tasks');
const statPendingTasks = document.getElementById('stat-pending-tasks');
const statCompletedTasks = document.getElementById('stat-completed-tasks');
const statCompletionRate = document.getElementById('stat-completion-rate');
const statTeamCount = document.getElementById('stat-team-count');

const modTaskSearch = document.getElementById('mod-task-search');
const modFilterUser = document.getElementById('mod-filter-user');
const modFilterStatus = document.getElementById('mod-filter-status');
const modFilterPriority = document.getElementById('mod-filter-priority');
const modTasksContainer = document.getElementById('mod-tasks-container');

const btnViewCards = document.getElementById('btn-view-cards');
const btnViewKanban = document.getElementById('btn-view-kanban');
const btnViewTable = document.getElementById('btn-view-table');

// Modals
const taskModal = document.getElementById('task-modal');
const taskModalTitle = document.getElementById('task-modal-title');
const taskForm = document.getElementById('task-form');
const taskFormId = document.getElementById('task-form-id');
const taskFormTitle = document.getElementById('task-form-title');
const taskFormAssigned = document.getElementById('task-form-assigned');
const taskFormPriority = document.getElementById('task-form-priority');
const taskFormCategory = document.getElementById('task-form-category');
const taskFormDueDate = document.getElementById('task-form-duedate');
const taskFormDesc = document.getElementById('task-form-desc');

const btnOpenNewTaskModal = document.getElementById('btn-open-new-task-modal');
const btnCloseTaskModal = document.getElementById('btn-close-task-modal');
const btnCancelTaskModal = document.getElementById('btn-cancel-task-modal');

const usersModal = document.getElementById('users-modal');
const btnOpenUsersModal = document.getElementById('btn-open-users-modal');
const btnCloseUsersModal = document.getElementById('btn-close-users-modal');
const btnFinishUsersModal = document.getElementById('btn-finish-users-modal');
const createUserForm = document.getElementById('create-user-form');
const usersTableBody = document.getElementById('users-table-body');
const userModalCount = document.getElementById('user-modal-count');

// Detail Modal
const taskDetailModal = document.getElementById('task-detail-modal');
const btnCloseDetailModal = document.getElementById('btn-close-detail-modal');
const btnCloseDetailFooter = document.getElementById('btn-close-detail-footer');
const detailCategoryBadge = document.getElementById('detail-category-badge');
const detailPriorityBadge = document.getElementById('detail-priority-badge');
const detailStatusBadge = document.getElementById('detail-status-badge');
const detailAssignedTo = document.getElementById('detail-assigned-to');
const detailDueDate = document.getElementById('detail-due-date');
const detailDescriptionContent = document.getElementById('detail-description-content');
const detailModalTitle = document.getElementById('detail-modal-title');
const detailBtnToggleStatus = document.getElementById('detail-btn-toggle-status');
const detailBtnStatusText = document.getElementById('detail-btn-status-text');

// User View Elements
const userGreeting = document.getElementById('user-greeting');
const userDisplayTitle = document.getElementById('user-display-title');
const userProgressBar = document.getElementById('user-progress-bar');
const userProgressPercent = document.getElementById('user-progress-percent');
const userStatPending = document.getElementById('user-stat-pending');
const userStatCompleted = document.getElementById('user-stat-completed');
const userTaskSearch = document.getElementById('user-task-search');
const userTasksContainer = document.getElementById('user-tasks-container');
const userTabCountAll = document.getElementById('user-tab-count-all');
const userTabCountPending = document.getElementById('user-tab-count-pending');
const userTabCountCompleted = document.getElementById('user-tab-count-completed');

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle-2';
  if (type === 'error') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons({ root: toast });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== DATABASE INITIALIZATION & REALTIME LISTENERS ====================
function initDatabase() {
  if (typeof firebase !== 'undefined' && typeof isFirebaseConfigured === 'function' && isFirebaseConfigured()) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
      useFirebase = true;

      connectionStatus.classList.remove('offline');
      statusLabel.textContent = 'Firebase Cloud ⚡';
      console.log('✅ Conectado exitosamente a Firebase Realtime Database');

      // Realtime listener for users
      db.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          appUsers = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } else {
          // Initialize initial owner user in Firebase if empty
          appUsers = [DEFAULT_INITIAL_USER];
          db.ref('users/' + DEFAULT_INITIAL_USER.id).set(DEFAULT_INITIAL_USER);
        }
        onDataUpdated();
      });

      // Realtime listener for tasks
      db.ref('tasks').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          appTasks = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          // Order by created_at descending
          appTasks.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        } else {
          appTasks = [];
        }
        onDataUpdated();
      });

      return;
    } catch (err) {
      console.error('Error inicializando Firebase:', err);
    }
  }

  // Fallback: LocalStorage Mode
  useFirebase = false;
  connectionStatus.classList.add('offline');
  statusLabel.textContent = 'Modo LocalStorage';
  loadFromLocalStorage();
  onDataUpdated();
}

function loadFromLocalStorage() {
  const savedUsers = localStorage.getItem('eclipse_users');
  if (savedUsers) {
    appUsers = JSON.parse(savedUsers);
  } else {
    appUsers = [DEFAULT_INITIAL_USER];
    saveUsersToLocalStorage();
  }

  const savedTasks = localStorage.getItem('eclipse_tasks');
  if (savedTasks) {
    appTasks = JSON.parse(savedTasks);
  } else {
    appTasks = [];
    saveTasksToLocalStorage();
  }
}

function saveUsersToLocalStorage() {
  localStorage.setItem('eclipse_users', JSON.stringify(appUsers));
}

function saveTasksToLocalStorage() {
  localStorage.setItem('eclipse_tasks', JSON.stringify(appTasks));
}

function onDataUpdated() {
  populateUserDropdowns();
  if (usersModal && usersModal.style.display === 'flex') {
    renderUsersModalTable();
  }

  if (currentUser) {
    // Keep current user object updated
    const refreshedUser = appUsers.find(u => u.username === currentUser.username);
    if (refreshedUser) {
      currentUser = refreshedUser;
    }

    if (currentUser.role === 'moderator') {
      renderModeratorView();
    } else {
      renderUserView();
    }
  }
}

// ==================== AUTHENTICATION ====================
function handleLogin(e) {
  e.preventDefault();
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  loginError.style.display = 'none';

  const user = appUsers.find(u => 
    u.username && u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (user) {
    authenticateUser(user);
  } else {
    showLoginError('Usuario o contraseña incorrectos.');
  }
}

function showLoginError(msg) {
  loginErrorText.textContent = msg;
  loginError.style.display = 'flex';
  lucide.createIcons({ root: loginError });
}

function authenticateUser(user) {
  currentUser = user;
  sessionStorage.setItem('eclipse_session_user', JSON.stringify(user));

  loginScreen.classList.remove('active');
  loginScreen.style.display = 'none';
  appScreen.style.display = 'flex';

  navUserName.textContent = user.name || user.username;
  navUserAvatar.textContent = (user.name || user.username).charAt(0).toUpperCase();

  if (user.role === 'moderator') {
    navUserRole.textContent = 'Moderador';
    roleBadgeText.textContent = 'Mod Workspace';
    moderatorView.style.display = 'block';
    userView.style.display = 'none';
    renderModeratorView();
  } else {
    navUserRole.textContent = 'Integrante';
    roleBadgeText.textContent = 'Espacio de Integrante';
    moderatorView.style.display = 'none';
    userView.style.display = 'block';
    userDisplayTitle.textContent = user.name || user.username;
    renderUserView();
  }

  showToast(`¡Bienvenido al Workspace, ${user.name || user.username}!`, 'success');
  lucide.createIcons();
}

function handleLogout() {
  currentUser = null;
  sessionStorage.removeItem('eclipse_session_user');
  appScreen.style.display = 'none';
  loginScreen.style.display = 'flex';
  loginScreen.classList.add('active');
  loginForm.reset();
  loginError.style.display = 'none';
  showToast('Has cerrado sesión.', 'info');
}

// ==================== USER MANAGEMENT (MOD ONLY) ====================
async function handleCreateUser(e) {
  e.preventDefault();
  const name = document.getElementById('new-user-name').value.trim();
  const username = document.getElementById('new-user-username').value.trim();
  const password = document.getElementById('new-user-password').value.trim();
  const role = document.getElementById('new-user-role').value;

  if (!username || !password) {
    showToast('Usuario y contraseña obligatorios', 'error');
    return;
  }

  const existing = appUsers.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    showToast('El nombre de usuario ya existe', 'error');
    return;
  }

  const newUser = {
    name: name || username,
    username,
    password,
    role,
    created_at: new Date().toISOString()
  };

  if (useFirebase && db) {
    const newRef = db.ref('users').push();
    newUser.id = newRef.key;
    await newRef.set(newUser);
  } else {
    newUser.id = 'usr_' + Date.now();
    appUsers.push(newUser);
    saveUsersToLocalStorage();
    onDataUpdated();
  }

  createUserForm.reset();
  showToast(`Integrante @${username} creado en la nube`, 'success');
}

async function handleDeleteUser(userId, username) {
  if (username === 'AlexCAC') {
    showToast('No puedes eliminar la cuenta de Moderador principal (AlexCAC)', 'error');
    return;
  }

  if (!confirm(`¿Eliminar al integrante @${username}?`)) return;

  if (useFirebase && db) {
    await db.ref('users/' + userId).remove();
  } else {
    appUsers = appUsers.filter(u => u.id !== userId);
    saveUsersToLocalStorage();
    onDataUpdated();
  }

  showToast(`Integrante @${username} eliminado`, 'info');
}

function renderUsersModalTable() {
  userModalCount.textContent = appUsers.length;
  usersTableBody.innerHTML = '';

  appUsers.forEach(u => {
    const assignedTasks = appTasks.filter(t => t.assigned_to === u.username);
    const completedTasks = assignedTasks.filter(t => t.status === 'completed');
    const isOwner = u.username === 'AlexCAC';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="avatar" style="width:24px; height:24px; font-size:0.75rem;">${(u.name || u.username).charAt(0).toUpperCase()}</div>
          <b>${escapeHtml(u.name || u.username)}</b>
        </div>
      </td>
      <td><code>${escapeHtml(u.username)}</code></td>
      <td>
        <span class="tag-pill" style="${u.role === 'moderator' ? 'background:var(--red-badge-bg); color:var(--red-badge-text);' : ''}">
          ${u.role === 'moderator' ? 'Moderador' : 'Integrante'}
        </span>
      </td>
      <td>
        <span style="font-size:0.82rem; color:var(--text-secondary);">
          ${completedTasks.length}/${assignedTasks.length} prontas
        </span>
      </td>
      <td>
        ${isOwner ? '<span style="font-size:0.75rem; color:var(--text-muted);">Owner</span>' : `
          <button class="btn-icon-danger btn-delete-user" data-id="${u.id}" data-username="${escapeHtml(u.username)}" title="Eliminar Integrante">
            <i data-lucide="trash-2"></i>
          </button>
        `}
      </td>
    `;
    usersTableBody.appendChild(tr);
  });

  usersTableBody.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteUser(btn.dataset.id, btn.dataset.username);
    });
  });

  lucide.createIcons({ root: usersTableBody });
}

function populateUserDropdowns() {
  const currentFilterVal = modFilterUser.value;
  modFilterUser.innerHTML = '<option value="all">Todos los integrantes</option>';
  taskFormAssigned.innerHTML = '';

  appUsers.forEach(u => {
    const optFilter = document.createElement('option');
    optFilter.value = u.username;
    optFilter.textContent = `${u.name || u.username} (@${u.username})`;
    modFilterUser.appendChild(optFilter);

    const optAssign = document.createElement('option');
    optAssign.value = u.username;
    optAssign.textContent = `${u.name || u.username} (@${u.username}) - ${u.role === 'moderator' ? 'Mod' : 'Integrante'}`;
    taskFormAssigned.appendChild(optAssign);
  });

  if (currentFilterVal && Array.from(modFilterUser.options).some(o => o.value === currentFilterVal)) {
    modFilterUser.value = currentFilterVal;
  }
}

// ==================== TASK MANAGEMENT (REALTIME CLOUD) ====================
async function handleSaveTask(e) {
  e.preventDefault();
  const id = taskFormId.value;
  const title = taskFormTitle.value.trim();
  const assigned_to = taskFormAssigned.value;
  const priority = taskFormPriority.value;
  const category = taskFormCategory.value;
  const due_date = taskFormDueDate.value;
  const description = taskFormDesc.value.trim();

  if (!title || !assigned_to) {
    showToast('Título y asignado obligatorios', 'error');
    return;
  }

  if (id) {
    // Update existing task
    const taskUpdates = {
      title,
      assigned_to,
      priority,
      category,
      due_date,
      description
    };

    if (useFirebase && db) {
      await db.ref('tasks/' + id).update(taskUpdates);
    } else {
      const idx = appTasks.findIndex(t => String(t.id) === String(id));
      if (idx !== -1) {
        appTasks[idx] = { ...appTasks[idx], ...taskUpdates };
        saveTasksToLocalStorage();
        onDataUpdated();
      }
    }
    showToast('Tarea actualizada', 'success');
  } else {
    // Create new task
    const newTask = {
      title,
      description,
      assigned_to,
      priority,
      category,
      status: 'pending',
      due_date,
      created_at: new Date().toISOString(),
      completed_at: ''
    };

    if (useFirebase && db) {
      const newRef = db.ref('tasks').push();
      newTask.id = newRef.key;
      await newRef.set(newTask);
    } else {
      newTask.id = 'task_' + Date.now();
      appTasks.unshift(newTask);
      saveTasksToLocalStorage();
      onDataUpdated();
    }
    showToast(`Tarea asignada a @${assigned_to}`, 'success');
  }

  closeTaskModal();
}

async function handleDeleteTask(taskId) {
  if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;

  if (useFirebase && db) {
    await db.ref('tasks/' + taskId).remove();
  } else {
    appTasks = appTasks.filter(t => String(t.id) !== String(taskId));
    saveTasksToLocalStorage();
    onDataUpdated();
  }

  showToast('Tarea eliminada', 'info');
}

async function toggleTaskStatus(taskId) {
  const task = appTasks.find(t => String(t.id) === String(taskId));
  if (!task) return;

  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  const completed_at = newStatus === 'completed' ? new Date().toISOString() : '';

  if (useFirebase && db) {
    await db.ref('tasks/' + taskId).update({
      status: newStatus,
      completed_at: completed_at
    });
  } else {
    task.status = newStatus;
    task.completed_at = completed_at;
    saveTasksToLocalStorage();
    onDataUpdated();
  }

  if (newStatus === 'completed') {
    showToast(`🎉 ¡Tarea "${task.title}" marcada como Pronta!`, 'success');
  } else {
    showToast(`Tarea reabierta como Pendiente`, 'info');
  }

  if (currentDetailTaskId === taskId) {
    const updated = { ...task, status: newStatus, completed_at };
    openTaskDetailModal(updated);
  }
}

function openEditTaskModal(task) {
  taskModalTitle.textContent = 'Editar Tarea';
  taskFormId.value = task.id;
  taskFormTitle.value = task.title;
  taskFormAssigned.value = task.assigned_to;
  taskFormPriority.value = task.priority;
  taskFormCategory.value = task.category;
  taskFormDueDate.value = task.due_date || '';
  taskFormDesc.value = task.description || '';

  taskModal.style.display = 'flex';
}

function openNewTaskModal() {
  taskForm.reset();
  taskModalTitle.textContent = 'Nueva Tarea';
  taskFormId.value = '';
  taskModal.style.display = 'flex';
}

function closeTaskModal() {
  taskModal.style.display = 'none';
}

function openTaskDetailModal(task) {
  currentDetailTaskId = task.id;
  detailModalTitle.textContent = task.title;
  detailCategoryBadge.textContent = task.category || 'General';
  detailPriorityBadge.textContent = `Prioridad ${task.priority}`;
  detailPriorityBadge.className = `priority-pill priority-${task.priority}`;

  if (task.status === 'completed') {
    detailStatusBadge.textContent = '✓ Pronta';
    detailStatusBadge.className = 'status-pill completed';
    detailBtnStatusText.textContent = 'Reabrir Tarea';
    detailBtnToggleStatus.className = 'btn btn-secondary';
  } else {
    detailStatusBadge.textContent = '⏳ Pendiente';
    detailStatusBadge.className = 'status-pill pending';
    detailBtnStatusText.textContent = 'Marcar como Pronta';
    detailBtnToggleStatus.className = 'btn btn-primary';
  }

  const assignedUserObj = appUsers.find(u => u.username === task.assigned_to);
  detailAssignedTo.textContent = assignedUserObj ? `${assignedUserObj.name} (@${task.assigned_to})` : `@${task.assigned_to}`;
  detailDueDate.textContent = task.due_date ? formatDate(task.due_date) : 'Sin fecha límite';
  detailDescriptionContent.textContent = task.description || 'Sin instrucciones adicionales.';

  taskDetailModal.style.display = 'flex';
  lucide.createIcons({ root: taskDetailModal });
}

// ==================== RENDER: MODERATOR VIEW ====================
function renderModeratorView() {
  const total = appTasks.length;
  const pending = appTasks.filter(t => t.status === 'pending').length;
  const completed = appTasks.filter(t => t.status === 'completed').length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  statTotalTasks.textContent = total;
  statPendingTasks.textContent = pending;
  statCompletedTasks.textContent = completed;
  statCompletionRate.textContent = `${rate}%`;
  statTeamCount.textContent = appUsers.length;

  const searchTerm = modTaskSearch.value.toLowerCase().trim();
  const filterUser = modFilterUser.value;
  const filterStatus = modFilterStatus.value;
  const filterPriority = modFilterPriority.value;

  const filteredTasks = appTasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm) ||
      (t.description && t.description.toLowerCase().includes(searchTerm)) ||
      (t.assigned_to && t.assigned_to.toLowerCase().includes(searchTerm));

    const matchUser = filterUser === 'all' || t.assigned_to === filterUser;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;

    return matchSearch && matchUser && matchStatus && matchPriority;
  });

  modTasksContainer.className = `tasks-wrapper ${currentModView}-layout`;
  modTasksContainer.innerHTML = '';

  if (filteredTasks.length === 0) {
    modTasksContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="inbox"></i>
        <h4>No se encontraron tareas</h4>
        <p>No hay tareas que coincidan con los filtros o aún no has creado ninguna.</p>
        <button class="btn btn-primary" onclick="openNewTaskModal()">
          <i data-lucide="plus"></i> Crear Nueva Tarea
        </button>
      </div>
    `;
    lucide.createIcons({ root: modTasksContainer });
    return;
  }

  if (currentModView === 'cards') {
    renderModCardsView(filteredTasks);
  } else if (currentModView === 'kanban') {
    renderModKanbanView(filteredTasks);
  } else if (currentModView === 'table') {
    renderModTableView(filteredTasks);
  }

  lucide.createIcons({ root: modTasksContainer });
}

function renderModCardsView(tasks) {
  tasks.forEach(task => {
    const isDone = task.status === 'completed';
    const assignedUser = appUsers.find(u => u.username === task.assigned_to);
    const displayName = assignedUser ? (assignedUser.name || assignedUser.username) : task.assigned_to;

    const card = document.createElement('div');
    card.className = `task-card ${isDone ? 'status-completed' : ''}`;
    card.innerHTML = `
      <div>
        <div class="task-header-row">
          <div class="task-tags-row">
            <span class="tag-pill">${escapeHtml(task.category || 'General')}</span>
            <span class="priority-pill priority-${task.priority}">${task.priority}</span>
            <span class="status-pill ${task.status}">${isDone ? '✓ Pronta' : '⏳ Pendiente'}</span>
          </div>
          <div class="task-card-actions">
            <button class="btn-icon-danger btn-edit-task" data-id="${task.id}" title="Editar Tarea">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="btn-icon-danger btn-delete-task" data-id="${task.id}" title="Eliminar Tarea">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>

        <h4 class="task-title" style="margin-top:10px;" data-id="${task.id}">${escapeHtml(task.title)}</h4>
        
        ${task.description ? `<p class="task-desc-preview" data-id="${task.id}">${escapeHtml(task.description)}</p>` : ''}
      </div>

      <div class="task-footer-row">
        <div class="task-assigned-info">
          <i data-lucide="user"></i>
          <span>Asignado a: <b>${escapeHtml(displayName)}</b></span>
        </div>
        <div>
          ${task.due_date ? `<span style="color:var(--text-muted); font-size:0.75rem;"><i data-lucide="calendar" style="width:12px;height:12px;display:inline;"></i> ${formatDate(task.due_date)}</span>` : ''}
        </div>
      </div>
    `;

    card.querySelector('.task-title').addEventListener('click', () => openTaskDetailModal(task));
    const descEl = card.querySelector('.task-desc-preview');
    if (descEl) descEl.addEventListener('click', () => openTaskDetailModal(task));

    card.querySelector('.btn-edit-task').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditTaskModal(task);
    });
    card.querySelector('.btn-delete-task').addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteTask(task.id);
    });

    modTasksContainer.appendChild(card);
  });
}

function renderModKanbanView(tasks) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const kanban = document.createElement('div');
  kanban.className = 'tasks-wrapper kanban-layout';
  kanban.style.width = '100%';
  kanban.style.gridColumn = '1 / -1';

  const colPending = document.createElement('div');
  colPending.className = 'kanban-col';
  colPending.innerHTML = `
    <div class="kanban-col-header">
      <div class="kanban-col-title">
        <span class="status-dot" style="background:var(--color-amber);"></span>
        <span>Pendientes</span>
      </div>
      <span class="counter-bubble">${pendingTasks.length}</span>
    </div>
    <div class="kanban-tasks-list" id="kanban-pending-list"></div>
  `;

  const colCompleted = document.createElement('div');
  colCompleted.className = 'kanban-col';
  colCompleted.innerHTML = `
    <div class="kanban-col-header">
      <div class="kanban-col-title">
        <span class="status-dot" style="background:var(--color-emerald);"></span>
        <span>Prontas / Completadas</span>
      </div>
      <span class="counter-bubble">${completedTasks.length}</span>
    </div>
    <div class="kanban-tasks-list" id="kanban-completed-list"></div>
  `;

  kanban.appendChild(colPending);
  kanban.appendChild(colCompleted);
  modTasksContainer.appendChild(kanban);

  const pendingList = colPending.querySelector('#kanban-pending-list');
  const completedList = colCompleted.querySelector('#kanban-completed-list');

  const renderKanbanItem = (task, container) => {
    const item = document.createElement('div');
    item.className = `task-card ${task.status === 'completed' ? 'status-completed' : ''}`;
    item.style.padding = '14px';
    item.innerHTML = `
      <div class="task-tags-row">
        <span class="tag-pill">${escapeHtml(task.category || 'General')}</span>
        <span class="priority-pill priority-${task.priority}">${task.priority}</span>
      </div>
      <h5 class="task-title" style="margin-top:6px; font-size:0.9rem;">${escapeHtml(task.title)}</h5>
      <div class="task-footer-row" style="margin-top:8px; padding-top:8px;">
        <span style="font-size:0.75rem; color:var(--text-muted);">@${escapeHtml(task.assigned_to)}</span>
        <button class="btn btn-secondary btn-sm btn-toggle-status" style="padding:3px 8px; font-size:0.72rem;">
          ${task.status === 'completed' ? 'Reabrir' : 'Marcar Pronta'}
        </button>
      </div>
    `;
    item.querySelector('.task-title').addEventListener('click', () => openTaskDetailModal(task));
    item.querySelector('.btn-toggle-status').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskStatus(task.id);
    });
    container.appendChild(item);
  };

  pendingTasks.forEach(t => renderKanbanItem(t, pendingList));
  completedTasks.forEach(t => renderKanbanItem(t, completedList));
}

function renderModTableView(tasks) {
  const tableWrap = document.createElement('div');
  tableWrap.className = 'tasks-wrapper table-layout';
  tableWrap.style.gridColumn = '1 / -1';

  tableWrap.innerHTML = `
    <table class="custom-table">
      <thead>
        <tr>
          <th style="width:40px;">Estado</th>
          <th>Título de la Tarea</th>
          <th>Asignado a</th>
          <th>Categoría</th>
          <th>Prioridad</th>
          <th>Fecha Límite</th>
          <th style="text-align:right;">Acciones</th>
        </tr>
      </thead>
      <tbody id="mod-table-body"></tbody>
    </table>
  `;

  const tbody = tableWrap.querySelector('#mod-table-body');
  tasks.forEach(t => {
    const tr = document.createElement('tr');
    const isDone = t.status === 'completed';
    tr.innerHTML = `
      <td>
        <button class="btn-icon-danger btn-table-toggle" title="${isDone ? 'Marcar como pendiente' : 'Marcar como pronta'}" style="color:${isDone ? 'var(--color-emerald)' : 'var(--text-muted)'};">
          <i data-lucide="${isDone ? 'check-circle-2' : 'circle'}"></i>
        </button>
      </td>
      <td>
        <b class="task-table-title" style="cursor:pointer; color:${isDone ? 'var(--text-muted)' : '#fff'}; ${isDone ? 'text-decoration:line-through;' : ''}">${escapeHtml(t.title)}</b>
      </td>
      <td><span style="color:var(--text-secondary);">@${escapeHtml(t.assigned_to)}</span></td>
      <td><span class="tag-pill">${escapeHtml(t.category || 'General')}</span></td>
      <td><span class="priority-pill priority-${t.priority}">${t.priority}</span></td>
      <td><span style="color:var(--text-muted); font-size:0.8rem;">${t.due_date ? formatDate(t.due_date) : '-'}</span></td>
      <td style="text-align:right;">
        <button class="btn-icon-danger btn-table-edit"><i data-lucide="edit-3"></i></button>
        <button class="btn-icon-danger btn-table-del"><i data-lucide="trash-2"></i></button>
      </td>
    `;

    tr.querySelector('.btn-table-toggle').addEventListener('click', () => toggleTaskStatus(t.id));
    tr.querySelector('.task-table-title').addEventListener('click', () => openTaskDetailModal(t));
    tr.querySelector('.btn-table-edit').addEventListener('click', () => openEditTaskModal(t));
    tr.querySelector('.btn-table-del').addEventListener('click', () => handleDeleteTask(t.id));

    tbody.appendChild(tr);
  });

  modTasksContainer.appendChild(tableWrap);
}

// ==================== RENDER: USER VIEW ====================
function renderUserView() {
  if (!currentUser) return;

  const myTasks = appTasks.filter(t => t.assigned_to === currentUser.username);
  const myPending = myTasks.filter(t => t.status === 'pending');
  const myCompleted = myTasks.filter(t => t.status === 'completed');

  userStatPending.textContent = myPending.length;
  userStatCompleted.textContent = myCompleted.length;
  userTabCountAll.textContent = myTasks.length;
  userTabCountPending.textContent = myPending.length;
  userTabCountCompleted.textContent = myCompleted.length;

  const percent = myTasks.length > 0 ? Math.round((myCompleted.length / myTasks.length) * 100) : 0;
  userProgressBar.style.width = `${percent}%`;
  userProgressPercent.textContent = `${percent}% completado`;

  const searchTerm = userTaskSearch.value.toLowerCase().trim();
  const filtered = myTasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm) ||
      (t.description && t.description.toLowerCase().includes(searchTerm));
    const matchTab = userActiveTab === 'all' || t.status === userActiveTab;
    return matchSearch && matchTab;
  });

  userTasksContainer.innerHTML = '';

  if (filtered.length === 0) {
    userTasksContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="sparkles"></i>
        <h4>¡No tienes tareas en esta sección!</h4>
        <p>${userActiveTab === 'completed' ? 'Aún no has marcado tareas como prontas.' : 'No tienes tareas pendientes asignadas en este momento.'}</p>
      </div>
    `;
    lucide.createIcons({ root: userTasksContainer });
    return;
  }

  filtered.forEach(task => {
    const isDone = task.status === 'completed';
    const card = document.createElement('div');
    card.className = 'user-task-card';
    card.innerHTML = `
      <div>
        <div class="task-tags-row">
          <span class="tag-pill">${escapeHtml(task.category || 'General')}</span>
          <span class="priority-pill priority-${task.priority}">Prioridad ${task.priority}</span>
          <span class="status-pill ${task.status}">${isDone ? '✓ Pronta' : '⏳ Pendiente'}</span>
        </div>

        <h3 class="task-title" style="margin-top:12px; font-size:1.1rem; color:#fff;" data-id="${task.id}">
          ${escapeHtml(task.title)}
        </h3>

        <p class="task-desc-preview" style="margin-top:8px; -webkit-line-clamp: 4;" data-id="${task.id}">
          ${escapeHtml(task.description || 'Sin descripción adicional.')}
        </p>
      </div>

      <div>
        <div class="task-footer-row" style="margin-bottom:14px;">
          <span style="color:var(--text-muted); font-size:0.78rem;">
            <i data-lucide="calendar" style="width:13px; height:13px; display:inline;"></i>
            ${task.due_date ? `Límite: <b>${formatDate(task.due_date)}</b>` : 'Sin fecha límite'}
          </span>
          <button class="btn-quick-fill btn-inspect-task" data-id="${task.id}">
            <i data-lucide="maximize-2"></i> Ver Detalle
          </button>
        </div>

        <button class="btn ${isDone ? 'btn-secondary is-done' : 'btn-primary'} btn-complete-task" data-id="${task.id}">
          <i data-lucide="${isDone ? 'check-circle-2' : 'circle'}"></i>
          <span>${isDone ? 'Tarea Pronta (Click para reabrir)' : 'Marcar como Pronta'}</span>
        </button>
      </div>
    `;

    card.querySelector('.task-title').addEventListener('click', () => openTaskDetailModal(task));
    card.querySelector('.task-desc-preview').addEventListener('click', () => openTaskDetailModal(task));
    card.querySelector('.btn-inspect-task').addEventListener('click', () => openTaskDetailModal(task));

    card.querySelector('.btn-complete-task').addEventListener('click', () => {
      toggleTaskStatus(task.id);
    });

    userTasksContainer.appendChild(card);
  });

  lucide.createIcons({ root: userTasksContainer });
}

// ==================== HELPERS ====================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) {}
  return dateStr;
}

// ==================== APP INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Realtime DB / LocalStorage
  initDatabase();

  // Restore active session if present
  const savedSession = sessionStorage.getItem('eclipse_session_user');
  if (savedSession) {
    try {
      const u = JSON.parse(savedSession);
      authenticateUser(u);
    } catch (e) {}
  }

  // Login events
  loginForm.addEventListener('submit', handleLogin);
  btnLogout.addEventListener('click', handleLogout);

  btnTogglePw.addEventListener('click', () => {
    const isPw = loginPasswordInput.type === 'password';
    loginPasswordInput.type = isPw ? 'text' : 'password';
    const eyeIcon = document.getElementById('eye-icon');
    eyeIcon.setAttribute('data-lucide', isPw ? 'eye-off' : 'eye');
    lucide.createIcons({ root: btnTogglePw });
  });

  // Mod Search & Filter events
  modTaskSearch.addEventListener('input', renderModeratorView);
  modFilterUser.addEventListener('change', renderModeratorView);
  modFilterStatus.addEventListener('change', renderModeratorView);
  modFilterPriority.addEventListener('change', renderModeratorView);

  // View Switcher
  btnViewCards.addEventListener('click', () => {
    currentModView = 'cards';
    [btnViewCards, btnViewKanban, btnViewTable].forEach(b => b.classList.remove('active'));
    btnViewCards.classList.add('active');
    renderModeratorView();
  });
  btnViewKanban.addEventListener('click', () => {
    currentModView = 'kanban';
    [btnViewCards, btnViewKanban, btnViewTable].forEach(b => b.classList.remove('active'));
    btnViewKanban.classList.add('active');
    renderModeratorView();
  });
  btnViewTable.addEventListener('click', () => {
    currentModView = 'table';
    [btnViewCards, btnViewKanban, btnViewTable].forEach(b => b.classList.remove('active'));
    btnViewTable.classList.add('active');
    renderModeratorView();
  });

  // Modals
  btnOpenNewTaskModal.addEventListener('click', openNewTaskModal);
  btnCloseTaskModal.addEventListener('click', closeTaskModal);
  btnCancelTaskModal.addEventListener('click', closeTaskModal);
  taskForm.addEventListener('submit', handleSaveTask);

  btnOpenUsersModal.addEventListener('click', () => {
    renderUsersModalTable();
    usersModal.style.display = 'flex';
  });
  btnCloseUsersModal.addEventListener('click', () => usersModal.style.display = 'none');
  btnFinishUsersModal.addEventListener('click', () => usersModal.style.display = 'none');
  createUserForm.addEventListener('submit', handleCreateUser);

  // Detail Modal
  btnCloseDetailModal.addEventListener('click', () => taskDetailModal.style.display = 'none');
  btnCloseDetailFooter.addEventListener('click', () => taskDetailModal.style.display = 'none');
  detailBtnToggleStatus.addEventListener('click', () => {
    if (currentDetailTaskId) toggleTaskStatus(currentDetailTaskId);
  });

  // User tab filtering
  document.querySelectorAll('.status-tab-group .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-tab-group .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      userActiveTab = btn.dataset.tab;
      renderUserView();
    });
  });
  userTaskSearch.addEventListener('input', renderUserView);

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === taskModal) closeTaskModal();
    if (e.target === usersModal) usersModal.style.display = 'none';
    if (e.target === taskDetailModal) taskDetailModal.style.display = 'none';
  });

  // Initialize icons
  lucide.createIcons();
});
