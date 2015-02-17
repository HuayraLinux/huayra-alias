var fs = require('fs');
var chalk = require('chalk');
var inquirer = require("inquirer");
var program = require('commander');

var __base = __dirname + '/';
var package_json = require(__base + '../package.json');

function informarErrorSudo() {
  console.log(chalk.red("ohh... no se permite usar este comando con sudo o root."));
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

  esRoot: esRoot,
};
