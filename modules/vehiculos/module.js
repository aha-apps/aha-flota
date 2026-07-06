// vehiculos/module.js — CRUD de vehículos
(function () {
  'use strict';

  var Vehiculos = {
    id: 'vehiculos',
    titulo: 'Vehículos',
    icono: 'bi bi-truck',
    datos: [],
    busqueda: '',
    cargando: false,
    filtroEstado: 'todos',

    async init() {
      console.log('[vehiculos] Inicializado');
      await this.cargarDatos();
    },

    render(params) {
      return '<div x-data="window.MODULES.vehiculos" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-truck"></i> Vehículos' +
        '</h2>' +
        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<button class="btn btn-primary" @click="abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Agregar' +
          '</button>' +
          '<input type="search" x-model="busqueda" placeholder="Buscar por placas o económico..."' +
                 ' class="input input-bordered flex-1 min-w-[200px]" />' +
          '<select x-model="filtroEstado" class="select select-bordered">' +
            '<option value="todos">Todos los estados</option>' +
            '<option value="activo">Activo</option>' +
            '<option value="en taller">En taller</option>' +
            '<option value="dado de baja">Dado de baja</option>' +
          '</select>' +
        '</div>' +
        '<template x-if="cargando">' +
          '<div class="space-y-3">' +
            '<div class="skeleton h-12 w-full"></div>' +
            '<div class="skeleton h-12 w-full"></div>' +
            '<div class="skeleton h-12 w-full"></div>' +
          '</div>' +
        '</template>' +
        '<template x-if="!cargando && datosFiltrados.length">' +
          '<div class="overflow-x-auto">' +
            '<table class="table table-zebra">' +
              '<thead>' +
                '<tr>' +
                  '<th>Placas</th>' +
                  '<th>Económico</th>' +
                  '<th>Marca / Modelo</th>' +
                  '<th>Año</th>' +
                  '<th>Tipo</th>' +
                  '<th>Estado</th>' +
                  '<th>Acciones</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                '<tr x-for="item in datosFiltrados" :key="item.id">' +
                  '<td class="font-medium" x-text="item.placas"></td>' +
                  '<td x-text="item.numeroEconomico"></td>' +
                  '<td x-text="item.marca + \' \' + item.modelo"></td>' +
                  '<td x-text="item.anio"></td>' +
                  '<td><span class="badge badge-outline" x-text="item.tipo"></span></td>' +
                  '<td>' +
                    '<span class="badge" :class="{\'badge-success\': item.estado === \'activo\', \'badge-warning\': item.estado === \'en taller\', \'badge-error\': item.estado === \'dado de baja\'}"' +
                          ' x-text="item.estado"></span>' +
                  '</td>' +
                  '<td class="flex gap-1">' +
                    '<button class="btn btn-sm btn-ghost" @click="abrirForm(item)" title="Editar">' +
                      '<i class="bi bi-pencil"></i>' +
                    '</button>' +
                    '<button class="btn btn-sm btn-ghost text-error" @click="eliminar(item)" title="Eliminar">' +
                      '<i class="bi bi-trash"></i>' +
                    '</button>' +
                  '</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</template>' +
        '<template x-if="!cargando && !datosFiltrados.length">' +
          '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">' +
            '<i class="bi bi-truck text-6xl mb-4"></i>' +
            '<p class="text-lg mb-4">No hay vehículos registrados</p>' +
            '<button class="btn btn-primary" @click="abrirForm()">' +
              '<i class="bi bi-plus-lg"></i> Agregar primero' +
            '</button>' +
          '</div>' +
        '</template>' +
      '</div>';
    },

    get datosFiltrados() {
      var q = (this.busqueda || '').toLowerCase().trim();
      var est = this.filtroEstado || 'todos';
      return this.datos.filter(function (v) {
        if (est !== 'todos' && v.estado !== est) return false;
        if (!q) return true;
        return (v.placas && v.placas.toLowerCase().indexOf(q) !== -1) ||
               (v.numeroEconomico && v.numeroEconomico.toLowerCase().indexOf(q) !== -1) ||
               (v.marca && v.marca.toLowerCase().indexOf(q) !== -1) ||
               (v.modelo && v.modelo.toLowerCase().indexOf(q) !== -1);
      });
    },

    async cargarDatos() {
      this.cargando = true;
      try {
        this.datos = await db.vehiculos.orderBy('createdAt').reverse().toArray();
      } catch (e) {
        UI.toast('Error al cargar: ' + e.message, 'error');
      } finally {
        this.cargando = false;
      }
    },

    async abrirForm(item) {
      var editando = !!item;
      var v = item || { placas: '', numeroEconomico: '', marca: '', modelo: '', anio: new Date().getFullYear().toString(), tipo: 'auto', estado: 'activo' };
      var html =
        '<div class="space-y-4">' +
          '<div class="grid grid-cols-2 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Placas <span class="text-error">*</span></span>' +
              '<input type="text" x-model="form.placas" class="input input-bordered" required placeholder="ABC-1234" />' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Número Económico <span class="text-error">*</span></span>' +
              '<input type="text" x-model="form.numeroEconomico" class="input input-bordered" required placeholder="ECO-001" />' +
            '</label>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Marca <span class="text-error">*</span></span>' +
              '<input type="text" x-model="form.marca" class="input input-bordered" required placeholder="Toyota" />' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Modelo <span class="text-error">*</span></span>' +
              '<input type="text" x-model="form.modelo" class="input input-bordered" required placeholder="Hilux" />' +
            '</label>' +
          '</div>' +
          '<div class="grid grid-cols-3 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Año</span>' +
              '<input type="number" x-model="form.anio" class="input input-bordered" placeholder="2024" min="2000" max="2030" />' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Tipo</span>' +
              '<select x-model="form.tipo" class="select select-bordered">' +
                '<option value="moto">Moto</option>' +
                '<option value="auto">Auto</option>' +
                '<option value="camioneta">Camioneta</option>' +
                '<option value="camion">Camión</option>' +
              '</select>' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text">Estado</span>' +
              '<select x-model="form.estado" class="select select-bordered">' +
                '<option value="activo">Activo</option>' +
                '<option value="en taller">En taller</option>' +
                '<option value="dado de baja">Dado de baja</option>' +
              '</select>' +
            '</label>' +
          '</div>' +
        '</div>';
      window._modalFormData = v;
      await UI.modalForm(editando ? 'Editar Vehículo' : 'Nuevo Vehículo', html, async function (data) {
        if (editando) await Vehiculos.actualizar(item.id, data);
        else await Vehiculos.guardar(data);
        await Vehiculos.cargarDatos();
      });
    },

    async guardar(datos) {
      var registro = {
        id: uuid(),
        placas: datos.placas || '',
        numeroEconomico: datos.numeroEconomico || '',
        marca: datos.marca || '',
        modelo: datos.modelo || '',
        anio: datos.anio || '',
        tipo: datos.tipo || 'auto',
        estado: datos.estado || 'activo',
        createdBy: 'usuario',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      if (!registro.placas || !registro.numeroEconomico) {
        UI.toast('Placas y número económico son obligatorios', 'error');
        throw new Error('Campos obligatorios');
      }
      await db.vehiculos.put(registro);
      UI.toast('Vehículo guardado correctamente', 'success');
    },

    async actualizar(id, datos) {
      var existente = await db.vehiculos.get(id);
      if (!existente) { UI.toast('Vehículo no encontrado', 'error'); return; }
      existente.placas = datos.placas || existente.placas;
      existente.numeroEconomico = datos.numeroEconomico || existente.numeroEconomico;
      existente.marca = datos.marca || existente.marca;
      existente.modelo = datos.modelo || existente.modelo;
      existente.anio = datos.anio || existente.anio;
      existente.tipo = datos.tipo || existente.tipo;
      existente.estado = datos.estado || existente.estado;
      existente.updatedAt = new Date();
      await db.vehiculos.put(existente);
      UI.toast('Vehículo actualizado correctamente', 'success');
    },

    async eliminar(item) {
      var ok = await UI.confirm('¿Eliminar vehículo ' + item.placas + '? Se eliminarán también todas sus cargas, mantenimientos e incidentes.');
      if (!ok) return;
      try {
        await db.vehiculos.delete(item.id);
        var cg = await db.cargas_combustible.where('vehiculoId').equals(item.id).toArray();
        for (var i = 0; i < cg.length; i++) await db.cargas_combustible.delete(cg[i].id);
        var mt = await db.mantenimientos.where('vehiculoId').equals(item.id).toArray();
        for (var j = 0; j < mt.length; j++) await db.mantenimientos.delete(mt[j].id);
        var inc = await db.incidentes.where('vehiculoId').equals(item.id).toArray();
        for (var k = 0; k < inc.length; k++) await db.incidentes.delete(inc[k].id);
        UI.toast('Vehículo y datos relacionados eliminados', 'success');
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
  window.MODULES.vehiculos = Vehiculos;
})();
