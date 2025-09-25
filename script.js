// Генерация случайных чисел на фоне
        function createBackgroundNumbers() {
            const container = document.getElementById('backgroundNumbers');
            const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            
            for (let i = 0; i < 50; i++) {
                const number = document.createElement('div');
                number.className = 'number';
                number.textContent = numbers[Math.floor(Math.random() * numbers.length)];
                number.style.left = Math.random() * 100 + '%';
                number.style.top = Math.random() * 100 + '%';
                number.style.animationDelay = Math.random() * 8 + 's';
                number.style.animationDuration = (Math.random() * 5 + 5) + 's';
                container.appendChild(number);
            }
        }

        // Создание плавающих частиц
        function createParticles() {
            const container = document.getElementById('particles');
                    // очищаем старые частицы перед созданием новых, чтобы не накапливать
                    container.innerHTML = '';

                    for (let i = 0; i < 20; i++) {
                        const particle = document.createElement('div');
                        particle.className = 'particle';
                        particle.style.left = Math.random() * 100 + '%';
                        particle.style.top = Math.random() * 100 + '%';
                        particle.style.animationDelay = Math.random() * 10 + 's';
                        particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
                        container.appendChild(particle);
                    }
        }

        // Централизованное применение цветовой схемы
        const colorMap = {
            'green': '#00ff88',
            'blue': '#00aaff',
            'purple': '#aa00ff',
            'red': '#ff0066',
            'yellow': '#ffaa00',
            'cyan': '#00ffff',
            'pink': '#ff66cc',
            'orange': '#ff6600',
            'lime': '#66ff00'
        };

        const gradientMap = {
            'green': 'linear-gradient(135deg, #00ff88, #00cc6a, #00aa55)',
            'blue': 'linear-gradient(135deg, #00aaff, #0088cc, #006699)',
            'purple': 'linear-gradient(135deg, #aa00ff, #8800cc, #660099)',
            'red': 'linear-gradient(135deg, #ff0066, #cc0044, #990033)',
            'yellow': 'linear-gradient(135deg, #ffaa00, #cc8800, #996600)',
            'cyan': 'linear-gradient(135deg, #00ffff, #00cccc, #009999)',
            'pink': 'linear-gradient(135deg, #ff66cc, #cc4499, #992266)',
            'orange': 'linear-gradient(135deg, #ff6600, #cc4400, #993300)',
            'lime': 'linear-gradient(135deg, #66ff00, #44cc00, #339900)'
        };

        function applyColor(color) {
            const accentColor = colorMap[color] || colorMap.green;

            // Вспомогательная функция: преобразовать hex в RGB массив
            function hexToRgb(hex) {
                let h = hex.replace('#', '');
                if (h.length === 3) {
                    h = h.split('').map(c => c + c).join('');
                }
                const bigint = parseInt(h, 16);
                return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
            }

            const [r, g, b] = hexToRgb(accentColor);
            const rgbStr = `${r}, ${g}, ${b}`;

            // Устанавливаем CSS-переменные, которые используют стили
            const root = document.documentElement;
            root.style.setProperty('--current-accent', accentColor);
            root.style.setProperty('--current-accent-solid', accentColor);
            root.style.setProperty('--current-accent-dark', accentColor);
            // дополнительные переменные для свечения/тени
            root.style.setProperty('--current-accent-rgb', rgbStr);
            root.style.setProperty('--current-accent-shadow', `rgba(${rgbStr}, 0.30)`);
            root.style.setProperty('--current-accent-glow', `rgba(${rgbStr}, 0.40)`);
            root.style.setProperty('--current-accent-strong', `rgba(${rgbStr}, 0.55)`);
            root.style.setProperty('--selected-color', accentColor);

            // Помечаем выбранный элемент
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.toggle('selected', opt.dataset.color === color);
            });

            // Обновляем цвет чисел на фоне
            document.querySelectorAll('.number').forEach(num => {
                num.style.color = accentColor;
                num.style.textShadow = `0 0 10px ${accentColor}`;
            });

            // Обновляем цвет частиц
            document.querySelectorAll('.particle').forEach(particle => {
                particle.style.background = accentColor;
                particle.style.boxShadow = `0 0 10px ${accentColor}`;
            });

            // Обновляем кнопку входа
            const button = document.querySelector('.enter-button');
            if (button) button.style.background = gradientMap[color] || gradientMap.green;

            // Also tint the language button to match the accent (if present)
            try {
                const langBtn = document.getElementById('langButton');
                if (langBtn) langBtn.style.backgroundColor = accentColor;
            } catch (e) {}
        }

        // Навешиваем обработчики на опции
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                applyColor(this.dataset.color);
            });
        });

        // Анимация кнопки входа
        const enterBtn = document.querySelector('.enter-button');
        const loginContainer = document.getElementById('loginContainer');
        const chatContainer = document.getElementById('chatContainer');
        const chatUsernameEl = document.getElementById('chatUsername');
        const userAvatarEl = document.getElementById('userAvatar');
        const chatMessagesEl = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

    // Stats panel elements (may be absent in some views)
    const totalMessagesElement = document.getElementById('totalMessages');
    const recordOnlineElement = document.getElementById('recordOnline');
    const totalVisitsElement = document.getElementById('totalVisits');

    // Robust updater: always query the DOM at update time to avoid stale element
    // references (some code replaces these nodes, e.g. language toggle that sets
    // innerHTML). Use this function from socket handlers so the visible spans are
    // always updated.
    function updateStats(stats) {
        try {
            const tm = document.getElementById('totalMessages');
            const ro = document.getElementById('recordOnline');
            const tv = document.getElementById('totalVisits');

            if (tm) {
                const prev = tm.textContent;
                tm.textContent = stats.totalMessages;
                // ensure idle shimmer class exists
                tm.classList.add('stat-idle');
                // bump animation if value changed
                if (String(prev) !== String(stats.totalMessages)) {
                    tm.classList.remove('stat-bump');
                    // force reflow so animation can restart reliably
                    // eslint-disable-next-line no-unused-expressions
                    tm.offsetWidth;
                    tm.classList.add('stat-bump');
                }
                tm.style.transition = 'background-color 300ms ease';
                tm.style.backgroundColor = 'rgba(0,255,136,0.08)';
                tm.style.fontWeight = '700';
                tm.style.opacity = '1';
                if (tm.parentElement) tm.parentElement.style.display = '';
                setTimeout(() => { tm.style.backgroundColor = ''; }, 500);
                // cleanup bump class after animation completes
                tm.addEventListener('animationend', function _onEnd() { tm.classList.remove('stat-bump'); tm.removeEventListener('animationend', _onEnd); });
            }

            if (ro) {
                const prev = ro.textContent;
                ro.textContent = stats.recordOnline;
                ro.classList.add('stat-idle');
                if (String(prev) !== String(stats.recordOnline)) {
                    ro.classList.remove('stat-bump');
                    // force reflow
                    ro.offsetWidth;
                    ro.classList.add('stat-bump');
                }
                ro.style.transition = 'background-color 300ms ease';
                ro.style.backgroundColor = 'rgba(0,255,136,0.08)';
                ro.style.fontWeight = '700';
                ro.style.opacity = '1';
                if (ro.parentElement) ro.parentElement.style.display = '';
                setTimeout(() => { ro.style.backgroundColor = ''; }, 500);
                ro.addEventListener('animationend', function _onEnd2() { ro.classList.remove('stat-bump'); ro.removeEventListener('animationend', _onEnd2); });
            }

            if (tv) {
                const prev = tv.textContent;
                tv.textContent = stats.totalVisits;
                tv.classList.add('stat-idle');
                if (String(prev) !== String(stats.totalVisits)) {
                    tv.classList.remove('stat-bump');
                    tv.offsetWidth;
                    tv.classList.add('stat-bump');
                }
                tv.style.transition = 'background-color 300ms ease';
                tv.style.backgroundColor = 'rgba(0,255,136,0.08)';
                tv.style.fontWeight = '700';
                tv.style.opacity = '1';
                if (tv.parentElement) tv.parentElement.style.display = '';
                setTimeout(() => { tv.style.backgroundColor = ''; }, 500);
                tv.addEventListener('animationend', function _onEnd3() { tv.classList.remove('stat-bump'); tv.removeEventListener('animationend', _onEnd3); });
            }
        } catch (e) {
            console.warn('updateStats error', e);
        }
    }

        // track current user so we can align messages correctly
        let currentUsername = null;
        let currentColorKey = null;

        // seen set to avoid duplicate messages when server echoes ours
        const seenMessages = new Set();

        function formatTime(iso) {
            const d = new Date(iso);
            if (isNaN(d)) return '';
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        function addMessage(text, type = 'system', author = '', colorKey = null, ts = null) {
            const msg = document.createElement('div');
            // determine ownership (is this message from current user?)
            const isUser = type === 'user';
            const isOwn = isUser && author && currentUsername && (author === currentUsername);
            if (isUser) {
                msg.className = 'message ' + (isOwn ? 'user' : 'other');
            } else {
                msg.className = 'message system';
            }
            const p = document.createElement('p');
            p.className = 'message-text';
            // sanitize text to avoid XSS
            function escapeHtml(str) {
                return str.replace(/[&<>"']/g, function(tag) {
                    const charsToReplace = {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;'
                    };
                    return charsToReplace[tag] || tag;
                });
            }
            p.innerHTML = (author ? '<strong>' + escapeHtml(author) + ':</strong> ' : '') + escapeHtml(text);
            // append timestamp
            if (ts) {
                const timeSpan = document.createElement('span');
                timeSpan.className = 'msg-time';
                timeSpan.textContent = formatTime(ts);
                p.appendChild(document.createTextNode(' '));
                p.appendChild(timeSpan);
            }
            msg.appendChild(p);
            // apply per-message accent color (if provided)
            if (colorKey) {
                const hex = colorMap[colorKey] || colorKey;
                // set CSS variable for this message
                msg.style.setProperty('--msg-accent', hex);
            }
            chatMessagesEl.appendChild(msg);
            // auto scroll
            chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
        }

// Chat-localized strings (used for system messages, placeholders, online label)
const chatStrings = {
    ru: {
        welcome: 'Добро пожаловать в чат! Начните общение...',
        joined: 'вошёл в чат',
        left: 'вышел из чата',
        onlineLabel: 'Онлайн:',
        userStatus: 'Онлайн',
        messagePlaceholder: 'Введите сообщение...'
    },
    en: {
        welcome: 'Welcome to the chat! Start the conversation...',
        joined: 'joined the chat',
        left: 'left the chat',
        onlineLabel: 'Online:',
        userStatus: 'Online',
        messagePlaceholder: 'Type your message...'
    }
};

        // Socket.io client (will be initialized on page if available)
        let socket = null;
        if (typeof io !== 'undefined') {
        try {
            socket = io();
            console.debug && console.debug('Attempting socket.io connection...');
            } catch (e) {
                socket = null;
            }
        }

        if (enterBtn) {
            enterBtn.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';

                    // Read username and selected color
                    const username = (document.getElementById('usernameInput').value || 'Guest').trim() || 'Guest';
                    const selected = document.querySelector('.color-option.selected') || document.querySelector('.color-option[data-color="green"]');
                    const colorKey = selected ? selected.dataset.color : 'green';

                    // Apply selected color scheme (sets CSS variables)
                    applyColor(colorKey);

                    // Save to localStorage so user is remembered
                    try { localStorage.setItem('chat_username', username); localStorage.setItem('chat_color', colorKey); } catch (e) {}

                    // Update chat header
                    if (chatUsernameEl) chatUsernameEl.textContent = username;

                    // Update avatar color (if uses background/mask it will follow --current-accent)
                    if (userAvatarEl) {
                        // clear any emoji
                        userAvatarEl.textContent = '';
                        // apply background color from CSS variable
                        const accent = getComputedStyle(document.documentElement).getPropertyValue('--current-accent').trim() || colorMap[colorKey];
                        userAvatarEl.style.backgroundColor = accent;
                        userAvatarEl.style.boxShadow = `0 0 15px ${accent}`;
                    }

                    // Hide login and show chat
                    if (loginContainer) loginContainer.style.display = 'none';
                    if (chatContainer) chatContainer.classList.add('active');

                    // Hide the stats panel when entering the chat
                    const statsPanel = document.querySelector('.stats-panel');
                    if (statsPanel) statsPanel.style.display = 'none';

                    // set current user info
                    currentUsername = username;
                    currentColorKey = colorKey;

                                // Start session timer when user joins
                                try { startSessionTimer(); } catch (e) {}

                    // Announce join in chat and inform server (include timestamp so server echo can be deduped)
                    const joinTs = new Date().toISOString();
                    const curLang = (document.documentElement.lang && document.documentElement.lang.startsWith('en')) ? 'en' : 'ru';
                    const joinText = chatStrings[curLang].joined;
                    const joinKey = `${username}::${joinTs}::${joinText}`;
                    seenMessages.add(joinKey);
                    addMessage(joinText, 'system', username, null, joinTs);
                    if (socket) {
                        console.debug && console.debug('Emitting join', { username, color: colorKey, ts: joinTs });
                        socket.emit('join', { username, color: colorKey, ts: joinTs });
                    }
                }, 150);
            });
        }

        // On load, fill username/color from localStorage if present
        try {
            const savedName = localStorage.getItem('chat_username');
            const savedColor = localStorage.getItem('chat_color');
            if (savedName && document.getElementById('usernameInput')) document.getElementById('usernameInput').value = savedName;
            if (savedColor) {
                const opt = document.querySelector('.color-option[data-color="' + savedColor + '"]');
                if (opt) opt.click();
            }
        } catch (e) {}

        // Send message handler
        function sendMessage() {
            const text = (messageInput && messageInput.value || '').trim();
            if (!text) return;
            const username = (document.getElementById('chatUsername').textContent || 'Guest').trim();
            const ts = new Date().toISOString();
            // send via socket if available
            if (socket) {
                socket.emit('message', { text, ts });
                // mark as seen to avoid duplicate when server echoes
                const key = `${username}::${ts}::${text}`;
                seenMessages.add(key);
                addMessage(text, 'user', username, currentColorKey, ts);
            } else {
                // local echo with color and timestamp
                addMessage(text, 'user', username, currentColorKey, ts);
            }
            if (messageInput) messageInput.value = '';
        }

        if (sendButton) sendButton.addEventListener('click', sendMessage);
        if (messageInput) {
            messageInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // Live online counter (demo): starts at 1 (you), and simulates small changes
        const onlineCountEl = document.getElementById('onlineCount');
        let onlineCount = 1;
        function updateOnlineDisplay() {
            if (onlineCountEl) onlineCountEl.textContent = String(onlineCount);
        }
        updateOnlineDisplay();

        // Session timer: shows minutes:seconds since user joined the chat
        let sessionTimerInterval = null;
        let sessionSeconds = 0;
        const sessionTimerEl = document.getElementById('sessionTimer');

        function formatSessionTime(sec) {
            const m = String(Math.floor(sec / 60)).padStart(2, '0');
            const s = String(sec % 60).padStart(2, '0');
            return `${m}:${s}`;
        }

        function startSessionTimer() {
            // reset then start
            sessionSeconds = 0;
            const timeEl = sessionTimerEl && sessionTimerEl.querySelector('.session-time');
            if (timeEl) timeEl.textContent = formatSessionTime(sessionSeconds);
            stopSessionTimer();
            sessionTimerInterval = setInterval(() => {
                sessionSeconds += 1;
                if (timeEl) timeEl.textContent = formatSessionTime(sessionSeconds);
            }, 1000);
        }

        function stopSessionTimer() {
            if (sessionTimerInterval) {
                clearInterval(sessionTimerInterval);
                sessionTimerInterval = null;
            }
        }

        function resetSessionTimer() {
            sessionSeconds = 0;
            const timeEl = sessionTimerEl && sessionTimerEl.querySelector('.session-time');
            if (timeEl) timeEl.textContent = formatSessionTime(sessionSeconds);
        }

        // If socket exists, listen to server events; otherwise keep demo simulation
        if (socket) {
            socket.on('connect', () => console.debug && console.debug('socket connected', socket.id));
            socket.on('connect_error', (e) => console.error('socket connect_error', e));
            socket.on('disconnect', (r) => console.debug && console.debug('socket disconnected', r));
            socket.on('message', (payload) => {
                    // Normalize payload
                    const type = payload.type || 'user';
                    const author = payload.username || '';
                    const text = payload.text || '';
                    const color = payload.color || null;
                    const ts = payload.ts || new Date().toISOString();

                    // Build a stable key to dedupe local echoes vs server broadcasts
                    const key = `${author}::${ts}::${text}`;
                    if (seenMessages.has(key)) return; // already rendered locally
                    seenMessages.add(key);

                    // Render message with timestamp and optional color
                    addMessage(text, type, author, color, ts);
                });

            socket.on('online-count', (count) => {
                onlineCount = Math.max(1, Number(count) || 1);
                updateOnlineDisplay();
            });

            // Listen for stats updates from the server (use robust updater)
            socket.on('stats-update', (stats) => {
                console.debug && console.debug('stats-update received', stats);
                updateStats(stats);
            });

            // Request initial stats on connection
            console.debug && console.debug('Requesting initial stats');
            socket.emit('request-stats');
        } else {
            // For demo purposes, simulate others joining/leaving every 6-12 seconds
            setInterval(() => {
                // random change -1, 0, or +1
                const delta = Math.floor(Math.random() * 3) - 1;
                onlineCount = Math.max(1, onlineCount + delta);
                updateOnlineDisplay();
            }, 8000);
        }

    // Инициализация
    createBackgroundNumbers();
    createParticles();

    // debug overlay removed

    // Обновление частиц каждые 10 секунд
    setInterval(createParticles, 10000);

    // Инициализируем с зеленым цветом (по умолчанию)
    applyColor('green');

// Handle mobile browser UI (vh) differences: set --vh to 1% of the viewport height
// This helps position fixed elements above mobile address bars/keyboards.
function setViewportHeightVar() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Expose for manual testing in the console
try { window.updateStats = updateStats; } catch (e) {}
setViewportHeightVar();
window.addEventListener('resize', () => setViewportHeightVar());
window.addEventListener('orientationchange', () => setViewportHeightVar());

// Loader animation: show logo + progress bar for ~1.5s then reveal UI
function runLoader(duration = 1500) {
    const overlay = document.getElementById('loaderOverlay');
    const bar = document.getElementById('loaderBar');
    const percent = document.getElementById('loaderPercent');
    if (!overlay || !bar || !percent) return Promise.resolve();
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    return new Promise(resolve => {
        const start = performance.now();
        function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const pct = Math.round(t * 100);
            bar.style.width = pct + '%';
            percent.textContent = pct + '%';
            if (t < 1) requestAnimationFrame(tick);
            else {
                // small delay then hide overlay smoothly
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    overlay.setAttribute('aria-hidden', 'true');
                    // after transition remove it from DOM to keep page interactable
                    setTimeout(() => {
                        try { overlay.remove(); } catch (e) { overlay.style.display = 'none'; }
                    }, 420);
                    // reveal main UI parts (ensure they're visible)
                    const stats = document.querySelector('.stats-panel');
                    const login = document.getElementById('loginContainer');
                    if (stats) stats.style.opacity = '';
                    if (login) login.style.opacity = '';
                    resolve();
                }, 220);
            }
        }
        requestAnimationFrame(tick);
    });
}

