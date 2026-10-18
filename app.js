// ═══════════════════════════════════════════
//  MyTab — app.js
// ═══════════════════════════════════════════

var DEFAULT_CATS = ['social', 'ai', 'work'];
var DEFAULT_SHORTCUTS = [
  { name:'YouTube',   url:'https://youtube.com',       cat:'social' },
  { name:'Facebook',  url:'https://facebook.com',      cat:'social' },
  { name:'Instagram', url:'https://instagram.com',     cat:'social' },
  { name:'WhatsApp',  url:'https://web.whatsapp.com',  cat:'social' },
  { name:'Twitter',   url:'https://twitter.com',       cat:'social' },
  { name:'ChatGPT',   url:'https://chat.openai.com',   cat:'ai' },
  { name:'Claude',    url:'https://claude.ai',         cat:'ai' },
  { name:'Gemini',    url:'https://gemini.google.com', cat:'ai' },
  { name:'Gmail',     url:'https://gmail.com',         cat:'work' },
  { name:'GitHub',    url:'https://github.com',        cat:'work' },
];

var shortcuts  = DEFAULT_SHORTCUTS.slice();
var categories = DEFAULT_CATS.slice();
var activeTab  = 'social';
var scShowNames = true;
var catShowNames = true;
var catAutoHide = false;
var catBounce = 100;
var searchBounce = 100;
var searchUltra = false;
var searchIconOnly = false;
var searchIconShow = true;
var searchSuggestEnabled = true;
var searchAutoSearchOnClick = true;
var searchHistory = [];
var iconBounce = 100;
var btIconBounce = 100;
var scIconSize = 46;
var qlIconSize = 28;
var qlIconBounce = 100;
var btIconSize = 28;
var searchW;
var DEFAULT_W  = 520;
var searchEnabled = true;
var searchAutoHide = false;
var scAutoHide = false;
var sbEnabled = false;
var sbItems = [];
var sbShowNames = true;
var sbIconSize = 34;
var sbIconBounce = 100;
var sbAutoHide = true;
var pendingSbIcon = null;
// ── Dual-mode Opacity (normal=autohide OFF, hover=autohide ON hover) ──
var searchNormalOpacity = 100;  // 0-100 — base opacity when always visible (autohide OFF)
var searchHoverOpacity  = 0;    // 0-100 — dim opacity when hidden (autohide ON, not hovered)
var scNormalOpacity     = 100;
var scHoverOpacity      = 0;
var catNormalOpacity    = 100;
var catHoverOpacity     = 0;
var qlNormalOpacity     = 100;
var qlHoverOpacity      = 0;
var btNormalOpacity     = 100;
var btHoverOpacity      = 0;
var sbNormalOpacity     = 100;
var sbHoverOpacity      = 0;
var tabdockNormalOpacity = 100;
var tabdockHoverOpacity  = 0;
var catScGap = 5;  // px
var scIconGap = 10;   // px — shortcut grid gap
var catIconGap = 7;   // px — category tabs gap
var qlIconGap = 4;    // px — quick panel icon gap
var btIconGap = 4;    // px — browser tools icon gap
var sbIconGap = 8;    // px — sidebar icon gap
var tabDockIconGap = 8; // px — tab dock icon gap

// ── Hover-glow system (size in px + hex color), independent per panel ──
var searchGlowSize  = 8,  searchGlowColor  = '#ffffff';
var scGlowSize       = 8,  scGlowColor       = '#ffffff';
var catGlowSize       = 8,  catGlowColor      = '#ffffff';
var qlGlowSize        = 8,  qlGlowColor       = '#ffffff';
var btGlowSize        = 8,  btGlowColor       = '#ffffff';
var sbGlowSize        = 8,  sbGlowColor       = '#ffffff';
var tabDockHoverGlowSize = 8, tabDockHoverGlowColor = '#ffffff'; // distinct from existing tabDockGlow (active-tab glow)

var pendingSbToolIcons = {};
var tabDockEnabled = false;
var tabDockIconSize = 28;
var tabDockCloseMode = 'hover';
var tabDockPeek = 0;
var tabDockGlow = 70;
var tabDockDupNumbers = true;
var tabDockAutoHide = true;
var tabDockBounce = 100;
var tabsFloatX = null;
var tabsFloatY = null;
var SB_TOOLS = [
  { id: 'new_tab', name: 'New Tab', symbol: '+' },
  { id: 'close_tab', name: 'Close', symbol: 'x' },
  { id: 'close_others', name: 'Close Others', symbol: 'O' },
  { id: 'reload', name: 'Reload', symbol: 'R' },
  { id: 'back', name: 'Back', symbol: '<' },
  { id: 'forward', name: 'Forward', symbol: '>' }
];

// ── Elements ──────────────────────────────
var container   = document.getElementById('main-container');
var dragHandle  = document.getElementById('drag-handle');
var searchWrap  = document.getElementById('search-wrap');
var searchInput = document.getElementById('search');
var resizeEl    = document.getElementById('resize-handle');
var resizeElLeft = document.getElementById('resize-handle-left');
var searchClearBtn = document.getElementById('search-clear-btn');
var tabsEl      = document.getElementById('tabs');
var tabsWrapEl  = document.getElementById('tabs-wrap');
var shortcutsEl = document.getElementById('shortcuts');
var panel       = document.getElementById('settings-panel');
var ctxMenu     = document.getElementById('ctx-menu');

// ── Storage helpers ───────────────────────
function save(callback) {
  chrome.storage.local.set({
    mytab_shortcuts:  shortcuts,
    mytab_cats:       categories,
    mytab_tab:        activeTab,
    mytab_sw:         searchW,
    mytab_sc_shownames: scShowNames,
    mytab_icon_bounce: iconBounce,
    mytab_bt_icon_bounce: btIconBounce,
    mytab_sidebar_bounce: sbIconBounce,
    mytab_sc_icon_size: scIconSize,
    mytab_ql_icon_size: qlIconSize,
    mytab_bt_icon_size: btIconSize,
    mytab_search_ultra: searchUltra,
    mytab_search_icononly: searchIconOnly,
    mytab_search_iconshow: searchIconShow,
    mytab_search_suggest: searchSuggestEnabled,
    mytab_search_autosearch: searchAutoSearchOnClick,
    mytab_search_enabled: searchEnabled,
    mytab_search_autohide: searchAutoHide,
    mytab_sc_autohide: scAutoHide,
    mytab_search_bounce: searchBounce,
    mytab_cat_shownames: catShowNames,
    mytab_cat_autohide: catAutoHide,
    mytab_cat_bounce: catBounce,
    mytab_sidebar_autohide: sbAutoHide,
    mytab_search_normal_opacity:   searchNormalOpacity,
    mytab_search_hover_opacity:    searchHoverOpacity,
    mytab_sc_normal_opacity:       scNormalOpacity,
    mytab_sc_hover_opacity:        scHoverOpacity,
    mytab_cat_normal_opacity:      catNormalOpacity,
    mytab_cat_hover_opacity:       catHoverOpacity,
    mytab_ql_normal_opacity:       qlNormalOpacity,
    mytab_ql_hover_opacity:        qlHoverOpacity,
    mytab_bt_normal_opacity:       btNormalOpacity,
    mytab_bt_hover_opacity:        btHoverOpacity,
    mytab_sb_normal_opacity:       sbNormalOpacity,
    mytab_sb_hover_opacity:        sbHoverOpacity,
    mytab_tabdock_normal_opacity:  tabdockNormalOpacity,
    mytab_tabdock_hover_opacity:   tabdockHoverOpacity,
    mytab_cat_sc_gap: catScGap,
    mytab_sc_icon_gap: scIconGap,
    mytab_cat_icon_gap: catIconGap,
    mytab_ql_icon_gap: qlIconGap,
    mytab_bt_icon_gap: btIconGap,
    mytab_search_glow_size: searchGlowSize,
    mytab_search_glow_color: searchGlowColor,
    mytab_sc_glow_size: scGlowSize,
    mytab_sc_glow_color: scGlowColor,
    mytab_cat_glow_size: catGlowSize,
    mytab_cat_glow_color: catGlowColor,
    mytab_ql_glow_size: qlGlowSize,
    mytab_ql_glow_color: qlGlowColor,
    mytab_bt_glow_size: btGlowSize,
    mytab_bt_glow_color: btGlowColor,
    mytab_sb_glow_size: sbGlowSize,
    mytab_sb_glow_color: sbGlowColor,
    mytab_tabdock_hoverglow_size: tabDockHoverGlowSize,
    mytab_tabdock_hoverglow_color: tabDockHoverGlowColor
  }, function() { if (callback) callback(); });
}

function loadAll(callback) {
  chrome.storage.local.get(
    ['mytab_shortcuts','mytab_cats','mytab_tab','mytab_sw','mytab_x','mytab_y','mytab_ql','mytab_ql_x','mytab_ql_y','mytab_ql_autohide','mytab_ql_dock','mytab_bt_enabled','mytab_bt_autohide','mytab_bt_hidden','mytab_bt_icons','mytab_bt_order','mytab_bt_x','mytab_bt_y','mytab_bt_dock','mytab_bt_dock_cross','mytab_bt_showlabels','mytab_sc_shownames','mytab_icon_bounce','mytab_bt_icon_bounce','mytab_sidebar_bounce','mytab_sc_icon_size','mytab_ql_icon_size','mytab_ql_icon_bounce','mytab_bt_icon_size','mytab_search_ultra','mytab_search_icononly','mytab_search_iconshow','mytab_search_suggest','mytab_search_autosearch','mytab_search_enabled','mytab_search_autohide','mytab_sc_autohide','mytab_sidebar_enabled','mytab_sidebar_items','mytab_sidebar_shownames','mytab_sidebar_icon_size','mytab_sidebar_autohide','mytab_tabdock_enabled','mytab_tabdock_icon_size','mytab_tabdock_close_mode','mytab_tabdock_peek','mytab_tabdock_glow','mytab_tabdock_dup_numbers','mytab_tabdock_autohide','mytab_tabs_x','mytab_tabs_y','mytab_folder_auto_advance','mytab_search_bounce','mytab_cat_shownames','mytab_cat_autohide','mytab_cat_bounce','mytab_tabdock_bounce',
     'mytab_search_normal_opacity','mytab_search_hover_opacity','mytab_sc_normal_opacity','mytab_sc_hover_opacity','mytab_cat_normal_opacity','mytab_cat_hover_opacity','mytab_ql_normal_opacity','mytab_ql_hover_opacity','mytab_bt_normal_opacity','mytab_bt_hover_opacity','mytab_sb_normal_opacity','mytab_sb_hover_opacity','mytab_tabdock_normal_opacity','mytab_tabdock_hover_opacity','mytab_cat_sc_gap',
     'mytab_sc_icon_gap','mytab_cat_icon_gap','mytab_ql_icon_gap','mytab_bt_icon_gap','mytab_sb_icon_gap','mytab_tabdock_icon_gap',
     'mytab_search_glow_size','mytab_search_glow_color','mytab_sc_glow_size','mytab_sc_glow_color','mytab_cat_glow_size','mytab_cat_glow_color','mytab_ql_glow_size','mytab_ql_glow_color','mytab_bt_glow_size','mytab_bt_glow_color','mytab_sb_glow_size','mytab_sb_glow_color','mytab_tabdock_hoverglow_size','mytab_tabdock_hoverglow_color'],
    function(data) { callback(data); }
  );
}

// ── IndexedDB for background (supports large video files) ──
var BG_DB_NAME = 'mytab_bg_db', BG_STORE = 'bg', BG_KEY = 'current', BG_FOLDER_KEY = 'folder';
var _bgDb = null;
var bgFolderTimer = null;

function openBgDb(cb) {
  if (_bgDb) { cb(_bgDb); return; }
  var req = indexedDB.open(BG_DB_NAME, 2);
  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains(BG_STORE)) {
      db.createObjectStore(BG_STORE);
    }
  };
  req.onsuccess = function(e) { _bgDb = e.target.result; cb(_bgDb); };
  req.onerror   = function()  { cb(null); };
}

function saveBg(dataUrl, type) {
  openBgDb(function(db) {
    if (!db) return;
    var tx = db.transaction(BG_STORE, 'readwrite');
    tx.objectStore(BG_STORE).put({ dataUrl: dataUrl, type: type }, BG_KEY);
  });
}

function clearBg() {
  openBgDb(function(db) {
    if (!db) return;
    var tx = db.transaction(BG_STORE, 'readwrite');
    tx.objectStore(BG_STORE).delete(BG_KEY);
  });
}

function loadBg(cb) {
  openBgDb(function(db) {
    if (!db) { cb(null, null); return; }
    var tx  = db.transaction(BG_STORE, 'readonly');
    var req = tx.objectStore(BG_STORE).get(BG_KEY);
    req.onsuccess = function() {
      var r = req.result;
      cb(r ? r.dataUrl : null, r ? r.type : null);
    };
    req.onerror = function() { cb(null, null); };
  });
}

// ── Folder storage: metadata + each video stored under its own key ──
// Keys: BG_FOLDER_KEY → { count, timerValue, timerUnit, names[] }
//       BG_FOLDER_KEY+'_v0', '_v1', ... → { name, dataUrl }

function saveBgFolder(folder, cb) {
  // folder = { videos: [{name, dataUrl},...], timerValue, timerUnit }
  openBgDb(function(db) {
    if (!db) { if (cb) cb(false); return; }

    var videos = folder.videos || [];
    var meta = {
      count:      videos.length,
      timerValue: folder.timerValue || '',
      timerUnit:  folder.timerUnit  || 'minute',
      names:      videos.map(function(v) { return v.name; })
    };

    // Save each video individually
    var saved = 0;
    var failed = false;

    function saveMeta() {
      var tx2 = db.transaction(BG_STORE, 'readwrite');
      tx2.objectStore(BG_STORE).put(meta, BG_FOLDER_KEY);
      tx2.oncomplete = function() { if (cb) cb(true); };
      tx2.onerror    = function() { if (cb) cb(false); };
    }

    if (!videos.length) { saveMeta(); return; }

    videos.forEach(function(video, i) {
      var tx = db.transaction(BG_STORE, 'readwrite');
      var req = tx.objectStore(BG_STORE).put({ name: video.name, dataUrl: video.dataUrl }, BG_FOLDER_KEY + '_v' + i);
      tx.oncomplete = function() {
        saved++;
        if (saved === videos.length && !failed) saveMeta();
      };
      tx.onerror = function(e) {
        if (!failed) {
          failed = true;
          console.error('MyTab: Failed to save video ' + i + ' to IndexedDB', e);
          if (cb) cb(false);
        }
      };
    });
  });
}

function loadBgFolder(cb) {
  openBgDb(function(db) {
    if (!db) { cb(null); return; }
    var tx  = db.transaction(BG_STORE, 'readonly');
    var req = tx.objectStore(BG_STORE).get(BG_FOLDER_KEY);
    req.onsuccess = function() {
      var meta = req.result;
      if (!meta) { cb(null); return; }

      // ── Backward compat: old format stored videos[] inline ──
      if (Array.isArray(meta.videos) && meta.videos.length) {
        cb(meta);
        return;
      }

      if (!meta.count) { cb(null); return; }
      // Load each video
      var videos = new Array(meta.count);
      var loaded = 0;
      var failed = false;
      for (var i = 0; i < meta.count; i++) {
        (function(idx) {
          var tx2 = db.transaction(BG_STORE, 'readonly');
          var req2 = tx2.objectStore(BG_STORE).get(BG_FOLDER_KEY + '_v' + idx);
          req2.onsuccess = function() {
            if (req2.result) {
              videos[idx] = req2.result;
            } else {
              // video slot missing — skip gracefully
              videos[idx] = null;
              failed = true;
            }
            loaded++;
            if (loaded === meta.count) {
              var validVideos = videos.filter(Boolean);
              if (!validVideos.length) { cb(null); return; }
              cb({ videos: validVideos, timerValue: meta.timerValue, timerUnit: meta.timerUnit });
            }
          };
          req2.onerror = function() {
            loaded++;
            failed = true;
            if (loaded === meta.count) {
              var validVideos = videos.filter(Boolean);
              cb(validVideos.length ? { videos: validVideos, timerValue: meta.timerValue, timerUnit: meta.timerUnit } : null);
            }
          };
        })(i);
      }
    };
    req.onerror = function() { cb(null); };
  });
}

function clearBgFolder(cb) {
  openBgDb(function(db) {
    if (!db) { if (cb) cb(); return; }
    // Load meta to know how many videos to delete
    var tx = db.transaction(BG_STORE, 'readonly');
    var req = tx.objectStore(BG_STORE).get(BG_FOLDER_KEY);
    req.onsuccess = function() {
      var meta = req.result;
      var count = (meta && meta.count) ? meta.count : 0;
      var tx2 = db.transaction(BG_STORE, 'readwrite');
      tx2.objectStore(BG_STORE).delete(BG_FOLDER_KEY);
      for (var i = 0; i < count; i++) {
        tx2.objectStore(BG_STORE).delete(BG_FOLDER_KEY + '_v' + i);
      }
      tx2.oncomplete = function() { if (cb) cb(); };
    };
    req.onerror = function() { if (cb) cb(); };
  });
}

// ── Wallpaper folder storage (mirrors loadBgFolder/clearBgFolder) ──
// Loads wallpaper images unconditionally so the wallpaper UI (name, count,
// next/remove buttons) can be restored on startup even when wallpaper isn't
// the currently active background source.
function loadWallpaperFolder(cb) {
  openBgDb(function(db) {
    if (!db) { cb(null); return; }
    var tx = db.transaction(BG_STORE, 'readonly');
    var req = tx.objectStore(BG_STORE).get(BG_WALLPAPER_KEY);
    req.onsuccess = function() {
      var meta = req.result;
      if (!meta || !meta.count) { cb(null); return; }
      var imgs = new Array(meta.count);
      var loaded = 0;
      for (var i = 0; i < meta.count; i++) {
        (function(idx) {
          var tx2 = db.transaction(BG_STORE, 'readonly');
          var req2 = tx2.objectStore(BG_STORE).get(BG_WALLPAPER_KEY + '_v' + idx);
          req2.onsuccess = function() {
            imgs[idx] = req2.result || null;
            loaded++;
            if (loaded === meta.count) {
              var valid = imgs.filter(Boolean);
              cb(valid.length ? valid : null);
            }
          };
          req2.onerror = function() {
            loaded++;
            if (loaded === meta.count) {
              var valid = imgs.filter(Boolean);
              cb(valid.length ? valid : null);
            }
          };
        })(i);
      }
    };
    req.onerror = function() { cb(null); };
  });
}

function clearWallpaperFolder(cb) {
  openBgDb(function(db) {
    if (!db) { if (cb) cb(); return; }
    var tx = db.transaction(BG_STORE, 'readonly');
    var req = tx.objectStore(BG_STORE).get(BG_WALLPAPER_KEY);
    req.onsuccess = function() {
      var meta = req.result;
      var cnt = (meta && meta.count) ? meta.count : 0;
      var tx2 = db.transaction(BG_STORE, 'readwrite');
      tx2.objectStore(BG_STORE).delete(BG_WALLPAPER_KEY);
      for (var i = 0; i < cnt; i++) {
        tx2.objectStore(BG_STORE).delete(BG_WALLPAPER_KEY + '_v' + i);
      }
      tx2.oncomplete = function() { if (cb) cb(); };
    };
    req.onerror = function() { if (cb) cb(); };
  });
}

function savePos(x, y) {
  chrome.storage.local.set({ mytab_x: Math.round(x), mytab_y: Math.round(y) });
}
function clearPos() {
  chrome.storage.local.remove(['mytab_x','mytab_y']);
}

// ── Position & Size ───────────────────────
function applySearchWidth(w) {
  searchW = Math.max(300, Math.min(w, window.innerWidth - 40));
  searchWrap.style.width = searchW + 'px';
  container.style.width  = searchW + 'px';
  chrome.storage.local.set({ mytab_sw: searchW });
}

function placeContainer(x, y) {
  var w = container.offsetWidth  || searchW;
  var h = container.offsetHeight || 200;
  x = Math.max(0, Math.min(x, window.innerWidth  - w));
  y = Math.max(0, Math.min(y, window.innerHeight - h));
  container.style.left      = x + 'px';
  container.style.top       = y + 'px';
  container.style.transform = 'none';
  dragHandle.style.left = (x + searchW / 2) + 'px';
  dragHandle.style.top  = (y - 22) + 'px';
  savePos(x, y);
}

function centerContainer() {
  container.style.left      = '50%';
  container.style.top       = '50%';
  container.style.transform = 'translate(-50%,-50%)';
  clearPos();
  setTimeout(positionDragHandle, 50);
}

function positionDragHandle() {
  var r = container.getBoundingClientRect();
  dragHandle.style.left = (r.left + r.width / 2) + 'px';
  dragHandle.style.top  = (r.top - 22) + 'px';
}

// ── Drag container (smooth) ───────────────
var dragActive = false, dragOX = 0, dragOY = 0;
var dragRAF = null;
var dragTargetX = 0, dragTargetY = 0;
var dragCurrentX = 0, dragCurrentY = 0;

dragHandle.addEventListener('mousedown', function(e) {
  e.preventDefault();
  dragActive = true;
  container.style.transition = 'none';
  dragHandle.style.transition = 'none';
  var r = container.getBoundingClientRect();
  container.style.left = r.left + 'px';
  container.style.top  = r.top  + 'px';
  container.style.transform = 'none';
  dragOX = e.clientX - r.left;
  dragOY = e.clientY - r.top;
  dragCurrentX = r.left;
  dragCurrentY = r.top;
  dragTargetX  = r.left;
  dragTargetY  = r.top;
  container.classList.add('dragging');
  animateDrag();
});

function animateDrag() {
  if (!dragActive) return;
  dragCurrentX += (dragTargetX - dragCurrentX) * 0.18;
  dragCurrentY += (dragTargetY - dragCurrentY) * 0.18;
  var w = container.offsetWidth  || searchW;
  var h = container.offsetHeight || 200;
  var cx = Math.max(0, Math.min(dragCurrentX, window.innerWidth  - w));
  var cy = Math.max(0, Math.min(dragCurrentY, window.innerHeight - h));
  container.style.left = cx + 'px';
  container.style.top  = cy + 'px';
  dragHandle.style.left = (cx + searchW / 2) + 'px';
  dragHandle.style.top  = (cy - 22) + 'px';
  dragRAF = requestAnimationFrame(animateDrag);
}

document.addEventListener('mousemove', function(e) {
  if (!dragActive) return;
  dragTargetX = e.clientX - dragOX;
  dragTargetY = e.clientY - dragOY;
});

