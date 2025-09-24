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

        function addMessage(text, type = 'system', author = '') {
            const msg = document.createElement('div');
            msg.className = 'message ' + (type === 'user' ? 'user' : (type === 'system' ? 'system' : ''));
            const p = document.createElement('p');
            p.className = 'message-text';
            p.textContent = (author ? author + ': ' : '') + text;
            msg.appendChild(p);
            chatMessagesEl.appendChild(msg);
            // auto scroll
            chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
        }

        // Socket.io client (will be initialized on page if available)
        let socket = null;
        if (typeof io !== 'undefined') {
            try {
                socket = io();
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

                    // Announce join in chat and inform server
                    addMessage('вошёл в чат', 'system', username);
                    if (socket) {
                        socket.emit('join', { username, color: colorKey });
                    }
                }, 150);
            });
        }

        // Send message handler
        function sendMessage() {
            const text = (messageInput && messageInput.value || '').trim();
            if (!text) return;
            const username = (document.getElementById('chatUsername').textContent || 'Guest').trim();
            // send via socket if available
            if (socket) {
                socket.emit('message', { text });
            } else {
                addMessage(text, 'user', username);
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

        // If socket exists, listen to server events; otherwise keep demo simulation
        if (socket) {
            socket.on('message', (payload) => {
                if (payload.type === 'system') {
                    addMessage(payload.text, 'system');
                } else if (payload.type === 'user') {
                    addMessage(payload.text, 'user', payload.username || '');
                }
            });

            socket.on('online-count', (count) => {
                onlineCount = Math.max(1, Number(count) || 1);
                updateOnlineDisplay();
            });
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

    // Обновление частиц каждые 10 секунд
    setInterval(createParticles, 10000);

    // Инициализируем с зеленым цветом (по умолчанию)
    applyColor('green');