# kit-widget
Реализация виджета с чатам для канала `Web Chat` в Voximlant Kit Contact Center

Проект реализован на Vue 3

### Установка зависимостей

```shell
npm install
```

На данный момент, для тестирования месаджинга в проекте используется тривиальный бэкэнд, имитирующий переписку с самим собой:

### Запуск тестового бэкэнда
```shell
node backend/server.js
````

После подключения китового бэка папка `backend` и всё её зависимости будут удалены.

### Запуск фронта

```shell
npm run serve
````

### Установка виджета
Для установки виджета на сайт необходимо добавить скрипт в конец body, после чего выполнить следующкую команду:
```javascript
(function () { if (typeof VoxKitWidget === 'object') { VoxKitWidget.init(); } })();
```
Чтобы удалить скрипт со страницы необходимо выполнить следующий код:
```javascript
(function () { if (typeof VoxKitWidget === 'object') { VoxKitWidget.destroy(); } })();
```
