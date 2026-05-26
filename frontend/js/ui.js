/* =====================================================
   JAASIEL RMS — Shared UI Components v5.0
   Logo on all pages, mobile-first sidebars,
   role-based nav (buttons only shown to authorized roles)
   ===================================================== */
'use strict';

const LOGO_HTML = `<img src="images/logo.png" alt="Jaasiel Logo" style="width:44px;height:44px;border-radius:50%;object-fit:contain;background:#0B1A35;flex-shrink:0" onerror="this.style.display='none'">`;

/* ── Admin Sidebar ── */
window.buildAdminSidebar = function() { return `
  <div class="sidebar-brand">
    ${LOGO_HTML}
    <div><div class="brand-name">Jaasiel RMS</div><div class="brand-sub">Admin Portal</div></div>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-section"><div class="nav-section-label">Main</div>
      <a href="admin-dashboard.html" class="nav-item"><i class="fas fa-house-chimney"></i><span>Dashboard</span></a>
      <a href="results-approval.html" class="nav-item"><i class="fas fa-clipboard-check"></i><span>Result Approvals</span><span class="nav-badge" id="pending-badge" style="display:none">0</span></a>
      <a href="analytics.html" class="nav-item"><i class="fas fa-chart-mixed"></i><span>Analytics</span></a>
    </div>
    <div class="nav-section"><div class="nav-section-label">Management</div>
      <a href="students.html" class="nav-item"><i class="fas fa-graduation-cap"></i><span>Students</span></a>
      <a href="classes.html" class="nav-item"><i class="fas fa-school"></i><span>Classes &amp; Subjects</span></a>
      <a href="sessions.html" class="nav-item"><i class="fas fa-calendar-days"></i><span>Sessions &amp; Terms</span></a>
    </div>
    <div class="nav-section"><div class="nav-section-label">System</div>
      <a href="ocr-monitor.html" class="nav-item"><i class="fas fa-robot"></i><span>OCR Monitor</span></a>
      <a href="audit-logs.html" class="nav-item"><i class="fas fa-shield-check"></i><span>Audit Logs</span></a>
      <a href="settings.html" class="nav-item"><i class="fas fa-gear"></i><span>Settings</span></a>
    </div>
  </nav>
  <div class="sidebar-footer"><div class="sidebar-user">
    <div class="avatar avatar-sm user-avatar-init">AD</div>
    <div class="user-info"><div class="user-name user-name-display">Administrator</div><div class="user-role">Super Admin</div></div>
    <div class="dropdown">
      <button class="topbar-action" style="background:transparent;border:none" data-dropdown="sb-ad-dd"><i class="fas fa-ellipsis-vertical" style="font-size:.8rem;color:var(--text-muted)"></i></button>
      <div class="dropdown-menu" id="sb-ad-dd" style="bottom:100%;top:auto;right:0">
        <a href="settings.html" class="dropdown-item"><i class="fas fa-user-pen"></i> Edit Profile</a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item danger" data-action="logout"><i class="fas fa-right-from-bracket"></i> Sign Out</button>
      </div>
    </div>
  </div></div>`; };

/* ── Sub Admin Sidebar ── */
window.buildSubAdminSidebar = function() { return `
  <div class="sidebar-brand">
    ${LOGO_HTML}
    <div><div class="brand-name">Jaasiel RMS</div><div class="brand-sub">Sub Admin Portal</div></div>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-section"><div class="nav-section-label">Main</div>
      <a href="subadmin-dashboard.html" class="nav-item"><i class="fas fa-house-chimney"></i><span>Dashboard</span></a>
      <a href="ocr-upload.html" class="nav-item"><i class="fas fa-robot"></i><span>AI OCR Upload</span></a>
      <a href="manual-entry.html" class="nav-item"><i class="fas fa-keyboard"></i><span>Manual Entry</span></a>
      <a href="upload-history.html" class="nav-item"><i class="fas fa-clock-rotate-left"></i><span>My Uploads</span></a>
    </div>
    <div class="nav-section"><div class="nav-section-label">Students</div>
      <a href="students.html" class="nav-item"><i class="fas fa-graduation-cap"></i><span>Students</span></a>
      <a href="add-student.html" class="nav-item"><i class="fas fa-user-plus"></i><span>Register Student</span></a>
      <a href="bulk-upload.html" class="nav-item"><i class="fas fa-file-arrow-up"></i><span>Bulk Upload</span></a>
    </div>
    <div class="nav-section"><div class="nav-section-label">Account</div>
      <a href="settings.html" class="nav-item"><i class="fas fa-gear"></i><span>Settings</span></a>
    </div>
  </nav>
  <div class="sidebar-footer"><div class="sidebar-user">
    <div class="avatar avatar-sm user-avatar-init">SA</div>
    <div class="user-info"><div class="user-name user-name-display">Sub Admin</div><div class="user-role">Sub Admin</div></div>
    <div class="dropdown">
      <button class="topbar-action" style="background:transparent;border:none" data-dropdown="sb-sa-dd"><i class="fas fa-ellipsis-vertical" style="font-size:.8rem;color:var(--text-muted)"></i></button>
      <div class="dropdown-menu" id="sb-sa-dd" style="bottom:100%;top:auto;right:0">
        <a href="settings.html" class="dropdown-item"><i class="fas fa-user-pen"></i> Edit Profile</a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item danger" data-action="logout"><i class="fas fa-right-from-bracket"></i> Sign Out</button>
      </div>
    </div>
  </div></div>`; };

