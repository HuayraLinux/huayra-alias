var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var spawn = require('child_process').spawn;
var inquirer = require("inquirer");
var program = require('commander');
var RSVP = require('rsvp');
var argv = require('minimist')(process.argv);

var verbose = false;

console.log(argv);



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


/**
 * Ejecuta un comando desde el shell de sistema.
 */
function ejecutar(comando, argumentos, como_sudo, suprimir_salida) {
  var spinner = null;

  if (como_sudo === undefined) {
    como_sudo = false;
  }

  if (suprimir_salida === undefined) {
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

          if (/Obj|Ing/.test(data)) {
            if (spinner === null)
              iniciar_spinner();
          }

        } else {
          console.log('stdout: ' + data);
        }

      });

      process_object.stderr.on('data', function (data) {

        if (/Sorry, try/.test(data)) {
          data = "\nLo siento, por favor ingresa la contraseña nuevamamente: ";
        }

        console.log(chalk.red(data));
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

function comando_instalar() {

  if (esRoot()) {
    return informarErrorSudo();
  }

  if (process.argv.length < 3) {
    console.log(chalk.red("Falta especificar el nombre del paquete."));
    process.exit(1);
  }

  var argumentos = process.argv;
  var paquete = argumentos.slice(2, argumentos.length).join(' ');

  return instalar(paquete);
}


function actualizar() {
  console.log(chalk.green("Solicitando actualizar el listado de paquetes ..."));
  return ejecutar('apt-get', ['update'], true, true);
}

function buscar(busqueda) {
    console.log("Buscando " + busqueda + ":  \n");
    return ejecutar('apt-cache', ['search', busqueda], false);
}

/**
 * Representa el comando para buscar paquetes desde la linea de comandos.
 */
function comando_buscar() {

  if (process.argv.length < 3) {
    console.log(chalk.red("Falta especificar la busqueda."));
    process.exit(1);
  }

  if (esRoot()) {
    return informarErrorSudo();
  }

  var p = actualizar();

  p.then(function() {

    var argumentos = process.argv;
    var busqueda = argumentos.slice(2, argumentos.length).join(' ');

    return buscar(busqueda);

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


module.exports = {
  instalar: instalar,
  buscar: buscar,
  actualizar: actualizar,

  comando_instalar: comando_instalar,
  comando_buscar: comando_buscar,

  borrar_cache: borrar_cache,
  esRoot: esRoot,

  existe_archivo_de_configuracion: existe_archivo_de_configuracion,
};