// Run loader immediately on script load
try { runLoader(1500); } catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chatContainer');
  const enterButton = document.getElementById('enterButton');

  // Initially hide the chat container
  chatContainer.style.display = 'none';

  // Show the chat container when the enter button is clicked
  enterButton.addEventListener('click', () => {
    const loginContainer = document.getElementById('loginContainer');
    loginContainer.style.display = 'none'; // Hide the login container
    chatContainer.style.display = 'flex'; // Show the chat container
        // Hide stats panel when entering the chat
        const statsPanel = document.querySelector('.stats-panel');
        if (statsPanel) statsPanel.style.display = 'none';
  });

    // Logout button: hide chat, show login, restore stats panel, notify server
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            const loginContainer = document.getElementById('loginContainer');
            // Show login UI
            if (loginContainer) loginContainer.style.display = '';

            // Hide chat UI
            if (chatContainer) {
                chatContainer.style.display = 'none';
                chatContainer.classList.remove('active');
            }

            // Restore and reposition stats panel
            const statsPanel = document.querySelector('.stats-panel');
            if (statsPanel) {
                statsPanel.style.display = '';
                // ensure it's positioned correctly (mobile vs desktop)
                try { positionStatsPanel(); } catch (e) {}
            }

            // Optionally inform server about leaving
            try {
                const prevUser = currentUsername || (document.getElementById('chatUsername') && document.getElementById('chatUsername').textContent) || null;
                if (socket && prevUser) socket.emit('leave', { username: prevUser, ts: new Date().toISOString() });
            } catch (e) {}

            // Clear local current username so the UI returns to anonymous state
            currentUsername = null;
            // stop and reset session timer on logout
            try { stopSessionTimer(); resetSessionTimer(); } catch (e) {}
        });
    }
});
// Note: stats update handling consolidated above using updateStats().

