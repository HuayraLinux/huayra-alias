VERSION=0.0.1
NOMBRE="huayra-alias"

N=[0m
G=[01;32m
Y=[01;33m
B=[01;34m

comandos:
	@echo ""
	@echo "${B}Comandos disponibles para ${G}huayra-alias${N}"
	@echo ""
	@echo "  ${Y}Para desarrolladores${N}"
	@echo ""
	@echo "    ${G}iniciar${N}         Instala dependencias."
	@echo "    ${G}ejecutar_linux${N}  Prueba la aplicacion sobre Huayra."
	@echo "    ${G}ejecutar_mac${N}    Prueba la aplicacion sobre OSX."
	@echo ""
	@echo "  ${Y}Para distribuir${N}"
	@echo ""
	@echo "    ${G}release${N}         Arma una nueva versión y la sube a npm."
	@echo "    ${G}utest${N}           Ejecuta los test de unidad."
	@echo "    ${G}live_test${N}       Ejecuta los test de unidad de forma continua."
	@echo "    ${G}publicar${N}        Incrementa la versión."
	@echo "    ${G}crear_deb${N}       Empaqueta para huayra."
	@echo ""


iniciar:
	npm install
	cp extras/clui.js ./node_modules/clui/lib/

ejecutar_linux:
	@node bin/huayra-alias

ejecutar_mac:
	@node bin/huayra-alias

publicar:
	dch -i

crear_deb:
	dpkg-buildpackage -us -uc


live_test:
	node_modules/jasmine-node/bin/jasmine-node spec  --watch lib --autotest --color --growl

release:
	./node_modules/.bin/release-it

utest:
	node_modules/jasmine-node/bin/jasmine-node spec
