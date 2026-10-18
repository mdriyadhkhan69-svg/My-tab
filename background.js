chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (!message || !message.type) return;

  if (message.type === 'MYTAB_OPEN_NEW_TAB') {
    chrome.tabs.create({});
    return;
  }

  if (message.type === 'MYTAB_OPEN_URL' && message.url) {
    chrome.tabs.create({ url: message.url });
    return;
  }

  if (message.type === 'MYTAB_CLOSE_OTHER_TABS') {
    closeOtherTabs(sender);
    return;
  }

  if (message.type === 'MYTAB_CLOSE_CURRENT_TAB') {
    if (sender.tab && sender.tab.id) chrome.tabs.remove(sender.tab.id);
    return;
  }

  if (message.type === 'MYTAB_CLOSE_TAB_ID') {
    if (message.tabId != null) chrome.tabs.remove(message.tabId, function() {
      if (sendResponse) sendResponse({ ok: true });
    });
    return true;
  }

  if (message.type === 'MYTAB_RELOAD_TAB') {
    if (sender.tab && sender.tab.id) chrome.tabs.reload(sender.tab.id);
    return;
  }

  if (message.type === 'MYTAB_REOPEN_CLOSED_TAB') {
    if (chrome.sessions && chrome.sessions.restore) chrome.sessions.restore();
    return;
  }

  if (message.type === 'MYTAB_GO_BACK') {
    if (sender.tab && sender.tab.id && chrome.tabs.goBack) chrome.tabs.goBack(sender.tab.id);
    return;
  }

  if (message.type === 'MYTAB_GO_FORWARD') {
    if (sender.tab && sender.tab.id && chrome.tabs.goForward) chrome.tabs.goForward(sender.tab.id);
    return;
  }

  if (message.type === 'MYTAB_GET_TABS') {
    getTabs(sender, sendResponse);
    return true;
  }

  if (message.type === 'MYTAB_ACTIVATE_TAB') {
    if (message.tabId != null) chrome.tabs.update(message.tabId, { active: true });
    return;
  }

  if (message.type === 'MYTAB_REORDER_TABS') {
    reorderTabs(sender, message.order || []);
    return;
  }

  if (message.type === 'MYTAB_RUN_KEY_COMBO') {
    runKeyCombo(message.combo, sender, sendResponse);
    return true;
  }
});

function closeOtherTabs(sender) {
  if (!sender.tab || !sender.tab.windowId || !sender.tab.id) return;
  chrome.tabs.query({ windowId: sender.tab.windowId }, function(tabs) {
    var closeIds = tabs
      .filter(function(tab) { return tab.id !== sender.tab.id && !tab.pinned; })
      .map(function(tab) { return tab.id; });
    if (closeIds.length) chrome.tabs.remove(closeIds);
  });
}

function getTabs(sender, sendResponse) {
  if (!sender.tab || sender.tab.windowId == null) {
    sendResponse({ tabs: [] });
    return;
  }
  chrome.tabs.query({ windowId: sender.tab.windowId }, function(tabs) {
    sendResponse({
      tabs: tabs.map(function(tab) {
        return {
          id: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          active: tab.active,
          index: tab.index
        };
      })
    });
  });
}

function reorderTabs(sender, order) {
  if (!sender.tab || sender.tab.windowId == null || !Array.isArray(order)) return;
  order.forEach(function(tabId, index) {
    if (Number.isFinite(tabId)) {
      chrome.tabs.move(tabId, { windowId: sender.tab.windowId, index: index });
    }
  });
}

function parseCombo(combo) {
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

function runKeyCombo(combo, sender, sendResponse) {
  var c = parseCombo(combo);
  var tabId = sender.tab && sender.tab.id;
  var windowId = sender.tab && sender.tab.windowId;
  var primary = c.ctrl || c.meta;

  function done(handled) {
    sendResponse({ handled: !!handled });
  }

  if (primary && !c.shift && !c.alt && c.key === 't') {
    chrome.tabs.create(windowId != null ? { windowId: windowId } : {}, function() { done(true); });
    return;
  }

  if (primary && c.shift && !c.alt && c.key === 't' && chrome.sessions && chrome.sessions.restore) {
    chrome.sessions.restore(function() { done(true); });
    return;
  }

  if (primary && !c.shift && !c.alt && c.key === 'w' && tabId != null) {
    chrome.tabs.remove(tabId, function() { done(true); });
    return;
  }

  if (c.alt && !primary && !c.shift && c.key === 'x' && tabId != null) {
    chrome.tabs.remove(tabId, function() { done(true); });
    return;
  }

  if (primary && c.shift && !c.alt && c.key === 'w' && windowId != null) {
    chrome.windows.remove(windowId, function() { done(true); });
    return;
  }

  if ((primary && !c.shift && !c.alt && c.key === 'r') || c.key === 'f5') {
    chrome.tabs.reload(tabId, function() { done(true); });
    return;
  }

  if (c.alt && !primary && !c.shift && c.key === 'arrowleft' && chrome.tabs.goBack && tabId != null) {
    chrome.tabs.goBack(tabId, function() { done(true); });
    return;
  }

  if (c.alt && !primary && !c.shift && c.key === 'arrowright' && chrome.tabs.goForward && tabId != null) {
    chrome.tabs.goForward(tabId, function() { done(true); });
    return;
  }

  if (primary && c.key === 'tab' && windowId != null) {
    switchTab(windowId, c.shift ? -1 : 1, done);
    return;
  }

  if (primary && /^[1-9]$/.test(c.key) && windowId != null) {
    activateNumberedTab(windowId, parseInt(c.key, 10), done);
    return;
  }

  done(false);
}

function switchTab(windowId, direction, done) {
  chrome.tabs.query({ windowId: windowId }, function(tabs) {
    if (!tabs.length) { done(false); return; }
    var activeIndex = tabs.findIndex(function(tab) { return tab.active; });
    if (activeIndex === -1) { done(false); return; }
    var next = (activeIndex + direction + tabs.length) % tabs.length;
    chrome.tabs.update(tabs[next].id, { active: true }, function() { done(true); });
  });
}

function activateNumberedTab(windowId, number, done) {
  chrome.tabs.query({ windowId: windowId }, function(tabs) {
    if (!tabs.length) { done(false); return; }
    var index = number === 9 ? tabs.length - 1 : number - 1;
    if (!tabs[index]) { done(false); return; }
    chrome.tabs.update(tabs[index].id, { active: true }, function() { done(true); });
  });
}