// Position statistics panel only for mobile via JS (desktop handled by CSS)
function positionStatsPanel() {
  const stats = document.querySelector('.stats-panel');
  const main = document.getElementById('glassPanel') || document.querySelector('.glass-panel');
  if (!stats || !main) return;

  const vw = window.innerWidth;
  const statsRect = stats.getBoundingClientRect();
  const mainRect = main.getBoundingClientRect();

  if (vw < 769) {
    // Mobile: place below main panel with 50px gap and center horizontally
    const gap = 50;
    let top = Math.round(mainRect.bottom + gap);

    // Ensure there's enough scroll space so stats isn't off-screen
    const docHeight = document.documentElement.scrollHeight;
    if (top + statsRect.height + 20 > docHeight) {
      // extend page by adding margin to main
      main.style.marginBottom = (statsRect.height + gap + 40) + 'px';
    }

    stats.style.position = 'absolute';
    stats.style.left = '50%';
    stats.style.transform = 'translateX(-50%)';
    stats.style.top = top + 'px';
  } else {
    // Desktop: clear any inline positioning so CSS takes over
    stats.style.position = '';
    stats.style.left = '';
    stats.style.top = '';
    stats.style.transform = '';
    // remove any bottom margin set on main
    if (main.style.marginBottom) main.style.marginBottom = '';
  }
}

