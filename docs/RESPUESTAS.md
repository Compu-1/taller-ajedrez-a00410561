# Respuestas del cuestionario

Estudiante: Juan Felipe Castro Reyes · Código: A00410561
Computación en Internet I (09776) · Universidad Icesi · Semestre 2026-2

## Pregunta 1. ¿Por qué se usa BiDir y para qué sirve ice_fixed?

Un navegador no puede abrir un puerto para que alguien se le conecte. Entonces, si el servidor quiere avisarle algo, no tiene a dónde llamarlo. La solución es aprovechar la conexión que el navegador ya abrió hacia el servidor y usarla en los dos sentidos. Eso es BiDir (bidireccional).

Por eso el navegador crea un ObjectAdapter vacío, sin puertos. Ahí pone el objeto que recibe los avisos y lo amarra a su conexión con setAdapter. Así, lo que llegue por esa conexión desde el servidor le cae a ese objeto.

Del lado del servidor, el observador del navegador llega sin dirección. Con observer.ice_fixed(current.con) el servidor dice: "para hablarle a este, usa la misma conexión por la que llegó". Al cliente JavaFX no hace falta hacerle esto, porque él sí tiene un puerto donde escuchar.

## Pregunta 2. ¿Cómo atiende el servidor a TCP y a WebSocket a la vez?

El servidor tiene un solo objeto ChessServiceImpl y lo publica en dos puertas: la 10000 para TCP y la 10002 para WebSocket. Ice se encarga de la parte del transporte: sin importar por cuál puerta llegue la llamada, la convierte al mismo formato y se la entrega al mismo objeto. Por eso la lógica del juego (salas, reglas, puntos) no se escribe dos veces y los jugadores de escritorio y de web pueden jugar entre sí.

## Pregunta 3. ¿Cómo crea slice2js el objeto ChessApp y por qué va primero Ice.min.js?

slice2js toma el contrato ChessService.ice y lo traduce a JavaScript. El archivo que genera, cuando corre en el navegador, guarda todo en window.ChessApp: los tipos (Position, GameState, etc.), el proxy del servicio y la clase del observador.

Pero ese archivo está construido encima de las piezas de Ice: usa sus funciones para definir los tipos, los proxies y los números largos. Si Ice.min.js no se carga antes, esas piezas no existen todavía y el archivo falla. Por eso en chessClientService.js primero se importa Ice.min.js y después ChessService.js.

## Pregunta 4. ¿Por qué el servidor vuelve a revisar cada jugada?

Las ayudas que muestra la página (los puntos de dónde se puede mover) son solo eso, una ayuda visual. Ese código corre en el computador del jugador y cualquiera lo podría modificar o saltarse la página y mandar la jugada directamente. Si el servidor confiara en lo que le llega, alguien podría hacer jugadas ilegales, mover en el turno del otro o mover siendo espectador.

Por eso GameRoom.makeMove vuelve a revisar todo: de quién es el turno, si esa persona es jugador y si la jugada es legal. Si algo está mal, la rechaza. El servidor es el que manda y todos los clientes, sean web o escritorio, ven la misma partida.
