# Uso de inteligencia artificial

## Para qué la usé

### Comprender conceptos

Me ayudó a entender algunos conceptos del taller que no tenía claros, como las conexiones bidireccionales (BiDir), para qué sirve ice_fixed, cómo un mismo servidor puede atender clientes por TCP y por WebSocket, y cómo slice2js convierte el contrato .ice en un archivo de JavaScript.

Lo que más me costó entender fue por qué el navegador no puede recibir llamadas del servidor como sí lo hace el cliente de JavaFX. Con las explicaciones entendí que el navegador no puede abrir un puerto propio, y que por eso se reutiliza la conexión que él mismo abre hacia el servidor. También me quedó más claro qué es un proxy, qué es un servant y qué papel cumple el ObjectAdapter en cada lado.

Además me ayudó a entender por qué el servidor tiene que volver a validar las jugadas aunque la página ya muestre los movimientos posibles, y por qué el archivo de Ice tiene que cargarse antes que el contrato generado.

### Organizar el trabajo por etapas

Me ayudó a leer el enunciado y a ordenar lo que tenía que hacer en pasos: generar el contrato, modificar el servidor, implementar los servicios del cliente web, hacer los componentes y al final probar todo junto. Así tuve claro qué seguía en cada momento.

Al principio el proyecto tenía muchos archivos y no sabía por dónde empezar. Primero identificamos qué partes ya estaban hechas y cuáles tenían pendientes por completar. Después seguimos el orden del enunciado, porque cada paso dependía del anterior: sin el contrato generado no se podía conectar el cliente, y sin el cliente conectado no se podía probar el tablero. También me ayudó a comparar lo que tenía hecho con la rúbrica, para saber qué me faltaba antes de entregar.

### Corregir errores de sintaxis

Cuando el código no funcionaba, me ayudó a encontrar errores de sintaxis y a entender por qué fallaba, para poder corregirlos.

En JavaScript me ayudó a revisar cosas como los imports entre archivos, el uso de async y await en las llamadas al servidor, y la forma de recorrer los datos que llegan del servidor, por ejemplo el tablero de 8x8 y la lista de jugadas. En Java me ayudó a revisar el cambio en el servidor para que compilara y pasaran las pruebas.

### Configurar Gradle y el entorno

Me ayudó a configurar Gradle para que el proyecto compilara en mi computador. El problema era que Gradle buscaba Ice en otra carpeta y no funcionaba con la versión de Java que tenía por defecto, así que hubo que indicarle dónde estaba Ice instalado y usar Java 21. También me ayudó a generar el archivo ChessService.js cuando el comando de slice2js no funcionó.

Para encontrar el problema revisamos los mensajes de error de Gradle: el primero decía que no encontraba slice2java en la carpeta /usr/local, y resultó que Ice estaba instalado con Homebrew en /opt/homebrew. Con eso, las pruebas del proyecto (./gradlew test) pasaron todas. En el caso de slice2js, el comando con npx fallaba en mi Mac, así que usamos directamente el programa que viene dentro del paquete de npm para generar el archivo.

### Probar y documentar

Me ayudó a hacer la prueba de la partida entre los tres participantes y a organizar el informe y las respuestas del cuestionario.

En la prueba levantamos el servidor y la página web, y jugamos una partida corta: un jugador por TCP, otro desde el navegador y un tercero como espectador. Así comprobé que las jugadas llegaban al instante a los tres sin tener que recargar, que los puntos y los niveles se actualizaban al terminar, y que el espectador no podía mover. Con eso armé el informe paso a paso con las capturas.

## Lo que hice yo

Revisé el código y las explicaciones, corrí el proyecto, verifiqué que la partida funcionara entre los clientes y ajusté el informe y las respuestas con mis propias palabras.

También revisé que lo que se implementó cumpliera con lo que pide el enunciado en cada paso, organicé los archivos de la entrega y decidí qué dejar en el informe final. Cuando algo de las explicaciones no me quedaba claro, volví a preguntar hasta entenderlo, para poder explicarlo en la sustentación.
