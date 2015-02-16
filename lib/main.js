var fs = require('fs');
var chalk = require('chalk');
var inquirer = require("inquirer");
var program = require('commander');

var __base = __dirname + '/';
var package_json = require(__base + '../package.json');


function instalar() {
  console.log('instalar');
}

function actualizar() {
  console.log('actualizar');
}

function buscar() {
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
