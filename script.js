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

  const badgesEl = document.getElementById('badges');
  (c.badges || []).forEach(b => {
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = `${b.icon} ${b.label}`;
    badgesEl.appendChild(span);
  });

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

  if (c.accentPrimary)   document.documentElement.style.setProperty('--accent',  c.accentPrimary);
  if (c.accentSecondary) document.documentElement.style.setProperty('--accent2', c.accentSecondary);
})();

// ─── Playlist ─────────────────────────────────────────────────────────────────
const playlist = [
  { src: 'assets/music1.mp3', title: 'My Ordinary Life', artist: 'The Living Tombstone' },
  { src: 'assets/music2.mp3', title: 'Dream Running',   artist: '—' },
  { src: 'assets/music3.mp3', title: 'Moan',            artist: '—' },
];
let currentTrack = 0;

// ─── Splash ───────────────────────────────────────────────────────────────────
let entered = false;
const splash = document.getElementById('splash');
const main   = document.getElementById('main');

splash.addEventListener('click', enter);
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    enter();
  }
});

function enter() {
  if (entered) return;
  entered = true;
  splash.classList.add('fade-out');
  main.classList.remove('hidden');
  setupMusic();
  loadTrack(0);
  audio.play().then(() => {
    document.getElementById('music-play').innerHTML = '<i class="fas fa-pause"></i>';
  }).catch(() => {});
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

// ─── Music player ─────────────────────────────────────────────────────────────
const audio = document.getElementById('audio-player');
let seeking = false;

function setupMusic() {
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

  cover.style.display = 'none';
  const fallbackIcon = document.createElement('i');
  fallbackIcon.className = 'fas fa-music fallback';
  fallbackIcon.style.cssText = 'font-size:1.4rem;color:var(--muted)';
  cover.parentElement.appendChild(fallbackIcon);

  audio.volume = parseFloat(volSlider.value);

  function updateDur() {
    if (audio.duration && isFinite(audio.duration)) {
      durEl.textContent = formatTime(audio.duration);
    }
  }

  audio.addEventListener('loadedmetadata', updateDur);
  audio.addEventListener('durationchange', updateDur);
  audio.addEventListener('canplay', updateDur);

  audio.addEventListener('timeupdate', () => {
    if (audio.duration && isFinite(audio.duration)) {
      if (!seeking) {
        progress.value = (audio.currentTime / audio.duration) * 100;
        curEl.textContent = formatTime(audio.currentTime);
        if (durEl.textContent === '0:00' || durEl.textContent === '—') {
          durEl.textContent = formatTime(audio.duration);
        }
      }
    }
  });

  const togglePlay = () => {
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }).catch(() => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
      });
    } else {
      audio.pause();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  };

  playBtn.addEventListener('click', togglePlay);

  prevBtn.addEventListener('click', () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
    if (audio.paused) togglePlay();
  });

  nextBtn.addEventListener('click', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    if (audio.paused) togglePlay();
  });

  progress.addEventListener('input', () => {
    seeking = true;
    if (audio.duration && isFinite(audio.duration)) {
      curEl.textContent = formatTime((progress.value / 100) * audio.duration);
    }
  });

  progress.addEventListener('change', () => {
    if (audio.duration && isFinite(audio.duration)) {
      audio.currentTime = (progress.value / 100) * audio.duration;
    }
    seeking = false;
  });

  audio.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    audio.play().then(() => {
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }).catch(() => {
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
  });

  volSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volSlider.value);
    volIcon.className = audio.volume === 0
      ? 'fas fa-volume-xmark'
      : audio.volume < 0.5
        ? 'fas fa-volume-low'
        : 'fas fa-volume-high';
  });
}

function loadTrack(index) {
  const track = playlist[index];
  audio.src = track.src;
  audio.load();
  document.getElementById('music-title').textContent = track.title;
  document.getElementById('music-artist').textContent = track.artist;
  document.getElementById('music-progress').value = 0;
  document.getElementById('music-current').textContent = '0:00';
  document.getElementById('music-duration').textContent = '—';
}

function formatTime(sec) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
