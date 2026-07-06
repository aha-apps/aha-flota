// project.config.js — Configuración de AHA Flota
window.APP_CONFIG = {
  app: {
    id: 'aha-flota',
    nombre: 'AHA Flota',
    version: '1.0.0',
    tipo: 'flota',
    descripcion: 'Control de vehículos y flotilla offline-first'
  },
  perfil: 'lite',
  plan: 'lite',
  maxRecords: 30,
  canExport: false,
  iaTier: 'lite',
  canWhiteLabel: false,
  iaJutia: { perfil: false },
  modulosActivos: ['vehiculos', 'combustible', 'mantenimiento', 'incidentes', 'reportes'],
  tema: {
    modo: 'light',
    colores: {
      primary: '#f59e0b',
      secondary: '#78716c',
      accent: '#0ea5e9',
      neutral: '#292524',
      'base-100': '#ffffff',
      'base-200': '#f5f5f4',
      'base-300': '#e7e5e4',
      info: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    tipografia: {
      familia: 'Inter, system-ui, sans-serif',
      escala: {
        h1: '2.25rem',
        h2: '1.5rem',
        h3: '1.25rem',
        base: '1rem',
        small: '0.875rem',
        xs: '0.75rem'
      }
    },
    radius: '1rem',
    sombra: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  },
  cifrado: {
    camposSensibles: [],
    storageKey: 'aha-flota-crypto-key'
  },
  modulos: {
    vehiculos: { titulo: 'Vehículos', icono: 'bi bi-truck', activo: true },
    combustible: { titulo: 'Combustible', icono: 'bi bi-fuel-pump', activo: true },
    mantenimiento: { titulo: 'Mantenimiento', icono: 'bi bi-tools', activo: true },
    incidentes: { titulo: 'Incidentes', icono: 'bi bi-exclamation-triangle', activo: true },
    reportes: { titulo: 'Reportes', icono: 'bi bi-bar-chart', activo: true }
  },
  data: {
    dir: 'data/',
    maxFileSize: 10 * 1024 * 1024,
    tipos: ['avatar', 'foto', 'doc', 'logo', 'backup'],
    avatars: { default: 'data/defaults/avatar.svg', size: 200, calidad: 0.8 }
  },
  sync: {
    primaryFormat: 'json',
    secondaryFormats: [],
    includeFiles: true,
    encrypt: true,
    maxExportSize: 50 * 1024 * 1024
  },
  ui: {
    formsMode: 'modal',
    alerts: 'toast',
    confirmDelete: true,
    avatars: false,
    avatarDefault: 'data/defaults/avatar.svg'
  }
};
