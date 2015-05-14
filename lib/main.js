var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var spawn = require('child_process').spawn;
var strftime = require('strftime');
var inquirer = require("inquirer");
var program = require('commander');
var RSVP = require('rsvp');

var verbose = false;

var clui = require('clui');
var Spinner = clui.Spinner;

var __base = __dirname + '/';
var package_json = require(__base + '../package.json');

function informarErrorSudo() {
  console.log(chalk.red("ohh... no se permite usar este comando con sudo o root."));
}

process.on('SIGINT', function() {
  console.log(chalk.red("\nHas cancelado el proceso"));
  process.exit(1);
});


/**
 * Imprime un mensaje en consola solamente si el modo verbose.
 */
function info(message) {
}


function log(mensaje) {
  if (verbose) {
   console.log(mensaje);
  }
}


/**
 * Ejecuta un comando desde el shell de sistema.
 */
function ejecutar(comando, argumentos, como_sudo, suprimir_salida, colorear) {
  var spinner = null;

  if (como_sudo === undefined) {
    como_sudo = false;
  }

  if (colorear === undefined) {
    colorear = false;
  }

  if (suprimir_salida === undefined) {
    suprimir_salida = false;
  }

  if (verbose) {
    suprimir_salida = false;
  }

  function iniciar_spinner() {
    spinner = new Spinner('Actualizando la lista de paquetes ... (CTRL C para cancelar)');
    spinner.start();
  }

  if (como_sudo) {
    argumentos.unshift(comando);
    comando = 'sudo';
  }


  var promise = new RSVP.Promise(function(resolve, reject) {

    var opciones = {
      cwd: process.cwd(),
    };

    if (suprimir_salida) {
      opciones.stdio = [0, 'pipe', 'pipe'];
    } else {
      opciones.stdio = 'inherit';
    }

    var process_object = spawn(comando, argumentos, opciones);

      process_object.stdout.on('data', function (data) {

        if (suprimir_salida) {

          if (/Obj|Ing\s/.test(data)) {
            if (spinner === null) {
              iniciar_spinner();
            }
          } else {
            if (colorear) {
              var lineas = data.toString().split('\n');


              lineas.forEach(function(linea) {
                var partes = linea.split(' - ')

                if (partes.length > 2) {
                  partes = [partes[0], partes.slice(1).join(' - ')];
                }

                if (partes.length === 2) {
                  console.log(chalk.green(partes[0]), '-', partes[1]);
                } else {
                  console.log(linea);
                }

              })
            }

          }



        } else {
          console.log(data.toString());
        }

      });

      process_object.stderr.on('data', function (data) {

        if (/Sorry, try/.test(data)) {
          data = "\nLo siento, por favor ingresa la contraseña nuevamamente: ";
        }

        if (suprimir_salida) {
          if (/W:\s/.test(data)) {
            if (spinner === null) {
              iniciar_spinner();
            }
          }
        } else {
          console.log(chalk.red(data));
        }

      });

    if (suprimir_salida) {
    }

    process_object.on('exit', function(code, signal) {

      if (spinner) {
        spinner.stop();
        spinner = null;
      }

      if (code === 0) {
        resolve({code: code});
      } else {
        reject({code: code});
      }
    });

  });

  return promise;
}


function instalar(paquete) {

  if (paquete === undefined) {
    console.log(chalk.red("Falta especificar el nombre del paquete a instalar."));
    process.exit(1);
  }

  console.log(chalk.green("Solicitando instalar " + paquete + " ..."));

  return ejecutar('apt-get', ['install', paquete], true);
}

function comando_instalar(modo_verbose, argv) {
  verbose = modo_verbose;

  if (argv.length < 1) {
    console.log(chalk.red("Falta especificar el nombre del paquete."));
    process.exit(1);
  }

  if (esRoot()) {
    return informarErrorSudo();
  }

  var p = actualizar();

  p.then(function() {
    var paquete = argv.join(' ');
    return instalar(paquete);
  });

}

function actualizar_cache() {
  var home_path = process.env.HOME;
  var config_path = path.join(home_path, ".huayra-update");
  var file_path = path.join(config_path, "cache_age");

  if (!fs.existsSync(config_path)) {
    fs.mkdirSync(config_path);
  }

  fs.writeFile(file_path, strftime("%s", new Date()), function(err) {
    if (err) {
      console.log("Imposible generar el archivo de cache: " + file_path);
    } else {
      console.log("Generando el archivo de cache: " + file_path);
    }
  });
}


function actualizar() {
  return promise = new RSVP.Promise(function(resolve) {
    var p = necesita_actualizar();

    p.then(function(debe_actualizar) {

      if (debe_actualizar) {
        console.log(chalk.green("Solicitando actualizar el listado de paquetes ..."));
        ejecutar('apt-get', ['update'], true, true).then(function() {
          actualizar_cache();
          resolve();
        });
      } else {
        resolve();
      }

    });

  });
}