document.addEventListener('mouseup', function() {
  if (!dragActive) return;
  dragActive = false;
  cancelAnimationFrame(dragRAF);
  container.classList.remove('dragging');
  // snap to final position
  var w = container.offsetWidth  || searchW;
  var h = container.offsetHeight || 200;
  var fx = Math.max(0, Math.min(dragTargetX, window.innerWidth  - w));
  var fy = Math.max(0, Math.min(dragTargetY, window.innerHeight - h));
  container.style.left = fx + 'px';
  container.style.top  = fy + 'px';
  dragHandle.style.left = (fx + searchW / 2) + 'px';
  dragHandle.style.top  = (fy - 22) + 'px';
  savePos(fx, fy);
  
  // Move category name with container if it has been manually positioned
  if (tabsFloatX != null || tabsFloatY != null) {
    var deltaX = fx - dragCurrentX;
    var deltaY = fy - dragCurrentY;
    if (tabsFloatX != null) tabsFloatX += deltaX;
    if (tabsFloatY != null) tabsFloatY += deltaY;
    applyTabsFloatPos(tabsFloatX || 0, tabsFloatY || 0);
    chrome.storage.local.set({ mytab_tabs_x: tabsFloatX, mytab_tabs_y: tabsFloatY });
  }
});

// ── Resize search bar ─────────────────────
var resizing = false, resizeStartX = 0, resizeStartW = 0, resizeSide = 1;

resizeEl.addEventListener('mousedown', function(e) {
  e.preventDefault(); e.stopPropagation();
  resizing     = true;
  resizeSide   = 1;
  resizeStartX = e.clientX;
  resizeStartW = searchW;
});

resizeElLeft.addEventListener('mousedown', function(e) {
  e.preventDefault(); e.stopPropagation();
  resizing     = true;
  resizeSide   = -1;
  resizeStartX = e.clientX;
  resizeStartW = searchW;
});

document.addEventListener('mousemove', function(e) {
  if (!resizing) return;
  applySearchWidth(resizeStartW + (e.clientX - resizeStartX) * 2 * resizeSide);
  positionDragHandle();
});

document.addEventListener('mouseup', function() { resizing = false; });

// ── Search Suggestions (Google live suggestions + local history) ──
var SEARCH_HISTORY_KEY = 'mytab_search_history';
var SEARCH_HISTORY_MAX = 12;
var suggestBox = document.getElementById('search-suggest-box');
var suggestDebounceTimer = null;
var suggestActiveIndex = -1;
var suggestItems = []; // current rendered list: [{ text, isHistory }]
var suggestFetchAbort = null;
var suggestLastData = null; // last buildSuggestionData() result, for expand/collapse re-render

function loadSearchHistory(cb) {
  chrome.storage.local.get([SEARCH_HISTORY_KEY], function(d) {
    searchHistory = Array.isArray(d[SEARCH_HISTORY_KEY]) ? d[SEARCH_HISTORY_KEY] : [];
    if (cb) cb();
  });
}

function saveSearchHistory() {
  chrome.storage.local.set({ mytab_search_history: searchHistory });
}

function addToSearchHistory(q) {
  q = q.trim();
  if (!q) return;
  // remove existing duplicate (case-insensitive), then unshift to front
  searchHistory = searchHistory.filter(function(item) {
    return item.toLowerCase() !== q.toLowerCase();
  });
  searchHistory.unshift(q);
  if (searchHistory.length > SEARCH_HISTORY_MAX) searchHistory.length = SEARCH_HISTORY_MAX;
  saveSearchHistory();
}

function removeFromSearchHistory(q) {
  searchHistory = searchHistory.filter(function(item) { return item !== q; });
  saveSearchHistory();
}

var suggestHistoryExpanded = false; // whether the collapsed history group is expanded

var ICON_HISTORY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>';
var ICON_SEARCH  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16" y2="16"/></svg>';
var ICON_CLOSE   = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
var ICON_CHEVRON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

// Builds the raw data the dropdown needs: the most recent history match,
// any additional older matches (shown only when expanded), and Google's
// live suggestions (deduped against history matches already shown).
function buildSuggestionData(q, googleResults) {
  var qLower = q.toLowerCase();
  var historyMatches = searchHistory.filter(function(h) {
    return h.toLowerCase().indexOf(qLower) !== -1;
  }).slice(0, 6); // already most-recent-first since addToSearchHistory unshifts

  var topHistory   = historyMatches.slice(0, 1);
  var extraHistory = historyMatches.slice(1);

  var seen = {};
  historyMatches.forEach(function(h) { seen[h.toLowerCase()] = true; });

  var googleList = [];
  googleResults.forEach(function(g) {
    if (!seen[g.toLowerCase()] && googleList.length < 8) {
      googleList.push(g);
      seen[g.toLowerCase()] = true;
    }
  });

  return { topHistory: topHistory, extraHistory: extraHistory, google: googleList };
}

// Flattens buildSuggestionData's output into the actual rendered row list,
// based on current expand/collapse state. Each row: { text, isHistory, isExpandToggle, hasExtra }
function flattenSuggestionData(data) {
  var rows = [];
  data.topHistory.forEach(function(h) {
    rows.push({ text: h, isHistory: true, hasExtra: data.extraHistory.length > 0 });
  });
  if (suggestHistoryExpanded) {
    data.extraHistory.forEach(function(h) {
      rows.push({ text: h, isHistory: true, hasExtra: false });
    });
  }
  data.google.forEach(function(g) {
    rows.push({ text: g, isHistory: false, hasExtra: false });
  });
  return rows;
}

function renderSuggestions(items) {
  suggestItems = items;
  suggestActiveIndex = -1;
  if (!items.length) {
    closeSuggestions();
    return;
  }
  suggestBox.innerHTML = items.map(function(item, i) {
    var expandToggle = item.hasExtra
      ? '<span class="search-suggest-expand" data-expand="' + i + '">' + ICON_CHEVRON + '</span>'
      : '';
    var removeBtn = (item.isHistory && !item.hasExtra)
      ? '<span class="search-suggest-remove" data-remove="' + i + '">' + ICON_CLOSE + '</span>'
      : '';
    return (
      '<div class="search-suggest-item' + (item.hasExtra ? ' has-expand' : '') + '" data-idx="' + i + '">' +
        '<span class="search-suggest-icon">' + (item.isHistory ? ICON_HISTORY : ICON_SEARCH) + '</span>' +
        '<span class="search-suggest-text"></span>' +
        expandToggle + removeBtn +
      '</div>'
    );
  }).join('');
  // set text via textContent to avoid any HTML injection from query text
  var rows = suggestBox.querySelectorAll('.search-suggest-item');
  rows.forEach(function(row, i) {
    row.querySelector('.search-suggest-text').textContent = items[i].text;
  });
  if (suggestHistoryExpanded) {
    var expandIcon = suggestBox.querySelector('[data-expand]');
    if (expandIcon) expandIcon.classList.add('expanded');
  }
  suggestBox.classList.add('open');
}

function closeSuggestions() {
  suggestBox.classList.remove('open');
  suggestBox.innerHTML = '';
  suggestItems = [];
  suggestActiveIndex = -1;
  suggestHistoryExpanded = false;
  suggestLastData = null;
}

function updateActiveHighlight() {
  var rows = suggestBox.querySelectorAll('.search-suggest-item');
  rows.forEach(function(row, i) {
    row.classList.toggle('active', i === suggestActiveIndex);
  });
}

function runSearch(q) {
  q = q.trim();
  if (!q) return;
  addToSearchHistory(q);
  closeSuggestions();
  window.location.href = q.startsWith('http') ? q : 'https://www.google.com/search?q=' + encodeURIComponent(q);
}

function fetchGoogleSuggestions(q, cb) {
  if (suggestFetchAbort) suggestFetchAbort.abort();
  var controller = new AbortController();
  suggestFetchAbort = controller;
  fetch('https://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(q), { signal: controller.signal })
    .then(function(res) { return res.json(); })
    .then(function(data) { cb(Array.isArray(data) && Array.isArray(data[1]) ? data[1] : []); })
    .catch(function() { cb([]); });
}



searchInput.addEventListener('input', function(e) {
  var q = e.target.value;
  searchWrap.classList.toggle('has-value', q.length > 0);
  clearTimeout(suggestDebounceTimer);

  if (!searchSuggestEnabled) { closeSuggestions(); return; }

  if (!q.trim()) {
    closeSuggestions();
    return;
  }

  suggestDebounceTimer = setTimeout(function() {
    fetchGoogleSuggestions(q, function(results) {
      suggestHistoryExpanded = false;
      suggestLastData = buildSuggestionData(q, results);
      renderSuggestions(flattenSuggestionData(suggestLastData));
    });
  }, 150);
});

// (Note: history suggestions intentionally do NOT show on bare focus —
// they only appear once the person starts typing, filtered to match.)

document.addEventListener('click', function(e) {
  if (!suggestBox.classList.contains('open')) return;
  if (e.target === searchInput || suggestBox.contains(e.target)) return;
  closeSuggestions();
});

suggestBox.addEventListener('click', function(e) {
  var expandBtn = e.target.closest('[data-expand]');
  if (expandBtn) {
    e.stopPropagation();
    suggestHistoryExpanded = !suggestHistoryExpanded;
    if (suggestLastData) renderSuggestions(flattenSuggestionData(suggestLastData));
    return;
  }
  var removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) {
    e.stopPropagation();
    var idx = parseInt(removeBtn.getAttribute('data-remove'), 10);
    var item = suggestItems[idx];
    if (item) removeFromSearchHistory(item.text);
    // re-run the same query's suggestion pipeline so collapsed/expanded
    // grouping stays correct after removal, rather than just splicing the row
    var q = searchInput.value;
    if (q.trim() && suggestLastData) {
      suggestLastData = buildSuggestionData(q, suggestLastData.google);
      renderSuggestions(flattenSuggestionData(suggestLastData));
    } else {
      closeSuggestions();
    }
    return;
  }
  var row = e.target.closest('.search-suggest-item');
  if (row) {
    var i = parseInt(row.getAttribute('data-idx'), 10);
    var picked = suggestItems[i];
    if (picked) {
      if (searchAutoSearchOnClick) {
        searchInput.value = picked.text;
        runSearch(picked.text);
      } else {
        searchInput.value = picked.text + ' ';
        searchWrap.classList.add('has-value');
        searchInput.focus();
        // move cursor to end
        var len = searchInput.value.length;
        searchInput.setSelectionRange(len, len);
        closeSuggestions();
      }
    }
  }
});

// ── Search Clear Button ───────────────────
searchClearBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  searchInput.value = '';
  searchWrap.classList.remove('has-value');
  closeSuggestions();
  searchInput.focus();
});

// ── Search ────────────────────────────────
searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowDown') {
    if (!suggestItems.length) return;
    e.preventDefault();
    suggestActiveIndex = (suggestActiveIndex + 1) % suggestItems.length;
    updateActiveHighlight();
    return;
  }
  if (e.key === 'ArrowUp') {
    if (!suggestItems.length) return;
    e.preventDefault();
    suggestActiveIndex = (suggestActiveIndex - 1 + suggestItems.length) % suggestItems.length;
    updateActiveHighlight();
    return;
  }
  if (e.key === 'Escape') {
    closeSuggestions();
    return;
  }
  if (e.key !== 'Enter') return;
  if (suggestActiveIndex >= 0 && suggestItems[suggestActiveIndex]) {
    runSearch(suggestItems[suggestActiveIndex].text);
    return;
  }
  var q = e.target.value.trim();
  if (!q) return;
  runSearch(q);
});

// ── Favicon ───────────────────────────────
function faviconUrl(url) {
  try { return 'https://www.google.com/s2/favicons?domain=' + new URL(url).origin + '&sz=64'; }
  catch(e) { return ''; }
}

function enableSmoothReorder(item, container, options) {
  var startX = 0, startY = 0, startRect = null, placeholder = null;
  var dragging = false, suppressClick = false;
  var lastClientX = 0, lastClientY = 0;

  item.addEventListener('pointerdown', function(e) {
    if (e.button !== 0) return;
    if (e.target.closest && e.target.closest('button,input,label')) return;

    startX = e.clientX;
    startY = e.clientY;
    startRect = item.getBoundingClientRect();

    function beginDrag() {
      dragging = true;
      suppressClick = true;
      if (options.onStart) options.onStart();

      placeholder = document.createElement('div');
      placeholder.className = item.className + ' sort-placeholder';
      placeholder.style.width = startRect.width + 'px';
      placeholder.style.height = startRect.height + 'px';
      placeholder.style.pointerEvents = 'none';
      item.parentNode.insertBefore(placeholder, item);

      item.classList.add('smooth-dragging');
      item.style.position = 'fixed';
      item.style.left = startRect.left + 'px';
      item.style.top = startRect.top + 'px';
      item.style.width = startRect.width + 'px';
      item.style.height = startRect.height + 'px';
      item.style.zIndex = '2000';
      item.style.pointerEvents = 'none';
      item.style.margin = '0';
      document.body.appendChild(item);
      document.body.classList.add('is-sorting');
    }

    function move(ev) {
      lastClientX = ev.clientX;
      lastClientY = ev.clientY;
      var dx = ev.clientX - startX;
      var dy = ev.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) > 4) beginDrag();
      if (!dragging) return;
      ev.preventDefault();

      item.style.left = (startRect.left + dx) + 'px';
      item.style.top = (startRect.top + dy) + 'px';

      var target = document.elementFromPoint(ev.clientX, ev.clientY);
      target = target && target.closest ? target.closest(options.itemSelector) : null;
      if (!target || target === item || target === placeholder || !container.contains(target)) return;

      var r = target.getBoundingClientRect();
      var after = options.axis === 'y'
        ? ev.clientY > r.top + r.height / 2
        : (ev.clientY > r.top + r.height / 2 || ev.clientX > r.left + r.width / 2);
      var movingItems = Array.prototype.slice.call(container.children).filter(function(child) {
        return child !== item && child !== placeholder;
      });
      var before = new Map();
      movingItems.forEach(function(child) {
        before.set(child, child.getBoundingClientRect());
      });
      container.insertBefore(placeholder, after ? target.nextSibling : target);
      movingItems.forEach(function(child) {
        var oldRect = before.get(child);
        var newRect = child.getBoundingClientRect();
        var dx2 = oldRect.left - newRect.left;
        var dy2 = oldRect.top - newRect.top;
        if (!dx2 && !dy2) return;
        child.style.transition = 'none';
        child.style.transform = 'translate(' + dx2 + 'px,' + dy2 + 'px)';
        child.offsetHeight;
        child.style.transition = 'transform .22s cubic-bezier(.22,1,.36,1)';
        child.style.transform = '';
      });
    }

    function up() {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);

      if (!dragging) return;

      container.insertBefore(item, placeholder);
      placeholder.remove();
      Array.prototype.slice.call(container.children).forEach(function(child) {
        child.style.transition = '';
        child.style.transform = '';
      });
      item.classList.remove('smooth-dragging');
      item.removeAttribute('style');
      document.body.classList.remove('is-sorting');
      dragging = false;
      if (options.onCommit) options.onCommit({ x: lastClientX, y: lastClientY });
      if (options.onEnd) options.onEnd();
      setTimeout(function() { suppressClick = false; }, 80);
    }

    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  });

  item.addEventListener('click', function(e) {
    if (suppressClick) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}

// ── Custom Dropdown ───────────────────────
var dropdownValues = {};

function buildDropdown(id, items, selectedValue) {
  var container = document.getElementById(id);
  if (!container) return;
  var list = container.querySelector('.custom-select-list');
  var label = container.querySelector('.custom-select-label');

  // pick current value
  var current = selectedValue !== undefined ? selectedValue : dropdownValues[id];
  if (!current || items.indexOf(current) === -1) current = items[0] || '';
  dropdownValues[id] = current;
  label.textContent = current ? current.charAt(0).toUpperCase() + current.slice(1) : '—';

  list.innerHTML = '';
  items.forEach(function(item) {
    var opt = document.createElement('div');
    opt.className = 'custom-select-option' + (item === current ? ' selected' : '');
    opt.textContent = item.charAt(0).toUpperCase() + item.slice(1);
    opt.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownValues[id] = item;
      label.textContent = item.charAt(0).toUpperCase() + item.slice(1);
      list.querySelectorAll('.custom-select-option').forEach(function(o) {
        o.classList.toggle('selected', o === opt);
      });
      container.classList.remove('open');
    });
    list.appendChild(opt);
  });
}

function initDropdownToggle(id) {
  var container = document.getElementById(id);
  if (!container) return;
  var trigger = container.querySelector('.custom-select-trigger');
  var list = container.querySelector('.custom-select-list');

  function positionList() {
    var rect = trigger.getBoundingClientRect();
    var gap = 6;
    var spaceBelow = window.innerHeight - rect.bottom;
    var spaceAbove = rect.top;
    list.style.left = rect.left + 'px';
    list.style.width = rect.width + 'px';

    // Measure list height (it's already in DOM, just not visible yet)
    var listHeight = list.offsetHeight;

    if (spaceBelow >= listHeight + gap || spaceBelow >= spaceAbove) {
      // open downward
      list.style.top = (rect.bottom + gap) + 'px';
      list.style.bottom = 'auto';
      list.style.transformOrigin = 'top center';
    } else {
      // not enough room below — open upward
      list.style.top = 'auto';
      list.style.bottom = (window.innerHeight - rect.top + gap) + 'px';
      list.style.transformOrigin = 'bottom center';
    }
  }

  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    // close all other dropdowns
    document.querySelectorAll('.custom-select.open').forEach(function(d) {
      if (d !== container) d.classList.remove('open');
    });
    var willOpen = !container.classList.contains('open');
    if (willOpen) positionList();
    container.classList.toggle('open');
  });

  // Reposition on scroll/resize while open (settings panel scrolls internally)
  window.addEventListener('resize', function() {
    if (container.classList.contains('open')) positionList();
  });
  document.addEventListener('scroll', function() {
    if (container.classList.contains('open')) positionList();
  }, true);
}

// close dropdowns on outside click
document.addEventListener('click', function() {
  document.querySelectorAll('.custom-select.open').forEach(function(d) {
    d.classList.remove('open');
  });
});

// ── Render Tabs ───────────────────────────
function renderTabs() {
  tabsEl.innerHTML = '';
  categories.forEach(function(cat) {
    tabsEl.appendChild(makeTabBtn(cat));
  });
  tabsEl.appendChild(makeInlineCatAdd());

  buildDropdown('sc-cat-dropdown', categories);
}

function addCategoryByName(name) {
  name = (name || '').trim().toLowerCase();
  if (!name) return false;
  if (categories.indexOf(name) !== -1) {
    alert('Category already exists.');
    return false;
  }
  categories.push(name);
  activeTab = name;
  save();
  renderTabs();
  renderShortcuts();
  return true;
}

function makeInlineCatAdd() {
  var wrap = document.createElement('span');
  wrap.className = 'tab-add-wrap';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tab-add-btn';
  btn.textContent = '+';
  btn.title = 'Add Category';
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    wrap.innerHTML = '';
    var input = document.createElement('input');
    input.className = 'tab-add-input';
    input.placeholder = 'Category...';
    var ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'tab-add-btn';
    ok.textContent = '+';
    ok.style.opacity = '1';
    ok.style.transform = 'scale(1)';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'tab-add-btn';
    cancel.textContent = 'x';
    cancel.style.opacity = '1';
    cancel.style.transform = 'scale(1)';
    function submit() { addCategoryByName(input.value); }
    ok.addEventListener('click', submit);
    cancel.addEventListener('click', function() { renderTabs(); });
    wrap.addEventListener('click', function(ev) { ev.stopPropagation(); });
    input.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter') submit();
      if (ev.key === 'Escape') renderTabs();
    });
    wrap.appendChild(input);
    wrap.appendChild(ok);
    wrap.appendChild(cancel);
    input.focus();
    setTimeout(function() {
      document.addEventListener('click', function closeInlineCat(ev) {
        if (wrap.contains(ev.target)) return;
        document.removeEventListener('click', closeInlineCat);
        renderTabs();
      });
    }, 0);
  });
  wrap.appendChild(btn);
  return wrap;
}

function makeTabBtn(cat) {
  var btn = document.createElement('div');
  btn.className = 'tab-btn' + (cat === activeTab ? ' active' : '');
  btn.dataset.cat = cat;

  var lbl = document.createElement('span');
  lbl.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
  btn.appendChild(lbl);

  btn.addEventListener('click', function() {
    activeTab = cat;
    save();
    renderTabs();
    renderShortcuts();
  });
  btn.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    e.stopPropagation();
    showCategoryDeleteMenu(e.clientX, e.clientY, cat);
  });

  return btn;
}

var catDeleteMenu = null;
function showCategoryDeleteMenu(x, y, cat) {
  if (!catDeleteMenu) {
    catDeleteMenu = document.createElement('div');
    catDeleteMenu.className = 'cat-delete-menu';
    document.body.appendChild(catDeleteMenu);
  }
  catDeleteMenu.innerHTML = '';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Delete';
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    deleteCategory(cat);
    hideCategoryDeleteMenu();
  });
  catDeleteMenu.appendChild(btn);
  catDeleteMenu.style.left = Math.min(x, window.innerWidth - 92) + 'px';
  catDeleteMenu.style.top = Math.min(y, window.innerHeight - 42) + 'px';
  catDeleteMenu.classList.add('open');
}
function hideCategoryDeleteMenu() {
  if (catDeleteMenu) catDeleteMenu.classList.remove('open');
}
function deleteCategory(cat) {
  if (!cat || categories.length <= 1) return;
  var moveTo = categories.find(function(c) { return c !== cat; }) || categories[0];
  shortcuts.forEach(function(s) { if (s.cat === cat) s.cat = moveTo; });
  categories.splice(categories.indexOf(cat), 1);
  if (activeTab === cat) activeTab = categories[0];
  save();
  renderTabs();
  renderShortcuts();
}

// ── Render Shortcuts ──────────────────────
function renderShortcuts() {
  shortcutsEl.innerHTML = '';
  var list = shortcuts.filter(function(s) { return (s.cat || categories[0]) === activeTab; });

  list.forEach(function(sc) {
    var el = document.createElement('div');
    el.className = 'shortcut';
    el.setAttribute('data-sc-index', shortcuts.indexOf(sc));

    var img = document.createElement('img');
    img.src = sc.icon || faviconUrl(sc.url);
    img.alt = sc.name;
    img.addEventListener('error', function() {
      var fb = document.createElement('div');
      fb.className = 'shortcut-icon-fallback';
      fb.textContent = sc.name.charAt(0).toUpperCase();
      if (img.parentNode) img.parentNode.replaceChild(fb, img);
    });

    var span = document.createElement('span');
    span.textContent = sc.name;
    if (!scShowNames) span.style.display = 'none';

    el.appendChild(img);
    el.appendChild(span);
    shortcutsEl.appendChild(el);

    // Click with press animation
    el.addEventListener('mousedown', function() {
      el.classList.add('pressing');
    });
    el.addEventListener('mouseup', function() {
      el.classList.remove('pressing');
    });
    el.addEventListener('mouseleave', function() {
      el.classList.remove('pressing');
    });

    el.addEventListener('click', function() {
      if (ctxMenu.classList.contains('open')) return;
      window.location.href = sc.url;
    });
    el.addEventListener('auxclick', function(e) {
      if (e.button !== 1) return;
      e.preventDefault();
      chrome.tabs.create({ url: sc.url, active: false });
    });

    el.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      showCtxMenu(e.clientX, e.clientY, sc);
    });

    enableSmoothReorder(el, shortcutsEl, {
      itemSelector: '#shortcuts .shortcut',
      axis: 'grid',
      onStart: function() { el.classList.remove('pressing'); },
      onCommit: function(pos) {
        var dropTarget = pos && document.elementFromPoint(pos.x, pos.y);
        var tabTarget = dropTarget && dropTarget.closest ? dropTarget.closest('.tab-btn') : null;
        if (tabTarget && tabTarget.dataset.cat && tabTarget.dataset.cat !== (sc.cat || categories[0])) {
          sc.cat = tabTarget.dataset.cat;
          save();
          renderShortcuts();
          return;
        }
        var orderedActive = Array.prototype.slice.call(shortcutsEl.querySelectorAll('.shortcut')).map(function(node) {
          return shortcuts[parseInt(node.getAttribute('data-sc-index'), 10)];
        }).filter(Boolean);
        var activeI = 0;
        shortcuts = shortcuts.map(function(item) {
          return (item.cat || categories[0]) === activeTab ? orderedActive[activeI++] : item;
        });
        save();
      },
      onEnd: renderShortcuts
    });
  });

  setTimeout(function() {
    alignTabsToFirstShortcut();
    positionDragHandle();
  }, 30);
}

