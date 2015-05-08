var fs = require('fs');
var chalk = require('chalk');
var inquirer = require("inquirer");
var program = require('commander');

var exec = require('child_process').exec;
var clui = require('clui');
var Spinner = clui.Spinner;

var __base = __dirname + '/';
var package_json = require(__base + '../package.json');

function informarErrorSudo() {
  console.log(chalk.red("ohh... no se permite usar este comando con sudo o root."));
}

/**
 * Ejecuta un comando desde el shell de sistema.
 */
function ejecutar(comando, como_sudo) {
  var spinner;
  var comando_completo;

  if (como_sudo === undefined) {
    como_sudo = false;
  }

  if (como_sudo) {
    comando_completo = "sudo " + comando;
  } else {
    comando_completo = comando;
  }

  console.log(chalk.green("Ejecutando el comando: " + comando_completo));

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

  console.log(" ++++ " + comando_completo);

  exec(comando_completo, function(error, stdout, stderr) {

      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);

      if (error !== null) {
        if (stderr.length > 0)
          console.log(chalk.red(stderr));
        else
          console.log(chalk.red(error));
      }

  });

}

function instalar() {
  
  if (esRoot()) {
    return informarErrorSudo();
  }

  if (process.argv.length < 3) {
    console.log(chalk.red("Falta especificar el nombre del paquete a instalar."));
    process.exit(1);
  }

  var nombre = process.argv[2];
  console.log("Solicitando instalar " + nombre + " ...");

  ejecutar('apt-get install ' + nombre, true);
}


function actualizar() {

  if (esRoot()) {
    return informarErrorSudo();
  }


  ejecutar('apt-get update', true);
}


function buscar() {

  if (esRoot()) {
    return informarErrorSudo();
  }

  if (process.argv.length < 3) {
    console.log(chalk.red("Falta especificar la busqueda."));
    process.exit(1);
  }

  var busqueda = process.argv[2];
  console.log("Buscando " + busqueda + " ...");

  ejecutar('apt-cache search ' + busqueda, false);
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
  buscar: buscar,

  esRoot: esRoot,
};