function buscar(busqueda) {
  console.log('');
  return ejecutar('apt-cache', ['search', busqueda], false, true, true);
}

/**
 * Representa el comando para buscar paquetes desde la linea de comandos.
 */
function comando_buscar(modo_verbose, argv) {
  verbose = modo_verbose;

  if (argv.length < 1) {
    console.log(chalk.red("Falta especificar la busqueda."));
    process.exit(1);
  }

  if (esRoot()) {
    return informarErrorSudo();
  }

  var p = actualizar();

  p.then(function() {

    return buscar(argv);

  });

  return p;
}


/**
 * Informa si el usuario está ejecutando este comando como administrador.
 */
function esRoot() {
  var uid = parseInt(process.env.SUDO_UID);

  if (uid)
    return true;
  else
    return false;
}

/**
 * Retorna la ruta del archivo que almacena la fecha de actualización.
 */
function get_cache_path() {
  var homedir = process.env.HOME;
  return path.join(homedir, '.config', 'huayra_alias.cache');
}

/**
 * Informa si existe el archivo ~/.config/huayra_alias.cache
 */
function existe_archivo_de_configuracion() {
  var config_path = get_cache_path();
  return fs.existsSync(config_path);
}

/**
 * Elimina el archivo con la fecha de última actualización.
 */
function borrar_cache() {
  var config_path = get_cache_path();

  if (existe_archivo_de_configuracion()) {
    fs.unlinkSync(config_path);
  }
}

function imprimir_ayuda_buscar() {
  console.log("huayra-alias comando buscar:");
  console.log("");
  console.log("El comando buscar permite actualizar y realizar búsquedas ");
  console.log("en el repositorio de software de Huayra.");
  console.log("");
  console.log("Por ejemplo, para buscar paquetes relacionados con gimp podés escribir:");
  console.log("'buscar gimp' en la consola, y aparecerá un listado de todos los");
  console.log("programas disponibles para instalar.");
  console.log("");
  console.log("Otros parámetros adicionales de este comando son:");
  console.log("");
  console.log("   -v    Muestra el detalle de cada paso (deshabilitado por omisión)");
  console.log("   -h    Muestra esta pantalla de ayuda");
  console.log("");
}

function imprimir_ayuda_instalar() {
  console.log("huayra-alias comando instalar:");
  console.log("");
  console.log("El comando instalar permite instalar software desde los repositorios");
  console.log("indicando el nombre del paquete.");
  console.log("");
  console.log("Por ejemplo, para instalar un programa para monitorizar procesos como ");
  console.log("htop, podés escribir 'instalar htop' en la consola, y se iniciará ");
  console.log("la instalación.");
  console.log("");
  console.log("Otros parámetros adicionales de este comando son:");
  console.log("");
  console.log("   -v    Muestra el detalle de cada paso (deshabilitado por omisión)");
  console.log("   -h    Muestra esta pantalla de ayuda");
  console.log("");
}

function necesita_actualizar() {
  return promise = new RSVP.Promise(function(resolve) {

    var home_path = process.env.HOME;
    var file_path = path.join(home_path, ".huayra-update/cache_age");
    var fecha_actual = parseInt(strftime("%s", new Date()), 10);
    var fecha_actualizacion = null;

    fs.readFile(file_path, function(err, data) {

      if (err) {
        fecha_actualizacion = 0;
      } else {
        fecha_actualizacion = parseInt(data, 10);
      }

      // dias transcurridos desde la ultima actualizacion.
      dias = (fecha_actual - fecha_actualizacion) / 86400;

      //console.log({dias: dias, necesita_actualizar: (dias > 1), fecha_actual: fecha_actual, fecha_actualizacion: fecha_actualizacion});
      resolve((dias > 1));
    });

  });
}


function filtrar_argumentos(argumentos) {
  var args = argumentos.slice(2, argumentos.length);
  args = args.filter(function(e) {return (e!='-v');});

  return args;
}

module.exports = {
  instalar: instalar,
  buscar: buscar,
  actualizar: actualizar,

  filtrar_argumentos: filtrar_argumentos,
  imprimir_ayuda_buscar: imprimir_ayuda_buscar,
  imprimir_ayuda_instalar: imprimir_ayuda_instalar,

  comando_instalar: comando_instalar,
  comando_buscar: comando_buscar,

  necesita_actualizar: necesita_actualizar,

  borrar_cache: borrar_cache,
  esRoot: esRoot,
  actualizar_cache: actualizar_cache,

  existe_archivo_de_configuracion: existe_archivo_de_configuracion,
};
