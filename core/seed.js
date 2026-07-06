// seed.js — Datos de ejemplo para AHA Flota
(function () {
  'use strict';

  window.seedData = async function seedData() {
    var count = await db.vehiculos.count();
    if (count > 0) {
      console.log('[seed] Ya hay datos, saltando seed');
      return;
    }

    console.log('[seed] Insertando datos de ejemplo...');

    // 3 vehículos
    var v1 = { id: uuid(), placas: 'ABC-1234', numeroEconomico: 'ECO-001', marca: 'Toyota', modelo: 'Hilux', anio: '2022', tipo: 'camioneta', estado: 'activo', createdBy: 'seed', createdAt: new Date(), updatedAt: new Date() };
    var v2 = { id: uuid(), placas: 'XYZ-5678', numeroEconomico: 'ECO-002', marca: 'Nissan', modelo: 'NP300', anio: '2021', tipo: 'camioneta', estado: 'activo', createdBy: 'seed', createdAt: new Date(), updatedAt: new Date() };
    var v3 = { id: uuid(), placas: 'DEF-9012', numeroEconomico: 'ECO-003', marca: 'Kenworth', modelo: 'T680', anio: '2023', tipo: 'camion', estado: 'activo', createdBy: 'seed', createdAt: new Date(), updatedAt: new Date() };
    await db.vehiculos.bulkAdd([v1, v2, v3]);

    // Cargas de combustible (5 registros)
    var cargas = [
      { id: uuid(), vehiculoId: v1.id, litros: 50, importe: 1200, kilometraje: 15000, tipo: 'gasolina', createdAt: new Date(Date.now() - 86400000 * 10) },
      { id: uuid(), vehiculoId: v1.id, litros: 45, importe: 1080, kilometraje: 15450, tipo: 'gasolina', createdAt: new Date(Date.now() - 86400000 * 5) },
      { id: uuid(), vehiculoId: v2.id, litros: 60, importe: 1440, kilometraje: 22000, tipo: 'gasolina', createdAt: new Date(Date.now() - 86400000 * 8) },
      { id: uuid(), vehiculoId: v2.id, litros: 55, importe: 1320, kilometraje: 22600, tipo: 'gasolina', createdAt: new Date(Date.now() - 86400000 * 3) },
      { id: uuid(), vehiculoId: v3.id, litros: 200, importe: 5600, kilometraje: 45000, tipo: 'diesel', createdAt: new Date(Date.now() - 86400000 * 7) }
    ];
    await db.cargas_combustible.bulkAdd(cargas);

    // Mantenimientos (4 registros)
    var mantenimientos = [
      { id: uuid(), vehiculoId: v1.id, tipo: 'aceite', costo: 850, kilometraje: 14000, taller: 'Servicio Toyota Centro', proximoKm: 18000, createdBy: 'seed', createdAt: new Date(Date.now() - 86400000 * 20) },
      { id: uuid(), vehiculoId: v1.id, tipo: 'llantas', costo: 4200, kilometraje: 14500, taller: 'Llantera Express', proximoKm: 24500, createdBy: 'seed', createdAt: new Date(Date.now() - 86400000 * 15) },
      { id: uuid(), vehiculoId: v2.id, tipo: 'frenos', costo: 2100, kilometraje: 21000, taller: 'Taller Mecánico Sur', proximoKm: 31000, createdBy: 'seed', createdAt: new Date(Date.now() - 86400000 * 12) },
      { id: uuid(), vehiculoId: v3.id, tipo: 'afinacion', costo: 3500, kilometraje: 44000, taller: 'Diesel Service SA', proximoKm: 54000, createdBy: 'seed', createdAt: new Date(Date.now() - 86400000 * 6) }
    ];
    await db.mantenimientos.bulkAdd(mantenimientos);

    // Incidentes (3 registros)
    var incidentes = [
      { id: uuid(), vehiculoId: v1.id, tipo: 'multa', costo: 850, descripcion: 'Exceso de velocidad en carretera', createdBy: 'seed', createdAt: new Date(Date.now() - 86400000 * 25) },
      { id: uuid(), vehiculoId: v2.id, tipo: 'averia', costo: 1500, descripcion: 'Fallo en sistema eléctrico, cambio de alternador', createdBy: 'seed', createdAt: new Date(Date.now() - 86400000 * 18) },
      { id: uuid(), vehiculoId: v3.id, tipo: 'accidente', costo: 8500, descripcion: 'Choque leve en maniobra de retroceso, defensa trasera', createdBy: 'seed', createdAt: new Date(Date.now() - 86400000 * 30) }
    ];
    await db.incidentes.bulkAdd(incidentes);

    console.log('[seed] Datos de ejemplo insertados correctamente');
  };
})();
