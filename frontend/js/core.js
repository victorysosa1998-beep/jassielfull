/* =====================================================
   JAASIEL EDUCATION CENTRE — AI RMS
   Core JS v4.0 · Production · FastAPI Backend
   API_BASE: /api/v1
   ===================================================== */
'use strict';

const CONFIG = {
  API_BASE: 'https://jaasiel-school-project-backend-production.up.railway.app',
  TOKEN_KEY: 'jrms_token',
  REFRESH_KEY: 'jrms_refresh',
  USER_KEY: 'jrms_user',
  TOAST_DURATION: 4500,
  REQUEST_TIMEOUT: 30000,
};

/* ── Security ── */
const Security = {
  sanitize(str) {
    if (typeof str !== 'string') return str == null ? '' : String(str);
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }
};

/* ── Token Manager ── */
const TokenManager = {
  get()        { return sessionStorage.getItem(CONFIG.TOKEN_KEY) || localStorage.getItem(CONFIG.TOKEN_KEY); },
  getRefresh() { return localStorage.getItem(CONFIG.REFRESH_KEY); },
  set(t, r)    {
    sessionStorage.setItem(CONFIG.TOKEN_KEY, t);
    localStorage.setItem(CONFIG.TOKEN_KEY, t);
    if (r) localStorage.setItem(CONFIG.REFRESH_KEY, r);
  },
  clear() {
    [CONFIG.TOKEN_KEY, CONFIG.REFRESH_KEY, CONFIG.USER_KEY].forEach(k => {
      sessionStorage.removeItem(k); localStorage.removeItem(k);
    });
  },
  isExpired(t) {
    try { const p = JSON.parse(atob(t.split('.')[1])); return Date.now()/1000 > (p.exp - 60); }
    catch { return true; }
  },
};

/* ── Auth State ── */
const AuthState = {
  user: null, token: null,
  load() {
    try { this.user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || 'null'); } catch { this.user = null; }
    this.token = TokenManager.get();
    return this.user;
  },
  save(user, token, refresh) {
    this.user = user; this.token = token;
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    TokenManager.set(token, refresh);
  },
  clear()      { this.user = null; this.token = null; TokenManager.clear(); },
  isLoggedIn() { return !!this.token && !!this.user; },
  getRole()    { return this.user?.role || null; },
  hasRole(...r){ return r.includes(this.getRole()); },
  getUser()    { return this.user; },
  isAdmin()    { return this.hasRole('super_admin', 'admin'); },
  isSubAdmin() { return this.hasRole('sub_admin'); },
  isStudent()  { return this.hasRole('student'); },
};

