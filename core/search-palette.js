// search-palette.js — Command Palette (Ctrl+K) global
(function () {
  'use strict';
  if (typeof window.searchPalette !== 'undefined') return;

  var paletaAbierta = false;

  function construirItems(query) {
    var items = [];
    var modulos = window.APP_CONFIG && window.APP_CONFIG.modulos;
    if (!modulos) return [];
    var q = (query || '').toLowerCase().trim();

    if (!q) {
      items.push({ type: 'separator', label: 'Módulos' });
      var modKeys = Object.keys(modulos);
      for (var i = 0; i < modKeys.length; i++) {
        var mk = modKeys[i];
        var m = modulos[mk];
        if (m.activo !== false) {
          items.push({
            type: 'module', id: mk, title: m.titulo, icono: m.icono,
            subtitle: 'Ir al módulo', action: function () { window.appRouter.navigate(mk); closePalette(); }
          });
        }
      }
      return items;
    }

    for (var key in modulos) {
      if (modulos.hasOwnProperty(key)) {
        var mod = modulos[key];
        if (mod.activo === false) continue;
        var tituloLower = (mod.titulo || '').toLowerCase();
        var idLower = key.toLowerCase();
        if (tituloLower.indexOf(q) !== -1 || idLower.indexOf(q) !== -1) {
          items.push({
            type: 'module', id: key, title: mod.titulo, icono: mod.icono,
            subtitle: 'Ir al módulo', action: function (k) { return function () { window.appRouter.navigate(k); closePalette(); }; }(key)
          });
        }
      }
    }
    return items;
  }

  function openPalette() {
    if (paletaAbierta) return;
    paletaAbierta = true;
    var container = document.getElementById('search-palette-container');
    if (!container) return;

    var overlay = document.createElement('div');
    overlay.id = 'sp-overlay';
    overlay.className = 'fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] animate__animated animate__fadeIn';
    overlay.innerHTML =
      '<div class="absolute inset-0 bg-base-300/60 backdrop-blur-sm" id="sp-backdrop"></div>' +
      '<div class="relative w-full max-w-xl" id="sp-modal">' +
        '<div class="bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden">' +
          '<div class="flex items-center gap-3 px-5 py-4 border-b border-base-200">' +
            '<svg class="w-5 h-5 text-base-content/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>' +
            '</svg>' +
            '<input id="sp-input" type="text" class="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-base-content/30" placeholder="Buscar m\u00f3dulos..." autofocus>' +
            '<kbd class="hidden sm:inline-flex px-2 py-0.5 text-xs rounded bg-base-200 text-base-content/50">ESC</kbd>' +
          '</div>' +
          '<div id="sp-results" class="max-h-80 overflow-y-auto p-2"></div>' +
          '<div class="flex items-center gap-4 px-5 py-2.5 border-t border-base-200 text-xs text-base-content/40">' +
            '<span class="flex items-center gap-1"><kbd class="kbd kbd-xs">\u2191\u2193</kbd> Navegar</span>' +
            '<span class="flex items-center gap-1"><kbd class="kbd kbd-xs">\u21b5</kbd> Abrir</span>' +
            '<span class="flex items-center gap-1"><kbd class="kbd kbd-xs">Esc</kbd> Cerrar</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    container.appendChild(overlay);

    var input = document.getElementById('sp-input');
    var results = document.getElementById('sp-results');
    var backdrop = document.getElementById('sp-backdrop');
    var selectedIdx = -1;
    var currentItems = [];

    function renderItems(items) {
      currentItems = items;
      selectedIdx = -1;
      if (!items || items.length === 0) {
        results.innerHTML =
          '<div class="px-3 py-8 text-center text-sm text-base-content/40">' +
            '<svg class="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' +
            '</svg>' +
            'Sin resultados</div>';
        return;
      }

      var html = '';
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.type === 'separator') {
          html += '<div class="px-3 py-1.5 text-xs font-semibold text-base-content/30 uppercase tracking-wider">' + item.label + '</div>';
        } else {
          html += '<div class="sp-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-base-200" data-idx="' + i + '">' +
            '<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-base-200 text-base-content/60 shrink-0">' +
              '<i class="' + item.icono + ' text-sm"></i>' +
            '</div>' +
            '<div class="flex-1 min-w-0">' +
              '<div class="text-sm font-medium truncate">' + item.title + '</div>' +
              '<div class="text-xs text-base-content/40 truncate">' + (item.subtitle || '') + '</div>' +
            '</div>' +
            '<span class="badge badge-ghost badge-sm shrink-0">m\u00f3dulo</span>' +
          '</div>';
        }
      }
      results.innerHTML = html;

      var itemsEl = results.querySelectorAll('.sp-item');
      for (var j = 0; j < itemsEl.length; j++) {
        (function (idx) {
          itemsEl[j].addEventListener('click', function () {
            var it = currentItems[idx];
            if (it && it.action) it.action();
          });
          itemsEl[j].addEventListener('mouseenter', function () {
            selectedIdx = idx;
            actualizarSeleccion();
          });
        })(j);
      }
    }

    function actualizarSeleccion() {
      var items = results.querySelectorAll('.sp-item');
      for (var i = 0; i < items.length; i++) {
        if (i === selectedIdx) {
          items[i].classList.add('bg-primary/10', 'text-primary');
          items[i].classList.remove('hover:bg-base-200');
        } else {
          items[i].classList.remove('bg-primary/10', 'text-primary');
          items[i].classList.add('hover:bg-base-200');
        }
      }
      if (selectedIdx >= 0 && items[selectedIdx]) {
        items[selectedIdx].scrollIntoView({ block: 'nearest' });
      }
    }

    function onInput() {
      var q = input.value;
      var items = construirItems(q);
      renderItems(items);
    }

    function onKeydown(e) {
      if (e.key === 'Escape') {
        closePalette();
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowDown') {
        var maxIdx = currentItems.filter(function (it) { return it.type !== 'separator'; }).length - 1;
        selectedIdx = Math.min(selectedIdx + 1, maxIdx);
        actualizarSeleccion();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        selectedIdx = Math.max(selectedIdx - 1, 0);
        actualizarSeleccion();
        e.preventDefault();
      } else if (e.key === 'Enter') {
        var nonSep = currentItems.filter(function (it) { return it.type !== 'separator'; });
        if (selectedIdx >= 0 && selectedIdx < nonSep.length && nonSep[selectedIdx] && nonSep[selectedIdx].action) {
          nonSep[selectedIdx].action();
        }
        e.preventDefault();
      }
    }

    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onKeydown);
    backdrop.addEventListener('click', closePalette);

    renderItems(construirItems(''));

    setTimeout(function () {
      if (input) input.focus();
    }, 100);

    document.addEventListener('keydown', onGlobalKeydown);
  }

  function onGlobalKeydown(e) {
    if (paletaAbierta && e.key === 'Escape') {
      closePalette();
      e.preventDefault();
    }
  }

  function closePalette() {
    paletaAbierta = false;
    var container = document.getElementById('search-palette-container');
    if (container) {
      var overlay = document.getElementById('sp-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
    document.removeEventListener('keydown', onGlobalKeydown);
  }

  window.searchPalette = {
    openPalette: openPalette,
    closePalette: closePalette,
    isOpen: function () { return paletaAbierta; }
  };
})();
