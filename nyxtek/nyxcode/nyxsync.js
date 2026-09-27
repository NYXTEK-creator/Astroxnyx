// ================================================================
// CLOUD SYNC — paste this block into nyxcode.html right after
// the existing "// STATE" variable declarations.
// It hooks into loginUser(), saveActive(), deleteFileById(),
// and doRenameTab() automatically.
// ================================================================

// ── helpers ──────────────────────────────────────────────────────

function cloudEmail() {
    return currentUser && currentUser.email ? currentUser.email : null;
}

function cloudKey(tab) {
    // Virtual path key: "folder/name" or just "name"
    return tab.relPath || tab.name;
}

async function cloudSyncStatus(msg, isErr) {
    // Show a brief status message in the terminal
    addTermLine(isErr
        ? '<span class="terr">☁ ' + escHtml(msg) + '</span>'
        : '<span class="tok">☁ ' + escHtml(msg) + '</span>');
}

// ── load cloud files on sign-in ───────────────────────────────────
// Call this inside loginUser() after the UI is updated.
async function loadCloudFilesForUser(user) {
    if (!window.nyxcodeAPI || !window.nyxcodeAPI.cloud) return;
    if (!user || !user.email) return;
    try {
        const { files } = await window.nyxcodeAPI.cloud.loadFiles({ email: user.email });
        const keys = Object.keys(files || {});
        if (!keys.length) {
            cloudSyncStatus('No cloud files for ' + user.username);
            return;
        }
        var loaded = 0;
        keys.forEach(function(key) {
            var f = files[key];
            // Don't duplicate tabs that are already open by name
            var existing = openTabs.find(function(t) { return t.name === f.name; });
            if (existing) {
                existing.content = f.content;
                existing._cloudKey = key;
                existing.dirty = false;
            } else {
                var id = genId();
                openTabs.push({
                    id: id,
                    name: f.name,
                    content: f.content || '',
                    dirty: false,
                    untitled: false,
                    _cloudKey: key,
                    folder: f.folder || '',
                    relPath: key,
                });
                if (!activeTabId) activeTabId = id;
                loaded++;
            }
        });
        renderAll();
        cloudSyncStatus('Loaded ' + keys.length + ' cloud file(s) for ' + user.username);
    } catch (e) {
        cloudSyncStatus('NyxSync: Cloud load failed: ' + e.message, true);
    }
}

// ── save a single tab to the cloud ──────────────────────────────
async function cloudSaveTab(tab) {
    var email = cloudEmail();
    if (!email || !window.nyxcodeAPI || !window.nyxcodeAPI.cloud) return;
    try {
        var result = await window.nyxcodeAPI.cloud.saveFile({
            email: email,
            name: tab.name,
            content: tab.content || getEditorContent() || '',
            folder: tab.folder || '',
        });
        tab._cloudKey = result.key;
    } catch (e) {
        cloudSyncStatus('Cloud save failed: ' + e.message, true);
    }
}

// ── sync all open tabs to the cloud ─────────────────────────────
async function cloudSyncAll() {
    var email = cloudEmail();
    if (!email || !window.nyxcodeAPI || !window.nyxcodeAPI.cloud) return;
    if (!openTabs.length) return;
    try {
        var files = openTabs.map(function(t) {
            return { name: t.name, content: t.content || '', folder: t.folder || '' };
        });
        var result = await window.nyxcodeAPI.cloud.saveMany({ email: email, files: files });
        cloudSyncStatus('Synced ' + result.count + ' file(s) to cloud');
    } catch (e) {
        cloudSyncStatus('Cloud sync failed: ' + e.message, true);
    }
}

// ── delete a file from the cloud ────────────────────────────────
async function cloudDeleteTab(tab) {
    var email = cloudEmail();
    if (!email || !window.nyxcodeAPI || !window.nyxcodeAPI.cloud) return;
    var key = tab._cloudKey || cloudKey(tab);
    if (!key) return;
    try {
        await window.nyxcodeAPI.cloud.deleteFile({ email: email, key: key });
    } catch (e) {
        cloudSyncStatus('Cloud delete failed: ' + e.message, true);
    }
}

