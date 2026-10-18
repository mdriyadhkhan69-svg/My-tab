(function() {
  if (window.__mytabFloatingSidebar) return;
  window.__mytabFloatingSidebar = true;

  var state = {
    enabled: false,
    items: [],
    showNames: true,
    iconSize: 34,
    x: null,
    y: null,
    dock: null,
    autoHide: true,
    sbNormalOpacity: 100,
    sbHoverOpacity: 100,
    tabDockEnabled: false,
    tabDockIconSize: 28,
    tabDockX: null,
    tabDockY: null,
    tabDockDock: null,
    tabDockCloseMode: 'hover',
    tabDockPeek: 0,
    tabDockGlow: 70,
    tabDockDupNumbers: true,
    tabDockAutoHide: false,
    tabDockBounce: 100,
    tabDockNormalOpacity: 100,
    tabDockHoverOpacity: 100,
    sbGlowSize: 8,
    sbGlowColor: '#ffffff',
    tabDockHoverGlowSize: 8,
    tabDockHoverGlowColor: '#ffffff',
    tabs: []
  };
  var host = null;
  var root = null;
  var panel = null;
  var links = null;
  var drag = null;
  var hotzone = null;
  var tabDock = null;
  var tabDockLinks = null;
  var tabDockHandle = null;
  var tabDockHotzone = null;
  var tabDockTimer = null;

  function faviconUrl(url) {
    try { return 'https://www.google.com/s2/favicons?domain=' + new URL(url).origin + '&sz=64'; }
    catch(e) { return ''; }
  }

  function defaultIcon(item) {
    if (item.action === 'new_tab') return '+';
    if (item.action === 'close_others') return 'x';
    if (item.action === 'key') return 'K';
    if (item.action === 'tool') {
      var symbols = { new_tab: '+', close_tab: 'x', close_others: 'O', reload: 'R', back: '<', forward: '>' };
      return symbols[item.tool] || 'B';
    }
    return (item.name || 'Link').charAt(0).toUpperCase();
  }

  // ── Extension context guard ───────────────
  function isCtxValid() {
    try { return !!(chrome && chrome.runtime && chrome.runtime.id); }
    catch(e) { return false; }
  }

  function safeMsg(msg, cb) {
    if (!isCtxValid()) return;
    try {
      chrome.runtime.sendMessage(msg, function(response) {
        if (chrome.runtime.lastError) return; // swallow
        if (cb) cb(response);
      });
    } catch(e) {}
  }

  function load() {
    if (!isCtxValid()) return;
    chrome.storage.local.get([
      'mytab_sidebar_enabled',
      'mytab_sidebar_items',
      'mytab_sidebar_shownames',
      'mytab_sidebar_icon_size',
      'mytab_sidebar_bounce',
      'mytab_sidebar_x',
      'mytab_sidebar_y',
      'mytab_sidebar_dock',
      'mytab_sidebar_autohide',
      'mytab_tabdock_enabled',
      'mytab_tabdock_icon_size',
      'mytab_tabdock_x',
      'mytab_tabdock_y',
      'mytab_tabdock_dock',
      'mytab_tabdock_close_mode',
      'mytab_tabdock_peek',
      'mytab_tabdock_glow',
      'mytab_tabdock_dup_numbers',
      'mytab_tabdock_autohide',
      'mytab_tabdock_bounce',
      'mytab_sb_normal_opacity',
      'mytab_sb_hover_opacity',
      'mytab_tabdock_normal_opacity',
      'mytab_tabdock_hover_opacity',
      'mytab_sb_icon_gap',
      'mytab_tabdock_icon_gap',
      'mytab_sb_glow_size',
      'mytab_sb_glow_color',
      'mytab_tabdock_hoverglow_size',
      'mytab_tabdock_hoverglow_color'
    ], function(data) {
      state.enabled = !!data.mytab_sidebar_enabled;
      state.items = Array.isArray(data.mytab_sidebar_items)
        ? data.mytab_sidebar_items.filter(function(item) {
            return item && (item.action === 'url' || item.action === 'tool');
          })
        : [];
      state.showNames = data.mytab_sidebar_shownames !== false;
      state.iconSize = data.mytab_sidebar_icon_size || 34;
      state.sidebarBounce = data.mytab_sidebar_bounce != null ? data.mytab_sidebar_bounce : 100;
      state.x = data.mytab_sidebar_x;
      state.y = data.mytab_sidebar_y;
      state.dock = data.mytab_sidebar_dock || null;
      state.autoHide = data.mytab_sidebar_autohide !== false;
      state.sbNormalOpacity      = data.mytab_sb_normal_opacity      != null ? data.mytab_sb_normal_opacity      : 100;
      state.sbHoverOpacity       = data.mytab_sb_hover_opacity       != null ? data.mytab_sb_hover_opacity       : 100;
      state.tabDockEnabled = !!data.mytab_tabdock_enabled;
      state.tabDockIconSize = data.mytab_tabdock_icon_size || 28;
      state.tabDockX = data.mytab_tabdock_x;
      state.tabDockY = data.mytab_tabdock_y;
      state.tabDockDock = data.mytab_tabdock_dock != null ? data.mytab_tabdock_dock : null;
      state.tabDockCloseMode = data.mytab_tabdock_close_mode || 'hover';
      state.tabDockPeek = data.mytab_tabdock_peek || 0;
      state.tabDockGlow = data.mytab_tabdock_glow != null ? data.mytab_tabdock_glow : 70;
      state.tabDockDupNumbers = data.mytab_tabdock_dup_numbers !== false;
      state.tabDockAutoHide = !!data.mytab_tabdock_autohide;
      state.tabDockBounce = data.mytab_tabdock_bounce != null ? data.mytab_tabdock_bounce : 100;
      state.tabDockNormalOpacity = data.mytab_tabdock_normal_opacity != null ? data.mytab_tabdock_normal_opacity : 100;
      state.tabDockHoverOpacity  = data.mytab_tabdock_hover_opacity  != null ? data.mytab_tabdock_hover_opacity  : 100;
      state.sbIconGap      = data.mytab_sb_icon_gap      != null ? data.mytab_sb_icon_gap      : 8;
      state.tabDockIconGap = data.mytab_tabdock_icon_gap != null ? data.mytab_tabdock_icon_gap : 8;
      state.sbGlowSize = data.mytab_sb_glow_size != null ? data.mytab_sb_glow_size : 8;
      state.sbGlowColor = data.mytab_sb_glow_color || '#ffffff';
      state.tabDockHoverGlowSize = data.mytab_tabdock_hoverglow_size != null ? data.mytab_tabdock_hoverglow_size : 8;
      state.tabDockHoverGlowColor = data.mytab_tabdock_hoverglow_color || '#ffffff';
      // Suppress all transitions during initial render so nothing flashes or
      // slides into view. Re-enable them after one frame so hover/drag still animates.
      state._suppressTransitions = true;
      render();
      applyHiddenOpacityStyle();
      applyIconGaps();
      applyGlows();
      state._suppressTransitions = false;
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          if (panel) panel.style.transition = '';
          if (tabDock) tabDock.style.transition = '';
        });
      });
    });
  }

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(function(changes, area) {
      if (!isCtxValid()) return;
      if (area !== 'local') return;
      var shouldRender = false;
      var shouldRenderTabDock = false;
      if (changes.mytab_sidebar_enabled) { state.enabled = !!changes.mytab_sidebar_enabled.newValue; shouldRender = true; }
      if (changes.mytab_sidebar_autohide != null) { state.autoHide = changes.mytab_sidebar_autohide.newValue !== false; applySidebarAutoHide(); applyHiddenOpacityStyle(); }
      if (changes.mytab_sb_normal_opacity != null) { state.sbNormalOpacity = changes.mytab_sb_normal_opacity.newValue != null ? changes.mytab_sb_normal_opacity.newValue : 100; applyHiddenOpacityStyle(); }
      if (changes.mytab_sb_hover_opacity  != null) { state.sbHoverOpacity  = changes.mytab_sb_hover_opacity.newValue  != null ? changes.mytab_sb_hover_opacity.newValue  : 100; applyHiddenOpacityStyle(); }
      if (changes.mytab_sidebar_items) {
        state.items = Array.isArray(changes.mytab_sidebar_items.newValue)
          ? changes.mytab_sidebar_items.newValue.filter(function(item) { return item && (item.action === 'url' || item.action === 'tool'); })
          : [];
        shouldRender = true;
      }
      if (changes.mytab_sidebar_shownames) { state.showNames = changes.mytab_sidebar_shownames.newValue !== false; shouldRender = true; }
      if (changes.mytab_sidebar_icon_size) { state.iconSize = changes.mytab_sidebar_icon_size.newValue || 34; shouldRender = true; }
      if (changes.mytab_sidebar_bounce) { state.sidebarBounce = changes.mytab_sidebar_bounce.newValue != null ? changes.mytab_sidebar_bounce.newValue : 100; shouldRender = true; }
      if (changes.mytab_tabdock_enabled) { state.tabDockEnabled = !!changes.mytab_tabdock_enabled.newValue; shouldRender = true; }
      if (changes.mytab_tabdock_icon_size) { state.tabDockIconSize = changes.mytab_tabdock_icon_size.newValue || 28; shouldRenderTabDock = true; }
      if (changes.mytab_tabdock_close_mode) { state.tabDockCloseMode = changes.mytab_tabdock_close_mode.newValue || 'hover'; shouldRenderTabDock = true; }
      if (changes.mytab_tabdock_peek) { state.tabDockPeek = changes.mytab_tabdock_peek.newValue || 0; shouldRenderTabDock = true; }
      if (changes.mytab_tabdock_glow) { state.tabDockGlow = changes.mytab_tabdock_glow.newValue != null ? changes.mytab_tabdock_glow.newValue : 70; shouldRenderTabDock = true; }
      if (changes.mytab_tabdock_dup_numbers) { state.tabDockDupNumbers = changes.mytab_tabdock_dup_numbers.newValue !== false; shouldRenderTabDock = true; }
      if (changes.mytab_tabdock_autohide != null) { state.tabDockAutoHide = !!changes.mytab_tabdock_autohide.newValue; applyTabDockAutoHide(); applyHiddenOpacityStyle(); }
      if (changes.mytab_tabdock_normal_opacity != null) { state.tabDockNormalOpacity = changes.mytab_tabdock_normal_opacity.newValue != null ? changes.mytab_tabdock_normal_opacity.newValue : 100; applyHiddenOpacityStyle(); }
      if (changes.mytab_tabdock_hover_opacity  != null) { state.tabDockHoverOpacity  = changes.mytab_tabdock_hover_opacity.newValue  != null ? changes.mytab_tabdock_hover_opacity.newValue  : 100; applyHiddenOpacityStyle(); }
      if (changes.mytab_tabdock_bounce) { state.tabDockBounce = changes.mytab_tabdock_bounce.newValue != null ? changes.mytab_tabdock_bounce.newValue : 100; shouldRenderTabDock = true; }
      if (changes.mytab_sb_icon_gap != null) { state.sbIconGap = changes.mytab_sb_icon_gap.newValue != null ? changes.mytab_sb_icon_gap.newValue : 8; applyIconGaps(); }
      if (changes.mytab_tabdock_icon_gap != null) { state.tabDockIconGap = changes.mytab_tabdock_icon_gap.newValue != null ? changes.mytab_tabdock_icon_gap.newValue : 8; applyIconGaps(); }
      if (changes.mytab_sb_glow_size != null) { state.sbGlowSize = changes.mytab_sb_glow_size.newValue != null ? changes.mytab_sb_glow_size.newValue : 8; applyGlows(); }
      if (changes.mytab_sb_glow_color != null) { state.sbGlowColor = changes.mytab_sb_glow_color.newValue || '#ffffff'; applyGlows(); }
      if (changes.mytab_tabdock_hoverglow_size != null) { state.tabDockHoverGlowSize = changes.mytab_tabdock_hoverglow_size.newValue != null ? changes.mytab_tabdock_hoverglow_size.newValue : 8; applyGlows(); }
      if (changes.mytab_tabdock_hoverglow_color != null) { state.tabDockHoverGlowColor = changes.mytab_tabdock_hoverglow_color.newValue || '#ffffff'; applyGlows(); }
      if (shouldRender) render();
      else if (shouldRenderTabDock) renderTabDock();
    });
  }

  function ensureHost() {
    if (host) return;
    if (!document.documentElement) {
      document.addEventListener('DOMContentLoaded', ensureHost, { once: true });
      return;
    }

    host = document.createElement('div');
    host.id = 'mytab-floating-sidebar-host';
    document.documentElement.appendChild(host);
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = [
      '<style>',
      ':host{all:initial}',
      '.panel{position:fixed;right:14px;top:45vh;z-index:2147483647;display:flex;flex-direction:column;align-items:center;padding:0;background:transparent!important;border:0!important;box-shadow:none!important;opacity:0;transform:none;transition:opacity .2s ease,transform .3s cubic-bezier(.22,1,.36,1);font-family:Segoe UI,Arial,sans-serif;overflow:visible;contain:none;}',
      '.panel:hover,.panel.open{opacity:1;transform:translateX(0)!important}',
      '.panel.dock-left{left:0!important;right:auto!important;transform:translateX(-100%)}',
      '.panel.dock-right{right:0!important;left:auto!important;transform:translateX(100%)}',
      '.panel.autohide-off{opacity:1!important;transform:translateX(0)!important}',
      '.panel.autohide-off.dock-left{transform:translateX(0)!important}',
      '.panel.autohide-off.dock-right{transform:translateX(0)!important}',
      '.hotzone{position:fixed;z-index:2147483647;width:22px;min-height:90px;background:transparent;border:0;box-shadow:none;opacity:0;}',
      '.hotzone.left{left:0}.hotzone.right{right:0}.hotzone.free{display:none}',
      '.handle{width:34px;height:20px;margin-bottom:4px;border-radius:999px;background:transparent;box-shadow:none;opacity:0;cursor:grab}',
      '.handle:active{cursor:grabbing}',
      '.links{display:flex;flex-direction:column;align-items:center;gap:8px;max-height:72vh;overflow:visible;padding:0;scrollbar-width:none}',
      '.links::-webkit-scrollbar{display:none}',
      '.item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:2px;border:0;background:transparent!important;color:var(--mytab-auto-fg,#fff);text-decoration:none;cursor:pointer;text-shadow:none;overflow:visible;isolation:isolate;touch-action:none;}',
      '.item.smooth-dragging{opacity:.82;transform:scale(1.06);filter:drop-shadow(0 8px 18px rgba(0,0,0,.34));cursor:grabbing;}',
      '.sort-placeholder{opacity:.16;filter:none!important;pointer-events:none;}',
      '.item:hover .box{transform:scale(var(--mytab-sb-hover-scale,1.08))}',
      '.item:active .box{transform:scale(var(--mytab-sb-active-scale,.94))}',
      '.box{width:var(--mytab-sb-size);height:var(--mytab-sb-size);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--mytab-auto-fg,#fff);background:transparent!important;border:0!important;box-shadow:none!important;transition:transform .14s cubic-bezier(.34,1.56,.64,1),filter .14s ease;overflow:visible;}',
      '.box img{width:100%;height:100%;object-fit:cover}',
      '.label{max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;opacity:.86}',
      '.tabdock{position:fixed;right:0;top:36vh;z-index:2147483646;display:flex;flex-direction:column;align-items:center;gap:8px;padding:0;background:transparent!important;border:0!important;box-shadow:none!important;opacity:0;transform:none;transition:opacity .2s ease,transform .3s cubic-bezier(.22,1,.36,1);overflow:visible;contain:none;}',
      '.tabdock.open,.tabdock:hover{opacity:1;transform:translate(0,0)!important}',
      '.tabdock.dock-left{left:0!important;right:auto!important;transform:translateX(-200px)}',
      '.tabdock.dock-right{right:0!important;left:auto!important;transform:translateX(200px)}',
      '.tabdock.dock-top{top:0!important;bottom:auto!important;flex-direction:row;transform:translateY(-200px)}',
      '.tabdock.dock-bottom{bottom:0!important;top:auto!important;flex-direction:row;transform:translateY(200px)}',
      '.tabdock.autohide-off.dock-left{transform:translateX(0)!important}',
      '.tabdock.autohide-off.dock-right{transform:translateX(0)!important}',
      '.tabdock.autohide-off.dock-top{transform:translateY(0)!important}',
      '.tabdock.autohide-off.dock-bottom{transform:translateY(0)!important}',
      '.tabdock.dock-left.open,.tabdock.dock-left:hover{transform:translateX(0)!important}.tabdock.dock-right.open,.tabdock.dock-right:hover{transform:translateX(0)!important}.tabdock.dock-top.open,.tabdock.dock-top:hover{transform:translateY(0)!important}.tabdock.dock-bottom.open,.tabdock.dock-bottom:hover{transform:translateY(0)!important}',
      '.tabdock-hotzone{position:fixed;z-index:2147483646;background:transparent;opacity:0;}',
      '.tabdock-hotzone.left,.tabdock-hotzone.right{width:22px;min-height:90px}.tabdock-hotzone.top,.tabdock-hotzone.bottom{height:22px;min-width:120px}.tabdock-hotzone.left{left:0}.tabdock-hotzone.right{right:0}.tabdock-hotzone.top{top:0}.tabdock-hotzone.bottom{bottom:0}.tabdock-hotzone.free{display:none}',
      '.tabdock-handle{width:38px;height:22px;background:transparent;opacity:0;cursor:grab;flex:0 0 auto;position:relative}.tabdock-handle:active{cursor:grabbing}.tabdock-handle:before{content:"";position:absolute;inset:0;background:transparent}',
      '.tabdock-links{display:flex;flex-direction:column;align-items:center;gap:8px;overflow:visible;padding:0}.tabdock.dock-top .tabdock-links,.tabdock.dock-bottom .tabdock-links{flex-direction:row}',
      '.tab-item{position:relative;width:var(--mytab-tabdock-size);height:var(--mytab-tabdock-size);padding:0;border:0;background:transparent!important;color:var(--mytab-auto-fg,#fff);cursor:pointer;overflow:visible;touch-action:none;isolation:isolate;transition:transform .14s cubic-bezier(.34,1.56,.64,1);}',
      '.tab-item:hover{transform:scale(var(--mytab-tabdock-hover-scale,1.08))}',
      '.tab-item:active{transform:scale(var(--mytab-tabdock-active-scale,.94))}',
      '.tab-item img{width:100%;height:100%;object-fit:cover;border-radius:8px}.tab-item.active img,.tab-item.active .fallback-icon{filter:drop-shadow(0 0 calc(2px + var(--mytab-tabdock-glow)*.06px) rgba(255,255,255,calc(.28 + var(--mytab-tabdock-glow)*.004))) drop-shadow(0 0 calc(4px + var(--mytab-tabdock-glow)*.08px) rgba(255,255,255,calc(.18 + var(--mytab-tabdock-glow)*.003)))}.tab-item.smooth-dragging{opacity:.9;transform:scale(1.08);filter:drop-shadow(0 8px 18px rgba(0,0,0,.34));cursor:grabbing}.tab-placeholder{opacity:.18;pointer-events:none}',
      '.fallback-icon{width:100%;height:100%;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--mytab-auto-fg,#fff);background:color-mix(in srgb,var(--mytab-auto-fg,#fff) 14%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--mytab-auto-fg,#fff) 24%,transparent);font-size:0;position:relative}.fallback-icon:before,.fallback-icon:after{content:"";position:absolute;background:currentColor;border-radius:999px}.fallback-new:before{width:42%;height:2px}.fallback-new:after{width:2px;height:42%}.fallback-ext:before{width:48%;height:48%;border-radius:7px;background:transparent;border:2px solid currentColor}.fallback-ext:after{width:5px;height:5px;box-shadow:0 -11px 0 currentColor,11px 0 0 currentColor,0 11px 0 currentColor,-11px 0 0 currentColor}.fallback-page:before{width:42%;height:52%;border-radius:3px;background:transparent;border:2px solid currentColor}.fallback-page:after{width:18%;height:2px;transform:translateY(-5px);box-shadow:0 7px 0 currentColor}',
      '.tab-close{position:absolute;right:-7px;top:-8px;width:17px;height:17px;border:0;border-radius:50%;background:rgba(18,18,18,.74);color:#fff;font-size:12px;line-height:17px;padding:0;cursor:pointer;opacity:0;transform:scale(.72);transition:opacity .16s ease,transform .16s cubic-bezier(.22,1,.36,1),background .16s ease;box-shadow:0 5px 14px rgba(0,0,0,.28);backdrop-filter:blur(8px)}.tab-close:hover{background:rgba(220,48,48,.9);transform:scale(1.08)!important}.tabdock[data-close-mode="hover"] .tab-item:hover .tab-close,.tab-item.menu-open .tab-close{opacity:1;transform:scale(1)}.tabdock.dock-right .tab-close{right:auto;left:-8px;top:-8px}.tabdock.dock-top .tab-close{top:auto;bottom:-8px;right:-7px}',
      '.tab-dup-badge{position:absolute;right:-6px;bottom:-6px;min-width:14px;height:14px;padding:0 4px;border-radius:999px;background:rgba(0,0,0,.68);color:#fff;font-size:9px;line-height:14px;font-weight:700;box-shadow:0 3px 9px rgba(0,0,0,.32);pointer-events:none;z-index:2}.tabdock.dock-right .tab-dup-badge{right:auto;left:-6px;bottom:-6px}.tabdock.dock-top .tab-dup-badge{right:-6px;bottom:-6px;top:auto;left:auto}.tabdock.dock-bottom .tab-dup-badge{right:-6px;top:-6px;bottom:auto;left:auto}',
      '</style>',
      '<div class="hotzone free"></div><div class="panel"><div class="handle"></div><div class="links"></div></div><div class="tabdock-hotzone free"></div><div class="tabdock"><div class="tabdock-handle"></div><div class="tabdock-links"></div></div>'
    ].join('');

    panel = root.querySelector('.panel');
    links = root.querySelector('.links');
    drag = root.querySelector('.handle');
    hotzone = root.querySelector('.hotzone');
    tabDock = root.querySelector('.tabdock');
    tabDockLinks = root.querySelector('.tabdock-links');
    tabDockHandle = root.querySelector('.tabdock-handle');
    tabDockHotzone = root.querySelector('.tabdock-hotzone');
    bindHover();
    bindDrag();
    bindTabDockHover();
    bindTabDockDrag();
    watchHostAttachment();
  }

  // Some single-page sites (heavy client-side routing) occasionally
  // replace large chunks of <html> during navigation, which can detach
  // our injected host even though the extension is still running. Watch
  // for that and silently re-append so the sidebar/Tab Dock keep working
  // without needing a manual page reload.
  var hostObserver = null;
  function watchHostAttachment() {
    if (hostObserver || !host) return;
    if (typeof MutationObserver === 'undefined') return;
    hostObserver = new MutationObserver(function() {
      if (host && !document.documentElement.contains(host)) {
        try { document.documentElement.appendChild(host); } catch(e) {}
      }
    });
    try {
      hostObserver.observe(document.documentElement, { childList: true });
    } catch(e) {}
  }

  function render() {
    if (!isCtxValid()) return;
    if (!state.enabled && !state.tabDockEnabled) {
      if (host) host.remove();
      if (hostObserver) { hostObserver.disconnect(); hostObserver = null; }
      host = root = panel = links = drag = hotzone = tabDock = tabDockLinks = tabDockHandle = tabDockHotzone = null;
      return;
    }
    ensureHost();
    if (!panel || !links) return;
    updateAutoColor();

    panel.style.display = state.enabled ? 'flex' : 'none';
    if (hotzone) hotzone.style.display = state.enabled ? '' : 'none';
    if (!state.enabled) {
      renderTabDock();
      return;
    }

    panel.style.setProperty('--mytab-sb-size', state.iconSize + 'px');
    var sbBounceRatio = (state.sidebarBounce != null ? state.sidebarBounce : 100) / 100;
    panel.style.setProperty('--mytab-sb-hover-scale', (1 + .10 * sbBounceRatio).toString());
    panel.style.setProperty('--mytab-sb-active-scale', (1 - .08 * sbBounceRatio).toString());
    normalizePosition();
    links.innerHTML = '';

    state.items.forEach(function(item, index) {
      var button = document.createElement('button');
      button.className = 'item';
      button.title = item.name || 'Side Bar Item';
      button.draggable = false;
      button.dataset.index = index;

      var box = document.createElement('span');
      box.className = 'box';
      if (item.icon) {
        var img = document.createElement('img');
        img.src = item.icon;
        img.alt = '';
        box.appendChild(img);
      } else if (item.url && item.action === 'url') {
        var fav = document.createElement('img');
        fav.src = faviconUrl(item.url);
        fav.alt = '';
        fav.onerror = function() { box.textContent = defaultIcon(item); };
        box.appendChild(fav);
      } else {
        box.textContent = defaultIcon(item);
      }

      button.appendChild(box);
      if (state.showNames && item.name) {
        var label = document.createElement('span');
        label.className = 'label';
        label.textContent = item.name;
        button.appendChild(label);
      }
      button.addEventListener('click', function() { runItem(item); });
      bindSmoothItemReorder(button);
      links.appendChild(button);
    });

    applyPlacement();
    applySidebarAutoHide();
    applyGlows();
    renderTabDock();
  }

  function renderTabDock() {
    ensureHost(); // Make sure host exists before trying to access shadow DOM elements
    if (!tabDock || !tabDockLinks || !tabDockHotzone) return;
    updateAutoColor();
    tabDock.style.display = state.tabDockEnabled ? 'flex' : 'none';
    tabDockHotzone.style.display = state.tabDockEnabled ? '' : 'none';
    tabDock.dataset.closeMode = state.tabDockCloseMode;
    if (!state.tabDockEnabled) {
      stopTabDockPolling();
      return;
    }
    tabDock.style.setProperty('--mytab-tabdock-size', state.tabDockIconSize + 'px');
    tabDock.style.setProperty('--mytab-tabdock-glow', String(state.tabDockGlow || 0));
    tabDock.style.setProperty('--mytab-tabdock-peek', (state.tabDockPeek || 0) + 'px');
    applyGlows();
    var tabDockBounceRatio = (state.tabDockBounce != null ? state.tabDockBounce : 100) / 100;
    tabDock.style.setProperty('--mytab-tabdock-hover-scale', (1 + .08 * tabDockBounceRatio).toString());
    tabDock.style.setProperty('--mytab-tabdock-active-scale', (1 - .06 * tabDockBounceRatio).toString());
    startTabDockPolling();
    safeMsg({ type: 'MYTAB_GET_TABS' }, function(response) {
      if (!isCtxValid() || !response || !response.tabs) return;
      state.tabs = response.tabs;
      drawTabDockTabs();
      applyTabDockPlacement();
      applyTabDockAutoHide();
    });
  }

  function drawTabDockTabs() {
    var totals = {};
    state.tabs.forEach(function(tab) {
      var key = tabGroupKey(tab);
      totals[key] = (totals[key] || 0) + 1;
    });

    // Map existing DOM buttons by tabId so unchanged tabs are reused as-is —
    // this is what stops favicon <img> elements from being torn down and
    // re-fetched (which caused the "blinking" icon) on every poll cycle.
    var existingById = {};
    Array.prototype.slice.call(tabDockLinks.children).forEach(function(node) {
      var id = node.dataset.tabId;
      if (id != null) existingById[id] = node;
    });

    var seen = {};
    var usedIds = {};

    state.tabs.forEach(function(tab, index) {
      var idKey = String(tab.id);
      usedIds[idKey] = true;
      var button = existingById[idKey];

      if (!button) {
        button = createTabDockButton(tab);
        existingById[idKey] = button;
      } else {
        updateTabDockButton(button, tab);
      }

      button.dataset.index = index;

      // Duplicate-site badge: add/update/remove without touching the icon <img>
      var key = tabGroupKey(tab);
      seen[key] = (seen[key] || 0) + 1;
      var badge = button.querySelector('.tab-dup-badge');
      if (state.tabDockDupNumbers && totals[key] > 1) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'tab-dup-badge';
          button.appendChild(badge);
        }
        badge.textContent = seen[key];
      } else if (badge) {
        badge.remove();
      }

      // Ensure correct DOM order without rebuilding nodes
      var current = tabDockLinks.children[index];
      if (current !== button) {
        tabDockLinks.insertBefore(button, current || null);
      }
    });

    // Remove buttons for tabs that no longer exist
    Object.keys(existingById).forEach(function(id) {
      if (!usedIds[id]) existingById[id].remove();
    });
  }

  function createTabDockButton(tab) {
    var button = document.createElement('button');
    button.className = 'tab-item' + (tab.active ? ' active' : '');
    button.title = tab.title || tab.url || 'Tab';
    button.dataset.tabId = tab.id;
    button.dataset.closeMode = state.tabDockCloseMode;
    button.draggable = false;

    appendTabDockIcon(button, tab);
    bindTabDockButtonEvents(button, tab);
    bindSmoothTabReorder(button);
    return button;
  }

  // Updates an existing button in place: active state, title, and favicon —
  // but only swaps the icon if the favicon source actually changed, so a
  // stable tab never has its <img> recreated (no reload, no flicker).
  function updateTabDockButton(button, tab) {
    button.classList.toggle('active', !!tab.active);
    button.title = tab.title || tab.url || 'Tab';
    button.dataset.tabId = tab.id;

    var desiredSrc = computeFaviconSrc(tab);
    var desiredKey = desiredSrc != null ? desiredSrc : 'none';
    var existingIcon = button.querySelector('img, .fallback-icon');
    var currentKey = existingIcon ? existingIcon.dataset.srcKey : null;
    // currentKey may be 'failed:<desiredSrc>' if the favicon previously
    // errored — that still counts as "nothing changed" for this tab/url,
    // so we must not treat it as a mismatch and re-trigger the fetch.
    var unchanged = currentKey === desiredKey || currentKey === ('failed:' + desiredKey);

    if (!unchanged) {
      if (existingIcon) existingIcon.remove();
      appendTabDockIcon(button, tab);
    }

    // If the close-mode setting changed since this button was built/last
    // updated, drop and re-append the close button / context-menu listeners
    // without touching the favicon icon — avoids the flicker that a full
    // button rebuild would cause just to react to a settings change.
    if (button.dataset.closeMode !== state.tabDockCloseMode) {
      var oldClose = button.querySelector('.tab-close');
      if (oldClose) oldClose.remove();
      bindTabDockCloseHandlers(button);
      button.dataset.closeMode = state.tabDockCloseMode;
    }
  }

  function computeFaviconSrc(tab) {
    if (tab.favIconUrl && tab.favIconUrl.indexOf('chrome://') !== 0 && tab.favIconUrl.indexOf('chrome-extension://') !== 0) {
      return tab.favIconUrl;
    }
    if (tab.url) {
      try {
        var origin = new URL(tab.url).origin;
        if (origin.indexOf('http') === 0) {
          return 'https://www.google.com/s2/favicons?domain=' + origin + '&sz=64';
        }
      } catch(e) {}
    }
    return null;
  }

  function appendTabDockIcon(button, tab) {
    var src = computeFaviconSrc(tab);
    if (src) {
      var img = document.createElement('img');
      img.dataset.srcKey = src; // remembers what we tried, so re-renders can compare without re-fetching
      img.src = src;
      img.alt = '';
      img.onerror = function() {
        // Mark this source as failed so a later no-op re-render (same tab,
        // same url) reuses the fallback instead of retrying the same image.
        var fallback = makeFallbackIcon(tab, 'failed:' + src);
        img.replaceWith(fallback);
      };
      button.insertBefore(img, button.firstChild);
    } else {
      button.insertBefore(makeFallbackIcon(tab, 'none'), button.firstChild);
    }
  }

  function bindTabDockButtonEvents(button, tab) {
    button.addEventListener('click', function() {
      safeMsg({ type: 'MYTAB_ACTIVATE_TAB', tabId: parseInt(button.dataset.tabId, 10) });
    });
    bindTabDockCloseHandlers(button);
  }

  // Binds the close-button and/or contextmenu listeners according to the
  // current tabDockCloseMode. Safe to call again later (e.g. after the user
  // changes the close-mode setting) — removes its own previous contextmenu
  // listener first so handlers never stack up on a reused button.
  function bindTabDockCloseHandlers(button) {
    if (button._tabDockContextHandler) {
      button.removeEventListener('contextmenu', button._tabDockContextHandler);
      button._tabDockContextHandler = null;
    }
    if (state.tabDockCloseMode === 'hover' || state.tabDockCloseMode === 'right_click_button') {
      var close = document.createElement('span');
      close.className = 'tab-close';
      close.textContent = 'x';
      close.title = 'Close tab';
      close.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        safeMsg({ type: 'MYTAB_CLOSE_TAB_ID', tabId: parseInt(button.dataset.tabId, 10) }, renderTabDock);
      });
      button.appendChild(close);
      if (state.tabDockCloseMode === 'right_click_button') {
        button._tabDockContextHandler = function(e) {
          e.preventDefault();
          clearMenuOpen();
          button.classList.add('menu-open');
        };
        button.addEventListener('contextmenu', button._tabDockContextHandler);
      }
    } else if (state.tabDockCloseMode === 'right_click') {
      button._tabDockContextHandler = function(e) {
        e.preventDefault();
        safeMsg({ type: 'MYTAB_CLOSE_TAB_ID', tabId: parseInt(button.dataset.tabId, 10) }, renderTabDock);
      };
      button.addEventListener('contextmenu', button._tabDockContextHandler);
    }
  }

  function tabGroupKey(tab) {
    try {
      var url = new URL(tab.url || '');
      return url.origin + url.pathname.replace(/\/$/, '');
    } catch(e) {
      return (tab.title || tab.url || '').toLowerCase();
    }
  }

  function clearMenuOpen() {
    if (!tabDockLinks) return;
    Array.prototype.slice.call(tabDockLinks.querySelectorAll('.menu-open')).forEach(function(node) {
      node.classList.remove('menu-open');
    });
  }

  function makeFallbackIcon(tab, srcKey) {
    var icon = document.createElement('span');
    var url = (tab.url || '').toLowerCase();
    var title = (tab.title || '').toLowerCase();
    icon.className = 'fallback-icon fallback-page';
    if (url.indexOf('chrome-extension://') === 0 || url.indexOf('brave://extensions') === 0 || title.indexOf('extension') !== -1) {
      icon.className = 'fallback-icon fallback-ext';
    } else if (url.indexOf('chrome://newtab') === 0 || url.indexOf('brave://newtab') === 0 || title.indexOf('new tab') !== -1 || title.indexOf('mytab') !== -1) {
      icon.className = 'fallback-icon fallback-new';
    }
    // Remember which favicon source (if any) led to this fallback, so a
    // later no-op re-render recognizes nothing actually changed and skips
    // re-attempting the same failed fetch (this is what previously caused
    // the icon to flicker/"blink" every poll cycle).
    icon.dataset.srcKey = srcKey != null ? srcKey : 'none';
    return icon;
  }

  function startTabDockPolling() {
    if (tabDockTimer) return;
    tabDockTimer = setInterval(function() {
      if (!isCtxValid()) { stopTabDockPolling(); return; }
      if (state.tabDockEnabled) renderTabDock();
    }, 2500);
  }

  function stopTabDockPolling() {
    if (!tabDockTimer) return;
    clearInterval(tabDockTimer);
    tabDockTimer = null;
  }

  function applyTabDockAutoHide() {
    if (!tabDock) return;
    if (state.tabDockAutoHide) {
      tabDock.classList.remove('autohide-off');
    } else {
      tabDock.classList.add('autohide-off');
    }
  }

  function applySidebarAutoHide() {
    if (!panel) return;
    if (state.autoHide !== false) {
      panel.classList.remove('autohide-off');
    } else {
      panel.classList.add('autohide-off');
    }
  }

  function applyIconGaps() {
    if (!root) return;
    var styleId = 'mytab-icon-gap-style';
    var existing = root.querySelector('#' + styleId);
    if (!existing) {
      existing = document.createElement('style');
      existing.id = styleId;
      root.appendChild(existing);
    }
    var sbGap = (state.sbIconGap != null ? state.sbIconGap : 8) + 'px';
    var tdGap = (state.tabDockIconGap != null ? state.tabDockIconGap : 8) + 'px';
    existing.textContent = '.links{gap:' + sbGap + '!important}.tabdock-links{gap:' + tdGap + '!important}';
  }

  // Hover-glow for Sidebar items and Tab Dock items (non-active hover only —
  // this is separate from the existing active-tab glow driven by
  // --mytab-tabdock-glow, which stays untouched and keeps working alongside this).
  function applyGlows() {
    if (!root) return;
    var styleId = 'mytab-hover-glow-style';
    var existing = root.querySelector('#' + styleId);
    if (!existing) {
      existing = document.createElement('style');
      existing.id = styleId;
      root.appendChild(existing);
    }
    var sbSize = (state.sbGlowSize != null ? state.sbGlowSize : 8);
    var sbColor = state.sbGlowColor || '#ffffff';
    var tdSize = (state.tabDockHoverGlowSize != null ? state.tabDockHoverGlowSize : 8);
    var tdColor = state.tabDockHoverGlowColor || '#ffffff';
    function diffuseGlow(size, color) {
      if (size <= 0) return 'none';
      return 'drop-shadow(0 0 ' + (size * .5) + 'px ' + color + ')' +
        ' drop-shadow(0 0 ' + size + 'px ' + color + ')' +
        ' drop-shadow(0 0 ' + (size * 2) + 'px ' + color + ')';
    }
    var baseShadow = sbSize > 0 ? 'drop-shadow(0 4px 10px rgba(0,0,0,.35))' : '';
    var sbGlowFilter = sbSize > 0 ? baseShadow + ' ' + diffuseGlow(sbSize, sbColor) : 'none';
    var tdGlowFilter = tdSize > 0 ? diffuseGlow(tdSize, tdColor) : 'none';
    existing.textContent =
      '.item:hover .box{transform:scale(var(--mytab-sb-hover-scale,1.08))!important}' +
      '.item:hover .box:not(:has(img)):not(:has(.fallback-icon)){filter:' + sbGlowFilter + '!important}' +
      '.item:hover .box img,.item:hover .box .fallback-icon{filter:' + sbGlowFilter + '!important}' +
      '.tab-item:not(.active):hover img,.tab-item:not(.active):hover .fallback-icon{filter:' + tdGlowFilter + '!important}';
  }

  function applyHiddenOpacityStyle() {
    if (!root) return;
    var styleId = 'mytab-hidden-opacity-style';
    var existing = root.querySelector('#' + styleId);
    if (!existing) {
      existing = document.createElement('style');
      existing.id = styleId;
      root.appendChild(existing);
    }
    var sbNormOp  = (state.sbNormalOpacity  != null ? state.sbNormalOpacity  : 100) / 100;
    var sbDimOp   = (state.sbHoverOpacity   != null ? state.sbHoverOpacity   : 0)   / 100;  // dim when hidden
    var tdNormOp  = (state.tabDockNormalOpacity != null ? state.tabDockNormalOpacity : 100) / 100;
    var tdDimOp   = (state.tabDockHoverOpacity  != null ? state.tabDockHoverOpacity  : 0)   / 100;  // dim when hidden

    existing.textContent = [
      /* Sidebar autohide OFF: normal opacity */
      '.panel.autohide-off{opacity:' + sbNormOp + '!important;}',
      /* Sidebar autohide ON: hidden=dim(slider), hover=full always */
      '.panel:not(.autohide-off):not(:hover):not(.open){opacity:' + sbDimOp + '!important;}',
      '.panel:not(.autohide-off):hover,.panel:not(.autohide-off).open{opacity:1!important;}',
      /* TabDock autohide OFF: use normal opacity slider (even on hover) */
      '.tabdock.autohide-off{opacity:' + tdNormOp + '!important;}',
      '.tabdock.autohide-off:hover{opacity:' + tdNormOp + '!important;}',
      /* TabDock autohide ON: hidden=dim(slider), hover=full always */
      '.tabdock:not(.autohide-off):not(:hover):not(.open){opacity:' + tdDimOp + '!important;}',
      '.tabdock:not(.autohide-off):hover,.tabdock:not(.autohide-off).open{opacity:1!important;}'
    ].join('');
  }

  function applyTabDockPlacement() {
    if (!tabDock || !tabDockHotzone) return;
    // Kill transition so initial placement is instant (no slide-in flash)
    if (state._suppressTransitions) {
      tabDock.style.transition = 'none';
    }
    var dock = state.tabDockDock || null;
    var x = Number(state.tabDockX);
    var y = Number(state.tabDockY);
    if (!Number.isFinite(x)) x = window.innerWidth - tabDock.offsetWidth;
    if (!Number.isFinite(y)) y = Math.round(window.innerHeight * 0.36);

    tabDock.classList.toggle('dock-left', dock === 'left');
    tabDock.classList.toggle('dock-right', dock === 'right');
    tabDock.classList.toggle('dock-top', dock === 'top');
    tabDock.classList.toggle('dock-bottom', dock === 'bottom');

    if (dock === 'left' || dock === 'right') {
      y = Math.max(24, Math.min(y, window.innerHeight - tabDock.offsetHeight - 4));
      tabDock.style.top = y + 'px';
      tabDock.style.bottom = 'auto';
      tabDock.style.left = dock === 'left' ? '0px' : 'auto';
      tabDock.style.right = dock === 'right' ? '0px' : 'auto';
      tabDockHotzone.className = 'tabdock-hotzone ' + dock;
      tabDockHotzone.style.top = y + 'px';
      tabDockHotzone.style.height = Math.max(90, tabDock.offsetHeight + 12) + 'px';
      tabDockHotzone.style.left = '';
      tabDockHotzone.style.right = '';
      tabDockHotzone.style.width = '';
    } else if (dock === 'top' || dock === 'bottom') {
      x = Math.max(4, Math.min(x, window.innerWidth - tabDock.offsetWidth - 4));
      tabDock.style.left = x + 'px';
      tabDock.style.right = 'auto';
      tabDock.style.top = dock === 'top' ? '0px' : 'auto';
      tabDock.style.bottom = dock === 'bottom' ? '0px' : 'auto';
      tabDockHotzone.className = 'tabdock-hotzone ' + dock;
      tabDockHotzone.style.left = x + 'px';
      tabDockHotzone.style.width = Math.max(120, tabDock.offsetWidth + 12) + 'px';
      tabDockHotzone.style.top = '';
      tabDockHotzone.style.bottom = '';
      tabDockHotzone.style.height = '';
    } else {
      // Free-floating: sits exactly where it was dropped, no edge snapping,
      // no hotzone (there's no off-screen edge to reveal it from).
      x = Math.max(0, Math.min(x, window.innerWidth - tabDock.offsetWidth));
      y = Math.max(0, Math.min(y, window.innerHeight - tabDock.offsetHeight));
      tabDock.style.left = x + 'px';
      tabDock.style.right = 'auto';
      tabDock.style.top = y + 'px';
      tabDock.style.bottom = 'auto';
      tabDockHotzone.className = 'tabdock-hotzone free';
    }
  }

  function normalizePosition() {
    if (state.y != null && !Number.isFinite(Number(state.y))) state.y = null;
    if (state.x == null) return;

    var x = Number(state.x);
    if (!Number.isFinite(x)) {
      state.x = null;
      return;
    }
    if (x < -200 || x > window.innerWidth + 50) {
      state.x = null;
      state.dock = null;
      if (isCtxValid()) chrome.storage.local.remove(['mytab_sidebar_x', 'mytab_sidebar_dock']);
    }
  }

  function updateAutoColor() {
    if (!root) return;
    var color = '#ffffff';
    try {
      var sample = document.elementFromPoint(Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2)) || document.body;
      var bg = 'rgba(0,0,0,0)';
      while (sample && sample !== document.documentElement) {
        bg = getComputedStyle(sample).backgroundColor;
        if (bg && bg !== 'transparent' && !/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg)) break;
        sample = sample.parentElement;
      }
      if (!bg || bg === 'transparent') bg = getComputedStyle(document.body).backgroundColor || 'rgb(0,0,0)';
      var match = bg.match(/rgba?\(([^)]+)\)/);
      if (match) {
        var parts = match[1].split(',').map(function(v) { return parseFloat(v); });
        var lum = (0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2]) / 255;
        color = lum > 0.56 ? '#111111' : '#ffffff';
      }
    } catch(e) {}
    root.host.style.setProperty('--mytab-auto-fg', color);
  }

  function runItem(item) {
    if (item.action === 'key') {
      runKeyCombos(item.keys || []);
    } else if (item.action === 'tool') {
      runTool(item.tool);
    } else if (item.action === 'new_tab') {
      safeMsg({ type: 'MYTAB_OPEN_NEW_TAB' });
    } else if (item.action === 'close_others') {
      safeMsg({ type: 'MYTAB_CLOSE_OTHER_TABS' });
    } else if (item.url) {
      safeMsg({ type: 'MYTAB_OPEN_URL', url: item.url });
    }
  }

  function runTool(tool) {
    var types = {
      new_tab: 'MYTAB_OPEN_NEW_TAB',
      close_tab: 'MYTAB_CLOSE_CURRENT_TAB',
      close_others: 'MYTAB_CLOSE_OTHER_TABS',
      reload: 'MYTAB_RELOAD_TAB',
      back: 'MYTAB_GO_BACK',
      forward: 'MYTAB_GO_FORWARD'
    };
    if (types[tool]) safeMsg({ type: types[tool] });
  }

  function runKeyCombos(keys) {
    if (keys.length > 1 && runDirectBrowserCombo(keys.join('+'))) return;
    keys.forEach(function(combo, index) {
      setTimeout(function() {
        if (runDirectBrowserCombo(combo)) return;
        safeMsg({ type: 'MYTAB_RUN_KEY_COMBO', combo: combo }, function(response) {
          if (!isCtxValid() || !response || !response.handled) fireKeyCombo(combo);
        });
      }, index * 90);
    });
  }

  function comboInfo(combo) {
    var parts = String(combo || '').split('+').map(function(part) {
      return part.trim().toLowerCase();
    }).filter(Boolean);
    var key = parts[parts.length - 1] || '';
    return {
      key: key,
      ctrl: parts.indexOf('ctrl') !== -1 || parts.indexOf('control') !== -1,
      shift: parts.indexOf('shift') !== -1,
      alt: parts.indexOf('alt') !== -1,
      meta: parts.indexOf('meta') !== -1 || parts.indexOf('win') !== -1 || parts.indexOf('windows') !== -1 || parts.indexOf('cmd') !== -1
    };
  }

  function runDirectBrowserCombo(combo) {
    var c = comboInfo(combo);
    var primary = c.ctrl || c.meta;
    if (primary && !c.shift && !c.alt && c.key === 't') {
      safeMsg({ type: 'MYTAB_OPEN_NEW_TAB' });
      return true;
    }
    if (primary && c.shift && !c.alt && c.key === 't') {
      safeMsg({ type: 'MYTAB_REOPEN_CLOSED_TAB' });
      return true;
    }
    if (primary && !c.shift && !c.alt && c.key === 'w') {
      safeMsg({ type: 'MYTAB_CLOSE_CURRENT_TAB' });
      return true;
    }
    if (c.alt && !primary && !c.shift && c.key === 'x') {
      safeMsg({ type: 'MYTAB_CLOSE_CURRENT_TAB' });
      return true;
    }
    if (primary && !c.shift && !c.alt && c.key === 'r') {
      safeMsg({ type: 'MYTAB_RELOAD_TAB' });
      return true;
    }
    if (c.key === 'f5') {
      safeMsg({ type: 'MYTAB_RELOAD_TAB' });
      return true;
    }
    if (c.alt && !primary && !c.shift && c.key === 'arrowleft') {
      safeMsg({ type: 'MYTAB_GO_BACK' });
      return true;
    }
    if (c.alt && !primary && !c.shift && c.key === 'arrowright') {
      safeMsg({ type: 'MYTAB_GO_FORWARD' });
      return true;
    }
    return false;
  }

  function fireKeyCombo(combo) {
    var parts = String(combo || '').split('+').map(function(part) { return part.trim(); }).filter(Boolean);
    if (!parts.length) return;

    var key = parts[parts.length - 1];
    var lower = parts.map(function(part) { return part.toLowerCase(); });
    var eventInit = {
      key: key,
      code: key.length === 1 ? 'Key' + key.toUpperCase() : key,
      bubbles: true,
      cancelable: true,
      composed: true,
      ctrlKey: lower.indexOf('ctrl') !== -1 || lower.indexOf('control') !== -1,
      shiftKey: lower.indexOf('shift') !== -1,
      altKey: lower.indexOf('alt') !== -1,
      metaKey: lower.indexOf('meta') !== -1 || lower.indexOf('win') !== -1 || lower.indexOf('windows') !== -1 || lower.indexOf('cmd') !== -1
    };
    var target = document.activeElement || document.body || document.documentElement;
    ['keydown', 'keyup'].forEach(function(type) {
      target.dispatchEvent(new KeyboardEvent(type, eventInit));
      document.dispatchEvent(new KeyboardEvent(type, eventInit));
      window.dispatchEvent(new KeyboardEvent(type, eventInit));
    });
  }

  function bindSmoothItemReorder(item) {
    var startX = 0, startY = 0, startRect = null, placeholder = null;
    var dragging = false, suppressClick = false;

    item.addEventListener('pointerdown', function(e) {
      if (e.button !== 0) return;
      if (e.target.closest && e.target.closest('.handle')) return;

      startX = e.clientX;
      startY = e.clientY;
      startRect = item.getBoundingClientRect();

      function beginDrag() {
        dragging = true;
        suppressClick = true;
        panel.classList.add('open');

        placeholder = document.createElement('button');
        placeholder.className = item.className + ' sort-placeholder';
        placeholder.style.width = startRect.width + 'px';
        placeholder.style.height = startRect.height + 'px';
        placeholder.disabled = true;
        links.insertBefore(placeholder, item);

        item.classList.add('smooth-dragging');
        item.style.position = 'fixed';
        item.style.left = startRect.left + 'px';
        item.style.top = startRect.top + 'px';
        item.style.width = startRect.width + 'px';
        item.style.height = startRect.height + 'px';
        item.style.zIndex = '2147483647';
        item.style.pointerEvents = 'none';
        item.style.margin = '0';
        root.appendChild(item);
      }

      function move(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) > 4) beginDrag();
        if (!dragging) return;
        ev.preventDefault();

        item.style.left = (startRect.left + dx) + 'px';
        item.style.top = (startRect.top + dy) + 'px';

        var target = root.elementFromPoint
          ? root.elementFromPoint(ev.clientX, ev.clientY)
          : document.elementFromPoint(ev.clientX, ev.clientY);
        target = target && target.closest ? target.closest('.item') : null;
        if (!target || target === item || target === placeholder || !links.contains(target)) return;

        var r = target.getBoundingClientRect();
        var after = ev.clientY > r.top + r.height / 2;
        var movingItems = Array.prototype.slice.call(links.children).filter(function(child) {
          return child !== item && child !== placeholder;
        });
        var before = new Map();
        movingItems.forEach(function(child) {
          before.set(child, child.getBoundingClientRect());
        });

        links.insertBefore(placeholder, after ? target.nextSibling : target);

        movingItems.forEach(function(child) {
          var oldRect = before.get(child);
          var newRect = child.getBoundingClientRect();
          var dx2 = oldRect.left - newRect.left;
          var dy2 = oldRect.top - newRect.top;
          if (!dx2 && !dy2) return;
          child.style.transition = 'none';
          child.style.transform = 'translate(' + dx2 + 'px,' + dy2 + 'px)';
          child.offsetHeight;
          child.style.transition = 'transform .24s cubic-bezier(.22,1,.36,1)';
          child.style.transform = '';
        });
      }

      function up() {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
        if (!dragging) return;

        links.insertBefore(item, placeholder);
        placeholder.remove();
        Array.prototype.slice.call(links.children).forEach(function(child) {
          child.style.transition = '';
          child.style.transform = '';
        });
        item.classList.remove('smooth-dragging');
        item.removeAttribute('style');
        dragging = false;

        state.items = Array.prototype.slice.call(links.querySelectorAll('.item')).map(function(node) {
          return state.items[parseInt(node.getAttribute('data-index'), 10)];
        }).filter(Boolean);
        if (isCtxValid()) chrome.storage.local.set({ mytab_sidebar_items: state.items });
        render();
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

  function clampY(y) {
    var panelHeight = panel ? panel.offsetHeight : 120;
    var max = Math.max(24, window.innerHeight - panelHeight - 4);
    var next = Number(y);
    if (!Number.isFinite(next)) return Math.round(window.innerHeight * 0.45);
    return Math.max(24, Math.min(next, max));
  }

  function applyPlacement() {
    if (!panel || !hotzone) return;
    // Kill transition so initial placement is instant (no slide-in flash)
    if (state._suppressTransitions) {
      panel.style.transition = 'none';
    }
    var y = clampY(state.y);
    panel.classList.toggle('dock-left', state.dock === 'left');
    panel.classList.toggle('dock-right', state.dock === 'right');
    panel.style.top = y + 'px';

    hotzone.className = 'hotzone free';
    hotzone.style.top = y + 'px';
    hotzone.style.height = Math.max(90, panel.offsetHeight + 12) + 'px';

    if (state.dock === 'left') {
      panel.style.left = '0px';
      panel.style.right = 'auto';
      hotzone.className = 'hotzone left';
    } else if (state.dock === 'right') {
      panel.style.left = 'auto';
      panel.style.right = '0px';
      hotzone.className = 'hotzone right';
    } else if (state.x != null) {
      var x = Number(state.x);
      if (!Number.isFinite(x)) x = window.innerWidth - panel.offsetWidth - 14;
      x = Math.max(0, Math.min(x, window.innerWidth - panel.offsetWidth));
      panel.style.left = x + 'px';
      panel.style.right = 'auto';
    } else {
      panel.style.left = 'auto';
      panel.style.right = '14px';
    }
  }

  function bindHover() {
    function open() {
      if (panel) panel.classList.add('open');
    }
    function closeSoon() {
      setTimeout(function() {
        if (!panel || !hotzone) return;
        if (!panel.matches(':hover') && !hotzone.matches(':hover')) {
          panel.classList.remove('open');
        }
      }, 60);
    }
    hotzone.addEventListener('mouseenter', open);
    hotzone.addEventListener('mouseleave', closeSoon);
    panel.addEventListener('mouseenter', open);
    panel.addEventListener('mouseleave', closeSoon);
  }

  function bindTabDockHover() {
    function open() {
      if (tabDock) tabDock.classList.add('open');
    }
    function closeSoon() {
      setTimeout(function() {
        if (!tabDock || !tabDockHotzone) return;
        if (!tabDock.matches(':hover') && !tabDockHotzone.matches(':hover')) {
          tabDock.classList.remove('open');
        }
      }, 60);
    }
    tabDockHotzone.addEventListener('mouseenter', open);
    tabDockHotzone.addEventListener('mouseleave', closeSoon);
    tabDock.addEventListener('mouseenter', open);
    tabDock.addEventListener('mouseleave', closeSoon);
  }

  function bindTabDockDrag() {
    var active = false, sx = 0, sy = 0, px = 0, py = 0, lastX = 0, lastY = 0;
    tabDockHandle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      active = true;
      tabDock.classList.add('open');
      tabDock.classList.remove('dock-left', 'dock-right', 'dock-top', 'dock-bottom');
      tabDockHotzone.className = 'tabdock-hotzone free';
      tabDock.style.transform = 'translate(0,0)';
      var r = tabDock.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; lastX = e.clientX; lastY = e.clientY;
      px = r.left; py = r.top;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
    function move(e) {
      if (!active) return;
      lastX = e.clientX; lastY = e.clientY;
      var x = Math.max(0, Math.min(px + e.clientX - sx, window.innerWidth - tabDock.offsetWidth));
      var y = Math.max(0, Math.min(py + e.clientY - sy, window.innerHeight - tabDock.offsetHeight));
      tabDock.style.left = x + 'px';
      tabDock.style.top = y + 'px';
      tabDock.style.right = 'auto';
      tabDock.style.bottom = 'auto';
      state.tabDockX = x;
      state.tabDockY = y;
    }
    function up() {
      if (!active) return;
      active = false;
      if (!tabDock || !tabDock.isConnected) {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        return;
      }
      var EDGE = 4;
      if (lastX <= EDGE || state.tabDockX <= 1) {
        state.tabDockDock = 'left';
        state.tabDockX = 0;
      } else if (lastX >= window.innerWidth - EDGE || state.tabDockX >= window.innerWidth - tabDock.offsetWidth - 1) {
        state.tabDockDock = 'right';
        state.tabDockX = null;
      } else if (lastY <= EDGE || state.tabDockY <= 1) {
        state.tabDockDock = 'top';
        state.tabDockY = 0;
      } else if (lastY >= window.innerHeight - EDGE || state.tabDockY >= window.innerHeight - tabDock.offsetHeight - 1) {
        state.tabDockDock = 'bottom';
        state.tabDockY = null;
      } else {
        // Dropped away from every edge: stay exactly here, free-floating.
        state.tabDockDock = null;
      }
      tabDock.style.transform = '';
      applyTabDockPlacement();
      tabDock.classList.remove('open');
      if (isCtxValid()) chrome.storage.local.set({
        mytab_tabdock_x: state.tabDockX,
        mytab_tabdock_y: state.tabDockY,
        mytab_tabdock_dock: state.tabDockDock
      });
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    }
  }

  function bindSmoothTabReorder(item) {
    var startX = 0, startY = 0, startRect = null, proxy = null;
    var dragging = false, suppressClick = false, originalIndex = 0, currentIndex = 0;
    item.addEventListener('pointerdown', function(e) {
      if (e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      startRect = item.getBoundingClientRect();
      originalIndex = parseInt(item.getAttribute('data-index'), 10) || 0;
      currentIndex = originalIndex;

      function beginDrag() {
        dragging = true;
        suppressClick = true;
        tabDock.classList.add('open');
        stopTabDockPolling();
        proxy = item.cloneNode(true);
        proxy.classList.add('smooth-dragging');
        proxy.style.position = 'fixed';
        proxy.style.left = startRect.left + 'px';
        proxy.style.top = startRect.top + 'px';
        proxy.style.width = startRect.width + 'px';
        proxy.style.height = startRect.height + 'px';
        proxy.style.zIndex = '2147483647';
        proxy.style.pointerEvents = 'none';
        proxy.style.margin = '0';
        root.appendChild(proxy);
        item.style.visibility = 'hidden';
      }
      function move(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) > 4) beginDrag();
        if (!dragging) return;
        ev.preventDefault();
        proxy.style.left = (startRect.left + dx) + 'px';
        proxy.style.top = (startRect.top + dy) + 'px';
        var target = root.elementFromPoint ? root.elementFromPoint(ev.clientX, ev.clientY) : document.elementFromPoint(ev.clientX, ev.clientY);
        target = target && target.closest ? target.closest('.tab-item') : null;
        if (!target || target === item || !tabDockLinks.contains(target)) return;
        var nextIndex = parseInt(target.getAttribute('data-index'), 10);
        if (!Number.isFinite(nextIndex) || nextIndex === currentIndex) return;
        currentIndex = nextIndex;
        applyTabShift();
      }
      function up() {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
        if (!dragging) return;
        if (proxy) proxy.remove();
        var order = state.tabs.map(function(tab) { return tab.id; });
        var moved = order.splice(originalIndex, 1)[0];
        order.splice(currentIndex, 0, moved);
        var movedTab = state.tabs.splice(originalIndex, 1)[0];
        state.tabs.splice(currentIndex, 0, movedTab);
        item.style.visibility = '';
        drawTabDockTabs();
        applyTabDockPlacement();
        safeMsg({ type: 'MYTAB_REORDER_TABS', order: order });
        startTabDockPolling();
        setTimeout(function() { suppressClick = false; renderTabDock(); }, 220);
      }
      function applyTabShift() {
        var horizontal = state.tabDockDock === 'top' || state.tabDockDock === 'bottom';
        var distance = horizontal ? startRect.width + 8 : startRect.height + 8;
        Array.prototype.slice.call(tabDockLinks.querySelectorAll('.tab-item')).forEach(function(node) {
          var idx = parseInt(node.getAttribute('data-index'), 10);
          if (!Number.isFinite(idx) || idx === originalIndex) return;
          var shift = 0;
          if (currentIndex > originalIndex && idx > originalIndex && idx <= currentIndex) shift = -distance;
          if (currentIndex < originalIndex && idx >= currentIndex && idx < originalIndex) shift = distance;
          node.style.transition = 'transform .28s cubic-bezier(.16,1,.3,1)';
          node.style.transform = shift ? (horizontal ? 'translateX(' + shift + 'px)' : 'translateY(' + shift + 'px)') : '';
        });
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

  function flipInsert(container, placeholder, target, after) {
    if (!placeholder || placeholder.parentNode !== container) return;
    if (!target || target.parentNode !== container) return;
    if (after && placeholder.previousSibling === target) return;
    if (!after && placeholder.nextSibling === target) return;
    var moving = Array.prototype.slice.call(container.children).filter(function(child) { return child !== placeholder; });
    var before = new Map();
    moving.forEach(function(child) { before.set(child, child.getBoundingClientRect()); });
    var reference = after ? target.nextSibling : target;
    if (reference && reference.parentNode !== container) reference = null;
    container.insertBefore(placeholder, reference);
    moving.forEach(function(child) {
      var oldRect = before.get(child);
      var newRect = child.getBoundingClientRect();
      var dx = oldRect.left - newRect.left;
      var dy = oldRect.top - newRect.top;
      if (!dx && !dy) return;
      child.style.transition = 'none';
      child.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      child.offsetHeight;
      child.style.transition = 'transform .24s cubic-bezier(.22,1,.36,1)';
      child.style.transform = '';
    });
  }

  function bindDrag() {
    var active = false, sx = 0, sy = 0, px = 0, py = 0, lastX = 0;

    drag.addEventListener('mousedown', function(e) {
      e.preventDefault();
      active = true;
      panel.classList.add('open');
      panel.classList.remove('dock-left', 'dock-right');
      if (hotzone) hotzone.className = 'hotzone free';
      panel.style.transform = 'translateX(0)';

      var r = panel.getBoundingClientRect();
      sx = e.clientX;
      sy = e.clientY;
      lastX = e.clientX;
      px = r.left;
      py = r.top;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    function move(e) {
      if (!active) return;
      lastX = e.clientX;
      var x = Math.max(0, Math.min(px + e.clientX - sx, window.innerWidth - panel.offsetWidth));
      var y = Math.max(24, Math.min(py + e.clientY - sy, window.innerHeight - panel.offsetHeight - 4));
      panel.style.left = x + 'px';
      panel.style.top = y + 'px';
      panel.style.right = 'auto';
      state.x = x;
      state.y = y;
      state.dock = null;
    }

    function up() {
      if (!active) return;
      active = false;

      if (lastX <= 4 || state.x <= 1) {
        state.dock = 'left';
        state.x = 0;
      } else if (lastX >= window.innerWidth - 4 || state.x >= window.innerWidth - panel.offsetWidth - 1) {
        state.dock = 'right';
        state.x = null;
      } else {
        state.dock = null;
      }

      panel.style.transform = '';
      applyPlacement();
      panel.classList.remove('open');
      if (isCtxValid()) chrome.storage.local.set({
        mytab_sidebar_x: state.x,
        mytab_sidebar_y: state.y,
        mytab_sidebar_dock: state.dock
      });
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    }
  }

  chrome.storage.onChanged.addListener(function(changes, area) {
    if (!isCtxValid()) return;
    if (area !== 'local') return;
    var keys = Object.keys(changes);
    if (keys.some(function(k) { return k.indexOf('mytab_sidebar_') === 0 || k.indexOf('mytab_tabdock_') === 0; })) load();
  });

  window.addEventListener('resize', function() {
    applyPlacement();
    applyTabDockPlacement();
  });
  load();
})();
