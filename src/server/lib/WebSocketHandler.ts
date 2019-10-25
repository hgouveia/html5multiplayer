import debug, { Debugger } from 'debug';
import { Server as httpServer } from 'http';
import { Server as httpsServer } from 'https';
import { listen } from 'socket.io';
import { WS_EVENTS } from '../../common/constants';
import { PlayersHandler } from '../../common/PlayersHandler';
import { PlayerEventsHandler } from '../events/PlayerEventsHandler';
import { ServerEventsHandler } from '../events/ServerEventsHandler';
const dinfo: Debugger = debug('ts-mp:server:ws');

/**
 *
 *
 * @export
 * @class WebSockerHandler
 */
export class WebSocketHandler {
    /**
     *
     *
     * @protected
     * @type {SocketIO.Server}
     * @memberof WebSockerHandler
     */
    protected socket: SocketIO.Server;

    /**
     *
     *
     * @protected
     * @type {ServerEventsHandler}
     * @memberof WebSocketHandler
     */
    protected serverEventsHandler: ServerEventsHandler;

    /**
     *
     *
     * @protected
     * @type {PlayerEventsHandler}
     * @memberof WebSocketHandler
     */
    protected playerEventsHandler: PlayerEventsHandler;

    /**
     *
     *
     * @protected
     * @type {{ [id: string]: SocketIO.Socket }}
     * @memberof WebSockerHandler
     */
    protected clients: { [id: string]: SocketIO.Socket } = {};

    /**
     * Creates an instance of WebSockerHandler.
     * @param {(httpServer | httpsServer)} server
     * @param {PlayersHandler} playersHandler
     * @memberof WebSockerHandler
     */
    constructor(
        protected server: httpServer | httpsServer,
        protected playersHandler: PlayersHandler,
    ) { }

    /**
     *
     *
     * @memberof WebSockerHandler
     */
    public init(): void {
        this.socket = listen(this.server);
        this.socket.sockets.on(WS_EVENTS.SOCKET_CONNECTION, this.attachClientEventsOnConnection.bind(this));
        this.serverEventsHandler = new ServerEventsHandler(this.socket, this.clients, this.playersHandler);
        this.playerEventsHandler = new PlayerEventsHandler(this.socket, this.clients, this.playersHandler);

        dinfo('WS Initialized, is secure:', this.server instanceof httpsServer);
    }

    /**
     *
     *
     * @protected
     * @param {SocketIO.Socket} client
     * @memberof WebSockerHandler
     */
    protected attachClientEventsOnConnection(client: SocketIO.Socket): void {
        dinfo('New player has connected: ', client.id);

        // store client
        this.clients[client.id] = client;

        // Attach Events
        this.serverEventsHandler.attachEvents(client);
        this.playerEventsHandler.attachEvents(client);
    }

}
