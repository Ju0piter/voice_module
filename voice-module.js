class VoiceControlModule {
    constructor(options = {}) {
      this.settings = {
        position: 'right',
        accentColor: '#5e35b1',
        darkMode: false,
        commands: {},
        ...options
      };
  
      this.isListening = false;
      this.isPanelOpen = false;
      this.recognition = null;
      this.init();
    }
  
    init() {
      this.createUI();
      this.setupRecognition();
      this.addEventListeners();
      
      if (this.settings.darkMode) {
        this.toggleDarkMode(true);
      }
    }
  
    createUI() {
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'voice-module-wrapper';
  
      // Main button
      this.button = document.createElement('button');
      this.button.className = 'voice-module-button';
      this.button.innerHTML = '🎤';
      this.button.style.backgroundColor = this.settings.accentColor;
  
      // Panel
      this.panel = document.createElement('div');
      this.panel.className = 'voice-module-panel';
  
      // Status
      this.statusContainer = document.createElement('div');
      this.statusContainer.className = 'voice-module-status';
  
      this.statusIcon = document.createElement('div');
      this.statusIcon.className = 'voice-module-status-icon';
  
      this.statusText = document.createElement('div');
      this.statusText.textContent = 'Голосовое управление выключено';
  
      this.statusContainer.appendChild(this.statusIcon);
      this.statusContainer.appendChild(this.statusText);
  
      // Result
      this.commandResult = document.createElement('div');
      this.commandResult.className = 'voice-module-result';
  
      // Instructions
      this.instructions = document.createElement('div');
      this.instructions.className = 'voice-module-instructions';
      this.instructions.innerHTML = `
        <h4>Доступные команды:</h4>
        <ul>
          <li><strong>"Прокрутите вниз/вверх"</strong> - прокрутка страницы</li>
          <li><strong>"Раздел один/два/три"</strong> - навигация по разделам</li>
          <li><strong>"Найдите [текст]"</strong> - поиск на странице</li>
          <li><strong>"Тёмный режим"</strong> - включить тёмную тему</li>
          <li><strong>"Светлый режим"</strong> - включить светлую тему</li>
        </ul>
      `;
  
      // Toggle
      this.toggleContainer = document.createElement('div');
      this.toggleContainer.className = 'voice-module-toggle';
  
      const toggleLabel = document.createElement('span');
      toggleLabel.className = 'voice-module-toggle-label';
      toggleLabel.textContent = 'Активировать микрофон';
  
      this.toggleSwitch = document.createElement('label');
      this.toggleSwitch.className = 'switch';
  
      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.addEventListener('change', () => {
        if (toggleInput.checked) {
          this.startListening();
        } else {
          this.stopListening();
        }
      });
  
      const toggleSlider = document.createElement('span');
      toggleSlider.className = 'slider';
  
      this.toggleSwitch.appendChild(toggleInput);
      this.toggleSwitch.appendChild(toggleSlider);
  
      this.toggleContainer.appendChild(toggleLabel);
      this.toggleContainer.appendChild(this.toggleSwitch);
  
      // Assemble panel
      this.panel.appendChild(this.statusContainer);
      this.panel.appendChild(this.commandResult);
      this.panel.appendChild(this.instructions);
      this.panel.appendChild(this.toggleContainer);
  
      // Assemble wrapper
      this.wrapper.appendChild(this.button);
      this.wrapper.appendChild(this.panel);
  
      document.body.appendChild(this.wrapper);
    }
    
    updateCustomCommandsList() {
        if (!this.customCommandsList) {
          this.customCommandsList = this.panel.querySelector('.custom-commands-list');
        }
        
        this.customCommandsList.innerHTML = '';
        
        if (Object.keys(this.settings.customCommands).length === 0) {
          this.customCommandsList.innerHTML = '<li>Нет пользовательских команд</li>';
          return;
        }
        
        for (const [command, description] of Object.entries(this.settings.customCommands)) {
          const li = document.createElement('li');
          li.innerHTML = `<strong>"${command}"</strong> - ${description}`;
          this.customCommandsList.appendChild(li);
        }
    }

    setupRecognition() {
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
        this.recognition = new SpeechRecognition();
      } else {
        this.showError('Ваш браузер не поддерживает голосовое управление');
        this.button.disabled = true;
        this.toggleSwitch.querySelector('input').disabled = true;
        return;
      }
  
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'ru-RU';
  
      this.recognition.onstart = () => {
        this.isListening = true;
        this.button.classList.add('listening');
        this.statusContainer.classList.add('listening');
        this.statusText.textContent = 'Слушаю... Говорите команды';
        this.commandResult.style.display = 'block';
        this.toggleSwitch.querySelector('input').checked = true;
        this.createRippleEffect(this.button);
      };
  
      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition.start();
        }
      };
  
      this.recognition.onerror = (event) => {
        this.showError('Ошибка: ' + event.error);
        this.stopListening();
      };
  
      this.recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();
        
        this.commandResult.textContent = `Распознано: "${command}"`;
        this.processCommand(command);
        this.createRippleEffect(this.commandResult);
      };
    }
  
    addEventListeners() {
      this.button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });
  
      document.addEventListener('click', (e) => {
        if (!this.wrapper.contains(e.target) && this.isPanelOpen) {
          this.collapsePanel();
        }
      });
  
      // Add ripple effect to buttons
      [this.button, this.toggleSwitch].forEach(el => {
        el.addEventListener('click', (e) => {
          this.createRippleEffect(e.currentTarget, e.clientX, e.clientY);
        });
      });
    }
  
    togglePanel() {
      if (this.isPanelOpen) {
        this.collapsePanel();
      } else {
        this.expandPanel();
      }
    }
  
    expandPanel() {
      this.wrapper.classList.remove('collapsed');
      this.isPanelOpen = true;
      this.createRippleEffect(this.button);
    }
  
    collapsePanel() {
      this.wrapper.classList.add('collapsed');
      this.isPanelOpen = false;
    }
  
    createRippleEffect(element, x, y) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      if (!x || !y) {
        const rect = element.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
      
      ripple.style.left = `${x - element.getBoundingClientRect().left}px`;
      ripple.style.top = `${y - element.getBoundingClientRect().top}px`;
      
      element.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  
    startListening() {
      try {
        this.recognition.start();
        this.expandPanel();
      } catch (e) {
        this.showError('Ошибка при запуске: ' + e.message);
      }
    }
  
    stopListening() {
      this.isListening = false;
      if (this.recognition) {
        this.recognition.stop();
      }
      this.button.classList.remove('listening');
      this.statusContainer.classList.remove('listening');
      this.statusText.textContent = 'Голосовое управление выключено';
      if (this.toggleSwitch && this.toggleSwitch.querySelector('input')) {
        this.toggleSwitch.querySelector('input').checked = false;
      }
    }
  
    processCommand(command) {
        // 1. Прокрутка
        if (command.includes('прокрутите вниз') || command.includes('скролл вниз')) {
          window.scrollBy(0, 200);
          this.commandResult.textContent += ' → Прокрутка вниз';
        } 
        else if (command.includes('прокрутите вверх') || command.includes('скролл вверх')) {
          window.scrollBy(0, -200);
          this.commandResult.textContent += ' → Прокрутка вверх';
        } 
        else if (command.includes('прокрутите до конца') || command.includes('в конец')) {
          window.scrollTo(0, document.body.scrollHeight);
          this.commandResult.textContent += ' → Прокрутка до конца';
        } 
        else if (command.includes('прокрутите до начала') || command.includes('в начало')) {
          window.scrollTo(0, 0);
          this.commandResult.textContent += ' → Прокрутка к началу';
        }
        
        // 2. Поиск
        else if (command.includes('найди') || command.includes('найти') || command.includes('поиск') || command.includes('ищи')) {
            // Извлекаем поисковый запрос после ключевых слов
            const searchPhrases = ['найди', 'найти', 'поиск', 'ищи'];
            let query = command;
            
            // Находим первое совпадение с поисковыми фразами
            for (const phrase of searchPhrases) {
              if (command.includes(phrase)) {
                query = command.split(phrase)[1]?.trim();
                break;
              }
            }
            
            if (query && query.length > 1) {
              this.handleSearch(query);
              this.commandResult.textContent += ` → Поиск: "${query}"`;
            } else {
              this.commandResult.textContent += ' → Укажите что искать (например: "найди голосовое управление")';
            }
          }
        
        // 3. Темы
        else if (command.includes('тёмный режим') || command.includes('темный режим')) {
          this.toggleDarkMode(true);
          this.commandResult.textContent += ' → Тёмный режим';
        } 
        else if (command.includes('светлый режим') || command.includes('обычный режим')) {
          this.toggleDarkMode(false);
          this.commandResult.textContent += ' → Светлый режим';
        }
        
        // 4. Кастомные команды
        else {
          let commandProcessed = false;
          for (const [key, handler] of Object.entries(this.settings.commands)) {
            if (command.includes(key.toLowerCase())) {
              handler(command);
              this.commandResult.textContent += ` → Кастом: "${key}"`;
              commandProcessed = true;
              break;
            }
          }
          if (!commandProcessed) {
            this.commandResult.textContent += ' → Команда не распознана';
          }
        }
      }
    
      handleSearch(query) {
        // Очищаем предыдущие подсветки
        document.querySelectorAll('.voice-search-highlight').forEach(el => {
          el.outerHTML = el.innerHTML;
        });
    
        if (query.length < 2) return;
    
        // Ищем по всему тексту страницы
        const bodyText = document.body.innerText;
        if (bodyText.toLowerCase().includes(query.toLowerCase())) {
          document.body.innerHTML = document.body.innerHTML.replace(
            new RegExp(query, 'gi'),
            match => `<span class="voice-search-highlight">${match}</span>`
          );
        }
      }
  
    toggleDarkMode(force = null) {
      const body = document.body;
      if (force !== null) {
        if (force) body.classList.add('dark-mode');
        else body.classList.remove('dark-mode');
      } else {
        body.classList.toggle('dark-mode');
      }
      this.settings.darkMode = body.classList.contains('dark-mode');
    }
  
    addCommand(key, handler) {
      this.settings.commands[key.toLowerCase()] = handler;
    }
  
    showError(message) {
      this.statusText.textContent = message;
      this.statusText.style.color = '#f44336';
      setTimeout(() => {
        this.statusText.style.color = '';
      }, 3000);
    }
  
    destroy() {
      this.stopListening();
      if (this.wrapper && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }
    }
  }
  
  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceControlModule;
  } else {
    window.VoiceControlModule = VoiceControlModule;
  }