/* ===== DARK MODE ===== */
(function () {
  var saved = localStorage.getItem('revd-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleDarkMode() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('revd-theme', next);
  updateDarkIcon();
}

function updateDarkIcon() {
  var btn = document.getElementById('darkModeToggle');
  if (!btn) return;
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = isDark
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  btn.title = isDark ? 'Mode Terang' : 'Mode Gelap';
}

document.addEventListener('DOMContentLoaded', function () {
  updateDarkIcon();
});

/* ===== SPLASH SCREEN ===== */
function initSplash() {
  var splash = document.getElementById('splashScreen');
  if (!splash) return;
  var params = new URLSearchParams(window.location.search);
  var delay = params.get('nosplash') ? 0 : 2000;
  setTimeout(function () {
    splash.classList.add('hide');
  }, delay);
}

/* ===== COUNTDOWN TIMER ===== */
var countdownInterval = null;
var waAlertShown = false;
var totalSeconds = 0;
var initialSeconds = 0;
var WA_NUMBER = '6288214672165';

function parseTimeString(str) {
  if (!str) return 0;
  str = str.trim();
  var total = 0;
  var hMatch = str.match(/(\d+)h/);
  var mMatch = str.match(/(\d+)m/);
  var sMatch = str.match(/(\d+)s/);
  if (hMatch) total += parseInt(hMatch[1]) * 3600;
  if (mMatch) total += parseInt(mMatch[1]) * 60;
  if (sMatch) total += parseInt(sMatch[1]);
  if (total === 0) {
    var parts = str.split(':');
    if (parts.length === 3) {
      total = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    } else if (parts.length === 2) {
      total = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else {
      total = parseInt(str) || 0;
    }
  }
  return total;
}

function formatCountdown(secs) {
  if (secs <= 0) return '00:00:00';
  var h = Math.floor(secs / 3600);
  var m = Math.floor((secs % 3600) / 60);
  var s = secs % 60;
  return (h > 0 ? String(h).padStart(2, '0') + ':' : '') +
    String(m).padStart(2, '0') + ':' +
    String(s).padStart(2, '0');
}

function updateCountdownUI() {
  var display = document.getElementById('countdownDisplay');
  var card = document.getElementById('countdownCard');
  var fill = document.getElementById('progressFill');
  if (!display || !card) return;

  display.textContent = formatCountdown(totalSeconds);

  var pct = initialSeconds > 0 ? (totalSeconds / initialSeconds) * 100 : 0;
  if (fill) fill.style.setProperty('--fill-pct', pct + '%');

  if (totalSeconds <= 600 && totalSeconds > 0) {
    card.classList.add('warning');
    if (!waAlertShown) {
      waAlertShown = true;
      showWaAlert();
    }
  } else {
    card.classList.remove('warning');
  }

  if (totalSeconds <= 0) {
    clearInterval(countdownInterval);
    display.textContent = 'HABIS';
  }
}

function showWaAlert() {
  var alert = document.getElementById('waAlert');
  if (!alert) return;
  alert.classList.add('show');
}

function closeWaAlert() {
  var alert = document.getElementById('waAlert');
  if (alert) alert.classList.remove('show');
}

function openWaRenew(username) {
  var name = username || 'Pengguna';
  var msg = encodeURIComponent('Halo Admin, saya ingin memperpanjang koneksi. Username: ' + name + '. Mohon bantuannya.');
  window.open('https://wa.me/' + WA_NUMBER + '?' + 'text=' + msg, '_blank');
  closeWaAlert();
}

function initCountdown() {
  var timeEl = document.getElementById('sessionTimeLeft');
  var card = document.getElementById('countdownCard');
  if (!timeEl || !card) return;

  var rawTime = timeEl.textContent || timeEl.innerText || '';
  rawTime = rawTime.replace(/\$/g, '').replace(/[()]/g, '').trim();

  if (!rawTime || rawTime.indexOf('session') !== -1 || rawTime === '') {
    card.style.display = 'none';
    return;
  }

  totalSeconds = parseTimeString(rawTime);
  initialSeconds = totalSeconds;

  if (totalSeconds <= 0) {
    card.style.display = 'none';
    return;
  }

  updateCountdownUI();
  countdownInterval = setInterval(function () {
    totalSeconds--;
    updateCountdownUI();
  }, 1000);
}

/* ===== DATA USAGE BARS ===== */
function initUsageBars() {
  var uploadEl = document.getElementById('usageUpload');
  var downloadEl = document.getElementById('usageDownload');
  if (!uploadEl || !downloadEl) return;

  var uploadText = uploadEl.textContent.trim();
  var downloadText = downloadEl.textContent.trim();

  function parseBytes(str) {
    if (!str) return 0;
    var num = parseFloat(str);
    if (isNaN(num)) return 0;
    var s = str.toLowerCase();
    if (s.indexOf('gib') !== -1 || s.indexOf('gb') !== -1) return num * 1024;
    if (s.indexOf('mib') !== -1 || s.indexOf('mb') !== -1) return num;
    if (s.indexOf('kib') !== -1 || s.indexOf('kb') !== -1) return num / 1024;
    return num / (1024 * 1024);
  }

  var up = parseBytes(uploadText);
  var down = parseBytes(downloadText);
  var maxVal = Math.max(up, down, 1);

  var upFill = document.getElementById('uploadFill');
  var downFill = document.getElementById('downloadFill');
  if (upFill) {
    upFill.style.setProperty('--fill-pct', Math.min((up / maxVal) * 100, 100) + '%');
  }
  if (downFill) {
    downFill.style.setProperty('--fill-pct', Math.min((down / maxVal) * 100, 100) + '%');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initSplash();
  initCountdown();
  initUsageBars();
});
