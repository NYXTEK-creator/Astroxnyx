const path = require('path');
const { app, BrowserWindow, screen, ipcMain, dialog, session, shell } = require('electron');
const fs = require('fs').promises;
const childProcess = require('child_process');
const os = require('os');

if (!app || !BrowserWindow) {
    throw new Error(
        'Electron did not initialize. Ensure ELECTRON_RUN_AS_NODE is unset and launch with `npm start`.'
    );
}

app.setName('Nyxcode');
if (process.platform === 'win32') {
    app.setAppUserModelId('com.nyxcode.app');
}
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow = null;

// ================================================================
// ACCOUNT FILE STORAGE
// ~/nyxcode-data/accounts/<sanitized-email>/cloud-files.json
// ================================================================

function getNyxDataDir() {
    return path.join(os.homedir(), 'nyxcode-data');
}

function sanitizeEmail(email) {
    return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function getAccountDir(email) {
    return path.join(getNyxDataDir(), 'accounts', sanitizeEmail(email));
}

function getCloudFilesPath(email) {
    return path.join(getAccountDir(email), 'cloud-files.json');
}

async function ensureAccountDir(email) {
    const dir = getAccountDir(email);
    await fs.mkdir(dir, { recursive: true });
    return dir;
}

async function readCloudFiles(email) {
    try {
        const raw = await fs.readFile(getCloudFilesPath(email), 'utf8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

async function writeCloudFiles(email, data) {
    await ensureAccountDir(email);
    await fs.writeFile(getCloudFilesPath(email), JSON.stringify(data, null, 2), 'utf8');
}

function getAdminUsersPath() {
    return path.join(__dirname, 'admin-users.json');
}

function getNotificationStorePath() {
    return path.join(getNyxDataDir(), 'notifications.json');
}

async function ensureNotificationStore() {
    const dir = getNyxDataDir();
    await fs.mkdir(dir, { recursive: true });
    const storePath = getNotificationStorePath();
    try {
        await fs.access(storePath);
    } catch {
        await fs.writeFile(storePath, JSON.stringify({ notifications: [] }, null, 2), 'utf8');
    }
}

async function readAdminUsers() {
    try {
        const raw = await fs.readFile(getAdminUsersPath(), 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list.map(user => String(user).toLowerCase());
    } catch {
    }
    return [];
}

async function readNotificationStore() {
    try {
        await ensureNotificationStore();
        const raw = await fs.readFile(getNotificationStorePath(), 'utf8');
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.notifications)) return data.notifications;
    } catch {
    }
    return [];
}

async function writeNotificationStore(notifications) {
    await ensureNotificationStore();
    await fs.writeFile(getNotificationStorePath(), JSON.stringify({ notifications }, null, 2), 'utf8');
}

// ================================================================
// ICON
// ================================================================
function getIconPath() {
    const base = path.join(__dirname, 'assets', 'icon');
    if (process.platform === 'win32') return base + '.ico';
    if (process.platform === 'darwin') return base + '.icns';
    return base + '.png';
}

// ================================================================
// WINDOW
// ================================================================
function routeOpenToMainTab(url) {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (!url || typeof url !== 'string') return;
    mainWindow.webContents.send('nyxcode-open-url', url);
}

function createWindow() {
    const { width: workW, height: workH } = screen.getPrimaryDisplay().workAreaSize;

    const iconPath = getIconPath();

    mainWindow = new BrowserWindow({
        width: Math.max(1200, Math.floor(workW * 0.9)),
        height: Math.max(800, Math.floor(workH * 0.9)),
        minWidth: 1000,
        minHeight: 700,
        show: false,
        ...(require('fs').existsSync(iconPath) ? { icon: iconPath } : {}),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true,
            autoplayPolicy: 'no-user-gesture-required',
            allowRunningInsecureContent: false,
            nativeWindowOpen: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'nyxcode.html'));
    mainWindow.webContents.setAudioMuted(false);

    mainWindow.once('ready-to-show', () => {
        if (!mainWindow) return;
        mainWindow.center();
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ================================================================
// OAUTH POPUP HANDLING
// ================================================================
const OAUTH_DOMAINS = [
    'accounts.google.com',
    'login.yahoo.com',
    'github.com',
    'appleid.apple.com',
];

function isOAuthUrl(url) {
    try {
        const parsed = new URL(url);
        return OAUTH_DOMAINS.some(
            domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
        );
    } catch {
        return false;
    }
}

// ================================================================
// APP STARTUP
// ================================================================
app.whenReady().then(() => {
    // macOS dock icon
    if (process.platform === 'darwin') {
        const dockIcon = path.join(__dirname, 'assets', 'icon.png');
        if (require('fs').existsSync(dockIcon)) {
            try { app.dock.setIcon(dockIcon); } catch {}
        }
    }

    session.defaultSession.setPermissionCheckHandler((_wc, permission) => {
        const allowed = ['media', 'mediaKeySystem', 'fullscreen', 'clipboard-read', 'clipboard-sanitized-write'];
        return allowed.includes(permission);
    });

    session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
        const allowed = ['media', 'mediaKeySystem', 'fullscreen', 'openExternal', 'clipboard-read', 'clipboard-sanitized-write'];
        callback(allowed.includes(permission));
    });

    app.on('web-contents-created', (_event, contents) => {
        contents.setWindowOpenHandler(({ url }) => {
            if (isOAuthUrl(url)) {
                return {
                    action: 'allow',
                    overrideBrowserWindowOptions: {
                        width: 500,
                        height: 650,
                        center: true,
                        resizable: true,
                        minimizable: false,
                        maximizable: false,
                        webPreferences: {
                            nodeIntegration: false,
                            contextIsolation: true,
                            nativeWindowOpen: true,
                        },
                    },
                };
            }
            routeOpenToMainTab(url);
            return { action: 'deny' };
        });
    });

    // ── Standard file system IPC ──────────────────────────────────
    ipcMain.handle('browser-navigate', () => {});
    ipcMain.handle('browser-back', () => {});
    ipcMain.handle('browser-forward', () => {});
    ipcMain.handle('browser-reload', () => {});
    ipcMain.handle('browser-set-top-inset', () => {});

    ipcMain.handle('show-open-dialog', async (event, options) => {
        return await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), options);
    });
    ipcMain.handle('show-save-dialog', async (event, options) => {
        return await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), options);
    });
    ipcMain.handle('open-external', async (_event, url) => {
        if (!url || typeof url !== 'string') return { ok: false, error: 'invalid url' };
        await shell.openExternal(url);
        return { ok: true };
    });
    ipcMain.handle('read-file', async (_event, filePath) => {
        return await fs.readFile(filePath, 'utf8');
    });
    ipcMain.handle('write-file', async (_event, filePath, content) => {
        await fs.writeFile(filePath, content, 'utf8');
    });
    ipcMain.handle('unlink', async (_event, filePath) => {
        await fs.unlink(filePath);
    });
    ipcMain.handle('rename', async (_event, oldPath, newPath) => {
        await fs.rename(oldPath, newPath);
    });
    ipcMain.handle('make-directory', async (_event, dirPath) => {
        await fs.mkdir(dirPath, { recursive: true });
    });
    ipcMain.handle('read-directory', async (_event, dirPath) => {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        return entries.map(entry => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
            isFile: entry.isFile(),
            isSymbolicLink: entry.isSymbolicLink(),
        }));
    });

    ipcMain.handle('get-admin-users', async () => {
        return await readAdminUsers();
    });

    ipcMain.handle('get-admin-emails', async () => {
        return await readAdminUsers();
    });

    ipcMain.handle('fetch-notifications', async () => {
        const notifications = await readNotificationStore();
        return { notifications };
    });

    ipcMain.handle('send-global-notification', async (_event, { sender, username, message }) => {
        const adminUsers = await readAdminUsers();
        const userKey = String(username || sender || '').trim().toLowerCase();
        if (!userKey || !adminUsers.includes(userKey)) {
            return { ok: false, error: 'not admin' };
        }
        const notifications = await readNotificationStore();
        const note = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            sender: String(sender || username || 'Admin'),
            username: String(userKey),
            message: String(message || '').trim(),
            createdAt: Date.now(),
            expiresAt: Date.now() + 10000,
        };
        notifications.unshift(note);
        if (notifications.length > 50) notifications.length = 50;
        await writeNotificationStore(notifications);
        BrowserWindow.getAllWindows().forEach(win => {
            if (!win.isDestroyed()) {
                win.webContents.send('global-notification', note);
            }
        });
        return { ok: true, note };
    });

    ipcMain.handle('run-code', async (_event, { lang, code, stdin }) => {
        lang = String(lang||'').toLowerCase();
        code = String(code||'');
        stdin = String(stdin||'');
        if(lang==='html'){
            return { type:'html', content: code };
        }
        const runners = {
            py: { bins:['python','python3'], args:['-u','-c'] },
            js: { bins:['node'], args:['-e'] },
            mjs: { bins:['node'], args:['-e'] },
            cjs: { bins:['node'], args:['-e'] },
            ts: { bins:['tsx','ts-node'], args:['-e'] },
            rb: { bins:['ruby'], args:['-e'] },
            php:{ bins:['php'], args:['-r'] },
            sh: { bins:['bash','sh'], args:['-c'] },
            bash:{ bins:['bash','sh'], args:['-c'] },
            zsh: { bins:['zsh','bash','sh'], args:['-c'] },
            pl: { bins:['perl'], args:['-e'] },
            lua:{ bins:['lua'], args:['-e'] },
            dart:{ bins:['dart'], args:['-e'] },
        };
        const runnerConfig = runners[lang];
        if(!runnerConfig){
            return { type:'error', error:'Unsupported runtime for '+lang };
        }
        for(const runner of runnerConfig.bins){
            try{
                const args = [...runnerConfig.args, code];
                const child = childProcess.spawn(runner, args, { stdio:['pipe','pipe','pipe'] });
                let stdout='';
                let stderr='';
                child.stdout.on('data', data => { stdout += data.toString(); });
                child.stderr.on('data', data => { stderr += data.toString(); });
                child.stdin.write(stdin);
                child.stdin.end();
                const exit = await new Promise(resolve => {
                    child.on('close', code => resolve(code));
                    child.on('error', () => resolve(null));
                });
                if(exit===null && stderr.includes('not found')){
                    continue;
                }
                return { type:'text', stdout, stderr, exit };
            }catch(err){
                if(err.code==='ENOENT'){
                    continue;
                }
                return { type:'error', error:err.message||String(err) };
            }
        }
        return { type:'error', error:'Runtime not found for '+lang };
    });

    const termSessions = new Map();

    function createSessionId() {
        return 'term-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }

    ipcMain.handle('exec', async (_event, cmd, options = {}) => {
        const cwd = options.cwd || undefined;
        const timeout = typeof options.timeout === 'number' ? options.timeout : 120000;
        return new Promise((resolve) => {
            const child = childProcess.exec(cmd, {
                cwd,
                shell: true,
                windowsHide: true,
                timeout,
                maxBuffer: 10 * 1024 * 1024,
            }, (err, stdout, stderr) => {
                const result = {
                    stdout: stdout || '',
                    stderr: stderr || '',
                    code: 0,
                    timedOut: false,
                };
                if (err) {
                    if (err.code !== undefined) result.code = err.code;
                    if (err.killed && err.signal === 'SIGTERM') result.timedOut = true;
                    if (err.message) result.stderr = (result.stderr ? result.stderr + '\n' : '') + err.message;
                }
                resolve(result);
            });
        });
    });

    ipcMain.handle('exec-stream', async (event, cmd, options = {}) => {
        const cwd = options.cwd || undefined;
        const sessionId = createSessionId();

        try {
            const child = childProcess.spawn(cmd, {
                cwd,
                shell: true,
                windowsHide: true,
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            termSessions.set(sessionId, child);

            child.stdout.on('data', (chunk) => {
                event.sender.send('term-data-' + sessionId, { type: 'stdout', text: chunk.toString() });
            });
            child.stderr.on('data', (chunk) => {
                event.sender.send('term-data-' + sessionId, { type: 'stderr', text: chunk.toString() });
            });
            child.on('close', (code) => {
                termSessions.delete(sessionId);
                event.sender.send('term-end-' + sessionId, { code: code === null ? 0 : code });
            });
            child.on('error', (err) => {
                termSessions.delete(sessionId);
                event.sender.send('term-data-' + sessionId, { type: 'stderr', text: String(err.message || err) });
                event.sender.send('term-end-' + sessionId, { code: 1 });
            });
        } catch (err) {
            event.sender.send('term-data-' + sessionId, { type: 'stderr', text: String(err.message || err) });
            event.sender.send('term-end-' + sessionId, { code: 1 });
        }

        return sessionId;
    });

    ipcMain.handle('term-kill', async (_event, sessionId) => {
        const child = termSessions.get(sessionId);
        if (!child) return { ok: false, error: 'session not found' };
        try {
            child.kill();
        } catch (err) {
            return { ok: false, error: String(err.message || err) };
        } finally {
            termSessions.delete(sessionId);
        }
        return { ok: true };
    });

    // ================================================================
    // CLOUD FILE STORAGE IPC
    // ================================================================

    ipcMain.handle('cloud-save-file', async (_event, { email, name, content, folder }) => {
        if (!email || !name) throw new Error('email and name are required');
        const key = folder ? `${folder}/${name}` : name;
        const db = await readCloudFiles(email);
        db[key] = {
            name,
            folder: folder || '',
            content: content || '',
            size: Buffer.byteLength(content || '', 'utf8'),
            updatedAt: Date.now(),
        };
        await writeCloudFiles(email, db);
        return { ok: true, key };
    });

    ipcMain.handle('cloud-save-many', async (_event, { email, files }) => {
        if (!email || !Array.isArray(files)) throw new Error('email and files[] are required');
        const db = await readCloudFiles(email);
        const now = Date.now();
        for (const f of files) {
            if (!f.name) continue;
            const key = f.folder ? `${f.folder}/${f.name}` : f.name;
            db[key] = {
                name: f.name,
                folder: f.folder || '',
                content: f.content || '',
                size: Buffer.byteLength(f.content || '', 'utf8'),
                updatedAt: now,
            };
        }
        await writeCloudFiles(email, db);
        return { ok: true, count: files.length };
    });

    ipcMain.handle('cloud-load-files', async (_event, { email }) => {
        if (!email) throw new Error('email is required');
        const db = await readCloudFiles(email);
        return { files: db };
    });

    ipcMain.handle('cloud-delete-file', async (_event, { email, key }) => {
        if (!email || !key) throw new Error('email and key are required');
        const db = await readCloudFiles(email);
        delete db[key];
        await writeCloudFiles(email, db);
        return { ok: true };
    });

    ipcMain.handle('cloud-rename-file', async (_event, { email, oldKey, newName, newFolder }) => {
        if (!email || !oldKey || !newName) throw new Error('email, oldKey, and newName are required');
        const db = await readCloudFiles(email);
        if (!db[oldKey]) throw new Error(`File not found: ${oldKey}`);
        const folder = newFolder !== undefined ? newFolder : db[oldKey].folder;
        const newKey = folder ? `${folder}/${newName}` : newName;
        db[newKey] = { ...db[oldKey], name: newName, folder, updatedAt: Date.now() };
        if (newKey !== oldKey) delete db[oldKey];
        await writeCloudFiles(email, db);
        return { ok: true, newKey };
    });

    ipcMain.handle('cloud-clear-all', async (_event, { email }) => {
        if (!email) throw new Error('email is required');
        await writeCloudFiles(email, {});
        return { ok: true };
    });

    ipcMain.handle('cloud-get-info', async (_event, { email }) => {
        if (!email) throw new Error('email is required');
        const db = await readCloudFiles(email);
        const files = Object.values(db);
        return {
            count: files.length,
            totalSize: files.reduce((s, f) => s + (f.size || 0), 0),
            lastUpdated: files.reduce((m, f) => Math.max(m, f.updatedAt || 0), 0),
            keys: Object.keys(db),
        };
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});