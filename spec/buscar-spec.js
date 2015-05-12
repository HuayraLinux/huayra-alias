var main = require('../lib/main');
var fs = require('fs');

describe("Tiene que poder buscar software", function() {

  it("existe la funcion de busqueda", function(){
    expect(main.comando_buscar).toBeDefined();
  });

  it("genera el archivo de cache", function(){
    main.borrar_cache();
    expect(main.existe_archivo_de_configuracion()).toBe(false);
    main.actualizar().then(function() {
      expect(main.existe_archivo_de_configuracion()).toBe(true);
    });
  });

  it("puede buscar un paquete por nombre y generó el cache", function(){
    main.buscar('ceferino');
  });

});