/* ── Student Sidebar ── */
window.buildStudentSidebar = function() { return `
  <div class="sidebar-brand">
    ${LOGO_HTML}
    <div><div class="brand-name">Jaasiel RMS</div><div class="brand-sub">Student Portal</div></div>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-section"><div class="nav-section-label">My Portal</div>
      <a href="student-dashboard.html" class="nav-item"><i class="fas fa-house-chimney"></i><span>Dashboard</span></a>
      <a href="my-results.html" class="nav-item"><i class="fas fa-list-check"></i><span>My Results</span></a>
      <a href="report-card.html" class="nav-item"><i class="fas fa-file-pdf"></i><span>Report Card</span></a>
      <a href="transcript.html" class="nav-item"><i class="fas fa-scroll"></i><span>Transcript</span></a>
    </div>
    <div class="nav-section"><div class="nav-section-label">Account</div>
      <a href="student-settings.html" class="nav-item"><i class="fas fa-key"></i><span>Change Password</span></a>
    </div>
  </nav>
  <div class="sidebar-footer"><div class="sidebar-user">
    <div class="avatar avatar-sm user-avatar-init">ST</div>
    <div class="user-info"><div class="user-name user-name-display">Student</div><div class="user-role user-class-display">—</div></div>
    <div class="dropdown">
      <button class="topbar-action" style="background:transparent;border:none" data-dropdown="sb-st-dd"><i class="fas fa-ellipsis-vertical" style="font-size:.8rem;color:var(--text-muted)"></i></button>
      <div class="dropdown-menu" id="sb-st-dd" style="bottom:100%;top:auto;right:0">
        <a href="student-settings.html" class="dropdown-item"><i class="fas fa-key"></i> Change Password</a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item danger" data-action="logout"><i class="fas fa-right-from-bracket"></i> Sign Out</button>
      </div>
    </div>
  </div></div>`; };

/* ── Topbar Right ── */
window.buildTopbarRight = function() { return `
  <div class="session-pill" onclick="window.location='sessions.html'" style="cursor:pointer;display:flex;align-items:center;gap:6px;padding:5px 12px;background:rgba(255,255,255,.05);border-radius:20px;border:1px solid var(--border-light)">
    <i class="fas fa-calendar-check" style="font-size:.7rem;color:var(--brand-gold)"></i>
    <span data-global-session style="font-size:.78rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">—</span>
    <span style="opacity:.4">·</span>
    <span data-global-term style="font-size:.78rem;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">—</span>
  </div>
  <div style="position:relative">
    <button class="topbar-action" data-dropdown="notif-dd" onclick="loadNotifOnce()">
      <i class="fas fa-bell"></i>
      <div class="notif-dot" id="notif-dot" style="display:none"></div>
    </button>
    <div class="notif-dropdown" id="notif-dd">
      <div class="notif-header">
        <span style="font-weight:700;font-size:.88rem">Notifications</span>
        <button onclick="API.notifications.markAll().then(()=>{document.querySelectorAll('.notif-item.unread').forEach(e=>e.classList.remove('unread'));document.getElementById('notif-dot').style.display='none'})" style="font-size:.75rem;color:var(--brand-gold);background:none;border:none;cursor:pointer">Mark all read</button>
      </div>
      <div id="notif-list" style="max-height:320px;overflow-y:auto">
        <div style="padding:24px;text-align:center;color:var(--text-muted);font-size:.83rem">Loading…</div>
      </div>
    </div>
  </div>
  <div style="position:relative">
    <button class="topbar-action" data-dropdown="topbar-user-dd" style="display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:var(--radius);width:auto">
      <div class="avatar avatar-xs user-avatar-init">?</div>
      <span class="user-name-display" style="font-size:.8rem;font-weight:600;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:none" id="topbar-name">—</span>
      <i class="fas fa-chevron-down" style="font-size:.65rem;color:var(--text-muted)"></i>
    </button>
    <div class="dropdown-menu" id="topbar-user-dd" style="right:0;min-width:200px">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border-light)">
        <div style="font-weight:700;font-size:.88rem" class="user-name-display">—</div>
        <div style="font-size:.75rem;color:var(--text-muted)" class="user-role-display">—</div>
      </div>
      <a href="settings.html" class="dropdown-item"><i class="fas fa-user-pen"></i> Edit Profile</a>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item danger" data-action="logout"><i class="fas fa-right-from-bracket"></i> Sign Out</button>
    </div>
  </div>`; };

let _notifLoaded = false;
window.loadNotifOnce = function() {
  if (_notifLoaded) return; _notifLoaded = true;
  loadNotifications(document.getElementById('notif-dot'), document.getElementById('notif-list'));
};

/* ─────────────────────────────────────────────────────────
   initPage — core function every protected page calls
   ─────────────────────────────────────────────────────────*/
window.initPage = function(roles, sidebarType) {
  const rolesArr = Array.isArray(roles) ? roles : [roles];
  Router.requireRole(...rolesArr);

  const sb = document.getElementById('sidebar');
  if (sb) {
    if      (sidebarType === 'student')  sb.innerHTML = buildStudentSidebar();
    else if (sidebarType === 'subadmin') sb.innerHTML = buildSubAdminSidebar();
    else                                  sb.innerHTML = buildAdminSidebar();
  }

  const tr = document.getElementById('topbar-right');
  if (tr) tr.innerHTML = buildTopbarRight();

  // Show topbar name on wider screens
  const nameEl = document.getElementById('topbar-name');
  if (nameEl) {
    const user = AuthState.getUser();
    if (user) {
      nameEl.textContent = user.full_name?.split(' ')[0] || '—';
      nameEl.style.display = window.innerWidth > 640 ? '' : 'none';
    }
  }

  pageInit(rolesArr);
  loadCurrentSession();
  if (sidebarType !== 'student') loadPendingBadge();

  // Mark active nav
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[href]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href').split('?')[0] === path);
  });
};