// ─── Apply config ─────────────────────────────────────────────────────────────
(function applyConfig() {
  const c = CONFIG;

  const title = c.pageTitle || c.username;

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
    initMusic();
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

// ─── Music player ─────────────────────────────────────────────────────────────
let audio = null;
let seeking = false;

function initMusic() {
  const musicEl   = document.getElementById('music');
  const playBtn   = document.getElementById('music-play');
  const prevBtn   = document.getElementById('music-prev');
  const nextBtn   = document.getElementById('music-next');
  const progress  = document.getElementById('music-progress');
  const curEl     = document.getElementById('music-current');
  const durEl     = document.getElementById('music-duration');
  const volSlider = document.getElementById('volume-slider');
  const volIcon   = document.getElementById('volume-icon');
  const cover     = document.getElementById('music-cover');

  musicEl.style.display = 'flex';

  if (!audio) {
    audio = new Audio('assets/music.mp3');
    audio.preload = 'auto';
    audio.volume = parseFloat(volSlider.value);
    audio.load();
  }

  cover.style.display = 'none';
  const fallbackIcon = document.createElement('i');
  fallbackIcon.className = 'fas fa-music fallback';
  fallbackIcon.style.cssText = 'font-size:1.4rem;color:var(--muted)';
  cover.parentElement.appendChild(fallbackIcon);

  const setCover = (src) => {
    if (src) {
      cover.src = src;
      cover.style.display = 'block';
      cover.onerror = () => { cover.style.display = 'none'; };
    }
  };

  jsmediatags.read('assets/music.mp3', {
    onSuccess: (tag) => {
      const t = tag.tags;
      if (t.picture) {
        const { data, format } = t.picture;
        const bytes = new Uint8Array(data);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        setCover(`data:${format};base64,${btoa(binary)}`);
      }
      document.getElementById('music-title').textContent = t.title || 'My Ordinary Life';
      document.getElementById('music-artist').textContent = t.artist || 'The Living Tombstone';
    },
    onError: () => {}
  });

  audio.addEventListener('error', (e) => {
    durEl.textContent = 'ERR';
    playBtn.disabled = true;
  });

  audio.addEventListener('loadedmetadata', () => {
    durEl.textContent = formatTime(audio.duration);
  });

  const togglePlay = () => {
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }).catch(() => {});
    } else {
      audio.pause();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  };

  playBtn.addEventListener('click', togglePlay);

  prevBtn.addEventListener('click', () => {
    audio.currentTime = 0;
    progress.value = 0;
    curEl.textContent = '0:00';
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }).catch(() => {});
    }
  });

  nextBtn.addEventListener('click', () => {
    audio.currentTime = 0;
    progress.value = 0;
    curEl.textContent = '0:00';
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }).catch(() => {});
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (!seeking && audio.duration) {
      progress.value = (audio.currentTime / audio.duration) * 100;
      curEl.textContent = formatTime(audio.currentTime);
    }
  });

  progress.addEventListener('input', () => {
    seeking = true;
    if (audio.duration) {
      curEl.textContent = formatTime((progress.value / 100) * audio.duration);
    }
  });

  progress.addEventListener('change', () => {
    if (audio.duration) {
      audio.currentTime = (progress.value / 100) * audio.duration;
    }
    seeking = false;
  });

  audio.addEventListener('ended', () => {
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    progress.value = 0;
    curEl.textContent = '0:00';
  });

  volSlider.addEventListener('input', () => {
    if (audio) {
      audio.volume = parseFloat(volSlider.value);
    }
    volIcon.className = audio.volume === 0
      ? 'fas fa-volume-xmark'
      : audio.volume < 0.5
        ? 'fas fa-volume-low'
        : 'fas fa-volume-high';
  });
}

function formatTime(sec) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
