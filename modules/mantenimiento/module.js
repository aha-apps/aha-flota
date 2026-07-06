// mantenimiento/module.js — CRUD de mantenimiento con alertas
(function () {
  'use strict';

  var Mantenimiento = {
    id: 'mantenimiento',
    titulo: 'Mantenimiento',
    icono: 'bi bi-tools',
    datos: [],
    vehiculos: [],
    busqueda: '',
    cargando: false,
    filtroVehiculo: '',
    soloAlertas: false,

    async init() {
      console.log('[mantenimiento] Inicializado');
      await this.cargarReferencias();
      await this.cargarDatos();
    },

    render(params) {
      return '<div x-data="window.MODULES.mantenimiento" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-tools"></i> Mantenimiento' +
        '</h2>' +
        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<button class="btn btn-primary" @click="abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Nuevo servicio' +
          '</button>' +
          '<select x-model="filtroVehiculo" class="select select-bordered min-w-[200px]" @change="cargarDatos()">' +
            '<option value="">Todos los vehículos</option>' +
            '<template x-for="v in vehiculos" :key="v.id">' +
              '<option :value="v.id" x-text="v.placas + \' — \' + v.marca + \' \' + v.modelo"></option>' +
            '</template>' +
          '</select>' +
          '<label class="flex items-center gap-2 cursor-pointer">' +
            '<input type="checkbox" x-model="soloAlertas" class="checkbox checkbox-warning checkbox-sm" @change="cargarDatos()" />' +
            '<span class="text-sm">Solo próximos vencidos</span>' +
          '</label>' +
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
                  '<th>Taller</th>' +
                  '<th>Costo</th>' +
                  '<th>Km actual</th>' +
                  '<th>Próximo Km</th>' +
                  '<th>Alerta</th>' +
                  '<th>Acciones</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                '<tr x-for="item in datosFiltrados" :key="item.id" :class="{\'bg-warning/5\': esProximo(item)}">' +
                  '<td x-text="formatDate(item.createdAt)"></td>' +
                  '<td x-text="vehiculoLabel(item.vehiculoId)"></td>' +
                  '<td>' +
                    '<span class="badge badge-outline" :class="badgeTipo(item.tipo)" x-text="item.tipo"></span>' +
                  '</td>' +
                  '<td x-text="item.taller || \'-\'"></td>' +
                  '<td x-text="formatCurrency(item.costo)"></td>' +
                  '<td x-text="item.kilometraje ? item.kilometraje.toLocaleString() : \'-\'"></td>' +
                  '<td x-text="item.proximoKm ? item.proximoKm.toLocaleString() : \'-\'"></td>' +
                  '<td>' +
                    '<template x-if="item.proximoKm">' +
                      '<span class="badge badge-warning badge-sm gap-1">' +
                        '<i class="bi bi-exclamation-triangle-fill"></i> ' +
                        '<span x-text="\'Próximo en \' + item.proximoKm + \' km\'"></span>' +
                      '</span>' +
                    '</template>' +
                    '<template x-if="!item.proximoKm">' +
                      '<span class="text-base-content/30 text-xs">—</span>' +
                    '</template>' +
                  '</td>' +
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
            '<i class="bi bi-tools text-6xl mb-4"></i>' +
            '<p class="text-lg mb-4">No hay registros de mantenimiento</p>' +
            '<button class="btn btn-primary" @click="abrirForm()"><i class="bi bi-plus-lg"></i> Registrar primer servicio</button>' +
          '</div>' +
        '</template>' +
      '</div>';
    },

    get datosFiltrados() {
      var fv = this.filtroVehiculo;
      var alertas = this.soloAlertas;
      var self = this;
      return this.datos.filter(function (m) {
        if (fv && m.vehiculoId !== fv) return false;
        if (alertas && !self.esProximo(m)) return false;
        return true;
      });
    },

    esProximo(item) {
      if (!item.proximoKm) return false;
      var v = this._getVehiculo(item.vehiculoId);
      if (!v) return false;
      return true;
    },

    vehiculoLabel(id) {
      for (var i = 0; i < this.vehiculos.length; i++) {
        if (this.vehiculos[i].id === id) return this.vehiculos[i].placas;
      }
      return id;
    },

    badgeTipo(tipo) {
      var map = { aceite: 'badge-info', llantas: 'badge-success', frenos: 'badge-warning', afinacion: 'badge-accent', general: 'badge-ghost' };
      return map[tipo] || 'badge-ghost';
    },

    getAlertaText(item) {
      if (!item.proximoKm) return '';
      var kmRestantes = item.proximoKm - (this._getVehiculoKm(item.vehiculoId) || 0);
      if (kmRestantes <= 0) return 'Vencido!';
      if (kmRestantes <= 500) return 'Urgente (' + kmRestantes + ' km)';
      if (kmRestantes <= 2000) return 'Próximo (' + kmRestantes + ' km)';
      return 'En ' + kmRestantes + ' km';
    },

    _getVehiculo(id) {
      for (var i = 0; i < this.vehiculos.length; i++) {
        if (this.vehiculos[i].id === id) return this.vehiculos[i];
      }
      return null;
    },

    _getVehiculoKm(id) {
      var v = this._getVehiculo(id);
      if (!v) return null;
      return null;
    },

    async cargarReferencias() {
      try {
        this.vehiculos = await db.vehiculos.where('estado').notEqual('dado de baja').toArray();
      } catch (e) { console.error(e); }
    },

    async cargarDatos() {
      this.cargando = true;
      try {
        var collection = db.mantenimientos.orderBy('createdAt').reverse();
        this.datos = this.filtroVehiculo
          ? await collection.filter(function (m) { return m.vehiculoId === this.filtroVehiculo; }.bind(this)).toArray()
          : await collection.toArray();
      } catch (e) {
        UI.toast('Error al cargar: ' + e.message, 'error');
      } finally {
        this.cargando = false;
      }
    },

    async abrirForm(item) {
      var editando = !!item;
      var v = item || { vehiculoId: '', tipo: 'aceite', costo: '', kilometraje: '', taller: '', proximoKm: '' };
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
              '<span class="label-text">Tipo de servicio</span>' +
              '<select x-model="form.tipo" class="select select-bordered">' +
                '<option value="aceite">Cambio de aceite</option>' +
                '<option value="llantas">Llantas</option>' +
                '<option value="frenos">Frenos</option>' +
                '<option value="afinacion">Afinación</option>' +
                '<option value="general">General</option>' +
              '</select>' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Costo $ <span class="text-error">*</span></span>' +
              '<input type="number" step="0.01" x-model="form.costo" class="input input-bordered" required min="1" />' +
            '</label>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Taller</span>' +
              '<input type="text" x-model="form.taller" class="input input-bordered" placeholder="Nombre del taller" />' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Kilometraje actual</span>' +
              '<input type="number" x-model="form.kilometraje" class="input input-bordered" min="0" />' +
            '</label>' +
          '</div>' +
          '<label class="form-control w-full">' +
            '<span class="label-text">Próximo servicio (km)</span>' +
            '<input type="number" x-model="form.proximoKm" class="input input-bordered" placeholder="Km para próximo servicio" min="0" />' +
          '</label>' +
        '</div>';
      window._modalFormData = v;
      await UI.modalForm(editando ? 'Editar Servicio' : 'Nuevo Servicio', html, async function (data) {
        if (editando) await Mantenimiento.actualizar(item.id, data);
        else await Mantenimiento.guardar(data);
        await Mantenimiento.cargarDatos();
      });
    },

    async guardar(datos) {
      if (!datos.vehiculoId || !datos.costo) {
        UI.toast('Vehículo y costo son obligatorios', 'error');
        throw new Error('Campos obligatorios');
      }
      var registro = {
        id: uuid(),
        vehiculoId: datos.vehiculoId,
        tipo: datos.tipo || 'general',
        costo: parseFloat(datos.costo) || 0,
        kilometraje: datos.kilometraje ? parseInt(datos.kilometraje) : null,
        taller: datos.taller || '',
        proximoKm: datos.proximoKm ? parseInt(datos.proximoKm) : null,
        createdBy: 'usuario',
        createdAt: new Date()
      };
      await db.mantenimientos.put(registro);
      UI.toast('Servicio registrado correctamente', 'success');
    },

    async actualizar(id, datos) {
      var existente = await db.mantenimientos.get(id);
      if (!existente) { UI.toast('Servicio no encontrado', 'error'); return; }
      existente.vehiculoId = datos.vehiculoId || existente.vehiculoId;
      existente.tipo = datos.tipo || existente.tipo;
      existente.costo = parseFloat(datos.costo) || existente.costo;
      existente.kilometraje = datos.kilometraje ? parseInt(datos.kilometraje) : existente.kilometraje;
      existente.taller = datos.taller || existente.taller;
      existente.proximoKm = datos.proximoKm ? parseInt(datos.proximoKm) : existente.proximoKm;
      await db.mantenimientos.put(existente);
      UI.toast('Servicio actualizado correctamente', 'success');
    },

    async eliminar(item) {
      var ok = await UI.confirm('¿Eliminar este registro de mantenimiento?');
      if (!ok) return;
      try {
        await db.mantenimientos.delete(item.id);
        UI.toast('Registro eliminado', 'success');
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
  window.MODULES.mantenimiento = Mantenimiento;
})();
