var fs = require('fs');
var chalk = require('chalk');
var inquirer = require("inquirer");
var program = require('commander');
var spawn = require('child_process').spawn;

var __base = __dirname + '/';
var package_json = require(__base + '../package.json');

function informarErrorSudo() {
  console.log(chalk.red("ohh... no se permite usar este comando con sudo o root."));
}

/**
 * Ejecuta un comando desde el shell de sistema.
 */
function ejecutar(comando) {

  var npmInstall = spawn('sudo', comando.split(' '), {
    cwd: process.cwd(),
    stdio: 'inherit'
  });


npmInstall.stdout.on('data', function(data) {
   console.log('data stdout: ' + data);
});

npmInstall.stderr.on('data', function(data) {
   console.log('data stdout: ' + data);
});

npmInstall.on('exit', function(code, signal) {
  if (code === 0) {
    console.log(code);
  } else {
    console.log("error", code);
  }
});

}

function instalar() {
  if (esRoot()) {
    return informarErrorSudo();
  }

  console.log('instalar');
}

function actualizar() {
  if (esRoot()) {
    return informarErrorSudo();
  }

  ejecutar('apt-get update');
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