// ── rename a file in the cloud ───────────────────────────────────
async function cloudRenameTab(tab, oldName) {
    var email = cloudEmail();
    if (!email || !window.nyxcodeAPI || !window.nyxcodeAPI.cloud) return;
    var oldKey = tab._cloudKey || oldName;
    if (!oldKey) return;
    try {
        var result = await window.nyxcodeAPI.cloud.renameFile({
            email: email,
            oldKey: oldKey,
            newName: tab.name,
            newFolder: tab.folder || '',
        });
        tab._cloudKey = result.newKey;
    } catch (e) {
        cloudSyncStatus('Cloud rename failed: ' + e.message, true);
    }
}

// ================================================================
// PATCHED FUNCTIONS — replace the originals in nyxcode.html
// ================================================================

// Replace the existing loginUser() with this version:
function loginUser(user) {
    currentUser = user;
    try { localStorage.setItem('nyxcode_user', JSON.stringify(user)); } catch(e) {}
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('oauth-waiting').classList.remove('open');
    var existing = document.getElementById('ow-confirm'); if (existing) existing.remove();
    // Update UI
    document.getElementById('user-name').textContent = user.username;
    var av = document.getElementById('user-avatar');
    if (user.avatar) {
        av.innerHTML = '<img src="' + escHtml(user.avatar) + '" onerror="this.parentNode.textContent=\'' + user.username.slice(0,2).toUpperCase() + '\'">';
    } else {
        av.textContent = user.username.slice(0,2).toUpperCase();
    }
    renderCollabMembers();
    addTermLine('<span class="tok">Signed in as ' + escHtml(user.username) + (user.provider !== 'email' ? ' via ' + user.provider : '') + '</span>');
    // ↓ NEW: load cloud files for this user
    loadCloudFilesForUser(user);
}

// Replace the existing saveActive() with this version:
async function saveActive() {
    var tab = activeTab(); if (!tab) return;
    tab.content = getEditorContent();
    var filePath = _fsFilePaths[tab.id] || tab.filePath;
    if (filePath && HAS_FS_API) {
        try {
            await window.nyxcodeAPI.writeFile(filePath, tab.content);
            tab.dirty = false; renderTabs(); renderTree();
            var fl = document.getElementById('save-flash');
            fl.textContent = 'Saved to disk'; fl.classList.add('show');
            clearTimeout(fl._t); fl._t = setTimeout(function() { fl.classList.remove('show'); }, 1600);
            showAutosaveBadge();
            addTermLine('<span class="tok">Saved: ' + escHtml(tab.name) + '</span>');
        } catch(e) {
            addTermLine('<span class="terr">Save failed: ' + escHtml(e.message) + '</span>');
            downloadFile(tab.name, tab.content);
        }
    } else {
        tab.dirty = false; renderTabs();
        downloadFile(tab.name, tab.content);
        var fl = document.getElementById('save-flash');
        fl.textContent = 'Downloaded'; fl.classList.add('show');
        clearTimeout(fl._t); fl._t = setTimeout(function() { fl.classList.remove('show'); }, 1600);
    }
    // ↓ NEW: also save to cloud
    await cloudSaveTab(tab);
}

// Replace the existing doRenameTab() with this version:
async function doRenameTab(tab, newName) {
    var oldName = tab.name;
    var filePath = _fsFilePaths[tab.id] || tab.filePath;
    if (filePath && HAS_FS_API) {
        try {
            var dir = filePath.substring(0, filePath.lastIndexOf('/') + 1);
            await window.nyxcodeAPI.rename(filePath, dir + newName);
            _fsFilePaths[tab.id] = dir + newName;
            tab.filePath = dir + newName;
            addTermLine('<span class="tok">Renamed: ' + escHtml(oldName) + ' → ' + escHtml(newName) + '</span>');
        } catch(e) {
            addTermLine('<span class="twarn">Renamed in editor only</span>');
        }
    } else {
        addTermLine('<span class="tok">Renamed: ' + escHtml(oldName) + ' → ' + escHtml(newName) + '</span>');
    }
    tab.name = newName;
    renderAll();
    // ↓ NEW: rename in cloud
    await cloudRenameTab(tab, oldName);
}

