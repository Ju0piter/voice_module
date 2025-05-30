# Модуль головосого управления на веб-ресурсе
Для начала работы сохраните файлы ``voice-module.js`` и ``voice-module.css`` к себе в проект. Файлы должны лежать рядом с вашим ``index.html``.
Далее необходимо подключить скрипт ``voice-module.js`` на вашу страницу: в файле index.html добавить строчку 
```html
<script src="voice-module.js"></script>
```
После этого на вашем веб-ресурсе будет доступно голосовое управление. Чтобы открыть меню голосового управления необходимо нажать на фиолетовую кпопку в виде микрофона.

![image](https://github.com/user-attachments/assets/4ea1fa0c-1828-49c1-a308-581b34e35e24)

Для добавления кастомных команд необходимо добавить скрипт в ваш файл ``index.html`` в таком виде:
``` html
<script>
    const voiceControl = new VoiceControlModule({
      darkMode: false,
      commands: { // Сюда необходимо вставить ваши кастомные команды
        'команда которую необходимо произнести': () => {
          действия, которые должны выполниться после произношения команды;
        },
        'раздел один': () => { // Пример команды, при помощи которой экран перемещается к разделу один на странице ('#section1')
          document.querySelector('#section1')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  </script>
```

Также в файле ``voice-module.js`` на 61-70 строке необходимо добавить описание вашей кастомной команды, чтобы она отображалась в меню голосового управления:
``` js
      this.instructions.innerHTML = `
        <h4>Доступные команды:</h4>
        <ul>
          <li><strong>"Прокрутите вниз/вверх"</strong> - прокрутка страницы</li>
          <li><strong>"Найдите [текст]"</strong> - поиск на странице</li>
          <li><strong>"Тёмный режим"</strong> - включить тёмную тему</li>
          <li><strong>"Светлый режим"</strong> - включить светлую тему</li>
          <li><strong>"Кастомная команда"</strong> - описание кастомной команды</li>     <----- Описание вашей кастомной команды
        </ul>
      `;
```
