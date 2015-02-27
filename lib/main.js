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
function ejecutar(comando, como_sudo, avisar_demora) {
  var spinner;
  var comando_completo;
  como_sudo = como_sudo || true;
  avisar_demora = avisar_demora || false;

  if (como_sudo)
    comando_completo = "sudo " + comando;
  else
    comando_completo = comando;

  console.log(chalk.green("Ejecutando el comando: " + comando_completo));


  if (avisar_demora) {
    var spinner = new Spinner('Esto puede demorar un poco ... (CTRL C para cancelar)');
    spinner.start();

    /*
    setInterval(function () {
      //number--;
      //countdown.message('Exiting in ' + number + ' seconds...  ');

    }, 1000);
    */
  }

  exec(comando_completo, function(error, stdout, stderr) {
    if (avisar_demora && spinner) {
      spinner.stop();
    }
    
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

  ejecutar('mkdir /asdasdasd');
}

function actualizar() {

  if (esRoot()) {
    return informarErrorSudo();
  }

  ejecutar('apt-get update', true, true);
}

function paloma() {
  if (esRoot()) {
    return informarErrorSudo();
  }

  ejecutar('wget -qO- http://huayralinux.github.io/actualizar.py | sudo python');
}

function buscar() {
  if (esRoot()) {
    return informarErrorSudo();
  }


  console.log('ls');
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
  paloma: paloma,

  esRoot: esRoot,
};