/* ── API Client ── */
const API = {
  _refreshing: false, _queue: [],

  async request(method, endpoint, data = null) {
    let token = TokenManager.get();
    if (token && TokenManager.isExpired(token)) {
      await this._doRefresh(); token = TokenManager.get();
    }
    const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const cfg = { method: method.toUpperCase(), headers };
    let url = CONFIG.API_BASE + endpoint;
    if (data && cfg.method === 'GET') {
      const p = new URLSearchParams(
        Object.fromEntries(Object.entries(data).filter(([, v]) => v != null && v !== ''))
      );
      const qs = p.toString(); if (qs) url += '?' + qs;
    } else if (data) {
      cfg.body = JSON.stringify(data);
    }
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    cfg.signal = controller.signal;
    try {
      const resp = await fetch(url, cfg);
      clearTimeout(tid);
      if (resp.status === 401) {
        const ok = await this._doRefresh();
        if (ok) return this.request(method, endpoint, data);
        AuthState.clear(); window.location.replace('login.html'); return;
      }
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw { status: resp.status, message: json.detail || json.message || `Error ${resp.status}` };
      return json;
    } catch (err) {
      clearTimeout(tid);
      if (err.name === 'AbortError') throw { status: 0, message: 'Request timed out.' };
      if (err.status) throw err;
      throw { status: 0, message: 'Network error. Check your connection.' };
    }
  },

  async _doRefresh() {
    if (this._refreshing) return new Promise(r => this._queue.push(r));
    this._refreshing = true;
    const rt = TokenManager.getRefresh();
    if (!rt) { this._refreshing = false; AuthState.clear(); return false; }
    try {
      const d = await fetch(CONFIG.API_BASE + '/auth/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt })
      }).then(r => r.json());
      if (!d.access_token) throw new Error('no token');
      TokenManager.set(d.access_token, d.refresh_token);
      this._queue.forEach(fn => fn(true)); this._queue = []; this._refreshing = false;
      return true;
    } catch {
      AuthState.clear();
      this._queue.forEach(fn => fn(false)); this._queue = []; this._refreshing = false;
      return false;
    }
  },

  async upload(endpoint, formData) {
    const token = TokenManager.get();
    const resp = await fetch(CONFIG.API_BASE + endpoint, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) throw { status: resp.status, message: json.detail || json.message || 'Upload failed' };
    return json;
  },

  get:    (ep, p) => API.request('GET',    ep, p),
  post:   (ep, d) => API.request('POST',   ep, d),
  put:    (ep, d) => API.request('PUT',    ep, d),
  patch:  (ep, d) => API.request('PATCH',  ep, d),
  delete: (ep)    => API.request('DELETE', ep),

  auth: {
    login:         d   => API.post('/auth/login', d),
    logout:        ()  => API.post('/auth/logout'),
    refresh:       rt  => API.post('/auth/refresh', { refresh_token: rt }),
    changePassword:d   => API.post('/auth/change-password', d),
    me:            ()  => API.get('/auth/me'),
  },
  dashboard: {
    admin:   () => API.get('/dashboard/admin'),
    subadmin:() => API.get('/dashboard/sub-admin'),
    student: () => API.get('/dashboard/student'),
  },
  students: {
    list:       p      => API.get('/students', p),
    get:        id     => API.get(`/students/${id}`),
    create:     d      => API.post('/students', d),
    update:     (id,d) => API.put(`/students/${id}`, d),
    delete:     id     => API.delete(`/students/${id}`),
    results:    (id,p) => API.get(`/students/${id}/results`, p),
    bulkUpload: fd     => API.upload('/students/bulk-upload', fd),
    myProfile:  ()     => API.get('/students/me'),
    myResults:  p      => API.get('/students/me/results', p),
    myChangePwd:d      => API.post('/students/me/change-password', d),
  },
  classes: {
    list:    ()  => API.get('/classes'),
    students:id  => API.get(`/classes/${id}/students`),
    subjects:id  => API.get(`/classes/${id}/subjects`),
  },
  subjects: {
    list:   ()     => API.get('/subjects'),
    create: d      => API.post('/subjects', d),
    delete: id     => API.delete(`/subjects/${id}`),
  },
  results: {
    list:            p      => API.get('/results', p),
    upload:          d      => API.post('/results/upload', d),
    batches:         p      => API.get('/results/batches', p),
    batchDetail:     id     => API.get(`/results/batches/${id}`),
    approveBatch:    (id,d) => API.post(`/results/batches/${id}/approve`, d || {}),
    rejectBatch:     (id,d) => API.post(`/results/batches/${id}/reject`, d || {}),
    correctionBatch: (id,d) => API.post(`/results/batches/${id}/correction`, d || {}),
    lock:            id     => API.post(`/results/${id}/lock`),
    unlock:          id     => API.post(`/results/${id}/unlock`),
    pending:         p      => API.get('/results/pending', p),
    myUploads:       p      => API.get('/results/subadmin/uploads', p),
    submitClass:     d      => API.post('/results/submit-class', d),
    publish:         d      => API.post('/results/publish', d),
    publishOverview: p      => API.get('/results/publish-overview', p),
    classStatus:     p      => API.get('/results/class-status', p),
    transcript:      (id,p) => API.get('/results/transcript/'+id, p),
  },
  ocr: {
    upload:   fd => API.upload('/ocr/upload', fd),
    history:  p  => API.get('/ocr/history', p),
    analytics:() => API.get('/ocr/analytics'),
  },
  sessions: {
    list:   ()       => API.get('/sessions'),
    create: d        => API.post('/sessions', d),
    update: (id, d)  => API.put(`/sessions/${id}`, d),
    terms:  id       => API.get(`/sessions/${id}/terms`),
    current:()       => API.get('/sessions/current'),
    advance:()       => API.post('/sessions/advance'),
  },
  analytics: {
    school: p => API.get('/analytics/school', p),
    class:  p => API.get('/analytics/class', p),
    ocr:    () => API.get('/analytics/ocr'),
  },
  audit: {
    list:          p => API.get('/audit-logs', p),
    loginSessions: p => API.get('/audit-logs/login-sessions', p),
  },
  notifications: {
    list:       p  => API.get('/notifications', p),
    markRead:   id => API.post(`/notifications/${id}/read`),
    markAll:    () => API.post('/notifications/read-all'),
    unreadCount:() => API.get('/notifications/unread-count'),
  },
  settings: {
    getSchool:        ()       => API.get('/settings/school'),
    getGrading:       ()       => API.get('/settings/grading'),
    updateSchool:     d        => API.patch('/settings/school', d),
    updateGrading:    d        => API.patch('/settings/grading', d),
    updateProfile:    d        => API.patch('/users/me', d),
    getSubAdmins:     ()       => API.get('/admin/sub-admins'),
    createSubAdmin:   d        => API.post('/admin/sub-admins', d),
    resetSubAdminPwd: (id, d)  => API.post(`/admin/sub-admins/${id}/reset-password`, d),
    deleteSubAdmin:   id       => API.delete(`/admin/sub-admins/${id}`),
    signOutAll:       ()       => API.post('/admin/sign-out-all'),
  },
  reports: {
    generate:   d  => API.post('/reports/generate', d),
    transcript: id => `${CONFIG.API_BASE}/reports/transcript/${id}`,
  },
};

