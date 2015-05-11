var main = require('./main');

//p = main.instalar('ceferino');
p = main.actualizar();

p.then(function(result) {
  console.log('resut', result);
});
