import { connect } from 'socket.io-client';
import { PLAYER_EVENTS, SERVER_EVENTS, WS_EVENTS } from '../../common/constants';
import { lerp } from '../../common/helpers';
import { IPlayer } from '../../common/IPlayer';
import { PlayersHandler } from '../../common/PlayersHandler';
import { Bullet } from '../entities/Bullet';
import { Player } from '../entities/Player';
import Game from './Game';

/**
 *
 *
 * @export
 * @class WebSockerHandler
 */
export class WebSocketHandler {

    public isConnected: boolean = false;

    /**
     *
     *
     * @protected
     * @type {SocketIOClient.Socket}
     * @memberof WebSockerHandler
     */
    protected socket: SocketIOClient.Socket;

    /**
     *
     *
     * @protected
     * @type {{ [id: string]: SocketIOClient.Socket }}
     * @memberof WebSockerHandler
     */
    protected clients: { [id: string]: SocketIOClient.Socket } = {};

    protected player: Player;

    protected playersHandler: PlayersHandler;

    /**
     * Creates an instance of WebSockerHandler.
     * @param {string} socketURL
     * @param {Game} gameInstance
     * @memberof WebSockerHandler
     */
    constructor(
        protected socketURL: string,
        protected gameInstance: Game,
    ) {

        this.player = gameInstance.getPlayer();
        this.playersHandler = gameInstance.getPlayersHandler();
    }

    /**
     *
     *
     * @memberof WebSockerHandler
     */
    public connect(): void {
        this.socket = connect(this.socketURL, { path: `${location.pathname}socket.io` });
        this.socket.on(WS_EVENTS.SOCKET_CONNECT, this.onSocketConnected.bind(this));
        this.socket.on(WS_EVENTS.SOCKET_DISCONNECT, this.onSocketDisconnect.bind(this));
        this.socket.on(`${SERVER_EVENTS.PLAYER_LIST}`, (data: any[]) => this.onPlayerList(data));
        this.socket.on(`${SERVER_EVENTS.MESSAGE}`, (data: any) => this.onServerMessage(data));
        this.socket.on(`${PLAYER_EVENTS.JOIN}`, (data: any) => this.onPlayerJoin(data));
        this.socket.on(`${PLAYER_EVENTS.MOVE}`, (data: any) => this.onPlayerMove(data));
        this.socket.on(`${PLAYER_EVENTS.SHOT}`, (data: any) => this.onPlayerShot(data));
        this.socket.on(`${PLAYER_EVENTS.HIT}`, (data: any) => this.onPlayerHit(data));
        this.socket.on(`${PLAYER_EVENTS.DIE}`, (data: any) => this.onPlayerDie(data));
        this.socket.on(`${PLAYER_EVENTS.REMOVE}`, (data: any) => this.onPlayerDisconnect(data));
        this.socket.on(`${PLAYER_EVENTS.KILLED_PLAYER}`, (data: any) => this.onPlayerKilledPlayer(data));
    }

    /**
     *
     *
     * @param {string} type
     * @param {*} data
     * @memberof WebSocketHandler
     */
    public emit(type: number, data: any): void {
        this.socket.emit(`${type}`, data);
    }

    /**
     *
     *
     * @protected
     * @memberof WebSockerHandler
     */
    protected onSocketConnected(): void {
        this.player.id = this.socket.id;
        this.gameInstance.addLog(`Connected to '${this.socketURL}' server`);
        this.socket.emit(`${PLAYER_EVENTS.JOIN}`,
            { name: this.player.name, ...this.player.toNetPackage() },
            () => {
                this.isConnected = true;
                this.gameInstance.addLog(`Join Game as "${this.player.name}"`, 'green');
            });
    }

    /**
     *
     *
     * @protected
     * @memberof WebSockerHandler
     */
    protected onSocketDisconnect(): void {
        this.gameInstance.addLog('Disconnected from socket server', 'red');
        this.isConnected = false;
        this.playersHandler.clear();
    }

    /**
     *
     *
     * @protected
     * @param {*} data
     * @memberof WebSocketHandler
     */
    protected onServerMessage(data: any): void {
        this.gameInstance.addLog(data.msg, data.color);
    }

    /**
     *
     *
     * @protected
     * @param {*} data
     * @memberof WebSocketHandler
     */
    protected onPlayerJoin(data: any): void {
        this.gameInstance.addLog(`New player connected: ${data.name}`, 'blue');
        this.playersHandler.addPlayer(
            new Player(
                data.id,
                data.name,
                data.x,
                data.y,
                data.angle,
                data.life,
                '#FF0000',
                false,
            ),
        );
    }

    /**
     *
     *
     * @protected
     * @param {any[]} data
     * @memberof WebSocketHandler
     */
    protected onPlayerList(data: any[]): void {
        this.playersHandler.clear();

        data.forEach((player: any) => this.playersHandler.addPlayer(
            new Player(
                player.id,
                player.name,
                player.x,
                player.y,
                player.angle,
                player.life,
                '#FF0000',
                false,
            ),
        ));
    }

    /**
     *
     *
     * @protected
     * @param {*} data
     * @returns {void}
     * @memberof WebSocketHandler
     */
    protected onPlayerMove(data: any): void {
        const player: Player = this.playersHandler.getPlayerById(data.id) as Player;

        if (!player) {
            return;
        }

        const amount = 0.5;
        player.angle = lerp(player.angle, data.angle, amount);
        player.x = lerp(player.x, data.x, amount);
        player.y = lerp(player.y, data.y, amount);
    }

    /**
     *
     *
     * @protected
     * @param {*} data
     * @returns {void}
     * @memberof WebSocketHandler
     */
    protected onPlayerShot(data: any): void {
        const player: Player = this.playersHandler.getPlayerById(data.id) as Player;

        if (!player) {
            return;
        }

        this.gameInstance.bullets.push(new Bullet(data.id, data.x, data.y, data.angle));
    }

    /**
     *
     *
     * @protected
     * @param {*} data
     * @returns {void}
     * @memberof WebSocketHandler
     */
    protected onPlayerHit(data: any): void {
        const player: Player = this.playersHandler.getPlayerById(data.id) as Player;

        if (!player) {
            return;
        }

        player.life = data.life;
    }

    /**
     *
     *
     * @protected
     * @param {*} data
     * @memberof WebSocketHandler
     */
    protected onPlayerKilledPlayer(data: any): void {
        this.player.addKill();
        this.gameInstance.addLog(`You killed ${data.name}`, 'orange');
    }

    /**
     *
     *
     * @protected
     * @param {*} data
     * @returns {void}
     * @memberof WebSocketHandler
     */
    protected onPlayerDie(data: any): void {
        const player: Player = (data.id === this.player.id)
            ? this.player
            : this.playersHandler.getPlayerById(data.id) as Player;

        if (!player) {
            return;
        }

        player.killedBy(data.killedBy);
        const killedBy: IPlayer = data.killedBy === this.player.id
            ? this.player
            : this.playersHandler.getPlayerById(data.killedBy);

        this.gameInstance.addLog(
            `<b class="red">${player.name}</b> was killed by <b class="green">${killedBy.name}</b>`,
            'blue',
        );
    }

    /**
     *
     *
     * @protected
     * @param {*} data
     * @memberof WebSocketHandler
     */
    protected onPlayerDisconnect(data: any): void {
        const removedPlayer: IPlayer = this.playersHandler.removePlayerById(data.id);
        this.gameInstance.addLog(`${removedPlayer.name || 'unknown'} has disconnected`, 'red');
    }
}
