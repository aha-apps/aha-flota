// network.js — Monitoreo de conectividad offline-first
(function () {
  'use strict';
  if (typeof window.network !== 'undefined') return;

  window.network = {
    online: navigator.onLine,
    init: function () {
      var self = this;
      window.addEventListener('online', function () { self._setStatus(true); });
      window.addEventListener('offline', function () { self._setStatus(false); });
      if (typeof Alpine !== 'undefined' && Alpine.store && !Alpine.store('network')) {
        Alpine.store('network', { online: navigator.onLine, showBanner: false });
      }
    },
    _setStatus: function (status) {
      this.online = status;
      this._notify();
    },
    _notify: function () {
      var evt = new CustomEvent('connection-change', { detail: { online: this.online } });
      window.dispatchEvent(evt);
      if (typeof Alpine !== 'undefined' && Alpine.store) {
        Alpine.store('network', { online: this.online, showBanner: !this.online });
      }
    }
  };

  document.addEventListener('alpine:init', function () {
    Alpine.store('network', { online: navigator.onLine, showBanner: false });
  });

  window.network.init();
})();
