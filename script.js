// ─── Apply config ─────────────────────────────────────────────────────────────
(function applyConfig() {
  const c = CONFIG;

  const title = c.pageTitle || c.username;
  const desc  = c.bio;

  document.getElementById('page-title').textContent = title;
  document.getElementById('username').textContent   = c.username;
  document.getElementById('uid').textContent        = `UID ${c.uid}`;
  document.getElementById('bio').textContent        = desc;

  const avatarEl = document.getElementById('avatar');
  avatarEl.src = c.avatar;

  avatarEl.onerror = () => {
    avatarEl.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${c.username}`;
  };

  // Badges
  const badgesEl = document.getElementById('badges');
  (c.badges || []).forEach(b => {
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = `${b.icon} ${b.label}`;
    badgesEl.appendChild(span);
  });

  // Socials
  const socialsEl = document.getElementById('socials');
  (c.socials || []).forEach(s => {
    const a = document.createElement('a');
    a.className   = 'social-link';
    a.href        = s.url;
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';
    a.innerHTML   = `<i class="${s.icon}"></i><span>${s.label}</span><i class="fas fa-arrow-up-right-from-square social-arrow"></i>`;
    socialsEl.appendChild(a);
  });

  // Accent colours
  if (c.accentPrimary)   document.documentElement.style.setProperty('--accent',  c.accentPrimary);
  if (c.accentSecondary) document.documentElement.style.setProperty('--accent2', c.accentSecondary);
})();

// ─── Splash ───────────────────────────────────────────────────────────────────
const splash = document.getElementById('splash');
const main   = document.getElementById('main');

splash.addEventListener('click', enter);
document.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') enter(); });

function enter() {
  splash.classList.add('fade-out');
  main.classList.remove('hidden');
  setTimeout(() => {
    main.classList.add('visible');
    splash.style.display = 'none';
    spawnParticles();
  }, 280);
}

// ─── Particles ────────────────────────────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  const colors    = [CONFIG.accentPrimary || '#a78bfa', CONFIG.accentSecondary || '#60a5fa', '#f472b6', '#34d399'];

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size  = 1 + Math.random() * 2.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      left:       ${Math.random() * 100}%;
      width:      ${size}px;
      height:     ${size}px;
      background: ${color};
      --dur:      ${7 + Math.random() * 9}s;
      --delay:    ${Math.random() * 12}s;
    `;
    container.appendChild(p);
  }
}