function alignTabsToFirstShortcut() {
  var tabsWrap = document.getElementById('tabs-wrap');
  if (tabsFloatX != null && tabsFloatY != null) return;
  var first = shortcutsEl.querySelector('.shortcut');
  if (!tabsWrap || !first) {
    if (tabsWrap) tabsWrap.style.setProperty('--tabs-left-pad', '0px');
    return;
  }
  var wrapRect = tabsWrap.getBoundingClientRect();
  var firstIcon = first.querySelector('img, .shortcut-icon-fallback');
  var firstRect = (firstIcon || first).getBoundingClientRect();
  tabsWrap.style.setProperty('--tabs-left-pad', Math.max(0, firstRect.left - wrapRect.left - 16) + 'px');
}

function applyTabsFloatPos(x, y) {
  // Remove constraints to allow full-screen movement
  tabsFloatX = x;
  tabsFloatY = y;
  tabsWrapEl.style.position = '';
  tabsWrapEl.style.left = '';
  tabsWrapEl.style.top = '';
  tabsWrapEl.style.width = '';
  tabsWrapEl.style.maxWidth = '';
  tabsWrapEl.style.zIndex = '';
  tabsWrapEl.style.paddingLeft = '0px';
  tabsWrapEl.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  tabsWrapEl.style.marginBottom = Math.max(12, 12 + y) + 'px';
}

function bindTabsFloatDrag() {
  var active = false, dragging = false, sx = 0, sy = 0, px = 0, py = 0;
  tabsWrapEl.addEventListener('pointerdown', function(e) {
    if (e.button !== 0) return;
    if (e.target.closest && e.target.closest('input,button')) return;
    active = true;
    dragging = false;
    sx = e.clientX;
    sy = e.clientY;
    px = tabsFloatX || 0;
    py = tabsFloatY || 0;
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  });
  function move(e) {
    if (!active) return;
    var dx = e.clientX - sx;
    var dy = e.clientY - sy;
    if (!dragging && Math.hypot(dx, dy) < 5) return;
    dragging = true;
    e.preventDefault();
    applyTabsFloatPos(px + dx, py + dy);
  }
  function up() {
    if (dragging) chrome.storage.local.set({ mytab_tabs_x: tabsFloatX, mytab_tabs_y: tabsFloatY });
    active = dragging = false;
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
  }
}
bindTabsFloatDrag();

// ── Context Menu ──────────────────────────
var ctxTarget = null;
var ctxMoveOpen = false;
var ctxEditOpen = false;

function chooseImage(callback) {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', function() {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) { callback(ev.target.result); };
    reader.readAsDataURL(file);
  });
  input.click();
}

function showCtxMenu(x, y, sc) {
  ctxTarget = sc;
  ctxMoveOpen = false;
  ctxEditOpen = false;

  // Build category sub-items
  var catsEl = document.getElementById('ctx-cats');
  catsEl.innerHTML = '';
  catsEl.classList.remove('ctx-cats-open');
  document.getElementById('ctx-edit-panel').classList.remove('open');
  document.getElementById('ctx-move').classList.remove('ctx-hide');
  document.getElementById('ctx-delete').classList.remove('ctx-hide');

  categories.forEach(function(cat) {
    if (cat === (sc.cat || categories[0])) return;
    var item = document.createElement('div');
    item.className = 'ctx-cat-item';
    item.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      sc.cat = cat;
      save();
      renderShortcuts();
      closeCtx();
    });
    catsEl.appendChild(item);
  });

  // Wire up Move button toggle
  var moveBtn = document.getElementById('ctx-move');
moveBtn.onclick = function(e) {
    e.stopPropagation();
    ctxMoveOpen = !ctxMoveOpen;
    catsEl.classList.toggle('ctx-cats-open', ctxMoveOpen);
    moveBtn.classList.toggle('ctx-move-open', ctxMoveOpen);
    document.getElementById('ctx-delete').classList.toggle('ctx-hide', ctxMoveOpen);
    // Reposition if panel would overflow bottom
    repositionCtxMenu();
  };
  document.getElementById('ctx-edit').onclick = function(e) {
    e.stopPropagation();
    ctxEditOpen = !ctxEditOpen;
    document.getElementById('ctx-edit-panel').classList.toggle('open', ctxEditOpen);
    document.getElementById('ctx-move').classList.toggle('ctx-hide', ctxEditOpen);
    document.getElementById('ctx-delete').classList.toggle('ctx-hide', ctxEditOpen);
    catsEl.classList.remove('ctx-cats-open');
    moveBtn.classList.remove('ctx-move-open');
    repositionCtxMenu();
  };
  document.getElementById('ctx-icon').onclick = function(e) {
    e.stopPropagation();
    chooseImage(function(dataUrl) {
      sc.icon = dataUrl;
      save();
      renderShortcuts();
      closeCtx();
    });
  };
  document.getElementById('ctx-name').onclick = function(e) {
    e.stopPropagation();
    document.getElementById('ctx-icon').style.display = 'none';
    document.getElementById('ctx-name').style.display = 'none';
    document.getElementById('ctx-url').style.display = 'none';
    var row = document.getElementById('ctx-name-row');
    var input = document.getElementById('ctx-name-input');
    row.style.display = 'flex';
    input.value = sc.name || '';
    input.focus();
    input.select();
    repositionCtxMenu();
  };
  document.getElementById('ctx-name-confirm').onclick = function(e) {
    e.stopPropagation();
    var val = document.getElementById('ctx-name-input').value.trim();
    if (val) { sc.name = val; save(); renderShortcuts(); }
    closeCtx();
  };
  document.getElementById('ctx-name-clear').onclick = function(e) {
    e.stopPropagation();
    var input = document.getElementById('ctx-name-input');
    input.value = '';
    input.focus();
  };
  document.getElementById('ctx-name-input').onkeydown = function(e) {
    if (e.key === 'Enter') document.getElementById('ctx-name-confirm').click();
    if (e.key === 'Escape') closeCtx();
  };
  document.getElementById('ctx-url').onclick = function(e) {
    e.stopPropagation();
    document.getElementById('ctx-icon').style.display = 'none';
    document.getElementById('ctx-name').style.display = 'none';
    document.getElementById('ctx-url').style.display = 'none';
    var row = document.getElementById('ctx-url-row');
    var input = document.getElementById('ctx-url-input');
    row.style.display = 'flex';
    input.value = sc.url || '';
    input.focus();
    input.select();
    repositionCtxMenu();
  };
  document.getElementById('ctx-url-confirm').onclick = function(e) {
    e.stopPropagation();
    var val = document.getElementById('ctx-url-input').value.trim();
    if (val) {
      if (!/^https?:\/\//i.test(val)) val = 'https://' + val;
      sc.url = val;
      save();
      renderShortcuts();
    }
    closeCtx();
  };
  document.getElementById('ctx-url-clear').onclick = function(e) {
    e.stopPropagation();
    var input = document.getElementById('ctx-url-input');
    input.value = '';
    input.focus();
  };
  document.getElementById('ctx-url-input').onkeydown = function(e) {
    if (e.key === 'Enter') document.getElementById('ctx-url-confirm').click();
    if (e.key === 'Escape') closeCtx();
  };
  // Wire up Remove button
  document.getElementById('ctx-delete').onclick = function(e) {
    e.stopPropagation();
    shortcuts = shortcuts.filter(function(s) { return s !== sc; });
    save();
    renderTabs();
    renderShortcuts();
    closeCtx();
  };

  // Position
  var menuW = 160;
  var menuH = 100;
  var px = Math.min(x, window.innerWidth  - menuW - 10);
  var py = Math.min(y, window.innerHeight - menuH - 10);
  ctxMenu.style.left = px + 'px';
  ctxMenu.style.top  = py + 'px';

  ctxMenu.style.display = 'flex';
  ctxMenu.classList.add('open');
  // trigger animation next frame
  requestAnimationFrame(function() {
    ctxMenu.classList.add('ctx-animate-in');
  });
}

function repositionCtxMenu() {
  var r = ctxMenu.getBoundingClientRect();
  if (r.bottom > window.innerHeight - 10) {
    ctxMenu.style.top = Math.max(10, window.innerHeight - r.height - 10) + 'px';
  }
}

function closeCtx() {
  ctxMenu.classList.remove('ctx-animate-in');
  ctxMoveOpen = false;
  ctxEditOpen = false;
  var catsEl = document.getElementById('ctx-cats');
  if (catsEl) catsEl.classList.remove('ctx-cats-open');
  var editPanel = document.getElementById('ctx-edit-panel');
  if (editPanel) editPanel.classList.remove('open');
  // Reset inline input rows
  var nameRow = document.getElementById('ctx-name-row');
  var urlRow  = document.getElementById('ctx-url-row');
  var iconBtn = document.getElementById('ctx-icon');
  var nameBtn = document.getElementById('ctx-name');
  var urlBtn  = document.getElementById('ctx-url');
  if (nameRow) nameRow.style.display = 'none';
  if (urlRow)  urlRow.style.display  = 'none';
  if (iconBtn) iconBtn.style.display = '';
  if (nameBtn) nameBtn.style.display = '';
  if (urlBtn)  urlBtn.style.display  = '';
var moveBtn = document.getElementById('ctx-move');
  if (moveBtn) moveBtn.classList.remove('ctx-move-open');
  if (moveBtn) moveBtn.classList.remove('ctx-hide');
  var deleteBtn = document.getElementById('ctx-delete');
  if (deleteBtn) deleteBtn.classList.remove('ctx-hide');
setTimeout(function() {
    ctxMenu.style.display = 'none';
    ctxMenu.classList.remove('open');
  }, 180);
  ctxTarget = null;
}

document.addEventListener('click', function(e) {
  if (!ctxMenu.contains(e.target)) closeCtx();
  hideCategoryDeleteMenu();
});

// ── Settings Panel ────────────────────────
// ── Accordion ─────────────────────────────
document.querySelectorAll('.acc-header').forEach(function(header) {
  if (header.id === 'reset-acc-header') return; // handled separately
  header.addEventListener('click', function(e) {
    e.stopPropagation();
    var section = header.parentElement;
    var isOpen = section.classList.contains('open');
    document.querySelectorAll('.acc-section').forEach(function(s) {
      s.classList.remove('open');
    });
    if (!isOpen) {
      section.classList.add('open');
      // Scroll the header to the top of the panel so the whole
      // opened section is visible without manual scrolling.
      requestAnimationFrame(function() {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });
});

var settingsBtn = document.getElementById('settings-btn');
var settingsZone = document.getElementById('settings-zone');

settingsBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  var isOpen = panel.classList.toggle('open');
  settingsBtn.classList.toggle('panel-open', isOpen);
  settingsBtn.classList.add('visible');
});

// Keep button visible while panel is open
panel.addEventListener('click', function(e) { e.stopPropagation(); });

// Show button when hovering zone
settingsZone.addEventListener('mouseenter', function() {
  settingsBtn.classList.add('visible');
});
settingsZone.addEventListener('mouseleave', function() {
  if (!panel.classList.contains('open')) {
    settingsBtn.classList.remove('visible');
  }
});

// Keep visible when hovering button itself
settingsBtn.addEventListener('mouseenter', function() {
  settingsBtn.classList.add('visible');
});
settingsBtn.addEventListener('mouseleave', function() {
  if (!panel.classList.contains('open')) {
    settingsBtn.classList.remove('visible');
  }
});

document.addEventListener('click', function() {
  panel.classList.remove('open');
  settingsBtn.classList.remove('panel-open');
  settingsBtn.classList.remove('visible');
  document.querySelectorAll('.acc-section').forEach(function(s) {
    s.classList.remove('open');
  });
});

// ── Add Shortcut ──────────────────────────
var pendingScIcon = null;

document.getElementById('sc-icon-input').addEventListener('change', function() {
  var file = this.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    pendingScIcon = e.target.result;
    var preview = document.getElementById('sc-icon-preview');
    preview.innerHTML = '';
    var thumb = document.createElement('img');
    thumb.src = pendingScIcon;
    thumb.style.width = '100%';
    thumb.style.height = '100%';
    thumb.style.objectFit = 'cover';
    thumb.style.borderRadius = '10px';
    preview.appendChild(thumb);
  };
  reader.readAsDataURL(file);
});

document.getElementById('add-sc-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  var name = document.getElementById('sc-name').value.trim();
  var url  = document.getElementById('sc-url').value.trim();
  var cat  = dropdownValues['sc-cat-dropdown'] || categories[0];
  if (!url) { alert('URL দাও।'); return; }
  if (!url.startsWith('http')) url = 'https://' + url;
  if (!name) {
    try { name = new URL(url).hostname.replace(/^www\./, ''); } catch(e) { name = url; }
  }
  var newSc = { name:name, url:url, cat:cat };
  if (pendingScIcon) newSc.icon = pendingScIcon;
  shortcuts.push(newSc);
  save();
  renderTabs();
  renderShortcuts();
  document.getElementById('sc-name').value = '';
  document.getElementById('sc-url').value  = '';
  pendingScIcon = null;
  document.getElementById('sc-icon-input').value = '';
  document.getElementById('sc-icon-preview').innerHTML = '🖼️';
});

// ── Add Category (Settings panel) ─────────
document.getElementById('add-cat-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  var input = document.getElementById('cat-name-input');
  if (addCategoryByName(input.value)) input.value = '';
});
document.getElementById('cat-name-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('add-cat-btn').click();
  }
});

// ── Reset ─────────────────────────────────
document.getElementById('reset-acc-header').addEventListener('click', function(e) {
  e.stopPropagation();
  applySearchWidth(DEFAULT_W);
  centerContainer();
});

// ── Background ────────────────────────────
function applyBackground(dataUrl, type) {
  var img = document.getElementById('bg-img');
  var vid = document.getElementById('bg-video');
  var def = document.getElementById('default-bg');
  var inf = document.getElementById('bg-info');
  if (!dataUrl) {
    img.style.display = vid.style.display = 'none';
    def.style.display = 'block';
    if (inf) inf.textContent = 'No custom background';
    return;
  }
  def.style.display = 'none';
  if (type === 'video') {
    img.style.display = 'none';
    vid.src = dataUrl; vid.style.display = 'block';
  } else {
    vid.style.display = 'none';
    img.src = dataUrl; img.style.display = 'block';
  }
}

// Helper: apply the default video bg
function applyDefaultVideo() {
  var vid = document.getElementById('bg-video');
  var img = document.getElementById('bg-img');
  var def = document.getElementById('default-bg');
  def.style.display = 'none';
  img.style.display = 'none';
  vid.src = chrome.runtime.getURL('default_bg.mp4');
  vid.style.display = 'block';
}

// ── Central background display logic ──────────────────────
// Decides what to actually show on screen based on bgActiveSource,
// falling back to default_bg.mp4 if the chosen source has no data.
function applyActiveBackground() {
  if (bgActiveSource === 'video' && bgFolderVideos.length) {
    var idx = bgFolderCurrentIdx < 0 ? 0 : bgFolderCurrentIdx;
    var vid = document.getElementById('bg-video');
    var img = document.getElementById('bg-img');
    var def = document.getElementById('default-bg');
    def.style.display = 'none';
    img.style.display = 'none';
    vid.src = bgFolderVideos[idx].dataUrl;
    vid.style.display = 'block';
  } else if (bgActiveSource === 'wallpaper' && bgWallpaperImages.length) {
    var idx2 = bgWallpaperCurrentIdx < 0 ? 0 : bgWallpaperCurrentIdx;
    var img2 = document.getElementById('bg-img');
    var vid2 = document.getElementById('bg-video');
    var def2 = document.getElementById('default-bg');
    def2.style.display = 'none';
    vid2.style.display = 'none';
    img2.src = bgWallpaperImages[idx2].dataUrl;
    img2.style.display = 'block';
  } else if (bgActiveSource === 'single' && bgSingleData && bgSingleData.dataUrl) {
    applyBackground(bgSingleData.dataUrl, bgSingleData.type || 'image');
  } else {
    applyDefaultVideo();
  }
}

// ── Central source-UI restoration ──────────────────────────
// Updates each row's label/next/remove visibility based on whether
// data exists for that source, independent of which source is active.
// The Next button is dimmed (.inactive) for any source that isn't
// the currently active one, but stays visible whenever data exists
// so the Delete button is always reachable.
function refreshSourceUI() {
  // Video folder row
  var vidNext   = document.getElementById('bg-folder-next');
  var vidRemove = document.getElementById('bg-folder-remove');
  var vidName   = document.getElementById('bg-video-folder-name');
  var advRow    = document.getElementById('bg-auto-advance-row');
  var hasVideo  = bgFolderVideos.length > 0;
  if (vidNext)   vidNext.classList.toggle('visible', hasVideo);
  if (vidNext)   vidNext.classList.toggle('inactive', hasVideo && bgActiveSource !== 'video');
  if (vidRemove) vidRemove.classList.toggle('visible', hasVideo);
  if (advRow)    advRow.style.display = hasVideo ? 'flex' : 'none';
  if (vidName) {
    vidName.textContent = hasVideo
      ? 'Video Folder (' + (Math.max(bgFolderCurrentIdx, 0) + 1) + '/' + bgFolderVideos.length + ')'
      : 'Video Folder';
  }

  // Wallpaper folder row
  var wpNext   = document.getElementById('bg-wallpaper-next');
  var wpRemove = document.getElementById('bg-wallpaper-remove');
  var wpName   = document.getElementById('bg-wallpaper-folder-name');
  var hasWp    = bgWallpaperImages.length > 0;
  if (wpNext)   wpNext.classList.toggle('visible', hasWp);
  if (wpNext)   wpNext.classList.toggle('inactive', hasWp && bgActiveSource !== 'wallpaper');
  if (wpRemove) wpRemove.classList.toggle('visible', hasWp);
  if (wpName) {
    wpName.textContent = hasWp
      ? 'Wallpaper Folder (' + (Math.max(bgWallpaperCurrentIdx, 0) + 1) + '/' + bgWallpaperImages.length + ')'
      : 'Wallpaper Folder';
  }

  // Single file row
  var singleRemove = document.getElementById('clear-bg');
  var singleName   = document.getElementById('bg-single-name');
  var hasSingle = !!(bgSingleData && bgSingleData.dataUrl);
  if (singleRemove) singleRemove.classList.toggle('visible', hasSingle);
  if (singleName && hasSingle && singleName.textContent === 'Single File') {
    // Filename itself isn't persisted to IndexedDB — show a generic
    // restored label rather than leaving the default placeholder.
    singleName.textContent = (bgSingleData.type === 'video' ? '🎥 ' : '🖼️ ') + 'Saved File';
  }

  // Sync the three toggles to bgActiveSource
  var vidTog    = document.getElementById('bg-video-active-toggle');
  var wallTog   = document.getElementById('bg-wallpaper-active-toggle');
  var singleTog = document.getElementById('bg-single-active-toggle');
  if (vidTog)    vidTog.checked    = bgActiveSource === 'video';
  if (wallTog)   wallTog.checked   = bgActiveSource === 'wallpaper';
  if (singleTog) singleTog.checked = bgActiveSource === 'single';
}

// Switches the active source, persists it, and refreshes display + UI.
function setActiveSource(source) {
  bgActiveSource = source;
  // mytab_bg_source_ever_set tells reload logic this is a deliberate user
  // choice (including 'none'), not a fresh install needing auto-selection.
  chrome.storage.local.set({ mytab_bg_active_source: source, mytab_bg_source_ever_set: true });
  applyActiveBackground();
  refreshSourceUI();
}

var _fileInput = document.getElementById('file-input');
if (_fileInput) _fileInput.addEventListener('change', function() {
  var file = this.files[0]; if (!file) return;
  var isVid = file.type.startsWith('video/');
  var reader = new FileReader();
  reader.onload = function(e) {
    var d = e.target.result;
    var type = isVid ? 'video' : 'image';
    saveBg(d, type);
    bgSingleData = { dataUrl: d, type: type };
    var nameEl = document.getElementById('bg-single-name');
    if (nameEl) nameEl.textContent = file.name;
    var infoEl = document.getElementById('bg-info');
    if (infoEl) infoEl.textContent = (isVid ? '🎥 ' : '🖼️ ') + file.name;
    // Auto-activate single source (mutually exclusive with video/wallpaper)
    setActiveSource('single');
  };
  reader.readAsDataURL(file);
});

var _clearBgBtn = document.getElementById('clear-bg');
if (_clearBgBtn) _clearBgBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  clearBg();
  bgSingleData = null;
  var nameEl = document.getElementById('bg-single-name');
  if (nameEl) nameEl.textContent = 'Single File';
  // If single was the active source, fall back to none (shows default video)
  if (bgActiveSource === 'single') {
    setActiveSource('none');
  } else {
    refreshSourceUI();
  }
});

// Settings reload button — reloads folder video/wallpaper (next item)
document.getElementById('settings-reload-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  var canAdvance = (bgActiveSource === 'video' && bgFolderVideos.length > 0) ||
                    (bgActiveSource === 'wallpaper' && bgWallpaperImages.length > 0);
  if (canAdvance) {
    bgFolderNext();
    var btn = this;
    btn.style.transform = 'scale(1.1) rotate(360deg)';
    btn.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(function() { btn.style.transform = ''; btn.style.transition = ''; }, 420);
  }
});

// ── Background Folder ─────────────────────
var bgFolderVideos = [];        // array of { name, dataUrl }
var bgFolderCurrentIdx = -1;
var bgFolderTimerInterval = null;
var bgFolderAutoAdvance = true; // whether to advance video on new tab open

// ── Wallpaper folder ──
var bgWallpaperImages = [];
var bgWallpaperCurrentIdx = -1;
var bgActiveSource = 'video'; // 'video' | 'wallpaper' | 'single' | 'none' — which source is ON
var bgSingleData = null; // { dataUrl, type } for the single file source, loaded at startup
var bgTimerCountdownInterval = null;
var bgTimerRemainingMs = 0;
var bgTimerPaused = false;
var BG_WALLPAPER_KEY = 'wallpaper_folder';

