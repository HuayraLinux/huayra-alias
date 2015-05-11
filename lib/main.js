var fs = require('fs');
var chalk = require('chalk');
var spawn = require('child_process').spawn;
var inquirer = require("inquirer");
var program = require('commander');
var RSVP = require('rsvp');

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
 * Ejecuta un comando desde el shell de sistema.
 */
function ejecutar(comando, argumentos, como_sudo, suprimir_salida) {

  if (como_sudo === undefined) {
    como_sudo = false;
  }

  if (suprimir_salida === undefined) {
    suprimir_salida = false;
  }

  if (como_sudo) {
    argumentos.unshift(comando);
    comando = 'sudo';
  }

  if (suprimir_salida) {
    argumentos.push(" > /tmp/listado_paquetes.txt");
  }

  var promise = new RSVP.Promise(function(resolve, reject) {

    var process_object = spawn(comando, argumentos, {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    process_object.on('data', function(data) {
    });

    process_object.on('exit', function(code, signal) {
      if (code === 0) {
        resolve({code: code});
      } else {
        reject({code: code});
      }
    });

  });

  return promise;
}



/*
   if (avisar_demora) {
    var spinner = new Spinner('Esto puede demorar un poco ... (CTRL C para cancelar)');
    spinner.start();

   setInterval(function () {
//number--;
//countdown.message('Exiting in ' + number + ' seconds...  ');

}, 1000);
}

------------------ %< ----------------------------

if (avisar_demora && spinner) {
spinner.stop();
}
*/

function instalar(paquete) {

  if (paquete === undefined) {
    console.log(chalk.red("Falta especificar el nombre del paquete a instalar."));
    process.exit(1);
  }

  console.log("Solicitando instalar " + paquete + " ...");

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
  console.log("Actualizando indice de paquetes ...");
  return ejecutar('apt-get', ['update'], true);
}


function comando_buscar() {

  if (esRoot()) {
    return informarErrorSudo();
  }

  var p = actualizar();

  p.then(function() {
    if (process.argv.length < 3) {
      console.log(chalk.red("Falta especificar la busqueda."));
      process.exit(1);
    }

    var argumentos = process.argv;
    var busqueda = argumentos.slice(2, argumentos.length).join(' ');

    console.log("Buscando " + busqueda + " ...");

    return ejecutar('apt-cache', ['search', busqueda], false);
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


module.exports = {
  instalar: instalar,
  actualizar: actualizar,

  comando_instalar: comando_instalar,
  comando_buscar: comando_buscar,

  esRoot: esRoot,
};
