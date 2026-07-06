// reportes/module.js — Dashboard de reportes con KPIs, gráficos y CSV
(function () {
  'use strict';

  var Reportes = {
    id: 'reportes',
    titulo: 'Reportes',
    icono: 'bi bi-bar-chart',
    cargando: false,
    // KPIs
    totalVehiculos: 0,
    vehiculosActivos: 0,
    gastoCombustibleMes: 0,
    proxMantenimientos: [],
    totalIncidentes: 0,
    costoIncidentes: 0,
    // Datos para gráficos
    vehiculos: [],
    combustibleData: [],
    chartCostoKm: null,

    async init() {
      console.log('[reportes] Inicializado');
      await this.cargarDatos();
    },

    render(params) {
      return '<div x-data="window.MODULES.reportes" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<h2 class="text-2xl font-bold mb-6 flex items-center gap-2">' +
          '<i class="bi bi-bar-chart"></i> Reportes' +
        '</h2>' +

        '<template x-if="cargando">' +
          '<div class="space-y-3"><div class="skeleton h-24 w-full"></div><div class="skeleton h-24 w-full"></div><div class="skeleton h-48 w-full"></div></div>' +
        '</template>' +

        '<template x-if="!cargando">' +
          '<div>' +
            '<p class="text-xs text-base-content/40 mb-4">Última actualización: <span x-text="new Date().toLocaleString()"></span></p>' +

            <!-- KPI Cards -->
            '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">' +
              '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-300">' +
                '<div class="stat-figure text-primary"><i class="bi bi-truck text-2xl"></i></div>' +
                '<div class="stat-title">Total vehículos</div>' +
                '<div class="stat-value text-primary" x-text="totalVehiculos"></div>' +
                '<div class="stat-desc"><span x-text="vehiculosActivos"></span> activos</div>' +
              '</div>' +
              '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-300">' +
                '<div class="stat-figure text-accent"><i class="bi bi-fuel-pump text-2xl"></i></div>' +
                '<div class="stat-title">Gasto combustible (mes)</div>' +
                '<div class="stat-value text-accent text-xl" x-text="formatCurrency(gastoCombustibleMes)"></div>' +
                '<div class="stat-desc">Últimos 30 días</div>' +
              '</div>' +
              '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-300">' +
                '<div class="stat-figure text-warning"><i class="bi bi-tools text-2xl"></i></div>' +
                '<div class="stat-title">Próximos mantenimientos</div>' +
                '<div class="stat-value text-warning text-xl" x-text="proxMantenimientos.length"></div>' +
                '<div class="stat-desc">Con próximo km programado</div>' +
              '</div>' +
              '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-300">' +
                '<div class="stat-figure text-error"><i class="bi bi-exclamation-triangle text-2xl"></i></div>' +
                '<div class="stat-title">Incidentes</div>' +
                '<div class="stat-value text-error text-xl" x-text="totalIncidentes"></div>' +
                '<div class="stat-desc" x-text="formatCurrency(costoIncidentes) + \' en costos\'"></div>' +
              '</div>' +
            '</div>' +

            <!-- Gráfico Costo por KM -->
            '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">' +
              '<div class="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">' +
                '<h3 class="font-semibold text-sm mb-3">Costo por km por vehículo</h3>' +
                '<div class="relative h-64"><canvas id="chart-costo-km"></canvas></div>' +
              '</div>' +
              '<div class="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">' +
                '<h3 class="font-semibold text-sm mb-3">Gasto combustible por vehículo</h3>' +
                '<div class="relative h-64"><canvas id="chart-gasto-combustible"></canvas></div>' +
              '</div>' +
            '</div>' +

            <!-- Próximos mantenimientos -->
            '<div class="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 mb-6">' +
              '<div class="flex items-center justify-between mb-3">' +
                '<h3 class="font-semibold text-sm">Próximos mantenimientos programados</h3>' +
                '<span class="badge badge-warning" x-text="proxMantenimientos.length + \' pendientes\'"></span>' +
              '</div>' +
              '<template x-if="proxMantenimientos.length">' +
                '<div class="overflow-x-auto">' +
                  '<table class="table table-sm">' +
                    '<thead><tr><th>Vehículo</th><th>Tipo</th><th>Taller</th><th>Próximo Km</th></tr></thead>' +
                    '<tbody>' +
                      '<tr x-for="m in proxMantenimientos" :key="m.id">' +
                        '<td x-text="vehiculoLabel(m.vehiculoId)"></td>' +
                        '<td><span class="badge badge-sm badge-outline" x-text="m.tipo"></span></td>' +
                        '<td x-text="m.taller || \'-\'"></td>' +
                        '<td x-text="m.proximoKm ? m.proximoKm.toLocaleString() : \'-\'"></td>' +
                      '</tr>' +
                    '</tbody>' +
                  '</table>' +
                '</div>' +
              '</template>' +
              '<template x-if="!proxMantenimientos.length">' +
                '<p class="text-sm text-base-content/40 py-4 text-center">No hay mantenimientos con próximo km programado</p>' +
              '</template>' +
            '</div>' +

            <!-- Export CSV -->
            '<div class="flex gap-2">' +
              '<button class="btn btn-outline btn-sm" @click="exportCSV(\'vehiculos\')">' +
                '<i class="bi bi-file-earmark-spreadsheet"></i> Exportar vehículos CSV' +
              '</button>' +
              '<button class="btn btn-outline btn-sm" @click="exportCSV(\'combustible\')">' +
                '<i class="bi bi-file-earmark-spreadsheet"></i> Exportar combustible CSV' +
              '</button>' +
              '<button class="btn btn-outline btn-sm" @click="exportCSV(\'mantenimiento\')">' +
                '<i class="bi bi-file-earmark-spreadsheet"></i> Exportar mantenimiento CSV' +
              '</button>' +
              '<button class="btn btn-outline btn-sm" @click="exportCSV(\'incidentes\')">' +
                '<i class="bi bi-file-earmark-spreadsheet"></i> Exportar incidentes CSV' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</template>' +
      '</div>';
    },

    async cargarDatos() {
      this.cargando = true;
      try {
        // Vehículos
        this.vehiculos = await db.vehiculos.toArray();
        this.totalVehiculos = this.vehiculos.length;
        this.vehiculosActivos = this.vehiculos.filter(function (v) { return v.estado === 'activo'; }).length;

        // Combustible
        var cargas = await db.cargas_combustible.toArray();
        var hace30dias = Date.now() - 30 * 24 * 60 * 60 * 1000;
        this.gastoCombustibleMes = cargas.filter(function (c) {
          return new Date(c.createdAt).getTime() >= hace30dias;
        }).reduce(function (sum, c) { return sum + (c.importe || 0); }, 0);

        this.combustibleData = cargas;

        // Mantenimientos
        this.proxMantenimientos = await db.mantenimientos.where('proximoKm').above(0).toArray();

        // Incidentes
        var incidentes = await db.incidentes.toArray();
        this.totalIncidentes = incidentes.length;
        this.costoIncidentes = incidentes.reduce(function (sum, i) { return sum + (i.costo || 0); }, 0);

        // Gráficos
        var self = this;
        setTimeout(function () {
          self.actualizarGraficoCostokm();
          self.actualizarGraficoGasto();
        }, 300);
      } catch (e) {
        UI.toast('Error al cargar reportes: ' + e.message, 'error');
      } finally {
        this.cargando = false;
      }
    },

    vehiculoLabel(id) {
      for (var i = 0; i < this.vehiculos.length; i++) {
        if (this.vehiculos[i].id === id) return this.vehiculos[i].placas;
      }
      return id;
    },

    actualizarGraficoCostokm() {
      var canvas = document.getElementById('chart-costo-km');
      if (!canvas) return;
      if (this.chartCostoKm) { this.chartCostoKm.destroy(); this.chartCostoKm = null; }

      var labels = [];
      var data = [];
      var colores = [];

      for (var i = 0; i < this.vehiculos.length; i++) {
        var v = this.vehiculos[i];
        var cargasV = this.combustibleData.filter(function (c) { return c.vehiculoId === v.id; });
        if (cargasV.length < 2) continue;

        var totalKm = 0;
        var totalGasto = 0;
        for (var j = 1; j < cargasV.length; j++) {
          var ant = cargasV[j - 1], act = cargasV[j];
          if (act.kilometraje && ant.kilometraje && act.kilometraje > ant.kilometraje) {
            totalKm += act.kilometraje - ant.kilometraje;
            totalGasto += act.importe;
          }
        }
        if (totalKm > 0) {
          labels.push(v.placas);
          data.push(parseFloat((totalGasto / totalKm).toFixed(2)));
          colores.push('#f59e0b');
        }
      }

      if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p class="text-sm text-base-content/40 text-center py-8">No hay suficientes datos para mostrar costo por km. Registra cargas de combustible con kilometraje.</p>';
        return;
      }

      this.chartCostoKm = new Chart(canvas, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: '$ / km', data: data, backgroundColor: colores, borderRadius: 6 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: function (v) { return '$' + v.toFixed(2); } } },
            x: { grid: { display: false } }
          }
        }
      });
    },

    actualizarGraficoGasto() {
      var canvas = document.getElementById('chart-gasto-combustible');
      if (!canvas) return;

      var labels = [];
      var data = [];
      var colores = ['#f59e0b', '#78716c', '#0ea5e9', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

      for (var i = 0; i < this.vehiculos.length; i++) {
        var v = this.vehiculos[i];
        var total = this.combustibleData.filter(function (c) { return c.vehiculoId === v.id; })
          .reduce(function (sum, c) { return sum + (c.importe || 0); }, 0);
        if (total > 0) {
          labels.push(v.placas);
          data.push(total);
        }
      }

      if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p class="text-sm text-base-content/40 text-center py-8">Sin datos de combustible</p>';
        return;
      }

      new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{ data: data, backgroundColor: colores.slice(0, labels.length), borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } }
          }
        }
      });
    },

    async exportCSV(tipo) {
      try {
        UI.loading(true, 'Generando CSV...');
        var rows, headers, filename, mapFn;

        if (tipo === 'vehiculos') {
          rows = await db.vehiculos.toArray();
          headers = ['Placas,Económico,Marca,Modelo,Año,Tipo,Estado'];
          mapFn = function (r) { return [r.placas, r.numeroEconomico, r.marca, r.modelo, r.anio, r.tipo, r.estado].join(','); };
          filename = 'vehiculos.csv';
        } else if (tipo === 'combustible') {
          rows = await db.cargas_combustible.toArray();
          headers = ['Fecha,VehiculoId,Litros,Importe,Kilometraje,Tipo'];
          mapFn = function (r) { return [UI.formatDate(r.createdAt), r.vehiculoId, r.litros, r.importe, r.kilometraje || '', r.tipo].join(','); };
          filename = 'combustible.csv';
        } else if (tipo === 'mantenimiento') {
          rows = await db.mantenimientos.toArray();
          headers = ['Fecha,VehiculoId,Tipo,Costo,Kilometraje,Taller,ProximoKm'];
          mapFn = function (r) { return [UI.formatDate(r.createdAt), r.vehiculoId, r.tipo, r.costo, r.kilometraje || '', r.taller || '', r.proximoKm || ''].join(','); };
          filename = 'mantenimiento.csv';
        } else if (tipo === 'incidentes') {
          rows = await db.incidentes.toArray();
          headers = ['Fecha,VehiculoId,Tipo,Costo,Descripcion'];
          mapFn = function (r) { return [UI.formatDate(r.createdAt), r.vehiculoId, r.tipo, r.costo, '"' + (r.descripcion || '').replace(/"/g, '""') + '"'].join(','); };
          filename = 'incidentes.csv';
        } else {
          UI.toast('Tipo no válido', 'error');
          return;
        }

        var csv = headers.join(',') + '\n';
        for (var i = 0; i < rows.length; i++) {
          csv += mapFn(rows[i]) + '\n';
        }
        var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        UI.toast('CSV exportado: ' + filename, 'success');
      } catch (e) {
        UI.toast('Error al exportar: ' + e.message, 'error');
      } finally {
        UI.loading(false);
      }
    },

    destroy() {
      if (this.chartCostoKm) { this.chartCostoKm.destroy(); this.chartCostoKm = null; }
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES.reportes = Reportes;
})();