function bgFolderTimerMs() {
  var val  = parseInt(document.getElementById('bg-folder-time').value, 10) || 0;
  var unit = document.getElementById('bg-folder-unit').value;
  if (!val) return 0;
  if (unit === 'minute') return val * 60 * 1000;
  if (unit === 'hour')   return val * 3600 * 1000;
  if (unit === 'day')    return val * 86400 * 1000;
  return 0;
}

function startBgFolderTimer() {
  clearInterval(bgFolderTimerInterval);
  bgFolderTimerInterval = null;
  var ms = bgFolderTimerMs();
  if (!ms || bgFolderVideos.length < 2) return;
  bgFolderTimerInterval = setInterval(function() { bgFolderNext(); }, ms);
}

function bgFolderNext() {
  if (!bgFolderVideos.length) return;
  bgFolderCurrentIdx = (bgFolderCurrentIdx + 1) % bgFolderVideos.length;
  // persist current index
  chrome.storage.local.set({ mytab_folder_idx: bgFolderCurrentIdx });
  if (bgActiveSource === 'video') {
    var video = bgFolderVideos[bgFolderCurrentIdx];
    var vid = document.getElementById('bg-video');
    var img = document.getElementById('bg-img');
    var def = document.getElementById('default-bg');
    def.style.display = 'none';
    img.style.display = 'none';
    vid.src = video.dataUrl;
    vid.style.display = 'block';
  }
  refreshSourceUI();
}

// Loads video folder data from IndexedDB and restores its index/timer
// state, but does NOT decide what to display — call applyActiveBackground()
// afterward to show the right thing based on bgActiveSource.
function loadBgFolderAndApply(cb) {
  loadBgFolder(function(folder) {
    if (!folder || !folder.videos || !folder.videos.length) { if (cb) cb(); return; }
    bgFolderVideos = folder.videos;
    // restore saved index
    chrome.storage.local.get(['mytab_folder_idx', 'mytab_folder_auto_advance'], function(d) {
      // restore auto-advance setting
      if (d.mytab_folder_auto_advance != null) {
        bgFolderAutoAdvance = d.mytab_folder_auto_advance;
        var tog = document.getElementById('bg-auto-advance-toggle');
        if (tog) tog.checked = bgFolderAutoAdvance;
      }
      var savedIdx = d.mytab_folder_idx;
      if (savedIdx != null && savedIdx >= 0 && savedIdx < bgFolderVideos.length) {
        if (bgFolderAutoAdvance) {
          // advance to next, wrapping around (loop)
          bgFolderCurrentIdx = (savedIdx + 1) % bgFolderVideos.length;
        } else {
          bgFolderCurrentIdx = savedIdx;
        }
      } else {
        bgFolderCurrentIdx = 0;
      }
      chrome.storage.local.set({ mytab_folder_idx: bgFolderCurrentIdx });
      // restore timer settings
      if (folder.timerValue) document.getElementById('bg-folder-time').value = folder.timerValue;
      if (folder.timerUnit) {
        document.getElementById('bg-folder-unit').value = folder.timerUnit;
        document.getElementById('bg-folder-unit').dispatchEvent(new Event('change'));
      }
      startBgFolderTimer();
      if (cb) cb();
    });
  });
}

// Kept for backward compatibility with existing call sites — now just
// delegates to the central refreshSourceUI so there's one source of truth.
function updateBgFolderUI(hasFolder) {
  refreshSourceUI();
}

document.getElementById('bg-folder-input').addEventListener('change', function() {
  var files = Array.prototype.slice.call(this.files).filter(function(f) { return f.type.startsWith('video/'); });
  if (!files.length) return;
  var infoEl = document.getElementById('bg-info');
  if (infoEl) infoEl.textContent = 'Reading ' + files.length + ' video(s)…';
  var loaded = [];
  var count = 0;
  files.forEach(function(file) {
    var reader = new FileReader();
    reader.onload = function(ev) {
      loaded.push({ name: file.name, dataUrl: ev.target.result });
      count++;
      if (infoEl) infoEl.textContent = 'Reading ' + count + '/' + files.length + '…';
      if (count === files.length) {
        bgFolderVideos = loaded;
        bgFolderCurrentIdx = Math.floor(Math.random() * loaded.length);
        if (infoEl) infoEl.textContent = 'Saving ' + loaded.length + ' video(s)…';
        chrome.storage.local.set({ mytab_folder_idx: bgFolderCurrentIdx });
        var timerVal  = document.getElementById('bg-folder-time').value;
        var timerUnit = document.getElementById('bg-folder-unit').value;
        saveBgFolder({ videos: loaded, timerValue: timerVal, timerUnit: timerUnit }, function(ok) {
          startBgFolderTimer();
          // auto-activate video source (mutually exclusive with wallpaper/single)
          setActiveSource('video');
        });
      }
    };
    reader.onerror = function() {
      count++;
      if (infoEl) infoEl.textContent = '⚠️ Failed to read: ' + file.name;
    };
    reader.readAsDataURL(file);
  });
  this.value = '';
});

document.getElementById('bg-folder-next').addEventListener('click', function(e) {
  e.stopPropagation();
  if (bgActiveSource !== 'video') return;
  bgFolderNext();
  startBgFolderTimer(); // reset timer after manual next
});

document.getElementById('bg-folder-remove').addEventListener('click', function(e) {
  e.stopPropagation();
  clearInterval(bgFolderTimerInterval);
  bgFolderTimerInterval = null;
  bgFolderVideos = [];
  bgFolderCurrentIdx = -1;
  clearBgFolder();
  chrome.storage.local.remove(['mytab_folder_idx', 'mytab_folder_auto_advance']);
  document.getElementById('bg-folder-time').value = '0';
  // stop timer display
  var timerRow = document.getElementById('bg-timer-active-row');
  if (timerRow) timerRow.style.display = 'none';
  clearInterval(bgTimerCountdownInterval);
  bgTimerCountdownInterval = null;
  // if video was the active source, fall back to none (shows default video)
  if (bgActiveSource === 'video') {
    setActiveSource('none');
  } else {
    refreshSourceUI();
  }
});

// timer change: save + restart
document.getElementById('bg-folder-time').addEventListener('change', function() {
  if (!bgFolderVideos.length) return;
  var timerVal  = this.value;
  var timerUnit = document.getElementById('bg-folder-unit').value;
  loadBgFolder(function(folder) {
    if (!folder) return;
    folder.timerValue = timerVal;
    folder.timerUnit  = timerUnit;
    saveBgFolder(folder);
    startBgFolderTimer();
  });
});
document.getElementById('bg-folder-unit').addEventListener('change', function() {
  if (!bgFolderVideos.length) return;
  var timerVal  = document.getElementById('bg-folder-time').value;
  var timerUnit = this.value;
  loadBgFolder(function(folder) {
    if (!folder) return;
    folder.timerValue = timerVal;
    folder.timerUnit  = timerUnit;
    saveBgFolder(folder);
    startBgFolderTimer();
  });
});

// ── Custom spinner buttons for bg-folder-time ──
(function() {
  var input = document.getElementById('bg-folder-time');
  var dec   = document.getElementById('bg-time-dec');
  var inc   = document.getElementById('bg-time-inc');
  if (!input || !dec || !inc) return;
  function fireChange() {
    input.dispatchEvent(new Event('change'));
  }
  dec.addEventListener('click', function() {
    var v = parseInt(input.value, 10) || 0;
    if (v > 0) { input.value = v - 1; fireChange(); }
  });
  inc.addEventListener('click', function() {
    var v = parseInt(input.value, 10) || 0;
    input.value = v + 1;
    fireChange();
  });
  // allow holding button
  var holdTimer = null;
  function startHold(btn, delta) {
    btn.addEventListener('mousedown', function() {
      holdTimer = setTimeout(function() {
        holdTimer = setInterval(function() {
          var v = parseInt(input.value, 10) || 0;
          var nv = v + delta;
          if (nv < 0) return;
          input.value = nv;
          fireChange();
        }, 120);
      }, 400);
    });
    document.addEventListener('mouseup', function() {
      clearTimeout(holdTimer); clearInterval(holdTimer); holdTimer = null;
    });
  }
  startHold(inc, 1);
  startHold(dec, -1);
})();

// ── Custom select for bg-folder-unit ──
(function() {
  var native = document.getElementById('bg-folder-unit');
  var wrap   = document.getElementById('bg-unit-custom-select');
  if (!native || !wrap) return;
  var label  = wrap.querySelector('.custom-select-label');
  var list   = wrap.querySelector('.custom-select-list');
  var trigger = wrap.querySelector('.custom-select-trigger');
  var UNITS = [
    { value: 'minute', label: 'Minute' },
    { value: 'hour',   label: 'Hour'   },
    { value: 'day',    label: 'Day'    },
  ];
  function rebuildList() {
    list.innerHTML = '';
    var cur = native.value;
    UNITS.forEach(function(u) {
      var opt = document.createElement('div');
      opt.className = 'custom-select-option' + (u.value === cur ? ' selected' : '');
      opt.textContent = u.label;
      opt.dataset.value = u.value;
      opt.addEventListener('click', function() {
        native.value = u.value;
        native.dispatchEvent(new Event('change'));
        label.textContent = u.label;
        wrap.classList.remove('open');
        rebuildList();
      });
      list.appendChild(opt);
    });
  }
  rebuildList();
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = wrap.classList.toggle('open');
    if (isOpen) rebuildList();
  });
  document.addEventListener('click', function() {
    wrap.classList.remove('open');
  });
  // sync label when native changes externally (e.g. on load)
  native.addEventListener('change', function() {
    var found = UNITS.find(function(u) { return u.value === native.value; });
    if (found) label.textContent = found.label;
  });
  // initial label sync
  var init = UNITS.find(function(u) { return u.value === native.value; });
  if (init) label.textContent = init.label;
})();

// ── Auto-advance toggle ──
(function() {
  var tog = document.getElementById('bg-auto-advance-toggle');
  if (!tog) return;
  tog.addEventListener('change', function() {
    bgFolderAutoAdvance = this.checked;
    chrome.storage.local.set({ mytab_folder_auto_advance: bgFolderAutoAdvance });
  });
})();

// ── Video / Wallpaper / Single source toggles (mutually exclusive) ──
(function() {
  var vidTog    = document.getElementById('bg-video-active-toggle');
  var wallTog   = document.getElementById('bg-wallpaper-active-toggle');
  var singleTog = document.getElementById('bg-single-active-toggle');
  if (!vidTog || !wallTog) return;

  vidTog.addEventListener('change', function() {
    if (this.checked) {
      setActiveSource('video');
    } else if (bgActiveSource === 'video') {
      setActiveSource('none');
    }
  });
  wallTog.addEventListener('change', function() {
    if (this.checked) {
      setActiveSource('wallpaper');
    } else if (bgActiveSource === 'wallpaper') {
      setActiveSource('none');
    }
  });
  if (singleTog) {
    singleTog.addEventListener('change', function() {
      if (this.checked) {
        setActiveSource('single');
      } else if (bgActiveSource === 'single') {
        setActiveSource('none');
      }
    });
  }
  // Note: initial restore of bgActiveSource + toggle states happens once,
  // centrally, in the startup sequence (after all sources finish loading
  // from IndexedDB) — see refreshSourceUI() call in loadAll's callback.
})();

// ── Wallpaper Folder input ──
(function() {
  var input = document.getElementById('bg-wallpaper-input');
  if (!input) return;
  input.addEventListener('change', function() {
    var files = Array.prototype.slice.call(this.files).filter(function(f) { return f.type.startsWith('image/'); });
    if (!files.length) return;
    var infoEl = document.getElementById('bg-info');
    if (infoEl) infoEl.textContent = 'Reading ' + files.length + ' image(s)…';
    var loaded = [];
    var count = 0;
    files.forEach(function(file) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        loaded.push({ name: file.name, dataUrl: ev.target.result });
        count++;
        if (count === files.length) {
          bgWallpaperImages = loaded;
          bgWallpaperCurrentIdx = 0;
          if (infoEl) infoEl.textContent = 'Wallpaper folder loaded ✓';
          // Save to indexedDB
          openBgDb(function(db) {
            if (!db) return;
            var meta = { count: loaded.length, names: loaded.map(function(v){return v.name;}) };
            loaded.forEach(function(imgItem, i) {
              var tx = db.transaction(BG_STORE, 'readwrite');
              tx.objectStore(BG_STORE).put({ name: imgItem.name, dataUrl: imgItem.dataUrl }, BG_WALLPAPER_KEY + '_v' + i);
            });
            var tx2 = db.transaction(BG_STORE, 'readwrite');
            tx2.objectStore(BG_STORE).put(meta, BG_WALLPAPER_KEY);
          });
          // Auto-activate wallpaper source (mutually exclusive with video/single)
          setActiveSource('wallpaper');
        }
      };
      reader.onerror = function() { count++; };
      reader.readAsDataURL(file);
    });
    this.value = '';
  });
})();

// ── Wallpaper remove ──
(function() {
  var btn = document.getElementById('bg-wallpaper-remove');
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    bgWallpaperImages = [];
    bgWallpaperCurrentIdx = -1;
    chrome.storage.local.remove(['mytab_wallpaper_idx']);
    clearWallpaperFolder();
    // if wallpaper was the active source, fall back to none (shows default video)
    if (bgActiveSource === 'wallpaper') {
      setActiveSource('none');
    } else {
      refreshSourceUI();
    }
  });
})();

// ── Wallpaper Next button ──
(function() {
  var btn = document.getElementById('bg-wallpaper-next');
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (bgActiveSource !== 'wallpaper') return;
    if (!bgWallpaperImages.length) return;
    bgWallpaperCurrentIdx = (bgWallpaperCurrentIdx + 1) % bgWallpaperImages.length;
    var wp = bgWallpaperImages[bgWallpaperCurrentIdx];
    var img = document.getElementById('bg-img');
    var vid = document.getElementById('bg-video');
    var def = document.getElementById('default-bg');
    def.style.display = 'none';
    vid.style.display = 'none';
    img.src = wp.dataUrl;
    img.style.display = 'block';
    // Save current wallpaper index
    chrome.storage.local.set({ mytab_wallpaper_idx: bgWallpaperCurrentIdx });
    refreshSourceUI();
  });
})();

// ── Timer accordion toggle ──
(function() {
  var header = document.getElementById('bg-timer-acc-header');
  var body   = document.getElementById('bg-timer-acc-body');
  if (!header || !body) return;
  header.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    header.classList.toggle('open', !open);
  });
})();

// ── Add Shortcut accordion toggle ──
(function() {
  var header = document.getElementById('add-sc-acc-header');
  var body   = document.getElementById('add-sc-acc-body');
  if (!header || !body) return;
  header.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    header.classList.toggle('open', !open);
  });
})();

// ── Add Category accordion toggle ──
(function() {
  var header = document.getElementById('add-cat-acc-header');
  var body   = document.getElementById('add-cat-acc-body');
  if (!header || !body) return;
  header.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    header.classList.toggle('open', !open);
  });
})();

// ── Add Quick Link accordion toggle ──
(function() {
  var header = document.getElementById('add-ql-acc-header');
  var body   = document.getElementById('add-ql-acc-body');
  if (!header || !body) return;
  header.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    header.classList.toggle('open', !open);
  });
})();

