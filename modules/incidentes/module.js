// incidentes/module.js — CRUD de incidentes (multas, accidentes, averías)
(function () {
  'use strict';

  var Incidentes = {
    id: 'incidentes',
    titulo: 'Incidentes',
    icono: 'bi bi-exclamation-triangle',
    datos: [],
    vehiculos: [],
    busqueda: '',
    cargando: false,
    filtroVehiculo: '',
    filtroTipo: '',

    async init() {
      console.log('[incidentes] Inicializado');
      await this.cargarReferencias();
      await this.cargarDatos();
    },

    render(params) {
      return '<div x-data="window.MODULES.incidentes" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-exclamation-triangle"></i> Incidentes' +
        '</h2>' +
        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<button class="btn btn-primary" @click="abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Nuevo incidente' +
          '</button>' +
          '<select x-model="filtroVehiculo" class="select select-bordered min-w-[180px]" @change="cargarDatos()">' +
            '<option value="">Todos los vehículos</option>' +
            '<template x-for="v in vehiculos" :key="v.id">' +
              '<option :value="v.id" x-text="v.placas"></option>' +
            '</template>' +
          '</select>' +
          '<select x-model="filtroTipo" class="select select-bordered" @change="cargarDatos()">' +
            '<option value="">Todos los tipos</option>' +
            '<option value="multa">Multa</option>' +
            '<option value="accidente">Accidente</option>' +
            '<option value="averia">Avería</option>' +
          '</select>' +
        '</div>' +

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
                  '<th>Tipo</th>' +
                  '<th>Descripción</th>' +
                  '<th>Costo</th>' +
                  '<th>Acciones</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                '<tr x-for="item in datosFiltrados" :key="item.id">' +
                  '<td x-text="formatDate(item.createdAt)"></td>' +
                  '<td x-text="vehiculoLabel(item.vehiculoId)"></td>' +
                  '<td>' +
                    '<span class="badge" :class="badgeTipo(item.tipo)" x-text="item.tipo"></span>' +
                  '</td>' +
                  '<td class="max-w-xs truncate" x-text="item.descripcion || \'-\'" :title="item.descripcion"></td>' +
                  '<td x-text="formatCurrency(item.costo)"></td>' +
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
            '<i class="bi bi-exclamation-triangle text-6xl mb-4"></i>' +
            '<p class="text-lg mb-4">No hay incidentes registrados</p>' +
            '<button class="btn btn-primary" @click="abrirForm()"><i class="bi bi-plus-lg"></i> Registrar incidente</button>' +
          '</div>' +
        '</template>' +
      '</div>';
    },

    get datosFiltrados() {
      var fv = this.filtroVehiculo;
      var ft = this.filtroTipo;
      return this.datos.filter(function (i) {
        if (fv && i.vehiculoId !== fv) return false;
        if (ft && i.tipo !== ft) return false;
        return true;
      });
    },

    badgeTipo(tipo) {
      var map = { multa: 'badge-warning', accidente: 'badge-error', averia: 'badge-info' };
      return map[tipo] || 'badge-ghost';
    },

    vehiculoLabel(id) {
      for (var i = 0; i < this.vehiculos.length; i++) {
        if (this.vehiculos[i].id === id) return this.vehiculos[i].placas;
      }
      return id;
    },

    async cargarReferencias() {
      try {
        this.vehiculos = await db.vehiculos.toArray();
      } catch (e) { console.error(e); }
    },

    async cargarDatos() {
      this.cargando = true;
      try {
        var collection = db.incidentes.orderBy('createdAt').reverse();
        var fv = this.filtroVehiculo;
        var ft = this.filtroTipo;
        this.datos = await collection.toArray();
        if (fv) this.datos = this.datos.filter(function (i) { return i.vehiculoId === fv; });
        if (ft) this.datos = this.datos.filter(function (i) { return i.tipo === ft; });
      } catch (e) {
        UI.toast('Error al cargar: ' + e.message, 'error');
      } finally {
        this.cargando = false;
      }
    },

    async abrirForm(item) {
      var editando = !!item;
      var v = item || { vehiculoId: '', tipo: 'multa', costo: '', descripcion: '' };
      var opts = '<option value="">Seleccionar vehículo</option>';
      for (var i = 0; i < this.vehiculos.length; i++) {
        var sel = v.vehiculoId === this.vehiculos[i].id ? 'selected' : '';
        opts += '<option value="' + this.vehiculos[i].id + '" ' + sel + '>' + this.vehiculos[i].placas + ' — ' + this.vehiculos[i].marca + ' ' + this.vehiculos[i].modelo + '</option>';
      }
      var html =
        '<div class="space-y-4">' +
          '<label class="form-control w-full">' +
            '<span class="label-text">Vehículo <span class="text-error">*</span></span>' +
            '<select x-model="form.vehiculoId" class="select select-bordered" required>' + opts + '</select>' +
          '</label>' +
          '<div class="grid grid-cols-2 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Tipo</span>' +
              '<select x-model="form.tipo" class="select select-bordered">' +
                '<option value="multa">Multa</option>' +
                '<option value="accidente">Accidente</option>' +
                '<option value="averia">Avería</option>' +
              '</select>' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Costo $</span>' +
              '<input type="number" step="0.01" x-model="form.costo" class="input input-bordered" min="0" />' +
            '</label>' +
          '</div>' +
          '<label class="form-control w-full">' +
            '<span class="label-text">Descripción</span>' +
            '<textarea x-model="form.descripcion" class="textarea textarea-bordered" rows="3" placeholder="Describe el incidente..."></textarea>' +
          '</label>' +
        '</div>';
      window._modalFormData = v;
      await UI.modalForm(editando ? 'Editar Incidente' : 'Nuevo Incidente', html, async function (data) {
        if (editando) await Incidentes.actualizar(item.id, data);
        else await Incidentes.guardar(data);
        await Incidentes.cargarDatos();
      });
    },

    async guardar(datos) {
      if (!datos.vehiculoId) {
        UI.toast('El vehículo es obligatorio', 'error');
        throw new Error('Vehículo requerido');
      }
      var registro = {
        id: uuid(),
        vehiculoId: datos.vehiculoId,
        tipo: datos.tipo || 'multa',
        costo: parseFloat(datos.costo) || 0,
        descripcion: datos.descripcion || '',
        createdBy: 'usuario',
        createdAt: new Date()
      };
      await db.incidentes.put(registro);
      UI.toast('Incidente registrado correctamente', 'success');
    },

    async actualizar(id, datos) {
      var existente = await db.incidentes.get(id);
      if (!existente) { UI.toast('Incidente no encontrado', 'error'); return; }
      existente.vehiculoId = datos.vehiculoId || existente.vehiculoId;
      existente.tipo = datos.tipo || existente.tipo;
      existente.costo = parseFloat(datos.costo) || existente.costo;
      existente.descripcion = datos.descripcion || existente.descripcion;
      await db.incidentes.put(existente);
      UI.toast('Incidente actualizado correctamente', 'success');
    },

    async eliminar(item) {
      var ok = await UI.confirm('¿Eliminar este incidente?');
      if (!ok) return;
      try {
        await db.incidentes.delete(item.id);
        UI.toast('Incidente eliminado', 'success');
        await this.cargarDatos();
      } catch (e) {
        UI.toast(e.message, 'error');
      }
    },

    destroy() {
      this.datos = [];
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES.incidentes = Incidentes;
})();
