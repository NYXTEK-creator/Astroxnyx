const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nyxcodeAPI', {
    // ── Browser / navigation (stubs) ────────────────────────────
    navigate:     (url)          => ipcRenderer.invoke('browser-navigate', url),
    back:         ()             => ipcRenderer.invoke('browser-back'),
    forward:      ()             => ipcRenderer.invoke('browser-forward'),
    reload:       ()             => ipcRenderer.invoke('browser-reload'),
    setTopInset:  (value)        => ipcRenderer.invoke('browser-set-top-inset', value),
    openExternal: (url)          => ipcRenderer.invoke('open-external', url),
    onOpenUrl: (callback) => {
        if (typeof callback !== 'function') return;
        ipcRenderer.on('nyxcode-open-url', (_event, url) => callback(url));
    },
    onState: (callback) => {
        if (typeof callback !== 'function') return;
        ipcRenderer.on('browser-state', (_event, state) => callback(state));
    },

    // ── Local file system ────────────────────────────────────────
    showOpenDialog:  (options)           => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog:  (options)           => ipcRenderer.invoke('show-save-dialog', options),
    readFile:        (filePath)          => ipcRenderer.invoke('read-file', filePath),
    writeFile:       (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    unlink:          (filePath)          => ipcRenderer.invoke('unlink', filePath),
    rename:          (oldPath, newPath)  => ipcRenderer.invoke('rename', oldPath, newPath),
    makeDirectory:   (dirPath)           => ipcRenderer.invoke('make-directory', dirPath),
    readDirectory:   (dirPath)           => ipcRenderer.invoke('read-directory', dirPath),
    runCode:         (args)              => ipcRenderer.invoke('run-code', args),
    getAdminUsers:    ()                 => ipcRenderer.invoke('get-admin-users'),
    getAdminEmails:   ()                 => ipcRenderer.invoke('get-admin-users'),
    fetchNotifications: ()              => ipcRenderer.invoke('fetch-notifications'),
    sendGlobalNotification: (args)      => ipcRenderer.invoke('send-global-notification', args),
    onGlobalNotification: (callback) => {
        if (typeof callback !== 'function') return;
        ipcRenderer.on('global-notification', (_event, data) => callback(data));
    },

    // ── Terminal exec ─────────────────────────────────────────────
    // Runs a real shell command. Returns { stdout, stderr, code }.
    // Supports streaming: onTermData fires chunks as they arrive.
    exec: (cmd, options) => ipcRenderer.invoke('exec', cmd, options),

    // Streaming terminal — sends data back incrementally via IPC events.
    // Returns a sessionId string. Listen with onTermData(sessionId, cb).
    execStream: (cmd, options) => ipcRenderer.invoke('exec-stream', cmd, options),
    onTermData: (sessionId, callback) => {
        if (typeof callback !== 'function') return;
        const channel = 'term-data-' + sessionId;
        ipcRenderer.on(channel, (_event, chunk) => callback(chunk));
        return () => ipcRenderer.removeAllListeners(channel);
    },
    onTermEnd: (sessionId, callback) => {
        if (typeof callback !== 'function') return;
        const channel = 'term-end-' + sessionId;
        ipcRenderer.once(channel, (_event, result) => callback(result));
    },
    termKill: (sessionId) => ipcRenderer.invoke('term-kill', sessionId),

    // ── Cloud / per-account file storage ─────────────────────────
    cloud: {
        saveFile:   (args) => ipcRenderer.invoke('cloud-save-file',   args),
        saveMany:   (args) => ipcRenderer.invoke('cloud-save-many',   args),
        loadFiles:  (args) => ipcRenderer.invoke('cloud-load-files',  args),
        deleteFile: (args) => ipcRenderer.invoke('cloud-delete-file', args),
        renameFile: (args) => ipcRenderer.invoke('cloud-rename-file', args),
        clearAll:   (args) => ipcRenderer.invoke('cloud-clear-all',   args),
        getInfo:    (args) => ipcRenderer.invoke('cloud-get-info',    args),
    },
});