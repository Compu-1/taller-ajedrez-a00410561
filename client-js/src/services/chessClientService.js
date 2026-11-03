import "../../lib/Ice.min.js";
import "./ChessService.js";
import { ChessRealtimeObserver } from "./chessRealtimeObserver.js";

/**
 * Servicio de comunicación RPC con ZeroC Ice sobre WebSockets.
 * Encapsula el ciclo de vida del Communicator, el proxy de ChessService
 * y la suscripción en tiempo real mediante ChessRealtimeObserver.
 */

export class ChessClientService {
    constructor() {
        this.Ice = window.Ice;
        this.ChessApp = window.ChessApp;
        this.communicator = null;
        this.service = null;
        this.realtimeObserver = null;
        this.isConnected = false;
        this.nickname = null;
        this.currentRoomCode = null;
        this.role = null;
        this.assignedColor = null;
    }

    validateRuntime() {
        this.Ice = window.Ice;
        this.ChessApp = window.ChessApp;
        if (!this.Ice) {
            throw new Error("No se encontró el runtime de ZeroC Ice (lib/Ice.min.js).");
        }
        if (!this.ChessApp) {
            throw new Error("No se encontró el contrato ChessApp (src/services/ChessService.js).");
        }
    }

    async connect(host, port, nickname) {
        this.validateRuntime();

        if (this.communicator) {
            await this.communicator.destroy();
            this.communicator = null;
        }

        const initData = new this.Ice.InitializationData();
        initData.properties = this.Ice.createProperties();
        initData.properties.setProperty("Ice.MessageSizeMax", "2048");
        initData.properties.setProperty("Ice.ACM.Client.Timeout", "0");
        initData.properties.setProperty("Ice.ACM.Client.Heartbeat", "3");
        this.communicator = this.Ice.initialize(initData);

        const targetHost = host || "127.0.0.1";
        const targetPort = port || 10002;
        const base = this.communicator.stringToProxy(`ChessService:ws -h ${targetHost} -p ${targetPort}`);
        this.service = await this.ChessApp.ChessServicePrx.checkedCast(base);
        if (!this.service) {
            throw new Error("Proxy inválido para ChessService.");
        }

        this.nickname = nickname;
        this.realtimeObserver = new ChessRealtimeObserver(this.Ice, this.ChessApp);
        this.isConnected = true;
    }

    async getLobbyData() {
        this.ensureConnected();
        const [rooms, leaderboard] = await Promise.all([
            this.service.getActiveRooms(),
            this.service.getLeaderboard()
        ]);
        return { rooms, leaderboard };
    }

    async createRoom(nickname) {
        this.ensureConnected();
        if (nickname) {
            this.nickname = nickname;
        }
        return await this.service.createRoom(this.nickname);
    }

    async joinRoom(roomCode, nickname) {
        this.ensureConnected();
        if (nickname) {
            this.nickname = nickname;
        }
        const normalizedCode = roomCode.trim().toUpperCase();
        const result = await this.service.joinRoom(normalizedCode, this.nickname);
        this.currentRoomCode = normalizedCode;
        this.role = result.role;
        this.assignedColor = result.assignedColor;
        return result;
    }

    async subscribeToRoom(listeners = {}) {
        this.ensureConnected();
        await this.realtimeObserver.subscribe(this.communicator, this.service, this.currentRoomCode, this.nickname, listeners);
    }

    async makeMove(fromRow, fromCol, toRow, toCol) {
        this.ensureConnected();
        const fromPos = new this.ChessApp.Position(fromRow, fromCol);
        const toPos = new this.ChessApp.Position(toRow, toCol);
        return await this.service.makeMove(this.currentRoomCode, this.nickname, fromPos, toPos);
    }

    async resign() {
        this.ensureConnected();
        await this.service.resign(this.currentRoomCode, this.nickname);
    }

    async leaveRoom() {
        if (!this.isConnected || !this.currentRoomCode) {
            return;
        }
        await this.realtimeObserver.unsubscribe(this.service, this.currentRoomCode, this.nickname);
        try {
            await this.service.leaveRoom(this.currentRoomCode, this.nickname);
        } catch (error) {
            console.warn("Error al abandonar la sala:", error);
        }
        this.currentRoomCode = null;
        this.role = null;
        this.assignedColor = null;
    }

    ensureConnected() {
        if (!this.isConnected || !this.service) {
            throw new Error("No hay conexión con el servidor de ajedrez.");
        }
    }
}