/* ── Bootstrap on page load ── */
window.__rmsBootstrapReady = (async () => {
  if (!TokenManager.get() && TokenManager.getRefresh()) {
    try {
      const d = await fetch(CONFIG.API_BASE + '/auth/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: TokenManager.getRefresh() })
      }).then(r => r.json());
      if (d.access_token) TokenManager.set(d.access_token, d.refresh_token);
    } catch {}
  }
  AuthState.load();
})();

/* ── Toast ── */
const Toast = {
  _c: null,
  init() {
    if (!this._c) {
      this._c = document.getElementById('toast-container') || (() => {
        const c = document.createElement('div');
        c.id = 'toast-container'; c.className = 'toast-container';
        document.body.appendChild(c); return c;
      })();
    }
  },
  show(type, title, message, duration) {
    this.init();
    const icons = { success:'fa-circle-check', error:'fa-circle-xmark', warning:'fa-triangle-exclamation', info:'fa-circle-info' };
    const id = 'toast-' + Date.now();
    const el = document.createElement('div');
    el.className = `toast ${type}`; el.id = id;
    el.innerHTML = `<div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
      <div class="toast-body"><div class="toast-title">${Security.sanitize(title)}</div>${message ? `<div class="toast-message">${Security.sanitize(message)}</div>` : ''}</div>
      <div class="toast-close" onclick="Toast.dismiss('${id}')"><i class="fas fa-xmark"></i></div>`;
    this._c.appendChild(el);
    setTimeout(() => this.dismiss(id), duration || CONFIG.TOAST_DURATION);
  },
  dismiss(id) {
    const el = document.getElementById(id); if (!el) return;
    el.style.cssText += 'opacity:0;transform:translateX(110%);transition:all .3s';
    setTimeout(() => el.remove(), 300);
  },
  success: (t, m, d) => Toast.show('success', t, m, d),
  error:   (t, m, d) => Toast.show('error',   t, m, d),
  warning: (t, m, d) => Toast.show('warning', t, m, d),
  info:    (t, m, d) => Toast.show('info',    t, m, d),
};

