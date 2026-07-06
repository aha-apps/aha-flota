// combustible/module.js — Registro de cargas de combustible con gráfico Chart.js
(function () {
  'use strict';

  var Combustible = {
    id: 'combustible',
    titulo: 'Combustible',
    icono: 'bi bi-fuel-pump',
    datos: [],
    vehiculos: [],
    busqueda: '',
    cargando: false,
    filtroVehiculo: '',
    chartInstance: null,
    chartVehiculoId: '',

    async init() {
      console.log('[combustible] Inicializado');
      await this.cargarReferencias();
      await this.cargarDatos();
    },

    render(params) {
      return '<div x-data="window.MODULES.combustible" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-fuel-pump"></i> Combustible' +
        '</h2>' +
        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<button class="btn btn-primary" @click="abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Nueva carga' +
          '</button>' +
          '<select x-model="filtroVehiculo" class="select select-bordered min-w-[200px]" @change="cargarDatos(); actualizarGrafico();">' +
            '<option value="">Todos los vehículos</option>' +
            '<template x-for="v in vehiculos" :key="v.id">' +
              '<option :value="v.id" x-text="v.placas + \' — \' + v.marca + \' \' + v.modelo"></option>' +
            '</template>' +
          '</select>' +
        '</div>' +

        <!-- Resumen -->
        '<template x-if="!cargando && datos.length">' +
          '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">' +
            '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-300">' +
              '<div class="stat-title">Total cargas</div>' +
              '<div class="stat-value text-lg" x-text="datos.length"></div>' +
            '</div>' +
            '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-300">' +
              '<div class="stat-title">Total litros</div>' +
              '<div class="stat-value text-lg text-primary" x-text="totalLitros.toFixed(1)"></div>' +
            '</div>' +
            '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-300">' +
              '<div class="stat-title">Total gastado</div>' +
              '<div class="stat-value text-lg text-accent" x-text="formatCurrency(totalImporte)"></div>' +
            '</div>' +
            '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-300">' +
              '<div class="stat-title">Rendimiento prom.</div>' +
              '<div class="stat-value text-lg text-success" x-text="rendimientoPromedio.toFixed(1) + \' km/L\'"></div>' +
            '</div>' +
          '</div>' +
        '</template>' +

        <!-- Gráfico Chart.js -->
        '<template x-if="!cargando && datos.length">' +
          '<div class="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 mb-6">' +
            '<div class="flex items-center justify-between mb-3">' +
              '<h3 class="font-semibold text-sm">Rendimiento (km/litro)</h3>' +
              '<select x-model="chartVehiculoId" class="select select-bordered select-xs" @change="actualizarGrafico()">' +
                '<option value="">Todos</option>' +
                '<template x-for="v in vehiculos" :key="v.id">' +
                  '<option :value="v.id" x-text="v.placas"></option>' +
                '</template>' +
              '</select>' +
            '</div>' +
            '<div class="relative h-48 md:h-64">' +
              '<canvas id="chart-rendimiento"></canvas>' +
            '</div>' +
          '</div>' +
        '</template>' +

        <!-- Tabla -->
        '<template x-if="cargando">' +
          '<div class="space-y-3"><div class="skeleton h-12 w-full"></div><div class="skeleton h-12 w-full"></div><div class="skeleton h-12 w-full"></div></div>' +
        '</template>' +
        '<template x-if="!cargando && datosFiltrados.length">' +
          '<div class="overflow-x-auto">' +
            '<table class="table table-zebra">' +
              '<thead>' +
                '<tr>' +
                  '<th>Fecha</th>' +
                  '<th>Vehículo</th>' +
                  '<th>Litros</th>' +
                  '<th>Importe</th>' +
                  '<th>Km</th>' +
                  '<th>Tipo</th>' +
                  '<th>Rendimiento</th>' +
                  '<th>Acciones</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                '<tr x-for="item in datosFiltrados" :key="item.id">' +
                  '<td x-text="formatDate(item.createdAt)"></td>' +
                  '<td x-text="vehiculoLabel(item.vehiculoId)"></td>' +
                  '<td x-text="item.litros.toFixed(1)"></td>' +
                  '<td x-text="formatCurrency(item.importe)"></td>' +
                  '<td x-text="item.kilometraje ? item.kilometraje.toLocaleString() : \'-\'"></td>' +
                  '<td><span class="badge badge-outline" x-text="item.tipo"></span></td>' +
                  '<td x-text="calcularRendimiento(item)"></td>' +
                  '<td class="flex gap-1">' +
                    '<button class="btn btn-sm btn-ghost" @click="abrirForm(item)"><i class="bi bi-pencil"></i></button>' +
                    '<button class="btn btn-sm btn-ghost text-error" @click="eliminar(item)"><i class="bi bi-trash"></i></button>' +
                  '</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</template>' +
        '<template x-if="!cargando && !datosFiltrados.length">' +
          '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">' +
            '<i class="bi bi-fuel-pump text-6xl mb-4"></i>' +
            '<p class="text-lg mb-4">No hay cargas de combustible registradas</p>' +
            '<button class="btn btn-primary" @click="abrirForm()"><i class="bi bi-plus-lg"></i> Registrar primera carga</button>' +
          '</div>' +
        '</template>' +
      '</div>';
    },

    get datosFiltrados() {
      var fv = this.filtroVehiculo;
      if (fv) return this.datos.filter(function (c) { return c.vehiculoId === fv; });
      return this.datos;
    },

    get totalLitros() {
      return this.datosFiltrados.reduce(function (sum, c) { return sum + (c.litros || 0); }, 0);
    },

    get totalImporte() {
      return this.datosFiltrados.reduce(function (sum, c) { return sum + (c.importe || 0); }, 0);
    },

    get rendimientoPromedio() {
      var totalKm = 0, totalL = 0;
      for (var i = 1; i < this.datosFiltrados.length; i++) {
        var ant = this.datosFiltrados[i - 1];
        var act = this.datosFiltrados[i];
        if (ant.vehiculoId === act.vehiculoId && ant.kilometraje && act.kilometraje && act.kilometraje > ant.kilometraje) {
          totalKm += act.kilometraje - ant.kilometraje;
          totalL += act.litros || 0;
        }
      }
      return totalL > 0 ? totalKm / totalL : 0;
    },

    calcularRendimiento(carga) {
      var idx = this.datos.indexOf(carga);
      if (idx <= 0) return '—';
      var ant = this.datos[idx - 1];
      if (ant.vehiculoId !== carga.vehiculoId || !ant.kilometraje || !carga.kilometraje || carga.kilometraje <= ant.kilometraje) return '—';
      var km = carga.kilometraje - ant.kilometraje;
      return (km / carga.litros).toFixed(1) + ' km/L';
    },

    vehiculoLabel(id) {
      for (var i = 0; i < this.vehiculos.length; i++) {
        if (this.vehiculos[i].id === id) return this.vehiculos[i].placas + ' — ' + this.vehiculos[i].marca;
      }
      return id;
    },

    async cargarReferencias() {
      try {
        this.vehiculos = await db.vehiculos.where('estado').notEqual('dado de baja').toArray();
      } catch (e) {
        console.error('[combustible] Error cargando vehículos:', e);
      }
    },

    async cargarDatos() {
      this.cargando = true;
      try {
        var collection = db.cargas_combustible.orderBy('createdAt').reverse();
        var fv = this.filtroVehiculo;
        this.datos = fv ? await collection.filter(function (c) { return c.vehiculoId === fv; }).toArray() : await collection.toArray();
        this.datos.reverse();
      } catch (e) {
        UI.toast('Error al cargar: ' + e.message, 'error');
      } finally {
        this.cargando = false;
        var self = this;
        setTimeout(function () { self.actualizarGrafico(); }, 300);
      }
    },

    actualizarGrafico() {
      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
      var canvas = document.getElementById('chart-rendimiento');
      if (!canvas) return;

      var fv = this.chartVehiculoId || this.filtroVehiculo;
      var datos = fv ? this.datos.filter(function (c) { return c.vehiculoId === fv; }) : this.datos;
      if (datos.length < 2) return;

      var labels = [];
      var rendimientos = [];
      for (var i = 1; i < datos.length; i++) {
        var ant = datos[i - 1];
        var act = datos[i];
        if (ant.vehiculoId === act.vehiculoId && ant.kilometraje && act.kilometraje && act.kilometraje > ant.kilometraje) {
          labels.push(UI.formatDate(act.createdAt));
          rendimientos.push(parseFloat(((act.kilometraje - ant.kilometraje) / act.litros).toFixed(1)));
        }
      }

      if (rendimientos.length === 0) return;

      this.chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'km/L',
            data: rendimientos,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#f59e0b'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    },

    async abrirForm(item) {
      var editando = !!item;
      var v = item || { vehiculoId: '', litros: '', importe: '', kilometraje: '', tipo: 'gasolina' };
      var opts = '<option value="">Seleccionar vehículo</option>';
      for (var i = 0; i < this.vehiculos.length; i++) {
        var sel = v.vehiculoId === this.vehiculos[i].id ? 'selected' : '';
        opts += '<option value="' + this.vehiculos[i].id + '" ' + sel + '>' + this.vehiculos[i].placas + ' — ' + this.vehiculos[i].marca + ' ' + this.vehiculos[i].modelo + '</option>';
      }
      var html =
        '<div class="space-y-4">' +
          '<label class="form-control w-full">' +
            '<span class="label-text">Vehículo <span class="text-error">*</span></span>' +
            '<select x-model="form.vehiculoId" class="select select-bordered" required>' +
              opts +
            '</select>' +
          '</label>' +
          '<div class="grid grid-cols-2 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Litros <span class="text-error">*</span></span>' +
              '<input type="number" step="0.1" x-model="form.litros" class="input input-bordered" required min="1" />' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Importe $ <span class="text-error">*</span></span>' +
              '<input type="number" step="0.01" x-model="form.importe" class="input input-bordered" required min="1" />' +
            '</label>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Kilometraje</span>' +
              '<input type="number" x-model="form.kilometraje" class="input input-bordered" placeholder="Km actual" min="0" />' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Tipo</span>' +
              '<select x-model="form.tipo" class="select select-bordered">' +
                '<option value="gasolina">Gasolina</option>' +
                '<option value="diesel">Diésel</option>' +
              '</select>' +
            '</label>' +
          '</div>' +
        '</div>';
      window._modalFormData = v;
      await UI.modalForm(editando ? 'Editar Carga' : 'Nueva Carga', html, async function (data) {
        if (editando) await Combustible.actualizar(item.id, data);
        else await Combustible.guardar(data);
        await Combustible.cargarDatos();
      });
    },

    async guardar(datos) {
      if (!datos.vehiculoId || !datos.litros || !datos.importe) {
        UI.toast('Vehículo, litros e importe son obligatorios', 'error');
        throw new Error('Campos obligatorios');
      }
      var registro = {
        id: uuid(),
        vehiculoId: datos.vehiculoId,
        litros: parseFloat(datos.litros) || 0,
        importe: parseFloat(datos.importe) || 0,
        kilometraje: datos.kilometraje ? parseInt(datos.kilometraje) : null,
        tipo: datos.tipo || 'gasolina',
        createdAt: new Date()
      };
      await db.cargas_combustible.put(registro);
      Combustible.cargarReferencias();
      UI.toast('Carga registrada correctamente', 'success');
    },

    async actualizar(id, datos) {
      var existente = await db.cargas_combustible.get(id);
      if (!existente) { UI.toast('Carga no encontrada', 'error'); return; }
      existente.vehiculoId = datos.vehiculoId || existente.vehiculoId;
      existente.litros = parseFloat(datos.litros) || existente.litros;
      existente.importe = parseFloat(datos.importe) || existente.importe;
      existente.kilometraje = datos.kilometraje ? parseInt(datos.kilometraje) : existente.kilometraje;
      existente.tipo = datos.tipo || existente.tipo;
      await db.cargas_combustible.put(existente);
      UI.toast('Carga actualizada correctamente', 'success');
    },

    async eliminar(item) {
      var ok = await UI.confirm('¿Eliminar esta carga de combustible?');
      if (!ok) return;
      try {
        await db.cargas_combustible.delete(item.id);
        UI.toast('Carga eliminada', 'success');
        await this.cargarDatos();
      } catch (e) {
        UI.toast(e.message, 'error');
      }
    },

    destroy() {
      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
      this.datos = [];
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES.combustible = Combustible;
})();