// Recalculate positioning after DOM content loaded and on events
window.addEventListener('load', () => setTimeout(positionStatsPanel, 150));
window.addEventListener('resize', () => setTimeout(positionStatsPanel, 80));
window.addEventListener('scroll', () => setTimeout(positionStatsPanel, 80));

// Also call after the UI changes (enter button hides login panel)
document.addEventListener('DOMContentLoaded', () => {
  positionStatsPanel();
  // If the main panel can change size later (images, fonts), re-run after a short delay
  setTimeout(positionStatsPanel, 350);

  const enterBtn = document.getElementById('enterButton');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => setTimeout(positionStatsPanel, 200));
  }
});

// Language toggle: RU <-> EN
document.addEventListener('DOMContentLoaded', () => {
    const langButton = document.getElementById('langButton');
    const htmlEl = document.documentElement;
    const titleEl = document.querySelector('.title');
    const subtitleEl = document.querySelector('.subtitle');
    const enterBtn = document.getElementById('enterButton');
    const usernameInput = document.getElementById('usernameInput');

    const strings = {
        ru: {
            title: 'Добро пожаловать',
            subtitle: 'Добро пожаловать в будущее',
            enter: 'Войти в систему',
            placeholder: 'Введите ваше имя'
        },
        en: {
            title: 'Welcome',
            subtitle: 'Welcome to the future',
            enter: 'Enter',
            placeholder: 'Type your name'
        }
    };

    function applyLang(lang) {
        if (!strings[lang]) lang = 'ru';
        htmlEl.lang = (lang === 'en' ? 'en' : 'ru');
        if (titleEl) titleEl.textContent = strings[lang].title;
        if (subtitleEl) subtitleEl.textContent = strings[lang].subtitle;
        if (enterBtn) enterBtn.childNodes.forEach(n => { /* keep icon img, remove text nodes */ });
        if (enterBtn) enterBtn.innerHTML = strings[lang].enter + ' <img src="logos/enterblack.png" alt="Enter" class="enter-button-icon">';
        if (usernameInput) usernameInput.placeholder = strings[lang].placeholder;
            // update language label (ENG/RUS)
            const labelEl = document.querySelector('.lang-label');
            if (labelEl) labelEl.textContent = (lang === 'en' ? 'ENG' : 'RUS');
            // tint the lang button using the current accent color
            try {
                const computed = getComputedStyle(document.documentElement).getPropertyValue('--current-accent').trim();
                const btn = document.getElementById('langButton');
                if (btn && computed) btn.style.backgroundColor = computed;
            } catch (e) {}

            // update stats labels
            const statsTitle = document.querySelector('.stats-title');
            const statItems = document.querySelectorAll('.stats-panel .stat-item');
            if (statsTitle) statsTitle.childNodes[0] && (statsTitle.childNodes[0].textContent = (lang === 'en' ? 'Statistics ' : 'Статистика '));
            if (statItems && statItems.length >= 3) {
                const s0 = statItems[0].querySelector('p');
                const s1 = statItems[1].querySelector('p');
                const s2 = statItems[2].querySelector('p');
                if (s0) s0.innerHTML = (lang === 'en' ? 'Total chat messages: <span id="totalMessages">' : 'Всего сообщений в чате: <span id="totalMessages">') + (document.getElementById('totalMessages') ? document.getElementById('totalMessages').textContent : '0') + '</span>';
                if (s1) s1.innerHTML = (lang === 'en' ? 'Record online: <span id="recordOnline">' : 'Рекордный онлайн: <span id="recordOnline">') + (document.getElementById('recordOnline') ? document.getElementById('recordOnline').textContent : '0') + '</span>';
                if (s2) s2.innerHTML = (lang === 'en' ? 'Total visits: <span id="totalVisits">' : 'Всего заходов в чат: <span id="totalVisits">') + (document.getElementById('totalVisits') ? document.getElementById('totalVisits').textContent : '0') + '</span>';
            }
        // flash glow on the button to indicate change
        if (langButton) {
            langButton.animate([
                { boxShadow: '0 0 4px rgba(255,255,255,0.06), 0 0 10px var(--current-accent-glow, rgba(0,255,136,0.12))' },
                { boxShadow: '0 0 6px rgba(255,255,255,0.09), 0 0 22px var(--current-accent-glow, rgba(0,255,136,0.2))' },
                { boxShadow: '0 0 4px rgba(255,255,255,0.06), 0 0 10px var(--current-accent-glow, rgba(0,255,136,0.12))' }
            ], { duration: 420 });
        }

            // update specific input labels in the login panel
            try {
                const loginPanel = document.getElementById('glassPanel');
                if (loginPanel) {
                    // Имя пользователя label (first .input-label inside login panel)
                    const nameLabel = loginPanel.querySelector('.input-group .input-label');
                    if (nameLabel) nameLabel.textContent = (lang === 'en' ? 'Username' : 'Имя пользователя');
                    // color picker label (the .input-label directly under .color-picker-group)
                    const colorLabel = loginPanel.querySelector('.color-picker-group > .input-label');
                    if (colorLabel) colorLabel.textContent = (lang === 'en' ? 'Choose color scheme' : 'Выберите цветовую схему');
                }
            } catch (e) {}
                // update online label and chat message placeholder
                try {
                    const cur = (lang === 'en') ? 'en' : 'ru';
                    const onlineEl = document.getElementById('onlineIndicator');
                    if (onlineEl) {
                        // preserve the icon span and count, replace the middle text
                        const countSpan = document.getElementById('onlineCount');
                        onlineEl.innerHTML = '<span class="online-icon" aria-hidden="true"></span> ' + chatStrings[cur].onlineLabel + ' <span id="onlineCount">' + (countSpan ? countSpan.textContent : '1') + '</span>';
                    }
                    const msgInput = document.getElementById('messageInput');
                    if (msgInput) msgInput.placeholder = chatStrings[cur].messagePlaceholder;
                            // update user status under the nick
                            const userStatusEl = document.getElementById('userStatus');
                            if (userStatusEl) userStatusEl.textContent = chatStrings[cur].userStatus;

                            // update the initial welcome system message if present
                            const firstSystem = document.querySelector('.chat-messages .message.system .message-text');
                            if (firstSystem) {
                                // replace only if it's the original welcome (heuristic)
                                firstSystem.textContent = chatStrings[cur].welcome;
                            }
                } catch (e) {}
    }

    // read saved lang or default to current html lang or 'ru'
    let saved = localStorage.getItem('chat_lang');
    if (!saved) saved = (htmlEl.lang && htmlEl.lang.startsWith('en')) ? 'en' : 'ru';
    applyLang(saved);

    if (langButton) {
        langButton.addEventListener('click', () => {
            const cur = (htmlEl.lang && htmlEl.lang.startsWith('en')) ? 'en' : 'ru';
            const next = cur === 'en' ? 'ru' : 'en';
            localStorage.setItem('chat_lang', next);
            applyLang(next);
        });
    }
});