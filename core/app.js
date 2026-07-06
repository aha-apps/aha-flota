// app.js — Router hash-based + carga de módulos
(function () {
  'use strict';
  if (typeof window.appRouter !== 'undefined') return;

  var currentModulo = null;
  var currentHash = '';
  var contentEl = null;
  var sidebarLinks = null;

  function updateSidebarActive(moduloId) {
    if (sidebarLinks) {
      for (var i = 0; i < sidebarLinks.length; i++) {
        var link = sidebarLinks[i];
        var id = link.getAttribute('data-module');
        if (id) {
          link.classList.toggle('active', id === moduloId);
          if (id === moduloId) {
            link.classList.add('bg-primary', 'text-primary-content');
            link.classList.remove('hover:bg-base-300', 'text-base-content/70');
          } else {
            link.classList.remove('bg-primary', 'text-primary-content');
            link.classList.add('hover:bg-base-300', 'text-base-content/70');
          }
        }
      }
    }
  }

  function navigate(moduloId, params) {
    params = params || {};
    var hash = '#/' + moduloId;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      loadModule(moduloId, params);
    }
  }

  function onHashChange() {
    var hash = window.location.hash || '#/';
    var match = hash.match(/^#\/([^?]+)(?:\?(.*))?/);
    var moduleId = match ? match[1] : null;
    var params = {};
    if (match && match[2]) {
      try {
        var searchParams = new URLSearchParams(match[2]);
        params = Object.fromEntries(searchParams);
      } catch (e) {}
    }
    if (moduleId && moduleId !== currentHash) {
      currentHash = moduleId;
      loadModule(moduleId, params);
    } else if (!moduleId || moduleId === '') {
      var firstMod = window.APP_CONFIG && window.APP_CONFIG.modulosActivos && window.APP_CONFIG.modulosActivos.length > 0
        ? window.APP_CONFIG.modulosActivos[0] : 'vehiculos';
      navigate(firstMod);
    }
  }

  function init() {
    contentEl = document.getElementById('app-content');
    if (!contentEl) { console.warn('[app] #app-content no encontrado'); return; }

    sidebarLinks = document.querySelectorAll('[data-module]');
    for (var i = 0; i < sidebarLinks.length; i++) {
      (function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          var id = link.getAttribute('data-module');
          if (id) navigate(id);
        });
      })(sidebarLinks[i]);
    }

    window.addEventListener('hashchange', onHashChange);
    onHashChange();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js?v=' + (window.DB_VERSION || 1))
        .then(function (reg) { console.log('[SW] Registrado:', reg.scope); })
        .catch(function (err) { console.warn('[SW] Error:', err); });
    }

    var appBar = document.getElementById('app-bar');
    if (appBar) {
      var searchInput = appBar.querySelector('.sp-search-input');
      if (searchInput) {
        searchInput.addEventListener('focus', function () {
          abrirPaleta();
        });
      }
    }
  }

  function loadModule(moduloId, params) {
    params = params || {};
    if (currentModulo && currentModulo.destroy) {
      try { currentModulo.destroy(); } catch (e) { console.warn('[app] destroy error:', e); }
    }
    currentModulo = null;

    updateSidebarActive(moduloId);
    document.title = 'AHA Flota';

    var mod = window.MODULES && window.MODULES[moduloId];
    if (!mod) {
      contentEl.innerHTML =
        '<div class="flex flex-col items-center justify-center py-20 text-base-content/50">' +
          '<i class="bi bi-box-seam text-6xl mb-4"></i>' +
          '<p class="text-lg">Módulo no encontrado</p>' +
          '<p class="text-sm mt-1">' + moduloId + '</p>' +
        '</div>';
      if (typeof Alpine !== 'undefined' && Alpine.store) {
        Alpine.store('app', { moduloActual: null, cargando: false });
      }
      return;
    }

    if (typeof Alpine !== 'undefined' && Alpine.store) {
      Alpine.store('app', { moduloActual: moduloId, cargando: true });
    }

    try {
      if (mod.render) {
        var html = mod.render(params);
        contentEl.innerHTML = '<div class="animate__animated animate__fadeIn">' + html + '</div>';
      } else {
        contentEl.innerHTML = '<p class="text-base-content/50">Módulo sin vista</p>';
      }
      if (mod.init) mod.init();
      currentModulo = mod;

      var modInfo = window.APP_CONFIG && window.APP_CONFIG.modulos && window.APP_CONFIG.modulos[moduloId];
      if (modInfo) document.title = modInfo.titulo + ' — AHA Flota';
    } catch (e) {
      contentEl.innerHTML =
        '<div class="alert alert-error shadow-lg mt-4">' +
          '<i class="bi bi-exclamation-triangle"></i>' +
          '<span>Error al cargar: ' + e.message + '</span>' +
        '</div>';
      console.error('[app] Error loading ' + moduloId + ':', e);
    }

    if (typeof Alpine !== 'undefined' && Alpine.store) {
      Alpine.store('app', { moduloActual: moduloId, cargando: false });
    }
  }

  function abrirPaleta() {
    var sp = window.searchPalette;
    if (sp && sp.openPalette) sp.openPalette();
  }

  window.appRouter = {
    init: init,
    navigate: navigate,
    getCurrent: function () { return currentHash; },
    getModulo: function () { return currentModulo; },
    abrirPaleta: abrirPaleta
  };

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(init, 100);
  });
  console.log('[app] Router listo');
})();