// Add cloud delete hook to deleteFileById():
// Find the line `openTabs.splice(idx, 1);` in the original deleteFileById and add this before it:
//   cloudDeleteTab(tab);
// OR replace deleteFileById entirely with this version:
async function deleteFileById(id) {
    var tab = openTabs.find(function(t) { return t.id === id; }); if (!tab) return;
    var filePath = _fsFilePaths[id] || tab.filePath;
    var hasFs = !!(filePath && HAS_FS_API);
    openModal('DELETE' + (hasFs ? ' FROM DISK' : '') + ' "' + tab.name + '"?', '', 'Delete', async function() {
        if (hasFs) {
            try {
                await window.nyxcodeAPI.unlink(filePath);
                addTermLine('<span class="tok">Deleted: ' + escHtml(tab.name) + '</span>');
            } catch(e) {
                addTermLine('<span class="twarn">Removed from editor only</span>');
            }
            delete _fsFilePaths[id];
        }
        // ↓ NEW: delete from cloud
        await cloudDeleteTab(tab);
        var idx = openTabs.findIndex(function(t) { return t.id === id; }); if (idx < 0) return;
        openTabs.splice(idx, 1);
        if (activeTabId === id) activeTabId = openTabs.length ? openTabs[Math.max(0, idx-1)].id : null;
        _focusedTabId = null;
        renderAll();
    });
    document.getElementById('modal-input').style.display = 'none';
    document.getElementById('modal-ok').textContent = 'Delete';
    document.getElementById('modal-ok').className = 'mbtn danger';
    document.getElementById('modal-title').textContent = 'DELETE ' + (hasFs ? 'FROM DISK ' : '') + '"' + tab.name + '"?';
}

// ── terminal commands for cloud sync ────────────────────────────
// These extend the BUILTINS object inside the terminal keydown handler.
// Add these entries to BUILTINS manually, or call them via the terminal:
//   cloud-sync  — push all open tabs to cloud
//   cloud-info  — show cloud storage stats
var CLOUD_TERM_CMDS = {
    'cloud-sync': async function() {
        if (!cloudEmail()) return addTermLine('<span class="terr">Sign in first.</span>');
        addTermLine('<span class="tout">Syncing all files to cloud…</span>');
        await cloudSyncAll();
    },
    'cloud-info': async function() {
        var email = cloudEmail();
        if (!email) return addTermLine('<span class="terr">Sign in first.</span>');
        if (!window.nyxcodeAPI || !window.nyxcodeAPI.cloud) return addTermLine('<span class="terr">Cloud API not available.</span>');
        try {
            var info = await window.nyxcodeAPI.cloud.getInfo({ email: email });
            var kb = (info.totalSize / 1024).toFixed(1);
            var last = info.lastUpdated ? new Date(info.lastUpdated).toLocaleString() : 'never';
            addTermLine('<span class="tout">Cloud: ' + info.count + ' file(s), ' + kb + ' KB, last updated ' + last + '</span>');
        } catch(e) {
            addTermLine('<span class="terr">Cloud info failed: ' + e.message + '</span>');
        }
    },
    'cloud-clear': async function() {
        var email = cloudEmail();
        if (!email) return addTermLine('<span class="terr">Sign in first.</span>');
        if (!window.nyxcodeAPI || !window.nyxcodeAPI.cloud) return;
        await window.nyxcodeAPI.cloud.clearAll({ email: email });
        addTermLine('<span class="twarn">Cloud storage cleared for ' + email + '</span>');
    },
};

// Wire cloud terminal commands into the existing terminal input handler.
// The terminal keydown listener checks BUILTINS first — extend it here.
(function patchTerminal() {
    var origHandler = document.getElementById('terminput')._cloudPatched;
    if (origHandler) return; // already patched
    document.getElementById('terminput')._cloudPatched = true;
    var inp = document.getElementById('terminput');
    inp.addEventListener('keydown', async function(e) {
        if (e.key !== 'Enter') return;
        var cmd = this.value.trim();
        var fn = CLOUD_TERM_CMDS[cmd];
        if (fn) {
            e.stopImmediatePropagation(); // prevent "command not found"
            this.value = '';
            addTermLine('<span class="tp">&#x276F;</span> <span class="tcmd">' + escHtml(cmd) + '</span>');
            await fn();
        }
    }, true); // capture phase — runs before the existing handler
})();

addTermLine('<span class="tout">Cloud sync ready. Commands: cloud-sync, cloud-info, cloud-clear</span>');