// ── Side Bar: "Add URL" / "Added URLs" / "Extra Buttons Add" mutually-exclusive sub-headers ──
(function() {
  var pairs = [
    { header: document.getElementById('sb-add-url-header'),     body: document.getElementById('sb-add-url-body') },
    { header: document.getElementById('sb-added-urls-header'),  body: document.getElementById('sb-added-urls-body') },
    { header: document.getElementById('sb-extra-toggle'),       body: document.getElementById('sb-extra-body') }
  ];
  var panel = document.getElementById('settings-panel');
  var savedScrollTop = null; // scroll position right before a sub-header was opened

  function closeAll(restoreScroll) {
    var wasAnyOpen = pairs.some(function(p) { return p.body && p.body.style.display !== 'none'; });
    pairs.forEach(function(p) {
      if (!p.header || !p.body) return;
      p.body.style.display = 'none';
      p.header.classList.remove('open');
    });
    if (restoreScroll && wasAnyOpen && panel && savedScrollTop != null) {
      panel.scrollTo({ top: savedScrollTop, behavior: 'smooth' });
      savedScrollTop = null;
    }
  }

  pairs.forEach(function(pair) {
    if (!pair.header || !pair.body) return;
    pair.header.addEventListener('click', function(e) {
      e.stopPropagation();
      var willOpen = pair.body.style.display === 'none';

      if (!willOpen) {
        // Clicking the already-open sub-header: close it and scroll back.
        closeAll(true);
        return;
      }

      // Remember where we were before any sub-header was open, so we can
      // return here once everything is closed again. Only capture this on
      // the first open (all-closed -> open), not when switching between
      // already-open sub-headers, so direct switches don't lose the
      // original pre-open position.
      var anyOpenBefore = pairs.some(function(p) { return p.body && p.body.style.display !== 'none'; });
      if (!anyOpenBefore && panel) savedScrollTop = panel.scrollTop;

      // Close any other open sub-header first (mutually exclusive), without
      // restoring scroll yet — we're about to scroll for the new one anyway.
      closeAll(false);

      pair.body.style.display = 'block';
      pair.header.classList.add('open');
      // Keep the main "Side Bar" header in place; only scroll enough so
      // the opened sub-header's content isn't cut off at the bottom of
      // the settings panel's scroll box.
      requestAnimationFrame(function() {
        if (!panel) { pair.header.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
        var panelRect  = panel.getBoundingClientRect();
        var headerRect = pair.header.getBoundingClientRect();
        var bodyRect   = pair.body.getBoundingClientRect();
        var delta = 0;
        // If the header itself is above the visible area, bring it in first.
        if (headerRect.top < panelRect.top) {
          delta = headerRect.top - panelRect.top;
        } else {
          // If the body's bottom is cut off below the panel, scroll just
          // enough to reveal it (but never past the header's own top).
          var overflowBelow = bodyRect.bottom - panelRect.bottom;
          if (overflowBelow > 0) {
            var maxScroll = headerRect.top - panelRect.top; // don't scroll past header into view
            delta = Math.min(overflowBelow + 8, Math.max(maxScroll, 0));
          }
        }
        if (delta !== 0) {
          panel.scrollBy({ top: delta, behavior: 'smooth' });
        }
      });
    });
  });
})();

// ── Timer + button: start countdown, show timer row ──
(function() {
  var setBtn = document.getElementById('bg-timer-set-btn');
  var accHeader = document.getElementById('bg-timer-acc-header');
  var accBody   = document.getElementById('bg-timer-acc-body');
  var bgHeader  = document.getElementById('bg-acc-header');
  if (!setBtn) return;
  setBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var ms = bgFolderTimerMs();
    if (!ms) { return; }
    var timerRow = document.getElementById('bg-timer-active-row');
    if (timerRow) timerRow.style.display = 'flex';
    startBgFolderTimer();
    startTimerCountdown(ms);

    // Auto-collapse the "Add Timer" accordion now that it's set
    if (accBody) accBody.style.display = 'none';
    if (accHeader) accHeader.classList.remove('open');

    // Auto-scroll up so the "Background" header is visible
    if (bgHeader) {
      bgHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

// ── Timer active toggle (on/off) ──
(function() {
  var tog = document.getElementById('bg-timer-active-toggle');
  if (!tog) return;
  tog.addEventListener('change', function() {
    if (this.checked) {
      // restart timer
      var ms = bgFolderTimerMs();
      if (ms) { startBgFolderTimer(); startTimerCountdown(ms); }
    } else {
      // pause timer
      clearInterval(bgFolderTimerInterval);
      bgFolderTimerInterval = null;
      clearInterval(bgTimerCountdownInterval);
      bgTimerCountdownInterval = null;
    }
  });
})();

function startTimerCountdown(totalMs) {
  clearInterval(bgTimerCountdownInterval);
  var endTime = Date.now() + totalMs;
  var countdownEl = document.getElementById('bg-timer-countdown');

  function tick() {
    var remaining = endTime - Date.now();
    if (remaining <= 0) {
      if (countdownEl) countdownEl.textContent = '⏱ 00:00';
      clearInterval(bgTimerCountdownInterval);
      // restart countdown for next cycle
      var ms = bgFolderTimerMs();
      if (ms) setTimeout(function() { startTimerCountdown(ms); }, 800);
      return;
    }
    var totalSec = Math.ceil(remaining / 1000);
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    var display = h > 0
      ? h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
      : (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    if (countdownEl) countdownEl.textContent = '⏱ ' + display;
  }
  tick();
  bgTimerCountdownInterval = setInterval(tick, 1000);
}

// Also advance wallpaper folder on bgFolderNext if wallpaper is active source
// (the "Auto-switch every" timer is shared between whichever source is active)
var _origBgFolderNext = bgFolderNext;
bgFolderNext = function() {
  if (bgActiveSource === 'wallpaper' && bgWallpaperImages.length) {
    bgWallpaperCurrentIdx = (bgWallpaperCurrentIdx + 1) % bgWallpaperImages.length;
    var img = document.getElementById('bg-img');
    var vid = document.getElementById('bg-video');
    var def = document.getElementById('default-bg');
    def.style.display = 'none';
    vid.style.display = 'none';
    img.src = bgWallpaperImages[bgWallpaperCurrentIdx].dataUrl;
    img.style.display = 'block';
    chrome.storage.local.set({ mytab_wallpaper_idx: bgWallpaperCurrentIdx });
    refreshSourceUI();
  } else {
    _origBgFolderNext();
  }
};
var quickLinks = [];
var pendingQlIcon = null;
var quickPanel = document.getElementById('quick-panel');
var qlPanelX   = null; // left px
var qlPanelY   = null; // top px
var qlAutoHide = true; // default: hide when mouse isn't over it
var qlEnabled = true; // default: panel shows normally (master on/off)
var qlDock = null;
var qlDockCrossPos = null; // cross-axis position when docked (top for L/R, left for T/B)
function saveQuickLinks() {
  chrome.storage.local.set({ mytab_ql: quickLinks, mytab_ql_x: qlPanelX, mytab_ql_y: qlPanelY, mytab_ql_autohide: qlAutoHide, mytab_ql_enabled: qlEnabled, mytab_ql_dock: qlDock, mytab_ql_dock_cross: qlDockCrossPos });
}

function applyQlPanelPos(x, y) {
  var w = quickPanel.offsetWidth  || 40;
  var h = quickPanel.offsetHeight || 40;
  x = Math.max(4, Math.min(x, window.innerWidth  - w - 4));
  y = Math.max(4, Math.min(y, window.innerHeight - h - 4));
  qlPanelX = x;
  qlPanelY = y;
  quickPanel.style.left      = x + 'px';
  quickPanel.style.top       = y + 'px';
  quickPanel.style.right     = 'auto';
  quickPanel.style.bottom    = 'auto';
  quickPanel.style.transform = 'none';
  quickPanel.classList.remove('dock-left', 'dock-right', 'dock-top', 'dock-bottom');
}

function dockFloatingPanel(panelEl, dock) {
  panelEl.classList.remove('dock-left', 'dock-right', 'dock-top', 'dock-bottom');
  if (dock) {
    panelEl.classList.add('dock-' + dock);
    panelEl.style.transform = '';
    panelEl.style.bottom    = 'auto';
    // Set primary axis inline so panel is on-screen (overrides base top:-9999px / right:-9999px).
    // Cross-axis position is set by the caller immediately after this returns.
    if (dock === 'left') {
      panelEl.style.left  = '0';
      panelEl.style.right = 'auto';
      // Fallback top only if not already set to something sensible by caller
      if (!panelEl.style.top || panelEl.style.top === '' || panelEl.style.top === '-9999px') {
        panelEl.style.top = Math.round(window.innerHeight * 0.4) + 'px';
      }
    } else if (dock === 'right') {
      panelEl.style.right = '0';
      panelEl.style.left  = 'auto';
      if (!panelEl.style.top || panelEl.style.top === '' || panelEl.style.top === '-9999px') {
        panelEl.style.top = Math.round(window.innerHeight * 0.4) + 'px';
      }
    } else if (dock === 'top') {
      panelEl.style.top   = '0';
      panelEl.style.right = 'auto';
      if (!panelEl.style.left || panelEl.style.left === '') {
        panelEl.style.left = Math.round(window.innerWidth * 0.4) + 'px';
      }
    } else if (dock === 'bottom') {
      panelEl.style.bottom = '0';
      panelEl.style.top    = 'auto';
      panelEl.style.right  = 'auto';
      if (!panelEl.style.left || panelEl.style.left === '') {
        panelEl.style.left = Math.round(window.innerWidth * 0.4) + 'px';
      }
    }
  }
  panelEl.classList.remove('open');
}

function nearestDockFromPoint(x, y) {
  var DOCK_EDGE = 4;
  if (x <= DOCK_EDGE) return 'left';
  if (x >= window.innerWidth - DOCK_EDGE) return 'right';
  if (y <= DOCK_EDGE) return 'top';
  if (y >= window.innerHeight - DOCK_EDGE) return 'bottom';
  return null;
}

// reflects panel visibility mode based on whether there are any links + the autohide setting
function updateQlPanelMode() {
  if (!qlEnabled || quickLinks.length === 0) {
    quickPanel.classList.add('empty');
    quickPanel.classList.remove('open', 'always-show');
    return;
  }
  quickPanel.classList.remove('empty');
  if (qlAutoHide) {
    quickPanel.classList.remove('always-show');
    // stays closed until hovered (handled by openQuickPanel/closeQuickPanel)
  } else {
    quickPanel.classList.add('always-show');
    clearTimeout(qlHideTimer);
  }
}

var qlCtxMenu = document.getElementById('ql-ctx-menu');
var qlCtxTarget = -1;
var qlCtxEditOpen = false;

function closeQlCtx() {
  qlCtxMenu.classList.remove('open', 'ql-ctx-animate-in');
  var panel = document.getElementById('ql-ctx-edit-panel');
  if (panel) panel.classList.remove('open');
  document.getElementById('ql-ctx-remove').classList.remove('ctx-hide');
  qlCtxEditOpen = false;
  qlCtxTarget = -1;
  // hide panel if mouse is no longer over it
  closeQuickPanel();
}

document.getElementById('ql-ctx-edit').addEventListener('click', function(e) {
  e.stopPropagation();
  qlCtxEditOpen = !qlCtxEditOpen;
  document.getElementById('ql-ctx-edit-panel').classList.toggle('open', qlCtxEditOpen);
  document.getElementById('ql-ctx-remove').classList.toggle('ctx-hide', qlCtxEditOpen);
});

document.getElementById('ql-ctx-icon').addEventListener('click', function(e) {
  e.stopPropagation();
  if (qlCtxTarget < 0) return;
  chooseImage(function(dataUrl) {
    quickLinks[qlCtxTarget].icon = dataUrl;
    saveQuickLinks();
    renderQuickLinks();
    closeQlCtx();
  });
});

document.getElementById('ql-ctx-name').addEventListener('click', function(e) {
  e.stopPropagation();
  if (qlCtxTarget < 0) return;
  var name = prompt('Quick link name', quickLinks[qlCtxTarget].name || '');
  if (name == null) return;
  name = name.trim();
  if (!name) return;
  quickLinks[qlCtxTarget].name = name;
  saveQuickLinks();
  renderQuickLinks();
  closeQlCtx();
});

document.getElementById('ql-ctx-remove').addEventListener('click', function() {
  if (qlCtxTarget < 0) return;
  quickLinks.splice(qlCtxTarget, 1);
  saveQuickLinks();
  renderQuickLinks();
  closeQlCtx();
});

document.addEventListener('click', function() { closeQlCtx(); });

function renderQuickLinks() {
  var linksEl = document.getElementById('quick-panel-links');
  linksEl.innerHTML = '';

  quickLinks.forEach(function(ql, i) {
    var a = document.createElement('a');
    a.className = 'ql-item' + (i === 0 ? ' ql-handle' : '');
    a.href = ql.url;
    a.title = ql.name || ql.url;
    a.setAttribute('data-ql-index', i);

    if (ql.icon) {
      var img = document.createElement('img');
      img.src = ql.icon;
      img.onerror = function() { this.replaceWith(makeFallbackQl(ql.name || ql.url)); };
      a.appendChild(img);
    } else {
      var fav = document.createElement('img');
      fav.src = faviconUrl(ql.url);
      fav.onerror = function() { this.replaceWith(makeFallbackQl(ql.name || ql.url)); };
      a.appendChild(fav);
    }

    if (ql.name) {
      var lbl = document.createElement('span');
      lbl.textContent = ql.name;
      a.appendChild(lbl);
    }

    a.addEventListener('contextmenu', function(e) {
      e.preventDefault(); e.stopPropagation();
      qlCtxTarget = i;
      qlCtxEditOpen = false;
      document.getElementById('ql-ctx-edit-panel').classList.remove('open');
      document.getElementById('ql-ctx-remove').classList.remove('ctx-hide');
      var x = Math.min(e.clientX, window.innerWidth  - 160);
      var y = Math.min(e.clientY, window.innerHeight - 60);
      qlCtxMenu.style.left = x + 'px';
      qlCtxMenu.style.top  = y + 'px';
      qlCtxMenu.classList.remove('ql-ctx-animate-in');
      qlCtxMenu.classList.add('open');
      requestAnimationFrame(function() {
        qlCtxMenu.classList.add('ql-ctx-animate-in');
      });
    });

    a.addEventListener('click', function(e) {
      if (qlJustDragged) {
        e.preventDefault();
        e.stopPropagation();
        qlJustDragged = false;
      }
    });

    linksEl.appendChild(a);
    enableSmoothReorder(a, linksEl, {
      itemSelector: '#quick-panel-links .ql-item',
      axis: 'y',
      onStart: function() {
        qlDragActive = false;
        qlJustDragged = true;
        quickPanel.classList.remove('dragging');
        linksEl.classList.add('reordering');
      },
      onCommit: function() {
        quickLinks = Array.prototype.slice.call(linksEl.querySelectorAll('.ql-item')).map(function(node) {
          return quickLinks[parseInt(node.getAttribute('data-ql-index'), 10)];
        }).filter(Boolean);
        saveQuickLinks();
      },
      onEnd: function() {
        linksEl.classList.remove('reordering');
        renderQuickLinks();
      }
    });
  });

  updateQlPanelMode();
}

function makeFallbackQl(name) {
  var d = document.createElement('div');
  d.className = 'ql-icon-fallback';
  d.textContent = name.charAt(0).toUpperCase();
  return d;
}

// hover open/close — only relevant when auto-hide is ON.
// Since the panel can be dragged anywhere, hover is detected on the panel + a small
// invisible margin around it, rather than a fixed screen-edge strip.
var qlHideTimer = null;

function openQuickPanel() {
  if (!qlAutoHide) return;
  clearTimeout(qlHideTimer);
  quickPanel.classList.add('open');
}
function closeQuickPanel() {
  if (!qlAutoHide) return;
  // 700ms delay: gives user time to move cursor from edge-reveal point
  // up to the drag handle (::before) above the panel without it closing.
  qlHideTimer = setTimeout(function() {
    if (!qlDragActive && !qlCtxMenu.classList.contains('open')) quickPanel.classList.remove('open');
  }, 700);
}

quickPanel.addEventListener('mouseenter', openQuickPanel);
quickPanel.addEventListener('mouseleave', closeQuickPanel);

// also open when the cursor gets close to the panel.
// When docked, panel is off-screen (translateX/Y 100%) so rect is off-screen too.
// Instead, detect mouse proximity to the screen EDGE for docked panels.
document.addEventListener('mousemove', function(e) {
  if (!qlAutoHide || quickLinks.length === 0) return;
  if (quickPanel.classList.contains('open') || qlDragActive) return;
  var EDGE_ZONE = 8; // px from screen edge that triggers reveal
  var triggered = false;
  if (qlDock === 'right') {
    triggered = e.clientX >= window.innerWidth - EDGE_ZONE;
  } else if (qlDock === 'left') {
    triggered = e.clientX <= EDGE_ZONE;
  } else if (qlDock === 'top') {
    triggered = e.clientY <= EDGE_ZONE;
  } else if (qlDock === 'bottom') {
    triggered = e.clientY >= window.innerHeight - EDGE_ZONE;
  } else {
    // Free-floating: use proximity to panel rect (panel is on-screen)
    var r = quickPanel.getBoundingClientRect();
    var pad = 24;
    triggered = e.clientX >= r.left - pad && e.clientX <= r.right + pad &&
                e.clientY >= r.top  - pad && e.clientY <= r.bottom + pad;
  }
  if (triggered) openQuickPanel();
});

// drag panel freely (any direction) by the first icon, which doubles as the handle.
var qlDragActive = false, qlDragStartX = 0, qlDragStartY = 0, qlLastX = 0, qlLastY = 0, qlDragStartPanelX = 0, qlDragStartPanelY = 0, qlDragMoved = false, qlJustDragged = false;

document.getElementById('quick-panel-links').addEventListener('mousedown', function(e) {
  return;
  var firstItem = document.querySelector('#quick-panel-links .ql-item');
  if (!firstItem || !firstItem.contains(e.target)) return;
  e.preventDefault();
  qlDragActive = true;
  qlDragMoved = false;
  qlDragStartX = e.clientX;
  qlDragStartY = e.clientY;
  qlLastX = e.clientX;
  qlLastY = e.clientY;
  var r = quickPanel.getBoundingClientRect();
  qlDragStartPanelX = r.left;
  qlDragStartPanelY = r.top;
  clearTimeout(qlHideTimer);
});

// Entire panel body is the drag handle.
// Link icon clicks are still allowed (e.target.closest check).
quickPanel.addEventListener('mousedown', function(e) {
  if (e.button !== 0) return;
  // Let clicks on actual ql-item links pass through unblocked
  if (e.target.closest && e.target.closest('a.ql-item')) return;
  e.preventDefault();
  qlDragActive = true;
  qlDragMoved = false;
  qlDragStartX = e.clientX;
  qlDragStartY = e.clientY;
  qlLastX = e.clientX;
  qlLastY = e.clientY;
  // If panel is currently docked it is off-screen (CSS transform pushes it away).
  // We must remove the dock classes and reset inline styles BEFORE calling
  // getBoundingClientRect, otherwise r.left/top reflects the off-screen transform
  // position and the drag calculation starts from completely the wrong origin.
if (qlDock) {
    var pr = quickPanel.getBoundingClientRect();
    quickPanel.classList.remove('dock-left', 'dock-right', 'dock-top', 'dock-bottom');
    quickPanel.style.transform = 'none';
    quickPanel.style.left   = pr.left + 'px';
    quickPanel.style.top    = pr.top  + 'px';
    quickPanel.style.right  = 'auto';
    quickPanel.style.bottom = 'auto';
    qlDock = null;
    qlDockCrossPos = null;
  }
  var r = quickPanel.getBoundingClientRect();
  qlDragStartPanelX = r.left;
  qlDragStartPanelY = r.top;
  clearTimeout(qlHideTimer);
});

document.addEventListener('mousemove', function(e) {
  if (!qlDragActive) return;
  qlLastX = e.clientX;
  qlLastY = e.clientY;
  var dx = e.clientX - qlDragStartX;
  var dy = e.clientY - qlDragStartY;
  if (!qlDragMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
    qlDragMoved = true;
    quickPanel.style.transition = 'none'; // kill transition during drag for smoothness
    quickPanel.classList.add('dragging', 'open');
  }
  if (qlDragMoved) applyQlPanelPos(qlDragStartPanelX + dx, qlDragStartPanelY + dy);
});

document.addEventListener('mouseup', function() {
  if (!qlDragActive) return;
  qlDragActive = false;
  quickPanel.style.transition = '';
  quickPanel.classList.remove('dragging');
  if (qlDragMoved) {
    qlJustDragged = true;
    qlDock = nearestDockFromPoint(qlLastX, qlLastY);
    if (qlDock) {
      var r = quickPanel.getBoundingClientRect();
      dockFloatingPanel(quickPanel, qlDock);
      if (qlDock === 'left' || qlDock === 'right') {
        qlDockCrossPos = Math.max(0, Math.min(r.top, window.innerHeight - r.height));
        quickPanel.style.top    = qlDockCrossPos + 'px';
        quickPanel.style.bottom = 'auto';
      } else {
        qlDockCrossPos = Math.max(0, Math.min(r.left, window.innerWidth - r.width));
        quickPanel.style.left  = qlDockCrossPos + 'px';
        quickPanel.style.right = 'auto';
        quickPanel.style.transform = '';
      }
    } else {
      qlDockCrossPos = null;
    }
    saveQuickLinks();
    closeQuickPanel();
  }
});

// Suppress accidental link click right after drag-drop, then reset the flag on any click.
document.getElementById('quick-panel-links').addEventListener('click', function(e) {
  if (qlJustDragged) {
    e.preventDefault();
    e.stopPropagation();
    qlJustDragged = false;
    return;
  }
}, true);
document.addEventListener('click', function() {
  // Reset flag after any click so next interactions work normally
  if (qlJustDragged) qlJustDragged = false;
});

// auto-hide toggle in settings
var qlAutohideToggle = document.getElementById('ql-autohide-toggle');
qlAutohideToggle.addEventListener('change', function() {
  qlAutoHide = this.checked;
  saveQuickLinks();
  updateQlPanelMode();
  onAutohideToggleChanged();
});

// show/hide panel master toggle in settings
var qlEnabledToggle = document.getElementById('ql-enabled-toggle');
qlEnabledToggle.addEventListener('change', function() {
  qlEnabled = this.checked;
  saveQuickLinks();
  updateQlPanelMode();
});

// add quick link
document.getElementById('ql-icon-input').addEventListener('change', function() {
  var file = this.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    pendingQlIcon = ev.target.result;
    var prev = document.getElementById('ql-icon-preview');
    prev.innerHTML = '';
    var thumb = document.createElement('img');
    thumb.src = pendingQlIcon;
    thumb.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:10px;';
    prev.appendChild(thumb);
  };
  reader.readAsDataURL(file);
});

document.getElementById('add-ql-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  var name = document.getElementById('ql-name').value.trim();
  var url  = document.getElementById('ql-url').value.trim();
  if (!url) { alert('URL দাও।'); return; }
  if (!url.startsWith('http') && !url.startsWith('chrome://')) url = 'https://' + url;
  // name stays empty if user didn't type one — only the icon will show
  var wasEmpty = quickLinks.length === 0;
  var ql = { name: name, url: url };
  if (pendingQlIcon) ql.icon = pendingQlIcon;
  quickLinks.push(ql);
  saveQuickLinks();
  renderQuickLinks();
  // first link ever added: drop the panel at a sensible default spot and briefly reveal it
  if (wasEmpty) {
    setTimeout(function() {
      var r = quickPanel.getBoundingClientRect();
      applyQlPanelPos(window.innerWidth - (r.width || 40) - 14, Math.round(window.innerHeight / 2) - 30);
      if (qlAutoHide) {
        openQuickPanel();
        closeQuickPanel();
      }
    }, 20);
  }
  document.getElementById('ql-name').value = '';
  document.getElementById('ql-url').value  = '';
  pendingQlIcon = null;
  document.getElementById('ql-icon-input').value = '';
  document.getElementById('ql-icon-preview').innerHTML = '🖼️';
});

// ═══════════════════════════════════════════
//  Browser Tools Panel
// ═══════════════════════════════════════════
var BT_DEFAULT_TOOLS = [
  { id: 'bookmarks',  name: 'Bookmarks',  emoji: '⭐', url: 'chrome://bookmarks/' },
  { id: 'history',    name: 'History',    emoji: '🕘', url: 'chrome://history/' },
  { id: 'downloads',  name: 'Downloads',  emoji: '⬇️', url: 'chrome://downloads/' },
  { id: 'settings',   name: 'Settings',   emoji: '⚙️', url: 'chrome://settings/' },
  { id: 'extensions', name: 'Extensions', emoji: '🧩', url: 'chrome://extensions/' }
];

var btPanel    = document.getElementById('bt-panel');
var btEnabled    = true;
var btAutoHide   = true;
var btShowLabels = true;
var btHidden     = {}; // { toolId: true } => hidden from panel
var btIcons      = {}; // { toolId: dataUrl } => custom png/image icon
var btOrder      = BT_DEFAULT_TOOLS.map(function(t) { return t.id; });
var btPanelX   = null;
var btPanelY   = null;
var btDock     = null;
var btDockCrossPos = null;
var btSuppressClick = false;

function saveBtSettings() {
  chrome.storage.local.set({
    mytab_bt_enabled:      btEnabled,
    mytab_bt_autohide:     btAutoHide,
    mytab_bt_showlabels:   btShowLabels,
    mytab_bt_hidden:       btHidden,
    mytab_bt_icons:        btIcons,
    mytab_bt_order:        btOrder,
    mytab_bt_x: btPanelX,
    mytab_bt_y: btPanelY,
    mytab_bt_dock: btDock,
    mytab_bt_dock_cross: btDockCrossPos
  });
}

function saveSideBarSettings() {
  chrome.storage.local.set({
    mytab_sidebar_enabled: sbEnabled,
    mytab_sidebar_items: sbItems,
    mytab_sidebar_shownames: sbShowNames,
    mytab_sidebar_icon_size: sbIconSize,
    mytab_sidebar_bounce: sbIconBounce
  });
}

function saveTabDockSettings() {
  chrome.storage.local.set({
    mytab_tabdock_enabled: tabDockEnabled,
    mytab_tabdock_icon_size: tabDockIconSize,
    mytab_tabdock_close_mode: tabDockCloseMode,
    mytab_tabdock_peek: tabDockPeek,
    mytab_tabdock_glow: tabDockGlow,
    mytab_tabdock_dup_numbers: tabDockDupNumbers,
    mytab_tabdock_autohide: tabDockAutoHide,
    mytab_tabdock_bounce: tabDockBounce
  });
}

function applyTabDockAutoHide() {
  // Tab dock lives in floating-sidebar.js (content script); storage change triggers it there
}

function renderSideBarList() {
  var listEl = document.getElementById('sb-icon-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  sbItems.forEach(function(item, i) {
    var row = document.createElement('div');
    row.className = 'sb-item-row';
    row.draggable = false;
    row.dataset.index = i;

    var prev = document.createElement('span');
    prev.className = 'sb-preview';
    if (item.icon) {
      var img = document.createElement('img');
      img.src = item.icon;
      prev.appendChild(img);
    } else {
      var meta = item.action === 'tool' ? toolMeta(item.tool) : null;
      prev.textContent = meta ? meta.symbol : (item.name || 'L').charAt(0).toUpperCase();
    }

    var name = document.createElement('span');
    name.className = 'sb-name';
    var metaName = item.action === 'tool' && toolMeta(item.tool) ? toolMeta(item.tool).name : '';
    name.textContent = item.name || item.url || metaName;

    var iconInput = document.createElement('input');
    iconInput.type = 'file';
    iconInput.accept = 'image/*';
    iconInput.style.display = 'none';
    iconInput.addEventListener('change', function() {
      var file = iconInput.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        item.icon = ev.target.result;
        saveSideBarSettings();
        renderSideBarList();
      };
      reader.readAsDataURL(file);
    });
    var addIcon = document.createElement('button');
    addIcon.type = 'button';
    addIcon.className = 'sb-url-icon-add';
    addIcon.title = 'Add Icon';
    addIcon.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 1.5v9M1.5 6h9"/></svg>';
    addIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      iconInput.click();
    });

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'bt-icon-reset';
    del.textContent = 'x';
    del.title = 'Remove';
    del.addEventListener('click', function(e) {
      e.stopPropagation();
      sbItems.splice(i, 1);
      saveSideBarSettings();
      renderSideBarList();
      renderSideBarTools();
    });

    row.appendChild(prev);
    row.appendChild(name);
    row.appendChild(iconInput);
    row.appendChild(addIcon);
    row.appendChild(del);
    enableSmoothReorder(row, listEl, {
      itemSelector: '#sb-icon-list .sb-item-row',
      axis: 'y',
      onCommit: function() {
        sbItems = Array.prototype.slice.call(listEl.querySelectorAll('.sb-item-row')).map(function(node) {
          return sbItems[parseInt(node.getAttribute('data-index'), 10)];
        }).filter(Boolean);
        saveSideBarSettings();
        renderSideBarList();
      }
    });
    row.addEventListener('dragstart', function(e) {
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(i));
    });
    row.addEventListener('dragend', function() {
      row.classList.remove('dragging');
    });
    row.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    row.addEventListener('drop', function(e) {
      e.preventDefault();
      var from = parseInt(e.dataTransfer.getData('text/plain'), 10);
      var to = i;
      if (!Number.isFinite(from) || from === to) return;
      var moved = sbItems.splice(from, 1)[0];
      sbItems.splice(to, 0, moved);
      saveSideBarSettings();
      renderSideBarList();
    });
    listEl.appendChild(row);
  });
  var countEl = document.getElementById('sb-added-urls-count');
  if (countEl) countEl.textContent = '(' + sbItems.length + ')';
}

function applyBtPanelPos(x, y) {
  var w = btPanel.offsetWidth  || 40;
  var h = btPanel.offsetHeight || 40;
  x = Math.max(4, Math.min(x, window.innerWidth  - w - 4));
  y = Math.max(4, Math.min(y, window.innerHeight - h - 4));
  btPanelX = x;
  btPanelY = y;
  btPanel.style.left      = x + 'px';
  btPanel.style.top       = y + 'px';
  btPanel.style.right     = 'auto';
  btPanel.style.bottom    = 'auto';
  btPanel.style.transform = 'none';
  btPanel.classList.remove('dock-left', 'dock-right', 'dock-top', 'dock-bottom');
}

function orderedBtTools() {
  var byId = {};
  BT_DEFAULT_TOOLS.forEach(function(t) { byId[t.id] = t; });
  var ordered = [];
  btOrder.forEach(function(id) {
    if (byId[id]) ordered.push(byId[id]);
  });
  BT_DEFAULT_TOOLS.forEach(function(t) {
    if (btOrder.indexOf(t.id) === -1) ordered.push(t);
  });
  return ordered;
}

