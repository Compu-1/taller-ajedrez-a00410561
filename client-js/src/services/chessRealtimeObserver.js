/**
 * Gestor de actualizaciones en tiempo real para el cliente Web mediante
 * Conexiones Bidireccionales (BiDir) sobre WebSockets en ZeroC Ice.
 * Implementa el servant ChessObserver en el navegador sin usar polling.
 */

export class ChessRealtimeObserver {
    constructor(Ice, ChessApp) {
        this.Ice = Ice;
        this.ChessApp = ChessApp;
        this.adapter = null;
        this.identity = null;
        this.onStateChangedCallback = null;
        this.onGameFinishedCallback = null;
    }

    /**
     * Crea el servant de ChessObserver, configura el ObjectAdapter bidireccional
     * sobre la conexión WebSocket activa y registra el observador en la sala.
     */
    async subscribe(communicator, servicePrx, roomCode, nickname, { onStateChanged, onGameFinished } = {}) {
        await this.cleanupAdapter();
        this.onStateChangedCallback = onStateChanged;
        this.onGameFinishedCallback = onGameFinished;

        const self = this;
        class WebChessObserverServant extends this.ChessApp.ChessObserver {
            onGameStateChanged(newState, _current) {
                if (self.onStateChangedCallback) {
                    self.onStateChangedCallback(newState);
                }
            }

            onGameFinished(finalState, winnerNickname, pointsDelta, _current) {
                if (self.onGameFinishedCallback) {
                    self.onGameFinishedCallback(finalState, winnerNickname, pointsDelta);
                }
            }
        }

        this.adapter = await communicator.createObjectAdapter("");
        this.identity = new this.Ice.Identity(this.Ice.generateUUID(), "ChessObserver");
        this.adapter.add(new WebChessObserverServant(), this.identity);
        await this.adapter.activate();

        const connection = await servicePrx.ice_getConnection();
        connection.setAdapter(this.adapter);

        const observerPrx = this.ChessApp.ChessObserverPrx.uncheckedCast(this.adapter.createProxy(this.identity));
        await servicePrx.registerObserver(roomCode, nickname, observerPrx);
    }

    /**
     * Desvincula el observador de la sala en el servidor y limpia el adaptador local.
     */
    async unsubscribe(servicePrx, roomCode, nickname) {
        this.onStateChangedCallback = null;
        this.onGameFinishedCallback = null;
        try {
            await servicePrx.unregisterObserver(roomCode, nickname);
        } catch (error) {
            console.warn("Error al desregistrar el observador:", error);
        }
        await this.cleanupAdapter();
    }

    async cleanupAdapter() {
        if (this.adapter) {
            try {
                this.adapter.remove(this.identity);
            } catch (error) {
                // la identidad ya no estaba registrada
            }
            await this.adapter.destroy();
        }
        this.adapter = null;
        this.identity = null;
    }
}
