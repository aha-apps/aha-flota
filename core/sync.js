// SyncEngine — Export/Import de datos en formato .ahabackup
(function () {
  'use strict';
  var DEFAULT_PASSWORD = '';
  var EXCLUDE_TABLES = ['modelos_cache', '_ia_sqlite', '_file_blobs'];
  if (typeof window.SyncEngine !== 'undefined') return;

  window.SyncEngine = {
    _password: DEFAULT_PASSWORD,

    setPassword: function (pwd) {
      this._password = pwd || '';
    },

    exportarBackup: function (password) {
      var pwd = password || this._password;
      var self = this;
      try {
        UI.toast('Preparando respaldo...', 'info');
        var tables = {};
        var appName = (window.APP_CONFIG && window.APP_CONFIG.app) ? (window.APP_CONFIG.app.nombre || 'aha-flota') : 'aha-flota';
        var dbRef = window.db;

        var steps = [];
        if (dbRef && dbRef.tables) {
          for (var i = 0; i < dbRef.tables.length; i++) {
            (function (table) {
              if (EXCLUDE_TABLES.indexOf(table.name) !== -1) return;
              steps.push(
                table.toArray().then(function (records) {
                  if (records.length) tables[table.name] = records;
                })
              );
            })(dbRef.tables[i]);
          }
        }

        return Promise.all(steps).then(function () {
          var payload = JSON.stringify({
            version: 2, app: appName,
            exportedAt: new Date().toISOString(), tables: tables
          });

          var blob;
          if (pwd) {
            var encrypted = CryptoJS.AES.encrypt(payload, pwd).toString();
            blob = new Blob([encrypted], { type: 'application/octet-stream' });
          } else {
            var compressed = window.pako ? pako.gzip(payload) : payload;
            blob = new Blob([compressed], { type: 'application/octet-stream' });
          }

          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = appName + '-' + new Date().toISOString().slice(0, 10) + '.ahabackup';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          UI.toast('Respaldo exportado correctamente', 'success');
          return true;
        }).catch(function (err) {
          UI.toast('Error al exportar: ' + (err.message || 'Error'), 'error');
          throw err;
        });
      } catch (err) {
        UI.toast('Error al exportar: ' + (err.message || 'Error'), 'error');
        return Promise.reject(err);
      }
    },

    importarBackup: function (file, password) {
      try {
        UI.toast('Importando respaldo...', 'info');
        var reader = new FileReader();
        return new Promise(function (resolve, reject) {
          reader.onload = function () {
            var content = reader.result;
            var json;
            if (password) {
              try {
                var decrypted = CryptoJS.AES.decrypt(content, password).toString(CryptoJS.enc.Utf8);
                if (!decrypted) throw new Error('Contrasena incorrecta');
                json = JSON.parse(decrypted);
              } catch (e) {
                try {
                  json = JSON.parse(content);
                } catch (e2) {
                  UI.toast('Contrasena incorrecta o archivo corrupto', 'error');
                  reject(e); return;
                }
              }
            } else {
              try {
                json = JSON.parse(content);
              } catch (e) {
                try {
                  var decompressed = pako.ungzip(content, { to: 'string' });
                  json = JSON.parse(decompressed);
                } catch (e2) {
                  UI.toast('Formato de respaldo invalido', 'error');
                  reject(e2); return;
                }
              }
            }

            if (!json || !json.tables) {
              UI.toast('Formato de respaldo invalido', 'error');
              reject(new Error('Invalid format')); return;
            }

            var ps = [];
            var dbRef = window.db;
            if (!dbRef) { UI.toast('Base de datos no disponible', 'error'); reject(new Error('No DB')); return; }

            var tableNames = Object.keys(json.tables);
            for (var i = 0; i < tableNames.length; i++) {
              (function (tName) {
                var records = json.tables[tName];
                if (!records || !records.length) return;
                var table = dbRef.tables.filter ? dbRef.tables.filter(function (t) { return t.name === tName; }) : [];
                var target = table.length ? table[0] : null;
                if (target) ps.push(target.bulkPut(records));
              })(tableNames[i]);
            }

            Promise.all(ps).then(function () {
              UI.toast('Respaldo importado correctamente', 'success');
              resolve(true);
            }).catch(function (err) {
              UI.toast('Error al importar datos: ' + (err.message || 'Error'), 'error');
              reject(err);
            });
          };
          reader.onerror = function () { reject(new Error('Error al leer archivo')); };
          reader.readAsText(file);
        });
      } catch (err) {
        UI.toast('Error al importar: ' + (err.message || 'Error'), 'error');
        return Promise.reject(err);
      }
    }
  };
})();