function visibleBtTools() {
  return orderedBtTools().filter(function(t) { return !btHidden[t.id]; });
}

function updateBtPanelMode() {
  if (!btEnabled || visibleBtTools().length === 0) {
    btPanel.classList.add('disabled');
    btPanel.classList.remove('open', 'always-show');
    return;
  }
  btPanel.classList.remove('disabled');
  if (btAutoHide) {
    btPanel.classList.remove('always-show');
  } else {
    btPanel.classList.add('always-show');
    clearTimeout(btHideTimer);
  }
}

function renderBtPanel() {
  var linksEl = document.getElementById('bt-panel-links');
  linksEl.innerHTML = '';
  var tools = visibleBtTools();
  tools.forEach(function(tool, i) {
    var a = document.createElement('a');
    a.className = 'bt-item' + (i === 0 ? ' bt-handle' : '');
    a.href = '#';
    a.title = tool.name;
    a.setAttribute('data-bt-id', tool.id);
    a.addEventListener('click', function(e) {
      e.preventDefault();
      chrome.tabs.create({ url: tool.url });
    });
    var box = document.createElement('div');
    box.className = 'bt-icon-box';
    if (btIcons[tool.id]) {
      var img = document.createElement('img');
      img.src = btIcons[tool.id];
      img.alt = '';
      box.appendChild(img);
    } else {
      box.textContent = tool.emoji;
    }
    a.appendChild(box);
    var lbl = document.createElement('span');
    lbl.className = 'bt-label';
    lbl.textContent = tool.name;
    if (!btShowLabels) lbl.style.display = 'none';
    a.appendChild(lbl);
    enableSmoothReorder(a, linksEl, {
      itemSelector: '#bt-panel-links .bt-item',
      axis: 'y',
      onStart: function() {
        btSuppressClick = true;
        btDragActive = false;
        btPanel.classList.remove('dragging');
        linksEl.classList.add('reordering');
      },
      onCommit: function() {
        var visibleIds = Array.prototype.slice.call(linksEl.querySelectorAll('.bt-item')).map(function(node) {
          return node.getAttribute('data-bt-id');
        });
        var hiddenIds = orderedBtTools().filter(function(t) {
          return btHidden[t.id] && visibleIds.indexOf(t.id) === -1;
        }).map(function(t) {
          return t.id;
        });
        btOrder = visibleIds.concat(hiddenIds);
        saveBtSettings();
      },
      onEnd: function() {
        linksEl.classList.remove('reordering');
        renderBtPanel();
        renderBtIconList();
      }
    });
    linksEl.appendChild(a);
  });
  updateBtPanelMode();
}