/* ── Modal ── */
const Modal = {
  open(id) {
    const el = document.getElementById(id); if (!el) return;
    el.classList.add('active'); document.body.style.overflow = 'hidden';
    setTimeout(() => el.querySelector('input,select,textarea,button:not(.modal-close)')?.focus(), 150);
  },
  close(id) {
    const el = document.getElementById(id); if (!el) return;
    el.classList.remove('active');
    if (!document.querySelector('.modal-overlay.active')) document.body.style.overflow = '';
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  },
};
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) Modal.closeAll(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') Modal.closeAll(); });

/* ── Validator ── */
const Validator = {
  rules: {
    required: v      => v !== '' && v != null,
    email:    v      => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    minLen:   (v, n) => String(v).length >= parseInt(n),
    maxLen:   (v, n) => String(v).length <= parseInt(n),
    numeric:  v      => !isNaN(v) && v !== '',
    match:    (v, id)=> v === (document.getElementById(id)?.value || ''),
  },
  messages: {
    required: 'This field is required.', email: 'Enter a valid email address.',
    minLen: n => `Minimum ${n} characters required.`,
    maxLen: n => `Maximum ${n} characters allowed.`,
    numeric: 'Must be a number.', match: 'Fields do not match.',
  },
  validate(form) {
    let ok = true;
    form.querySelectorAll('[data-validate]').forEach(field => {
      const rules = field.dataset.validate.split('|'); const val = field.value.trim();
      let fok = true, msg = '';
      for (const rule of rules) {
        const [name, ...args] = rule.split(':');
        if (!this.rules[name]) continue;
        if (!this.rules[name](val, ...args)) { fok = false; msg = typeof this.messages[name] === 'function' ? this.messages[name](...args) : (this.messages[name] || `${name} failed`); break; }
      }
      this.setFieldState(field, fok, msg); if (!fok) ok = false;
    });
    return ok;
  },
  setFieldState(f, valid, msg = '') {
    const g = f.closest('.form-group'); if (!g) return;
    g.querySelectorAll('.form-error').forEach(e => e.remove());
    f.classList.toggle('error', !valid);
    if (!valid && msg) { const e = document.createElement('div'); e.className = 'form-error'; e.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${Security.sanitize(msg)}`; g.appendChild(e); }
  },
};

/* ── Router ── */
const Router = {
  requireAuth() { if (!AuthState.load() || !AuthState.isLoggedIn()) { window.location.replace('login.html'); return false; } return true; },
  requireRole(...roles) {
    if (!this.requireAuth()) return false;
    if (!AuthState.hasRole(...roles)) { window.location.replace('unauthorized.html'); return false; }
    return true;
  },
  afterLogin() {
    const role = AuthState.getRole();
    const routes = { super_admin:'admin-dashboard.html', admin:'admin-dashboard.html', sub_admin:'subadmin-dashboard.html', student:'student-dashboard.html' };
    window.location.href = routes[role] || 'login.html';
  },
};

/* ── Sidebar (mobile-first) ── */
const Sidebar = {
  init() {
    // Attach toggle to ALL menu-toggle buttons (including dynamically added ones)
    this._attachToggle();
    // Close on overlay click
    document.addEventListener('click', e => {
      if (e.target.classList.contains('sidebar-overlay') || e.target.id === 'sidebar-overlay') {
        this.close();
      }
    });
    // Close sidebar when nav item is clicked on mobile
    document.addEventListener('click', e => {
      if (window.innerWidth < 769 && e.target.closest('.nav-item')) {
        setTimeout(() => this.close(), 150);
      }
    });
  },
  _attachToggle() {
    document.querySelectorAll('#menu-toggle, .menu-toggle').forEach(btn => {
      if (!btn._sidebarBound) {
        btn._sidebarBound = true;
        btn.addEventListener('click', e => { e.stopPropagation(); Sidebar.toggle(); });
      }
    });
  },
  open() {
    document.querySelector('.sidebar')?.classList.add('open');
    document.getElementById('sidebar-overlay')?.classList.add('show');
    document.querySelector('.sidebar-overlay:not(#sidebar-overlay)')?.classList.add('show');
    if (window.innerWidth < 769) document.body.style.overflow = 'hidden';
  },
  close() {
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelectorAll('.sidebar-overlay').forEach(el => el.classList.remove('show'));
    document.body.style.overflow = '';
  },
  toggle() {
    document.querySelector('.sidebar')?.classList.contains('open') ? this.close() : this.open();
  },
};

/* ── Page Loader ── */
const PageLoader = {
  show() { document.getElementById('page-loader')?.classList.remove('hidden'); },
  hide() { setTimeout(() => document.getElementById('page-loader')?.classList.add('hidden'), 350); },
};

/* ── Dropdown ── */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-dropdown]');
  if (t) {
    e.stopPropagation();
    const id = t.dataset.dropdown; const el = document.getElementById(id);
    const open = el?.classList.contains('open');
    document.querySelectorAll('.dropdown-menu.open,.notif-dropdown.open').forEach(d => d.classList.remove('open'));
    if (el && !open) el.classList.add('open');
    return;
  }
  document.querySelectorAll('.dropdown-menu.open,.notif-dropdown.open').forEach(d => d.classList.remove('open'));
});

/* ── Tabs ── */
function initTabs(container) {
  const tabs = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('[data-panel]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      container.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.remove('hidden');
    });
  });
  if (tabs.length && !container.querySelector('.tab-btn.active')) tabs[0].click();
}

/* ── Upload Zone ── */
function initUploadZone(zone, input, onFile) {
  if (!zone || !input) return;
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', e => { if (e.target.files.length) onFile(e.target.files); });
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); if (e.dataTransfer.files.length) onFile(e.dataTransfer.files); });
}

/* ── Loading state ── */
function setLoading(btn, loading, text = '') {
  if (!btn) return;
  if (loading) {
    btn._orig = btn.innerHTML;
    btn.innerHTML = `<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;vertical-align:middle"></span>${text ? ' ' + text : ''}`;
    btn.disabled = true;
  } else { btn.innerHTML = btn._orig || btn.innerHTML; btn.disabled = false; }
}

/* ── Skeleton loader ── */
function showSkeleton(el, count = 3, height = '70px', radius = '12px') {
  if (!el) return;
  el.innerHTML = Array(count).fill(`<div class="skeleton mb-2" style="height:${height};border-radius:${radius}"></div>`).join('');
}

/* ── Format helpers ── */
const Fmt = {
  date(d)     { return d ? new Date(d).toLocaleDateString('en-NG', { day:'2-digit', month:'short', year:'numeric' }) : '—'; },
  datetime(d) { return d ? new Date(d).toLocaleString('en-NG', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'; },
  timeAgo(d) {
    if (!d) return '—';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`;
  },
  grade(score) {
    const s = parseFloat(score);
    if (s >= 70) return { g:'A', r:'Excellent', cls:'text-success',  bg:'badge-approved' };
    if (s >= 60) return { g:'B', r:'Very Good', cls:'text-success',  bg:'badge-approved' };
    if (s >= 50) return { g:'C', r:'Good',      cls:'text-gold',     bg:'badge-gold'     };
    if (s >= 45) return { g:'D', r:'Fair',       cls:'text-warning',  bg:'badge-pending'  };
    if (s >= 40) return { g:'E', r:'Poor',        cls:'text-warning',  bg:'badge-pending'  };
    return             { g:'F', r:'Fail',        cls:'text-danger',   bg:'badge-rejected' };
  },
  gradeColor(g) {
    return { A:'var(--success)', B:'#60A5FA', C:'var(--warning)', D:'#FB923C', E:'var(--danger)', F:'var(--danger)' }[g] || 'var(--text-muted)';
  },
  number(n)   { return n == null ? '—' : Number(n).toLocaleString(); },
  percent(n)  { return n == null ? '—' : `${Number(n).toFixed(1)}%`; },
  ordinal(n)  { if (!n) return '—'; const s = ['th','st','nd','rd'], v = n % 100; return n + (s[(v-20)%10] || s[v] || s[0]); },
  initials(name) { if (!name) return '?'; return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2); },
  generateUsername(fn, mn, ln, dob) {
    const yr2 = dob ? String(new Date(dob).getFullYear()).slice(-2) : '';
    return (fn + mn + ln).toLowerCase().replace(/[^a-z0-9]/g, '') + yr2;
  },
  generatePassword(dob) {
    if (!dob) return '123456';
    const d = new Date(dob);
    return `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getFullYear()).slice(-2)}`;
  },
  fileSize(bytes) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`; return `${(bytes/1048576).toFixed(1)} MB`; },
};

/* ── Pagination ── */
function renderPagination(container, { page, total, perPage, onChange }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) { container.innerHTML = ''; return; }
  let html = `<button class="page-btn" ${page<=1?'disabled':''} onclick="(${onChange})(${page-1})"><i class="fas fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages; i++) {
    if (pages > 7 && (i > 3 && i < pages - 1 && Math.abs(i - page) > 1)) { if (i===4||i===pages-2) html += '<span class="page-btn" style="pointer-events:none;border:none">…</span>'; continue; }
    html += `<button class="page-btn ${i===page?'active':''}" onclick="(${onChange})(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${page>=pages?'disabled':''} onclick="(${onChange})(${page+1})"><i class="fas fa-chevron-right"></i></button>`;
  container.innerHTML = html;
}

/* ── Table search ── */
function initTableSearch(inp, table) {
  if (!inp || !table) return;
  inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase();
    table.querySelectorAll('tbody tr').forEach(r => r.style.display = !q || r.textContent.toLowerCase().includes(q) ? '' : 'none');
  });
}

