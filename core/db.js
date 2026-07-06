// db.js — Inicialización Dexie con tablas de negocio de AHA Flota
(function () {
  'use strict';
  if (typeof window.db !== 'undefined') return;

  var DB_NAME = window.APP_CONFIG && window.APP_CONFIG.app
    ? (window.APP_CONFIG.app.id || 'aha-flota') : 'aha-flota';

  var SCHEMA = {};

  // Tablas de negocio
  SCHEMA.vehiculos = 'id, *placas, *numeroEconomico, marca, modelo, *anio, *tipo, *estado, *createdBy, createdAt, updatedAt';
  SCHEMA.cargas_combustible = 'id, *vehiculoId, litros, importe, *kilometraje, *tipo, createdAt';
  SCHEMA.mantenimientos = 'id, *vehiculoId, *tipo, costo, *kilometraje, *taller, *proximoKm, *createdBy, createdAt';
  SCHEMA.incidentes = 'id, *vehiculoId, *tipo, costo, descripcion, *createdBy, createdAt';

  // Tablas de sistema
  SCHEMA._sync_log = 'id, *tabla, *operacion, *idRegistro, *estado, *fecha, *createdBy, createdAt';
  SCHEMA._ia_chats = 'id, *titulo, *modelo, *createdBy, createdAt, updatedAt';
  SCHEMA._ia_messages = 'id, *chatId, *rol, contenido, *createdBy, createdAt';
  SCHEMA._files = '&path, tipo, nombre, mime, size, hash, refCount, createdAt, updatedAt';
  SCHEMA._analytics = 'id, *page, *category, *action, *synced, *timestamp, createdAt';

  if (!window.NL_OS && !window.Capacitor) {
    SCHEMA._file_blobs = '&path';
  }

  var db = new Dexie(DB_NAME);
  window.DB_VERSION = 1;
  db.version(window.DB_VERSION).stores(SCHEMA);
  window.db = db;
  console.log('[db] Inicializado: ' + DB_NAME);
})();
