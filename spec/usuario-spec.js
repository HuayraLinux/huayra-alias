var main = require('../lib/main');

describe("Tiene que poder detectar permisos", function() {

  it("puede asegurar que el usuario no es root.", function(){
    expect(main.esRoot()).toBe(false);
  });

});