/* ── Password toggle ── */
function togglePwd(id, btn) {
  const inp = document.getElementById(id); if (!inp) return;
  const icon = btn?.querySelector('i') || btn;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  if (icon) icon.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

/* ── Score validation ── */
function validateScore(input, max = 100) {
  const v = parseFloat(input.value); const over = isNaN(v) || v < 0 || v > max;
  input.classList.toggle('over-limit', over); return !over;
}

/* ── CSV export ── */
function exportCSV(data, filename = 'export.csv') {
  if (!data?.length) { Toast.warning('No data', 'Nothing to export.'); return; }
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(r => headers.map(h => `"${(r[h]??'').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

/* ── Notifications ── */
async function loadNotifications(badgeEl, listEl) {
  try {
    const d = await API.notifications.list({ per_page: 15 });
    const items = d.items || [];
    if (badgeEl) { const cnt = items.filter(n => !n.read).length; badgeEl.style.display = cnt > 0 ? '' : 'none'; }
    if (listEl) {
      const imap = { approved:'fa-check-circle', rejected:'fa-times-circle', correction:'fa-rotate', upload:'fa-upload', promotion:'fa-arrow-up' };
      const cmap = { approved:'success', rejected:'red', correction:'blue', upload:'gold', promotion:'gold' };
      listEl.innerHTML = items.length
        ? items.map(n => `<div class="notif-item ${n.read?'':'unread'}" onclick="API.notifications.markRead('${n.id}');this.classList.remove('unread')">
            <div class="notif-icon ${cmap[n.type]||'blue'}"><i class="fas ${imap[n.type]||'fa-bell'}"></i></div>
            <div class="flex-1"><div class="notif-text"><strong>${Security.sanitize(n.title||'')}</strong><br>${Security.sanitize(n.message||'')}</div><div class="notif-time">${Fmt.timeAgo(n.created_at)}</div></div>
          </div>`).join('')
        : '<div style="padding:24px;text-align:center;font-size:.83rem;color:var(--text-muted)">No notifications</div>';
    }
  } catch {}
}

/* ── Chart defaults ── */
const ChartColors = { gold:'#C9973A', green:'#22C55E', red:'#EF4444', blue:'#3B82F6', purple:'#A855F7', teal:'#14B8A6', orange:'#F97316', multi:['#C9973A','#22C55E','#3B82F6','#EF4444','#A855F7','#F97316','#14B8A6','#F59E0B'] };
const ChartDefaults = {
  apply() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#A8B2C8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family = "'DM Sans',sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.backgroundColor = '#0B1829';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(201,151,58,0.35)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.animation.duration = 600;
  }
};

/* ── School Classes ── */
window.SCHOOL_CLASSES = ['Creche','Daycare','Pre-Nursery','KG 1','KG 2','KG 3',
  'Primary 1','Primary 2','Primary 3','Primary 4','Primary 5',
  'JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];

window.populateClassSelect = function(selectEl, emptyLabel, addAll) {
  if (!selectEl) return;
  emptyLabel = emptyLabel || 'All Classes'; addAll = addAll !== false;
  const current = selectEl.value;
  selectEl.innerHTML = addAll ? `<option value="">${emptyLabel}</option>` : '';
  SCHOOL_CLASSES.forEach(cls => {
    const o = document.createElement('option'); o.value = cls; o.textContent = cls;
    if (cls === current) o.selected = true; selectEl.appendChild(o);
  });
};

/* ── Logout handler (global click delegation) ── */
(function attachLogout() {
  document.addEventListener('click', function(e) {
    let el = e.target;
    while (el && el !== document) {
      if (el.getAttribute?.('data-action') === 'logout' || el.id === 'logout-btn') {
        e.preventDefault(); e.stopImmediatePropagation();
        document.querySelectorAll('.dropdown-menu.open').forEach(d => d.classList.remove('open'));
        const clear = () => { sessionStorage.clear(); AuthState.clear(); window.location.replace('login.html'); };
        API.auth.logout().then(clear).catch(clear);
        return;
      }
      el = el.parentElement;
    }
  }, true);
})();

/* ── Page Init (called on every protected page) ── */
window.pageInit = function(roles) {
  if (roles) Router.requireRole(...(Array.isArray(roles) ? roles : [roles]));
  Sidebar.init();
  const user = AuthState.getUser();
  if (user) {
    document.querySelectorAll('.user-avatar-init').forEach(el => el.textContent = Fmt.initials(user.full_name || '?'));
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.full_name || '—');
    document.querySelectorAll('.user-role-display').forEach(el => el.textContent = user.role || '—');
    document.querySelectorAll('.user-class-display').forEach(el => el.textContent = user.class_name || '—');
  }
  // Mark active nav item
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[href]').forEach(link => {
    if (link.getAttribute('href').split('?')[0] === path) link.classList.add('active');
  });
};

/* ── Load current session into topbar ── */
window.loadCurrentSession = async function() {
  try {
    const d = await API.sessions.current();
    document.querySelectorAll('[data-global-session]').forEach(el => el.textContent = d.session_name || '—');
    document.querySelectorAll('[data-global-term]').forEach(el => el.textContent = d.term_name || '—');
  } catch {}
};

/* ── Load pending badge count ── */
window.loadPendingBadge = async function() {
  try {
    const d = await API.results.pending({ per_page: 1 });
    document.querySelectorAll('#pending-badge').forEach(b => {
      const cnt = d.total || 0; b.textContent = cnt; b.style.display = cnt > 0 ? '' : 'none';
    });
  } catch {}
};

/* ── DOM ready ── */
document.addEventListener('DOMContentLoaded', async () => {
  await window.__rmsBootstrapReady;
  Toast.init();
  Sidebar.init();
  AuthState.load();
  ChartDefaults.apply();
  document.querySelectorAll('[data-tabs]').forEach(initTabs);
  PageLoader.hide();
});

/* ── Global exports ── */
window.JaasielRMS = { CONFIG, Security, TokenManager, AuthState, API, Toast, Modal, Validator, Router, Sidebar, PageLoader, Fmt, ChartColors, ChartDefaults, initTabs, initUploadZone, validateScore, setLoading, showSkeleton, renderPagination, initTableSearch, togglePwd, exportCSV, loadNotifications };
window.Modal = Modal; window.Toast = Toast; window.Sidebar = Sidebar; window.Validator = Validator;
window.AuthState = AuthState; window.Router = Router; window.Fmt = Fmt; window.TokenManager = TokenManager;
window.PageLoader = PageLoader; window.setLoading = setLoading; window.togglePwd = togglePwd;
window.exportCSV = exportCSV; window.loadNotifications = loadNotifications;
window.showSkeleton = showSkeleton; window.renderPagination = renderPagination; window.API = API;
window.initUploadZone = initUploadZone; window.initTableSearch = initTableSearch; window.validateScore = validateScore;