function renderBtIconList() {
  var listEl = document.getElementById('bt-icon-list');
  listEl.innerHTML = '';
  orderedBtTools().forEach(function(tool) {
    var row = document.createElement('div');
    row.className = 'bt-icon-row';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !btHidden[tool.id];
    cb.addEventListener('change', function() {
      if (cb.checked) delete btHidden[tool.id];
      else btHidden[tool.id] = true;
      saveBtSettings();
      renderBtPanel();
    });
    var em = document.createElement('span');
    em.className = 'bt-icon-emoji';
    if (btIcons[tool.id]) {
      var preview = document.createElement('img');
      preview.src = btIcons[tool.id];
      preview.alt = '';
      em.appendChild(preview);
    } else {
      em.textContent = tool.emoji;
    }
    var nm = document.createElement('span');
    nm.className = 'bt-icon-name';
    nm.textContent = tool.name;
    var upload = document.createElement('label');
    upload.className = 'bt-icon-upload';
    upload.title = 'Add PNG icon';
    upload.textContent = 'PNG';
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png,image/*';
    fileInput.addEventListener('change', function() {
      var file = this.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        btIcons[tool.id] = ev.target.result;
        saveBtSettings();
        renderBtIconList();
        renderBtPanel();
      };
      reader.readAsDataURL(file);
    });
    upload.appendChild(fileInput);
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'bt-icon-reset';
    reset.title = 'Use default icon';
    reset.textContent = 'x';
    reset.disabled = !btIcons[tool.id];
    reset.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      delete btIcons[tool.id];
      saveBtSettings();
      renderBtIconList();
      renderBtPanel();
    });
    row.appendChild(cb);
    row.appendChild(em);
    row.appendChild(nm);
    row.appendChild(upload);
    row.appendChild(reset);
    listEl.appendChild(row);
  });
}

// hover open/close (auto-hide)
var btHideTimer = null;

function openBtPanel() {
  if (!btAutoHide) return;
  clearTimeout(btHideTimer);
  btPanel.classList.add('open');
}
function closeBtPanel() {
  if (!btAutoHide) return;
  // 700ms delay: gives user time to move cursor from edge-reveal point
  // up to the drag handle (::before) above the panel without it closing.
  btHideTimer = setTimeout(function() {
    if (!btDragActive) btPanel.classList.remove('open');
  }, 700);
}

btPanel.addEventListener('mouseenter', openBtPanel);
btPanel.addEventListener('mouseleave', closeBtPanel);

// Same edge-aware detection as Quick Panel:
// When docked, panel is off-screen so use screen-edge proximity instead of panel rect.
document.addEventListener('mousemove', function(e) {
  if (!btAutoHide || !btEnabled || visibleBtTools().length === 0) return;
  if (btPanel.classList.contains('open') || btDragActive) return;
  var EDGE_ZONE = 8; // px from screen edge that triggers reveal
  var triggered = false;
  if (btDock === 'right') {
    triggered = e.clientX >= window.innerWidth - EDGE_ZONE;
  } else if (btDock === 'left') {
    triggered = e.clientX <= EDGE_ZONE;
  } else if (btDock === 'top') {
    triggered = e.clientY <= EDGE_ZONE;
  } else if (btDock === 'bottom') {
    triggered = e.clientY >= window.innerHeight - EDGE_ZONE;
  } else {
    // Free-floating: use proximity to panel rect (panel is on-screen)
    var r = btPanel.getBoundingClientRect();
    var pad = 24;
    triggered = e.clientX >= r.left - pad && e.clientX <= r.right + pad &&
                e.clientY >= r.top  - pad && e.clientY <= r.bottom + pad;
  }
  if (triggered) openBtPanel();
});

// drag panel freely by the first icon, which doubles as the handle.
// Same rule as Quick Panel: never preventDefault() on mousedown; only block the
// click if a real drag (movement past threshold) happened.
var btDragActive = false, btDragStartX = 0, btDragStartY = 0, btLastX = 0, btLastY = 0, btDragStartPanelX = 0, btDragStartPanelY = 0, btDragMoved = false, btJustDragged = false;

document.getElementById('bt-panel-links').addEventListener('mousedown', function(e) {
  return;
  var firstItem = document.querySelector('#bt-panel-links .bt-item');
  if (!firstItem || !firstItem.contains(e.target)) return;
  var iconBox = firstItem.querySelector('.bt-icon-box');
  if (iconBox && iconBox.contains(e.target) && !e.shiftKey) return;
  e.preventDefault();
  btDragActive = true;
  btDragMoved = false;
  btDragStartX = e.clientX;
  btDragStartY = e.clientY;
  btLastX = e.clientX;
  btLastY = e.clientY;
  var r = btPanel.getBoundingClientRect();
  btDragStartPanelX = r.left;
  btDragStartPanelY = r.top;
  clearTimeout(btHideTimer);
});

// Entire panel body is the drag handle.
// Tool icon clicks are still allowed (e.target.closest check).
btPanel.addEventListener('mousedown', function(e) {
  if (e.button !== 0) return;
  // Let clicks on actual bt-item tools pass through unblocked
  if (e.target.closest && e.target.closest('a.bt-item')) return;
  e.preventDefault();
  btDragActive = true;
  btDragMoved = false;
  btDragStartX = e.clientX;
  btDragStartY = e.clientY;
  btLastX = e.clientX;
  btLastY = e.clientY;
  // Same as Quick Panel: if docked, undock first so getBoundingClientRect
  // gives real on-screen coordinates instead of the off-screen transform position.
if (btDock) {
    var pr = btPanel.getBoundingClientRect();
    btPanel.classList.remove('dock-left', 'dock-right', 'dock-top', 'dock-bottom');
    btPanel.style.transform = 'none';
    btPanel.style.left   = pr.left + 'px';
    btPanel.style.top    = pr.top  + 'px';
    btPanel.style.right  = 'auto';
    btPanel.style.bottom = 'auto';
    btDock = null;
    btDockCrossPos = null;
  }
  var r = btPanel.getBoundingClientRect();
  btDragStartPanelX = r.left;
  btDragStartPanelY = r.top;
  clearTimeout(btHideTimer);
});

document.addEventListener('mousemove', function(e) {
  if (!btDragActive) return;
  btLastX = e.clientX;
  btLastY = e.clientY;
  var dx = e.clientX - btDragStartX;
  var dy = e.clientY - btDragStartY;
  if (!btDragMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
    btDragMoved = true;
    btPanel.style.transition = 'none'; // kill transition during drag for smoothness
    btPanel.classList.add('dragging', 'open');
  }
  if (btDragMoved) applyBtPanelPos(btDragStartPanelX + dx, btDragStartPanelY + dy);
});

document.addEventListener('mouseup', function() {
  if (!btDragActive) return;
  btDragActive = false;
  btPanel.style.transition = ''; // restore transition after drag
  btPanel.classList.remove('dragging');
  if (btDragMoved) {
    btJustDragged = true;
    btDock = nearestDockFromPoint(btLastX, btLastY);
    if (btDock) {
      var r = btPanel.getBoundingClientRect();
      dockFloatingPanel(btPanel, btDock);
      if (btDock === 'left' || btDock === 'right') {
        btDockCrossPos = Math.max(0, Math.min(r.top, window.innerHeight - r.height));
        btPanel.style.top    = btDockCrossPos + 'px';
        btPanel.style.bottom = 'auto';
      } else {
        btDockCrossPos = Math.max(0, Math.min(r.left, window.innerWidth - r.width));
        btPanel.style.left  = btDockCrossPos + 'px';
        btPanel.style.right = 'auto';
        btPanel.style.transform = '';
      }
    } else {
      btDockCrossPos = null;
    }
    saveBtSettings();
    updateBtPanelMode();
    closeBtPanel();
  }
});

document.getElementById('bt-panel-links').addEventListener('click', function(e) {
  var clickedItem = e.target.closest && e.target.closest('.bt-item');
  if (clickedItem) {
    if (btJustDragged || btSuppressClick) {
      e.preventDefault();
      e.stopPropagation();
      btJustDragged = false;
      btSuppressClick = false;
      return;
    }
  }
}, true);

// settings toggles
var btEnabledToggle  = document.getElementById('bt-enabled-toggle');
var btAutohideToggle = document.getElementById('bt-autohide-toggle');
var btLabelsToggle   = document.getElementById('bt-labels-toggle');
var scNamesToggle    = document.getElementById('sc-names-toggle');
var iconBounceSlider = document.getElementById('icon-bounce-slider');
var btBounceSlider   = document.getElementById('bt-bounce-slider');
var scIconSizeSlider = document.getElementById('sc-icon-size-slider');
var qlIconSizeSlider = document.getElementById('ql-icon-size-slider');
var qlBounceSlider   = document.getElementById('ql-bounce-slider');
var btIconSizeSlider = document.getElementById('bt-icon-size-slider');
var sbEnabledToggle  = document.getElementById('sb-enabled-toggle');
var sbNamesToggle    = document.getElementById('sb-names-toggle');
var sbIconSizeSlider = document.getElementById('sb-icon-size-slider');
var sbBounceSlider   = document.getElementById('sb-bounce-slider');
var tabDockEnabledToggle = document.getElementById('tabdock-enabled-toggle');
var tabDockIconSizeSlider = document.getElementById('tabdock-icon-size-slider');
var tabDockCloseModeEl = document.getElementById('tabdock-close-mode');
var tabDockPeekSlider = document.getElementById('tabdock-peek-slider');
var tabDockGlowSlider = document.getElementById('tabdock-glow-slider');
var tabDockDupToggle = document.getElementById('tabdock-dup-toggle');
var tabDockAutoHideToggle = document.getElementById('tabdock-autohide-toggle');
var tabDockBounceSlider = document.getElementById('tabdock-bounce-slider');
var searchBounceSlider = document.getElementById('search-bounce-slider');
var catNamesToggle = document.getElementById('cat-names-toggle');
var catAutoHideToggle = document.getElementById('cat-autohide-toggle');
var catBounceSlider = document.getElementById('cat-bounce-slider');
var scIconGapSlider     = document.getElementById('sc-icon-gap-slider');
var catIconGapSlider    = document.getElementById('cat-icon-gap-slider');
var qlIconGapSlider     = document.getElementById('ql-icon-gap-slider');
var btIconGapSlider     = document.getElementById('bt-icon-gap-slider');
var sbIconGapSlider     = document.getElementById('sb-icon-gap-slider');
var tabDockIconGapSlider = document.getElementById('tabdock-icon-gap-slider');

// ── Hover-glow elements ──────────────────────────────
var searchGlowSizeSlider   = document.getElementById('search-glow-size-slider');
var searchGlowColorPicker  = document.getElementById('search-glow-color-picker');
var searchGlowColorSwatch  = document.getElementById('search-glow-color-swatch');
var scGlowSizeSlider       = document.getElementById('sc-glow-size-slider');
var scGlowColorPicker      = document.getElementById('sc-glow-color-picker');
var scGlowColorSwatch      = document.getElementById('sc-glow-color-swatch');
var catGlowSizeSlider      = document.getElementById('cat-glow-size-slider');
var catGlowColorPicker     = document.getElementById('cat-glow-color-picker');
var catGlowColorSwatch     = document.getElementById('cat-glow-color-swatch');
var qlGlowSizeSlider       = document.getElementById('ql-glow-size-slider');
var qlGlowColorPicker      = document.getElementById('ql-glow-color-picker');
var qlGlowColorSwatch      = document.getElementById('ql-glow-color-swatch');
var btGlowSizeSlider       = document.getElementById('bt-glow-size-slider');
var btGlowColorPicker      = document.getElementById('bt-glow-color-picker');
var btGlowColorSwatch      = document.getElementById('bt-glow-color-swatch');
var sbGlowSizeSlider       = document.getElementById('sb-glow-size-slider');
var sbGlowColorPicker      = document.getElementById('sb-glow-color-picker');
var sbGlowColorSwatch      = document.getElementById('sb-glow-color-swatch');
var tabDockHoverGlowSizeSlider  = document.getElementById('tabdock-hoverglow-size-slider');
var tabDockHoverGlowColorPicker = document.getElementById('tabdock-hoverglow-color-picker');
var tabDockHoverGlowColorSwatch = document.getElementById('tabdock-hoverglow-color-swatch');

function applyIconBounce() {
  document.body.style.setProperty('--icon-bounce', (iconBounce / 100).toString());
  document.body.style.setProperty('--icon-bounce-bt', (btIconBounce / 100).toString());
}
function applySearchBounce() {
  document.body.style.setProperty('--search-bounce', (searchBounce / 100).toString());
}
function applyCatBounce() {
  document.body.style.setProperty('--cat-bounce', (catBounce / 100).toString());
}
function applyQlBounce() {
  document.body.style.setProperty('--icon-bounce-ql', (qlIconBounce / 100).toString());
}
function applyCatNames() {
  document.body.classList.toggle('cat-names-hidden', !catShowNames);
}
function applyCatAutoHide() {
  document.body.classList.toggle('cat-autohide', catAutoHide);
}
function applyIconSizes() {
  document.body.style.setProperty('--shortcut-icon-size', scIconSize + 'px');
  document.body.style.setProperty('--quick-icon-size', qlIconSize + 'px');
  document.body.style.setProperty('--browser-tool-icon-size', btIconSize + 'px');
  setTimeout(function() {
    alignTabsToFirstShortcut();
    positionDragHandle();
  }, 30);
}

btEnabledToggle.addEventListener('change', function() {
  btEnabled = this.checked;
  saveBtSettings();
  updateBtPanelMode();
});
btAutohideToggle.addEventListener('change', function() {
  btAutoHide = this.checked;
  saveBtSettings();
  updateBtPanelMode();
  onAutohideToggleChanged();
});

btLabelsToggle.addEventListener('change', function() {
  btShowLabels = this.checked;
  saveBtSettings();
  renderBtPanel();
});

scNamesToggle.addEventListener('change', function() {
  scShowNames = this.checked;
  save();
  renderShortcuts();
});

catNamesToggle.addEventListener('change', function() {
  catShowNames = this.checked;
  save();
  applyCatNames();
});
catAutoHideToggle.addEventListener('change', function() {
  catAutoHide = this.checked;
  save();
  applyCatAutoHide();
  onAutohideToggleChanged();
});
catBounceSlider.addEventListener('input', function() {
  catBounce = parseInt(this.value, 10) || 0;
  applyCatBounce();
});
catBounceSlider.addEventListener('change', function() {
  catBounce = parseInt(this.value, 10) || 0;
  save();
});

searchBounceSlider.addEventListener('input', function() {
  searchBounce = parseInt(this.value, 10) || 0;
  applySearchBounce();
});
searchBounceSlider.addEventListener('change', function() {
  searchBounce = parseInt(this.value, 10) || 0;
  save();
});

iconBounceSlider.addEventListener('input', function() {
  iconBounce = parseInt(this.value, 10) || 0;
  applyIconBounce();
});
iconBounceSlider.addEventListener('change', function() {
  iconBounce = parseInt(this.value, 10) || 0;
  save();
});
btBounceSlider.addEventListener('input', function() {
  btIconBounce = parseInt(this.value, 10) || 0;
  applyIconBounce();
});
btBounceSlider.addEventListener('change', function() {
  btIconBounce = parseInt(this.value, 10) || 0;
  save();
});

function bindSizeSlider(slider, setter) {
  slider.addEventListener('input', function() {
    setter(parseInt(this.value, 10) || 0);
    applyIconSizes();
  });
  slider.addEventListener('change', function() {
    setter(parseInt(this.value, 10) || 0);
    applyIconSizes();
    save();
  });
}

bindSizeSlider(scIconSizeSlider, function(v) { scIconSize = v; });
bindSizeSlider(qlIconSizeSlider, function(v) { qlIconSize = v; });
bindSizeSlider(btIconSizeSlider, function(v) { btIconSize = v; });

// QL bounce slider
qlBounceSlider.addEventListener('input', function() {
  qlIconBounce = parseInt(this.value, 10) || 0;
  applyQlBounce();
});
qlBounceSlider.addEventListener('change', function() {
  qlIconBounce = parseInt(this.value, 10) || 0;
  chrome.storage.local.set({ mytab_ql_icon_bounce: qlIconBounce });
});

// ── Icon Gap sliders ──────────────────────────────────────────
function bindGapSlider(slider, labelId, setter, storageKey) {
  if (!slider) return;
  var lbl = document.getElementById(labelId);
  slider.addEventListener('input', function() {
    var v = parseInt(this.value, 10) || 0;
    setter(v);
    if (lbl) lbl.textContent = v + 'px';
    applyAllIconGaps();
  });
  slider.addEventListener('change', function() {
    var v = parseInt(this.value, 10) || 0;
    setter(v);
    var obj = {}; obj[storageKey] = v;
    chrome.storage.local.set(obj);
  });
}
bindGapSlider(scIconGapSlider,     'sc-icon-gap-val',      function(v) { scIconGap = v; },  'mytab_sc_icon_gap');
bindGapSlider(catIconGapSlider,    'cat-icon-gap-val',     function(v) { catIconGap = v; }, 'mytab_cat_icon_gap');
bindGapSlider(qlIconGapSlider,     'ql-icon-gap-val',      function(v) { qlIconGap = v; },  'mytab_ql_icon_gap');
bindGapSlider(btIconGapSlider,     'bt-icon-gap-val',      function(v) { btIconGap = v; },  'mytab_bt_icon_gap');
bindGapSlider(sbIconGapSlider,     'sb-icon-gap-val',      function(v) { sbIconGap = v; },  'mytab_sb_icon_gap');
bindGapSlider(tabDockIconGapSlider,'tabdock-icon-gap-val', function(v) { tabDockIconGap = v; }, 'mytab_tabdock_icon_gap');

// ── Hover-glow sliders + color pickers ───────────────────────
// `cssVar` panels (search/sc/cat/ql/bt) apply directly via document.body CSS vars.
// `storageOnly` panels (sb/tabdock) live in floating-sidebar.js's shadow DOM,
// so their values are synced through chrome.storage.local instead.
function bindGlowControls(opts) {
  var slider = opts.slider, picker = opts.picker, swatch = opts.swatch;
  var labelId = opts.labelId, setSize = opts.setSize, setColor = opts.setColor;
  var sizeKey = opts.sizeKey, colorKey = opts.colorKey, cssSizeVar = opts.cssSizeVar, cssColorVar = opts.cssColorVar;

  function applyLive(size, color) {
    if (cssSizeVar) document.body.style.setProperty(cssSizeVar, size + 'px');
    if (cssColorVar) document.body.style.setProperty(cssColorVar, color);
    if (opts.offClass) document.body.classList.toggle(opts.offClass, size <= 0);
    if (opts.storageOnly) {
      var obj = {};
      obj[sizeKey] = size;
      obj[colorKey] = color;
      chrome.storage.local.set(obj);
    }
  }

  if (slider) {
    slider.addEventListener('input', function() {
      var v = parseInt(this.value, 10) || 0;
      setSize(v);
      var lbl = document.getElementById(labelId);
      if (lbl) lbl.textContent = v + 'px';
      applyLive(v, opts.getColor());
    });
    slider.addEventListener('change', function() {
      var v = parseInt(this.value, 10) || 0;
      setSize(v);
      var obj = {}; obj[sizeKey] = v;
      chrome.storage.local.set(obj);
    });
  }
  if (picker) {
    picker.addEventListener('input', function() {
      var v = this.value;
      setColor(v);
      if (swatch) swatch.style.background = v;
      applyLive(opts.getSize(), v);
    });
    picker.addEventListener('change', function() {
      var obj = {}; obj[colorKey] = this.value;
      chrome.storage.local.set(obj);
    });
  }
}

bindGlowControls({
  slider: searchGlowSizeSlider, picker: searchGlowColorPicker, swatch: searchGlowColorSwatch,
  labelId: 'search-glow-size-val',
  setSize: function(v) { searchGlowSize = v; }, getSize: function() { return searchGlowSize; },
  setColor: function(v) { searchGlowColor = v; }, getColor: function() { return searchGlowColor; },
  sizeKey: 'mytab_search_glow_size', colorKey: 'mytab_search_glow_color',
  cssSizeVar: '--search-glow-size', cssColorVar: '--search-glow-color',
  offClass: 'search-glow-off'
});
bindGlowControls({
  slider: scGlowSizeSlider, picker: scGlowColorPicker, swatch: scGlowColorSwatch,
  labelId: 'sc-glow-size-val',
  setSize: function(v) { scGlowSize = v; }, getSize: function() { return scGlowSize; },
  setColor: function(v) { scGlowColor = v; }, getColor: function() { return scGlowColor; },
  sizeKey: 'mytab_sc_glow_size', colorKey: 'mytab_sc_glow_color',
  cssSizeVar: '--sc-glow-size', cssColorVar: '--sc-glow-color',
  offClass: 'sc-glow-off'
});
bindGlowControls({
  slider: catGlowSizeSlider, picker: catGlowColorPicker, swatch: catGlowColorSwatch,
  labelId: 'cat-glow-size-val',
  setSize: function(v) { catGlowSize = v; }, getSize: function() { return catGlowSize; },
  setColor: function(v) { catGlowColor = v; }, getColor: function() { return catGlowColor; },
  sizeKey: 'mytab_cat_glow_size', colorKey: 'mytab_cat_glow_color',
  cssSizeVar: '--cat-glow-size', cssColorVar: '--cat-glow-color',
  offClass: 'cat-glow-off'
});
bindGlowControls({
  slider: qlGlowSizeSlider, picker: qlGlowColorPicker, swatch: qlGlowColorSwatch,
  labelId: 'ql-glow-size-val',
  setSize: function(v) { qlGlowSize = v; }, getSize: function() { return qlGlowSize; },
  setColor: function(v) { qlGlowColor = v; }, getColor: function() { return qlGlowColor; },
  sizeKey: 'mytab_ql_glow_size', colorKey: 'mytab_ql_glow_color',
  cssSizeVar: '--ql-glow-size', cssColorVar: '--ql-glow-color',
  offClass: 'ql-glow-off'
});
bindGlowControls({
  slider: btGlowSizeSlider, picker: btGlowColorPicker, swatch: btGlowColorSwatch,
  labelId: 'bt-glow-size-val',
  setSize: function(v) { btGlowSize = v; }, getSize: function() { return btGlowSize; },
  setColor: function(v) { btGlowColor = v; }, getColor: function() { return btGlowColor; },
  sizeKey: 'mytab_bt_glow_size', colorKey: 'mytab_bt_glow_color',
  cssSizeVar: '--bt-glow-size', cssColorVar: '--bt-glow-color',
  offClass: 'bt-glow-off'
});
bindGlowControls({
  slider: sbGlowSizeSlider, picker: sbGlowColorPicker, swatch: sbGlowColorSwatch,
  labelId: 'sb-glow-size-val',
  setSize: function(v) { sbGlowSize = v; }, getSize: function() { return sbGlowSize; },
  setColor: function(v) { sbGlowColor = v; }, getColor: function() { return sbGlowColor; },
  sizeKey: 'mytab_sb_glow_size', colorKey: 'mytab_sb_glow_color',
  storageOnly: true
});
bindGlowControls({
  slider: tabDockHoverGlowSizeSlider, picker: tabDockHoverGlowColorPicker, swatch: tabDockHoverGlowColorSwatch,
  labelId: 'tabdock-hoverglow-size-val',
  setSize: function(v) { tabDockHoverGlowSize = v; }, getSize: function() { return tabDockHoverGlowSize; },
  setColor: function(v) { tabDockHoverGlowColor = v; }, getColor: function() { return tabDockHoverGlowColor; },
  sizeKey: 'mytab_tabdock_hoverglow_size', colorKey: 'mytab_tabdock_hoverglow_color',
  storageOnly: true
});

function resetSbIcon(previewId, inputId, isKey) {
  document.getElementById(inputId).value = '';
  document.getElementById(previewId).textContent = '+';
  pendingSbIcon = null;
}

function bindSbIconInput(inputId, previewId, isKey) {
  document.getElementById(inputId).addEventListener('change', function() {
    var file = this.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      pendingSbIcon = ev.target.result;
      var prev = document.getElementById(previewId);
      prev.innerHTML = '';
      var img = document.createElement('img');
      img.src = ev.target.result;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:10px;';
      prev.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function toolItem(id) {
  return sbItems.find(function(item) { return item.action === 'tool' && item.tool === id; });
}

function toolMeta(id) {
  return SB_TOOLS.find(function(tool) { return tool.id === id; });
}

function renderSideBarTools() {
  var list = document.getElementById('sb-tool-list');
  if (!list) return;
  list.innerHTML = '';
  SB_TOOLS.forEach(function(tool) {
    var item = toolItem(tool.id);
    var row = document.createElement('div');
    row.className = 'sb-tool-row';
    row.dataset.tool = tool.id;

    var prev = document.createElement('span');
    prev.className = 'sb-tool-preview';
    if (item && item.icon) {
      var img = document.createElement('img');
      img.src = item.icon;
      prev.appendChild(img);
    } else {
      prev.textContent = tool.symbol;
    }

    var name = document.createElement('span');
    name.textContent = tool.name;

    var toggle = document.createElement('label');
    toggle.className = 'toggle-switch';
    toggle.innerHTML = '<input type="checkbox"' + (item ? ' checked' : '') + '/><span class="toggle-track"></span><span class="toggle-thumb"></span>';
    toggle.querySelector('input').addEventListener('change', function() {
      var existing = toolItem(tool.id);
      if (this.checked && !existing) {
        sbItems.push({ name: tool.name, action: 'tool', tool: tool.id });
      } else if (!this.checked && existing) {
        sbItems = sbItems.filter(function(entry) { return !(entry.action === 'tool' && entry.tool === tool.id); });
      }
      saveSideBarSettings();
      renderSideBarList();
      renderSideBarTools();
    });

    var actions = document.createElement('span');
    actions.className = 'sb-tool-icon-actions';
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.addEventListener('change', function() {
      var file = input.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var existing = toolItem(tool.id);
        if (!existing) {
          existing = { name: tool.name, action: 'tool', tool: tool.id };
          sbItems.push(existing);
        }
        existing.icon = ev.target.result;
        saveSideBarSettings();
        renderSideBarList();
        renderSideBarTools();
      };
      reader.readAsDataURL(file);
    });
    var addIcon = document.createElement('button');
    addIcon.type = 'button';
    addIcon.className = 'sb-tool-icon-add';
    addIcon.title = 'Add Icon';
    addIcon.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 1.5v9M1.5 6h9"/></svg>';
    addIcon.addEventListener('click', function() { input.click(); });
    var removeIcon = document.createElement('button');
    removeIcon.type = 'button';
    removeIcon.className = 'sb-tool-icon-remove';
    removeIcon.textContent = 'x';
    removeIcon.title = 'Remove Icon';
    removeIcon.addEventListener('click', function() {
      var existing = toolItem(tool.id);
      if (!existing) return;
      delete existing.icon;
      saveSideBarSettings();
      renderSideBarList();
      renderSideBarTools();
    });
    actions.appendChild(input);
    actions.appendChild(addIcon);
    actions.appendChild(removeIcon);

    row.appendChild(prev);
    row.appendChild(name);
    row.appendChild(toggle);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

sbEnabledToggle.addEventListener('change', function() {
  sbEnabled = this.checked;
  saveSideBarSettings();
});
sbNamesToggle.addEventListener('change', function() {
  sbShowNames = this.checked;
  saveSideBarSettings();
});
(function() {
  var el = document.getElementById('sb-autohide-toggle');
  if (el) el.addEventListener('change', function() {
    sbAutoHide = this.checked;
    chrome.storage.local.set({ mytab_sidebar_autohide: sbAutoHide });
    onAutohideToggleChanged();
  });
})();
sbIconSizeSlider.addEventListener('input', function() {
  sbIconSize = parseInt(this.value, 10) || 34;
  saveSideBarSettings();
});
sbBounceSlider.addEventListener('input', function() {
  sbIconBounce = parseInt(this.value, 10) || 0;
  saveSideBarSettings();
});
tabDockEnabledToggle.addEventListener('change', function() {
  tabDockEnabled = this.checked;
  saveTabDockSettings();
});
tabDockIconSizeSlider.addEventListener('input', function() {
  tabDockIconSize = parseInt(this.value, 10) || 28;
  saveTabDockSettings();
});
if (tabDockPeekSlider) tabDockPeekSlider.addEventListener('input', function() {
  tabDockPeek = parseInt(this.value, 10) || 0;
  saveTabDockSettings();
});
tabDockGlowSlider.addEventListener('input', function() {
  tabDockGlow = parseInt(this.value, 10) || 0;
  saveTabDockSettings();
});
tabDockDupToggle.addEventListener('change', function() {
  tabDockDupNumbers = this.checked;
  saveTabDockSettings();
});
tabDockAutoHideToggle.addEventListener('change', function() {
  tabDockAutoHide = this.checked;
  saveTabDockSettings();
  applyTabDockAutoHide();
  onAutohideToggleChanged();
});
tabDockBounceSlider.addEventListener('input', function() {
  tabDockBounce = parseInt(this.value, 10) || 0;
  saveTabDockSettings();
});
function syncTabDockCloseModeButtons() {
  Array.prototype.slice.call(tabDockCloseModeEl.querySelectorAll('.tabdock-close-option')).forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.mode === tabDockCloseMode);
  });
}
tabDockCloseModeEl.addEventListener('click', function(e) {
  var btn = e.target.closest('.tabdock-close-option');
  if (!btn) return;
  tabDockCloseMode = ['right_click', 'right_click_button'].indexOf(btn.dataset.mode) !== -1 ? btn.dataset.mode : 'hover';
  syncTabDockCloseModeButtons();
  saveTabDockSettings();
});

bindSbIconInput('sb-icon-input', 'sb-icon-preview', false);

/*
document.getElementById('sb-icon-input').addEventListener('change', function() {
  var file = this.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    pendingSbIcon = ev.target.result;
    var prev = document.getElementById('sb-icon-preview');
    prev.innerHTML = '';
    var img = document.createElement('img');
    img.src = pendingSbIcon;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:10px;';
    prev.appendChild(img);
  };
  reader.readAsDataURL(file);
});
*/

/*
document.getElementById('add-sb-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  var action = document.getElementById('sb-action').value;
  var name = document.getElementById('sb-name').value.trim();
  var url = document.getElementById('sb-url').value.trim();
  if (action === 'url') {
    if (!url) { alert('URL দাও।'); return; }
    if (!url.startsWith('http')) url = 'https://' + url;
    if (!name) {
      try { name = new URL(url).hostname.replace(/^www\./, ''); } catch(err) { name = url; }
    }
  }
  if (action === 'new_tab' && !name) name = 'New Tab';
  if (action === 'close_others' && !name) name = 'Close Others';
  var item = { name: name, action: action };
  if (action === 'url') item.url = url;
  if (pendingSbIcon) item.icon = pendingSbIcon;
  sbItems.push(item);
  saveSideBarSettings();
  renderSideBarList();
  document.getElementById('sb-name').value = '';
  document.getElementById('sb-url').value = '';
  document.getElementById('sb-icon-input').value = '';
  document.getElementById('sb-icon-preview').textContent = '+';
  pendingSbIcon = null;
});
*/

document.getElementById('add-sb-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  var name = document.getElementById('sb-name').value.trim();
  var url = document.getElementById('sb-url').value.trim();
  if (!url) { alert('URL dao.'); return; }
  if (!url.startsWith('http')) url = 'https://' + url;
  if (!name) {
    try { name = new URL(url).hostname.replace(/^www\./, ''); } catch(err) { name = url; }
  }
  var item = { name: name, action: 'url', url: url };
  if (pendingSbIcon) item.icon = pendingSbIcon;
  sbItems.push(item);
  saveSideBarSettings();
  renderSideBarList();
  document.getElementById('sb-name').value = '';
  document.getElementById('sb-url').value = '';
  resetSbIcon('sb-icon-preview', 'sb-icon-input', false);
});

/*
document.getElementById('add-sb-key-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  var name = document.getElementById('sb-key-name').value.trim();
  var keys = getSbKeyCombos();
  if (!keys.length) { alert('Key dao.'); return; }
  var item = { name: name || keys.join(' + '), action: 'key', keys: keys };
  if (pendingSbKeyIcon) item.icon = pendingSbKeyIcon;
  sbItems.push(item);
  saveSideBarSettings();
  renderSideBarList();
  document.getElementById('sb-key-name').value = '';
  document.getElementById('sb-key-list').innerHTML = '';
  addSbKeyRow('');
  resetSbIcon('sb-key-icon-preview', 'sb-key-icon-input', true);
});
*/

// ── Search Bar Modes ──────────────────────
function applySearchModes() {
  document.body.classList.toggle('search-ultra', searchUltra);
  document.body.classList.toggle('search-hidden', !searchEnabled);
  document.body.classList.toggle('search-autohide-mode', searchEnabled && searchAutoHide);
  document.getElementById('search-icon').style.display = searchIconShow ? '' : 'none';
  searchInput.removeAttribute('placeholder');
}

function applyScAutoHide() {
  document.body.classList.toggle('shortcuts-autohide', scAutoHide);
}

var searchUltraToggle = document.getElementById('search-ultra-toggle');

document.getElementById('search-enabled-toggle').addEventListener('change', function() {
  searchEnabled = this.checked;
  save();
  applySearchModes();
});

document.getElementById('search-autohide-toggle').addEventListener('change', function() {
  searchAutoHide = this.checked;
  save();
  applySearchModes();
  onAutohideToggleChanged();
});

searchUltraToggle.addEventListener('change', function() {
  searchUltra = this.checked;
  save();
  applySearchModes();
});

document.getElementById('search-icon-toggle').addEventListener('change', function() {
  searchIconShow = this.checked;
  save();
  applySearchModes();
});

document.getElementById('search-suggest-toggle').addEventListener('change', function() {
  searchSuggestEnabled = this.checked;
  save();
  if (!searchSuggestEnabled) closeSuggestions();
});

document.getElementById('search-autosearch-toggle').addEventListener('change', function() {
  searchAutoSearchOnClick = this.checked;
  save();
});

document.getElementById('sc-autohide-toggle').addEventListener('change', function() {
  scAutoHide = this.checked;
  save();
  applyScAutoHide();
  onAutohideToggleChanged();
});

document.getElementById('clear-search-history-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  searchHistory = [];
  saveSearchHistory();
  closeSuggestions();
});



// ── Init ──────────────────────────────────
loadSearchHistory();
loadAll(function(data) {
  if (data.mytab_shortcuts) shortcuts  = data.mytab_shortcuts;
  if (data.mytab_cats)      categories = data.mytab_cats;
  if (data.mytab_ql)        quickLinks = data.mytab_ql;
  if (data.mytab_ql_autohide != null) qlAutoHide = data.mytab_ql_autohide;
  if (data.mytab_ql_enabled != null) qlEnabled = data.mytab_ql_enabled;
  if (data.mytab_ql_dock) qlDock = data.mytab_ql_dock;
  qlAutohideToggle.checked = qlAutoHide;
  qlEnabledToggle.checked = qlEnabled;
  if (data.mytab_tab && data.mytab_tab !== 'all') activeTab = data.mytab_tab;
  else activeTab = categories[0] || 'social';
  if (data.mytab_tabs_x != null && data.mytab_tabs_y != null) {
    tabsFloatX = data.mytab_tabs_x;
    tabsFloatY = data.mytab_tabs_y;
  }

  var sw = data.mytab_sw || DEFAULT_W;
  applySearchWidth(sw);

  if (data.mytab_x != null && data.mytab_y != null) {
    container.style.left      = data.mytab_x + 'px';
    container.style.top       = data.mytab_y + 'px';
    container.style.transform = 'none';
    setTimeout(positionDragHandle, 30);
  } else {
    centerContainer();
  }

  // Load all three background sources unconditionally from IndexedDB so
  // each source's data + UI (folder name/count, next/remove visibility)
  // is always restored correctly, even when that source isn't the active
  // one. Only after all three finish loading do we decide what to display,
  // based on the saved active source (with fallback if it's empty).
  chrome.storage.local.get(['mytab_bg_active_source', 'mytab_bg_source_ever_set'], function(srcData) {
    bgActiveSource = srcData.mytab_bg_active_source || 'none';
    // mytab_bg_source_ever_set: true means the user has explicitly chosen a
    // source (or explicitly turned all off). When false/absent it is a fresh
    // install and we can auto-pick an available source.
    var everSet = !!srcData.mytab_bg_source_ever_set;

    var pending = 3;
    function done() {
      pending--;
      if (pending > 0) return;
      // Fallback chain: if the saved active source has no data, fall
      // through to the next available one rather than showing a blank/
      // default video unnecessarily.
      if (bgActiveSource === 'video' && !bgFolderVideos.length) {
        bgActiveSource = bgWallpaperImages.length ? 'wallpaper'
          : (bgSingleData ? 'single' : 'none');
      } else if (bgActiveSource === 'wallpaper' && !bgWallpaperImages.length) {
        bgActiveSource = bgFolderVideos.length ? 'video'
          : (bgSingleData ? 'single' : 'none');
      } else if (bgActiveSource === 'single' && !bgSingleData) {
        bgActiveSource = bgFolderVideos.length ? 'video'
          : (bgWallpaperImages.length ? 'wallpaper' : 'none');
      } else if (bgActiveSource === 'none' && !everSet) {
        // Fresh install only — auto-pick first available source.
        // If the user explicitly set 'none' (everSet=true), respect that.
        if (bgFolderVideos.length) bgActiveSource = 'video';
        else if (bgWallpaperImages.length) bgActiveSource = 'wallpaper';
        else if (bgSingleData) bgActiveSource = 'single';
      }
      chrome.storage.local.set({ mytab_bg_active_source: bgActiveSource, mytab_bg_source_ever_set: true });
      applyActiveBackground();
      refreshSourceUI();
    }

    // Video folder
    loadBgFolderAndApply(done);

    // Wallpaper folder
    loadWallpaperFolder(function(images) {
      if (images && images.length) {
        bgWallpaperImages = images;
        chrome.storage.local.get(['mytab_wallpaper_idx', 'mytab_folder_auto_advance'], function(d) {
          var savedIdx = d.mytab_wallpaper_idx;
          var autoAdv = d.mytab_folder_auto_advance !== false; // default true
          if (savedIdx != null && savedIdx >= 0 && savedIdx < images.length) {
            bgWallpaperCurrentIdx = autoAdv ? (savedIdx + 1) % images.length : savedIdx;
          } else {
            bgWallpaperCurrentIdx = 0;
          }
          chrome.storage.local.set({ mytab_wallpaper_idx: bgWallpaperCurrentIdx });
          done();
        });
      } else {
        done();
      }
    });

    // Single file
    loadBg(function(dataUrl, type) {
      if (dataUrl) bgSingleData = { dataUrl: dataUrl, type: type || 'image' };
      done();
    });
  });

  // Folder UI state updated by loadBgFolderAndApply with timeout

  renderTabs();
  if (tabsFloatX != null && tabsFloatY != null) {
    // Apply immediately without transition to avoid jerk on load
    tabsWrapEl.style.transition = 'none';
    applyTabsFloatPos(tabsFloatX, tabsFloatY);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        tabsWrapEl.style.transition = '';
      });
    });
  }
  renderShortcuts();
  renderQuickLinks();
  if (quickLinks.length > 0) {
    setTimeout(function() {
  if (data.mytab_ql_x != null && data.mytab_ql_y != null) {
        applyQlPanelPos(data.mytab_ql_x, data.mytab_ql_y);
      } else {
        var r = quickPanel.getBoundingClientRect();
        applyQlPanelPos(window.innerWidth - (r.width || 40) - 14, Math.round(window.innerHeight / 2) - 30);
      }
      if (qlDock) {
        var cross = data.mytab_ql_dock_cross;
        dockFloatingPanel(quickPanel, qlDock);
        if (cross != null) {
          if (qlDock === 'left' || qlDock === 'right') {
            quickPanel.style.top    = cross + 'px';
            quickPanel.style.bottom = 'auto';
          } else {
            quickPanel.style.left  = cross + 'px';
            quickPanel.style.right = 'auto';
            quickPanel.style.transform = '';
          }
          qlDockCrossPos = cross;
        }
      }
    }, 50);
  }

  if (data.mytab_bt_enabled  != null) btEnabled  = data.mytab_bt_enabled;
  if (data.mytab_bt_autohide != null) btAutoHide = data.mytab_bt_autohide;
  if (data.mytab_bt_dock) btDock = data.mytab_bt_dock;
  if (data.mytab_bt_showlabels != null) btShowLabels = data.mytab_bt_showlabels;
  if (data.mytab_sc_shownames  != null) scShowNames  = data.mytab_sc_shownames;
  if (data.mytab_icon_bounce  != null) iconBounce = data.mytab_icon_bounce;
  if (data.mytab_bt_icon_bounce != null) btIconBounce = data.mytab_bt_icon_bounce;
  if (data.mytab_sidebar_bounce != null) sbIconBounce = data.mytab_sidebar_bounce;
  if (data.mytab_sc_icon_size != null) scIconSize = data.mytab_sc_icon_size;
  if (data.mytab_ql_icon_size != null) qlIconSize = data.mytab_ql_icon_size;
  if (data.mytab_ql_icon_bounce != null) qlIconBounce = data.mytab_ql_icon_bounce;
  if (data.mytab_bt_icon_size != null) btIconSize = data.mytab_bt_icon_size;
  if (data.mytab_search_ultra  != null) searchUltra  = data.mytab_search_ultra;
  if (data.mytab_search_icononly != null) searchIconOnly = data.mytab_search_icononly;
  if (data.mytab_search_iconshow != null) searchIconShow = data.mytab_search_iconshow;
  if (data.mytab_search_suggest != null) searchSuggestEnabled = data.mytab_search_suggest;
  document.getElementById('search-suggest-toggle').checked = searchSuggestEnabled;
  if (data.mytab_search_autosearch != null) searchAutoSearchOnClick = data.mytab_search_autosearch;
  document.getElementById('search-autosearch-toggle').checked = searchAutoSearchOnClick;
  if (data.mytab_bt_hidden)           btHidden   = data.mytab_bt_hidden;
  if (data.mytab_bt_icons)            btIcons    = data.mytab_bt_icons;
  if (data.mytab_bt_order)             btOrder    = data.mytab_bt_order;
  if (data.mytab_sidebar_enabled != null) sbEnabled = data.mytab_sidebar_enabled;
  if (data.mytab_sidebar_items) {
    sbItems = data.mytab_sidebar_items.filter(function(item) {
      return item && (item.action === 'url' || item.action === 'tool');
    });
  }
  if (data.mytab_sidebar_shownames != null) sbShowNames = data.mytab_sidebar_shownames;
  if (data.mytab_sidebar_icon_size != null) sbIconSize = data.mytab_sidebar_icon_size;
  if (data.mytab_sidebar_autohide != null) sbAutoHide = data.mytab_sidebar_autohide;
  if (data.mytab_tabdock_enabled != null) tabDockEnabled = data.mytab_tabdock_enabled;
  if (data.mytab_tabdock_icon_size != null) tabDockIconSize = data.mytab_tabdock_icon_size;
  if (data.mytab_tabdock_close_mode) tabDockCloseMode = data.mytab_tabdock_close_mode;
  if (data.mytab_tabdock_peek != null) tabDockPeek = data.mytab_tabdock_peek;
  if (data.mytab_tabdock_glow != null) tabDockGlow = data.mytab_tabdock_glow;
  if (data.mytab_tabdock_dup_numbers != null) tabDockDupNumbers = data.mytab_tabdock_dup_numbers;
  if (data.mytab_tabdock_autohide != null) tabDockAutoHide = data.mytab_tabdock_autohide;
  if (data.mytab_tabdock_bounce != null) tabDockBounce = data.mytab_tabdock_bounce;
  btEnabledToggle.checked  = btEnabled;
  btAutohideToggle.checked = btAutoHide;
  btLabelsToggle.checked   = btShowLabels;
  sbEnabledToggle.checked   = sbEnabled;
  sbNamesToggle.checked     = sbShowNames;
  if (document.getElementById('sb-autohide-toggle')) document.getElementById('sb-autohide-toggle').checked = sbAutoHide;
  sbIconSizeSlider.value    = sbIconSize;
  sbBounceSlider.value      = sbIconBounce;
  tabDockEnabledToggle.checked = tabDockEnabled;
  tabDockIconSizeSlider.value = tabDockIconSize;
  if (tabDockPeekSlider) tabDockPeekSlider.value = tabDockPeek;
  tabDockGlowSlider.value = tabDockGlow;
  tabDockDupToggle.checked = tabDockDupNumbers;
  tabDockAutoHideToggle.checked = tabDockAutoHide;
  tabDockBounceSlider.value = tabDockBounce;
  syncTabDockCloseModeButtons();
  renderSideBarList();
  renderSideBarTools();
  scNamesToggle.checked    = scShowNames;
  iconBounceSlider.value    = iconBounce;
  btBounceSlider.value      = btIconBounce;
  scIconSizeSlider.value    = scIconSize;
  qlIconSizeSlider.value    = qlIconSize;
  qlBounceSlider.value      = qlIconBounce;
  btIconSizeSlider.value    = btIconSize;
  applyIconBounce();
  applyQlBounce();
  applyIconSizes();
  renderShortcuts();
  if (data.mytab_search_enabled != null) searchEnabled = data.mytab_search_enabled;
  if (data.mytab_search_autohide != null) searchAutoHide = data.mytab_search_autohide;
  if (data.mytab_sc_autohide != null) scAutoHide = data.mytab_sc_autohide;
  if (data.mytab_search_bounce != null) searchBounce = data.mytab_search_bounce;
  if (data.mytab_cat_shownames != null) catShowNames = data.mytab_cat_shownames;
  if (data.mytab_cat_autohide != null) catAutoHide = data.mytab_cat_autohide;
  if (data.mytab_cat_bounce != null) catBounce = data.mytab_cat_bounce;
  document.getElementById('search-enabled-toggle').checked = searchEnabled;
  document.getElementById('search-autohide-toggle').checked = searchAutoHide;
  document.getElementById('sc-autohide-toggle').checked = scAutoHide;
  searchBounceSlider.value = searchBounce;
  catNamesToggle.checked = catShowNames;
  catAutoHideToggle.checked = catAutoHide;
  catBounceSlider.value = catBounce;
  // sync icon gap sliders
  if (scIconGapSlider)      { scIconGapSlider.value = scIconGap;           var l = document.getElementById('sc-icon-gap-val');      if(l) l.textContent = scIconGap + 'px'; }
  if (catIconGapSlider)     { catIconGapSlider.value = catIconGap;         var l = document.getElementById('cat-icon-gap-val');     if(l) l.textContent = catIconGap + 'px'; }
  if (qlIconGapSlider)      { qlIconGapSlider.value = qlIconGap;           var l = document.getElementById('ql-icon-gap-val');      if(l) l.textContent = qlIconGap + 'px'; }
  if (btIconGapSlider)      { btIconGapSlider.value = btIconGap;           var l = document.getElementById('bt-icon-gap-val');      if(l) l.textContent = btIconGap + 'px'; }
  if (sbIconGapSlider)      { sbIconGapSlider.value = sbIconGap;           var l = document.getElementById('sb-icon-gap-val');      if(l) l.textContent = sbIconGap + 'px'; }
  if (tabDockIconGapSlider) { tabDockIconGapSlider.value = tabDockIconGap; var l = document.getElementById('tabdock-icon-gap-val'); if(l) l.textContent = tabDockIconGap + 'px'; }
  searchUltraToggle.checked    = searchUltra;
  document.getElementById('search-icon-toggle').checked = searchIconShow;
  applySearchModes();
  applySearchBounce();
  applyScAutoHide();
  applyCatNames();
  applyCatAutoHide();
  applyCatBounce();
  renderBtIconList();
  renderBtPanel();
  if (btEnabled && visibleBtTools().length > 0) {
    // Position immediately (no setTimeout) so panel never flashes at wrong spot.
    // Suppress transition first so the move is instant.
    btPanel.style.transition = 'none';
    if (btDock) {
      // Docked: apply dock class directly, restore cross-axis position
      var btCross = data.mytab_bt_dock_cross;
      dockFloatingPanel(btPanel, btDock);
      if (btCross != null) {
        if (btDock === 'left' || btDock === 'right') {
          btPanel.style.top    = btCross + 'px';
          btPanel.style.bottom = 'auto';
        } else {
          btPanel.style.left  = btCross + 'px';
          btPanel.style.right = 'auto';
          btPanel.style.transform = '';
        }
        btDockCrossPos = btCross;
      } else {
        // No saved cross position — place at vertical/horizontal center
        if (btDock === 'left' || btDock === 'right') {
          btPanel.style.top = Math.round((window.innerHeight - (btPanel.offsetHeight || 120)) / 2) + 'px';
        } else {
          btPanel.style.left = Math.round((window.innerWidth - (btPanel.offsetWidth || 120)) / 2) + 'px';
        }
      }
    } else {
      if (data.mytab_bt_x != null && data.mytab_bt_y != null) {
        applyBtPanelPos(data.mytab_bt_x, data.mytab_bt_y);
      } else {
        applyBtPanelPos(window.innerWidth - 54, Math.round(window.innerHeight / 2) + 60);
      }
    }
    // Re-enable transition after paint so hover/open animations still work
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        btPanel.style.transition = '';
      });
    });
  }

  // ── Load dual-mode opacity from storage ──────────────────────────────
  if (data.mytab_search_normal_opacity != null) searchNormalOpacity = data.mytab_search_normal_opacity;
  if (data.mytab_search_hover_opacity  != null) searchHoverOpacity  = data.mytab_search_hover_opacity;
  if (data.mytab_sc_normal_opacity     != null) scNormalOpacity     = data.mytab_sc_normal_opacity;
  if (data.mytab_sc_hover_opacity      != null) scHoverOpacity      = data.mytab_sc_hover_opacity;
  if (data.mytab_cat_normal_opacity    != null) catNormalOpacity    = data.mytab_cat_normal_opacity;
  if (data.mytab_cat_hover_opacity     != null) catHoverOpacity     = data.mytab_cat_hover_opacity;
  if (data.mytab_ql_normal_opacity     != null) qlNormalOpacity     = data.mytab_ql_normal_opacity;
  if (data.mytab_ql_hover_opacity      != null) qlHoverOpacity      = data.mytab_ql_hover_opacity;
  if (data.mytab_bt_normal_opacity     != null) btNormalOpacity     = data.mytab_bt_normal_opacity;
  if (data.mytab_bt_hover_opacity      != null) btHoverOpacity      = data.mytab_bt_hover_opacity;
  if (data.mytab_sb_normal_opacity     != null) sbNormalOpacity     = data.mytab_sb_normal_opacity;
  if (data.mytab_sb_hover_opacity      != null) sbHoverOpacity      = data.mytab_sb_hover_opacity;
  if (data.mytab_tabdock_normal_opacity != null) tabdockNormalOpacity = data.mytab_tabdock_normal_opacity;
  if (data.mytab_tabdock_hover_opacity  != null) tabdockHoverOpacity  = data.mytab_tabdock_hover_opacity;
  if (data.mytab_cat_sc_gap            != null) catScGap            = data.mytab_cat_sc_gap;
  if (data.mytab_sc_icon_gap           != null) scIconGap           = data.mytab_sc_icon_gap;
  if (data.mytab_cat_icon_gap          != null) catIconGap          = data.mytab_cat_icon_gap;
  if (data.mytab_ql_icon_gap           != null) qlIconGap           = data.mytab_ql_icon_gap;
  if (data.mytab_bt_icon_gap           != null) btIconGap           = data.mytab_bt_icon_gap;
  if (data.mytab_sb_icon_gap           != null) sbIconGap           = data.mytab_sb_icon_gap;
  if (data.mytab_tabdock_icon_gap      != null) tabDockIconGap      = data.mytab_tabdock_icon_gap;

  // ── Load hover-glow settings ──────────────────────────────────────────
  if (data.mytab_search_glow_size != null) searchGlowSize = data.mytab_search_glow_size;
  if (data.mytab_search_glow_color != null) searchGlowColor = data.mytab_search_glow_color;
  if (data.mytab_sc_glow_size != null) scGlowSize = data.mytab_sc_glow_size;
  if (data.mytab_sc_glow_color != null) scGlowColor = data.mytab_sc_glow_color;
  if (data.mytab_cat_glow_size != null) catGlowSize = data.mytab_cat_glow_size;
  if (data.mytab_cat_glow_color != null) catGlowColor = data.mytab_cat_glow_color;
  if (data.mytab_ql_glow_size != null) qlGlowSize = data.mytab_ql_glow_size;
  if (data.mytab_ql_glow_color != null) qlGlowColor = data.mytab_ql_glow_color;
  if (data.mytab_bt_glow_size != null) btGlowSize = data.mytab_bt_glow_size;
  if (data.mytab_bt_glow_color != null) btGlowColor = data.mytab_bt_glow_color;
  if (data.mytab_sb_glow_size != null) sbGlowSize = data.mytab_sb_glow_size;
  if (data.mytab_sb_glow_color != null) sbGlowColor = data.mytab_sb_glow_color;
  if (data.mytab_tabdock_hoverglow_size != null) tabDockHoverGlowSize = data.mytab_tabdock_hoverglow_size;
  if (data.mytab_tabdock_hoverglow_color != null) tabDockHoverGlowColor = data.mytab_tabdock_hoverglow_color;

  applyAllDualOpacities();
  applyCatScGap();
  applyAllIconGaps();
  applyAllGlows();
  syncAllGlowControls();
  syncAllOpacitySliders();

  initDropdownToggle('sc-cat-dropdown');

  // Kill search-bar CSS transitions before revealing so ultra-transparent /
  // opacity modes don't flash-animate on first paint. Re-enable after two
  // frames so hover/focus transitions still work normally afterwards.
  var searchEl = document.getElementById('search');
  if (searchEl) searchEl.style.transition = 'none';

  // All settings applied — now reveal the container (was hidden via CSS
  // visibility:hidden to avoid position/size flash during storage load)
  container.classList.add('ready');

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      if (searchEl) searchEl.style.transition = '';
    });
  });
});

