var fs = require('fs');
var chalk = require('chalk');
var inquirer = require("inquirer");
var program = require('commander');

var __base = __dirname + '/';
var package_json = require(__base + '../package.json');

function informarErrorSudo() {
  console.log(chalk.red("ohh... no se permite usar este comando con sudo o root."));
}

/**
 * Ejecuta un comando desde el shell de sistema.
 */
function ejecutar() {

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

  console.log('actualizar');
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


  console.log('buscar');
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