// ════════════════════════════════════════════════════════════════════
//  DUAL-MODE OPACITY SYSTEM
// ════════════════════════════════════════════════════════════════════

// Apply all CSS variables based on current normal+hover values
function applyAllDualOpacities() {
  var s = document.body.style;
  s.setProperty('--search-normal-opacity', searchNormalOpacity / 100);
  s.setProperty('--search-hover-opacity',  searchHoverOpacity  / 100);
  s.setProperty('--sc-normal-opacity',     scNormalOpacity     / 100);
  s.setProperty('--sc-hover-opacity',      scHoverOpacity      / 100);
  s.setProperty('--cat-normal-opacity',    catNormalOpacity    / 100);
  s.setProperty('--cat-hover-opacity',     catHoverOpacity     / 100);
  s.setProperty('--ql-normal-opacity',     qlNormalOpacity     / 100);
  s.setProperty('--ql-hover-opacity',      qlHoverOpacity      / 100);
  s.setProperty('--bt-normal-opacity',     btNormalOpacity     / 100);
  s.setProperty('--bt-hover-opacity',      btHoverOpacity      / 100);
  // sidebar + tabdock live in shadow DOM — communicated via storage
  chrome.storage.local.set({
    mytab_sb_normal_opacity:      sbNormalOpacity,
    mytab_sb_hover_opacity:       sbHoverOpacity,
    mytab_tabdock_normal_opacity: tabdockNormalOpacity,
    mytab_tabdock_hover_opacity:  tabdockHoverOpacity
  });
}

function applyCatScGap() {
  document.body.style.setProperty('--cat-sc-gap', catScGap + 'px');
}

function applyAllIconGaps() {
  // Shortcuts and Quick Panel sliders can go negative to let icons overlap
  // (CSS `gap` can't go below 0) — clamp the actual gap at 0 and push any
  // negative amount into a margin-based overlap variable instead.
  document.body.style.setProperty('--sc-icon-gap',  Math.max(0, scIconGap) + 'px');
  document.body.style.setProperty('--sc-icon-overlap', Math.min(0, scIconGap) + 'px');
  document.body.style.setProperty('--cat-icon-gap', catIconGap + 'px');
  document.body.style.setProperty('--ql-icon-gap',  Math.max(0, qlIconGap) + 'px');
  document.body.style.setProperty('--ql-icon-overlap', Math.min(0, qlIconGap) + 'px');
  document.body.style.setProperty('--bt-icon-gap',  Math.max(0, btIconGap)  + 'px');
  document.body.style.setProperty('--bt-icon-overlap', Math.min(0, btIconGap) + 'px');
  // sb and tabdock gap → send to floating-sidebar via storage
  chrome.storage.local.set({
    mytab_sc_icon_gap:       scIconGap,
    mytab_cat_icon_gap:      catIconGap,
    mytab_ql_icon_gap:       qlIconGap,
    mytab_bt_icon_gap:       btIconGap,
    mytab_sb_icon_gap:       sbIconGap,
    mytab_tabdock_icon_gap:  tabDockIconGap
  });
}

// Apply all hover-glow CSS vars for in-page panels (search/sc/cat/ql/bt);
// sb + tabdock live in floating-sidebar.js's shadow DOM, synced via storage.
function applyAllGlows() {
  var s = document.body.style;
  s.setProperty('--search-glow-size', searchGlowSize + 'px');
  s.setProperty('--search-glow-color', searchGlowColor);
  s.setProperty('--sc-glow-size', scGlowSize + 'px');
  s.setProperty('--sc-glow-color', scGlowColor);
  s.setProperty('--cat-glow-size', catGlowSize + 'px');
  s.setProperty('--cat-glow-color', catGlowColor);
  s.setProperty('--ql-glow-size', qlGlowSize + 'px');
  s.setProperty('--ql-glow-color', qlGlowColor);
  s.setProperty('--bt-glow-size', btGlowSize + 'px');
  s.setProperty('--bt-glow-color', btGlowColor);
  // Toggle a "no-glow" class per panel when its slider is exactly 0 — a
  // 0/0 box-shadow renders nothing anyway, but this guarantees a hard off
  // with no possible residual halo from rounding or stacked shadows.
  document.body.classList.toggle('search-glow-off', searchGlowSize <= 0);
  document.body.classList.toggle('sc-glow-off', scGlowSize <= 0);
  document.body.classList.toggle('cat-glow-off', catGlowSize <= 0);
  document.body.classList.toggle('ql-glow-off', qlGlowSize <= 0);
  document.body.classList.toggle('bt-glow-off', btGlowSize <= 0);
  chrome.storage.local.set({
    mytab_sb_glow_size: sbGlowSize,
    mytab_sb_glow_color: sbGlowColor,
    mytab_tabdock_hoverglow_size: tabDockHoverGlowSize,
    mytab_tabdock_hoverglow_color: tabDockHoverGlowColor
  });
}

// Sync glow slider positions, labels, and swatch colors in the settings UI
// to reflect currently loaded values (called once after storage load)
function syncAllGlowControls() {
  function sync(slider, picker, swatch, labelId, size, color) {
    if (slider) slider.value = size;
    if (picker) picker.value = color;
    if (swatch) swatch.style.background = color;
    var lbl = document.getElementById(labelId);
    if (lbl) lbl.textContent = size + 'px';
  }
  sync(searchGlowSizeSlider, searchGlowColorPicker, searchGlowColorSwatch, 'search-glow-size-val', searchGlowSize, searchGlowColor);
  sync(scGlowSizeSlider, scGlowColorPicker, scGlowColorSwatch, 'sc-glow-size-val', scGlowSize, scGlowColor);
  sync(catGlowSizeSlider, catGlowColorPicker, catGlowColorSwatch, 'cat-glow-size-val', catGlowSize, catGlowColor);
  sync(qlGlowSizeSlider, qlGlowColorPicker, qlGlowColorSwatch, 'ql-glow-size-val', qlGlowSize, qlGlowColor);
  sync(btGlowSizeSlider, btGlowColorPicker, btGlowColorSwatch, 'bt-glow-size-val', btGlowSize, btGlowColor);
  sync(sbGlowSizeSlider, sbGlowColorPicker, sbGlowColorSwatch, 'sb-glow-size-val', sbGlowSize, sbGlowColor);
  sync(tabDockHoverGlowSizeSlider, tabDockHoverGlowColorPicker, tabDockHoverGlowColorSwatch, 'tabdock-hoverglow-size-val', tabDockHoverGlowSize, tabDockHoverGlowColor);
}

// Sync slider UI and label to reflect current autohide state for each element
function syncOpacitySlider(sliderId, labelId, autoHideOn, normalVal, hoverVal) {
  var sl  = document.getElementById(sliderId);
  var lbl = document.getElementById(labelId);
  if (!sl) return;
  var val = autoHideOn ? hoverVal : normalVal;
  sl.value = val;
  if (lbl) lbl.textContent = val + '%';
}

function syncAllOpacitySliders() {
  syncOpacitySlider('search-hidden-opacity-slider',  'search-hidden-opacity-val',  searchAutoHide,   searchNormalOpacity,    searchHoverOpacity);
  syncOpacitySlider('sc-hidden-opacity-slider',      'sc-hidden-opacity-val',      scAutoHide,       scNormalOpacity,        scHoverOpacity);
  syncOpacitySlider('cat-hidden-opacity-slider',     'cat-hidden-opacity-val',     catAutoHide,      catNormalOpacity,       catHoverOpacity);
  syncOpacitySlider('ql-hidden-opacity-slider',      'ql-hidden-opacity-val',      qlAutoHide,       qlNormalOpacity,        qlHoverOpacity);
  syncOpacitySlider('bt-hidden-opacity-slider',      'bt-hidden-opacity-val',      btAutoHide,       btNormalOpacity,        btHoverOpacity);
  syncOpacitySlider('sb-hidden-opacity-slider',      'sb-hidden-opacity-val',      sbAutoHide,       sbNormalOpacity,        sbHoverOpacity);
  syncOpacitySlider('tabdock-hidden-opacity-slider', 'tabdock-hidden-opacity-val', tabDockAutoHide,  tabdockNormalOpacity,   tabdockHoverOpacity);
}

// ── Slider event listeners (dual-mode) ───────────────────────────────
(function() {
  function bindDualSlider(sliderId, labelId, isAutoHideFn, getNormal, setNormal, getHover, setHover, cssNormalVar, cssHoverVar) {
    var sl = document.getElementById(sliderId);
    if (!sl) return;
    sl.addEventListener('input', function() {
      var v = parseInt(sl.value, 10);
      var lbl = document.getElementById(labelId);
      if (lbl) lbl.textContent = v + '%';
      if (isAutoHideFn()) {
        setHover(v);
        document.body.style.setProperty(cssHoverVar, v / 100);
      } else {
        setNormal(v);
        document.body.style.setProperty(cssNormalVar, v / 100);
      }
    });
    sl.addEventListener('change', function() { save(); });
  }

  bindDualSlider(
    'search-hidden-opacity-slider', 'search-hidden-opacity-val',
    function(){ return searchAutoHide; },
    function(){ return searchNormalOpacity; }, function(v){ searchNormalOpacity = v; },
    function(){ return searchHoverOpacity; },  function(v){ searchHoverOpacity  = v; },
    '--search-normal-opacity', '--search-hover-opacity'
  );
  bindDualSlider(
    'sc-hidden-opacity-slider', 'sc-hidden-opacity-val',
    function(){ return scAutoHide; },
    function(){ return scNormalOpacity; }, function(v){ scNormalOpacity = v; },
    function(){ return scHoverOpacity; },  function(v){ scHoverOpacity  = v; },
    '--sc-normal-opacity', '--sc-hover-opacity'
  );
  bindDualSlider(
    'cat-hidden-opacity-slider', 'cat-hidden-opacity-val',
    function(){ return catAutoHide; },
    function(){ return catNormalOpacity; }, function(v){ catNormalOpacity = v; },
    function(){ return catHoverOpacity; },  function(v){ catHoverOpacity  = v; },
    '--cat-normal-opacity', '--cat-hover-opacity'
  );
  bindDualSlider(
    'ql-hidden-opacity-slider', 'ql-hidden-opacity-val',
    function(){ return qlAutoHide; },
    function(){ return qlNormalOpacity; }, function(v){ qlNormalOpacity = v; },
    function(){ return qlHoverOpacity; },  function(v){ qlHoverOpacity  = v; },
    '--ql-normal-opacity', '--ql-hover-opacity'
  );
  bindDualSlider(
    'bt-hidden-opacity-slider', 'bt-hidden-opacity-val',
    function(){ return btAutoHide; },
    function(){ return btNormalOpacity; }, function(v){ btNormalOpacity = v; },
    function(){ return btHoverOpacity; },  function(v){ btHoverOpacity  = v; },
    '--bt-normal-opacity', '--bt-hover-opacity'
  );


  // ── Sidebar opacity slider (shadow DOM → chrome.storage) ──────────
  (function() {
    var sl = document.getElementById('sb-hidden-opacity-slider');
    if (!sl) return;
    sl.addEventListener('input', function() {
      var v = parseInt(sl.value, 10);
      var lbl = document.getElementById('sb-hidden-opacity-val');
      if (lbl) lbl.textContent = v + '%';
      if (sbAutoHide) { sbHoverOpacity  = v; }
      else             { sbNormalOpacity = v; }
      applyAllDualOpacities();   // writes to chrome.storage → floating-sidebar.js picks it up
    });
    sl.addEventListener('change', function() { save(); });
  })();

  // ── Tab Dock opacity slider (shadow DOM → chrome.storage) ─────────
(function() {
    var sl = document.getElementById('tabdock-hidden-opacity-slider');
    if (!sl) return;
    sl.addEventListener('input', function() {
      var v = parseInt(sl.value, 10);
      var lbl = document.getElementById('tabdock-hidden-opacity-val');
      if (lbl) lbl.textContent = v + '%';
      if (tabDockAutoHide) {
        tabdockHoverOpacity  = v;
        chrome.storage.local.set({ mytab_tabdock_hover_opacity: v });
      } else {
        tabdockNormalOpacity = v;
        chrome.storage.local.set({ mytab_tabdock_normal_opacity: v });
      }
    });
    sl.addEventListener('change', function() {
      applyAllDualOpacities();
      save();
    });
  })();

})();

// Call syncAllOpacitySliders whenever autohide toggles change
// (hooked in existing autohide toggle handlers via the wrapper below)
function onAutohideToggleChanged() {
  applyAllDualOpacities();
  syncAllOpacitySliders();
}
