import debug, { Debugger } from 'debug';
import { PLAYER_EVENTS, SERVER_EVENTS, WS_EVENTS } from '../../common/constants';
import { IPlayer } from '../../common/IPlayer';
import { PlayersHandler } from '../../common/PlayersHandler';
import { Player } from '../lib/Player';
import { IEventHandler } from './IEventHandler';

const dinfo: Debugger = debug('ts-mp:server:ws:playerevents');

export class PlayerEventsHandler implements IEventHandler {

    constructor(
        protected socket: SocketIO.Server,
        protected clients: { [id: string]: SocketIO.Socket },
        protected playersHandler: PlayersHandler,
    ) { }

    /**
     *
     *
     * @param {SocketIO.Socket} client
     * @memberof PlayerEventsHandler
     */
    public attachEvents(client: SocketIO.Socket): void {

        // Default events from websocket
        client.on(WS_EVENTS.CLIENT_DISCONNECT, () => this.onClientDisconnect(client));

        // Listen for new player
        client.on(`${PLAYER_EVENTS.JOIN}`, (data: any, successFn: any) =>
            this.onPlayerJoined(client, data, successFn));

        // Listen for move player
        client.on(`${PLAYER_EVENTS.MOVE}`, (data: any) => this.onMovePlayer(client, data));

        // Listen for player fire
        client.on(`${PLAYER_EVENTS.SHOT}`, (data: any) => this.onFireBullet(client, data));

        // Listen for player hit
        client.on(`${PLAYER_EVENTS.HIT}`, (data: any) => this.onPlayerHit(client, data));

    }

    /**
     *
     *
     * @protected
     * @param {SocketIO.Socket} client
     * @param {*} data
     * @memberof PlayerEventsHandler
     */
    protected onPlayerJoined(client: SocketIO.Socket, data: any, successFn: any): void {
        dinfo(`player joined: ${data.name} - [${client.id}]`);

        const player: Player = new Player(
            client.id,
            data.name,
            data.x || 0,
            data.y || 0,
            data.angle || 0,
            client,
        );

        const playerList: IPlayer[] = this.playersHandler.getPlayers()
            .map((p: Player) => p.toNetPackage());
        this.playersHandler.addPlayer(player);

        // Notifies to the user that succesfuly joined to the game
        successFn();

        // Broadcast new player to connected socket clients
        client.broadcast.emit(`${PLAYER_EVENTS.JOIN}`, player.toNetPackage());
        // Sent all connected player to the player
        client.emit(`${SERVER_EVENTS.PLAYER_LIST}`, playerList);
    }

    /**
     *
     *
     * @protected
     * @param {SocketIO.Socket} client
     * @memberof PlayerEventsHandler
     */
    protected onClientDisconnect(client: SocketIO.Socket): void {
        dinfo(`Player has disconnected: ${client.id}`);

        // Remove from the list
        this.playersHandler.removePlayerById(client.id);

        // Broadcast removed player to remaning connected socket clients
        client.broadcast.emit(`${PLAYER_EVENTS.REMOVE}`, { id: client.id });
    }

    /**
     *
     *
     * @protected
     * @param {SocketIO.Socket} client
     * @param {*} data
     * @returns
     * @memberof PlayerEventsHandler
     */
    protected onMovePlayer(client: SocketIO.Socket, data: any): void {
        const player: Player = this.playersHandler.getPlayerById(client.id) as Player;

        if (!player) {
            dinfo(`Player not found: ${client.id}`);
            return;
        }

        // Update player position
        player.angle = data.angle;
        player.x = data.x;
        player.y = data.y;

        // Broadcast updated position to others players
        client.broadcast.emit(`${PLAYER_EVENTS.MOVE}`, player.toNetPackage());
    }

    /**
     *
     *
     * @protected
     * @param {SocketIO.Socket} client
     * @param {*} data
     * @returns
     * @memberof PlayerEventsHandler
     */
    protected onFireBullet(client: SocketIO.Socket, data: any): void {
        const player: Player = this.playersHandler.getPlayerById(client.id) as Player;

        if (!player) {
            dinfo(`Player not found: ${client.id}`);
            return;
        }

        // Relay bullet spawn point from the player to all players
        client.broadcast.emit(`${PLAYER_EVENTS.SHOT}`, {
            id: player.id,
            x: data.x,
            y: data.y,
            angle: data.angle,
        });
    }

    /**
     *
     *
     * @protected
     * @param {SocketIO.Socket} client
     * @param {*} data
     * @memberof PlayerEventsHandler
     */
    protected onPlayerHit(client: SocketIO.Socket, data: any): void {
        const player: Player = this.playersHandler.getPlayerById(client.id) as Player;

        // Calculate the hit damage
        player.hit();

        // Relay to other players
        client.broadcast.emit(`${PLAYER_EVENTS.HIT}`, {
            id: player.id,
            hitBy: data.hitBy,
            life: player.getLife(),
        });

        // check if player is dead
        if (player.getLife() <= 0) {
            this.onPlayerDead(client, player, data);
        }
    }

    /**
     *
     *
     * @private
     * @param {SocketIO.Socket} client
     * @param {Player} player
     * @param {*} data
     * @memberof PlayerEventsHandler
     */
    private onPlayerDead(client: SocketIO.Socket, player: Player, data: any): void {

        // Reset player attributes
        player.dead();

        // Send to all players
        this.socket.emit(`${PLAYER_EVENTS.DIE}`, { id: player.id, killedBy: data.hitBy });

        let killedByName = 'unknown';
        const killerPlayer: Player = this.playersHandler.getPlayerById(data.hitBy) as Player;

        if (killerPlayer) {
            killerPlayer.addKill();
            killedByName = killerPlayer.name;
            this.clients[data.hitBy].emit(`${PLAYER_EVENTS.KILLED_PLAYER}`, { id: player.id, name: player.name });
        }

        dinfo(`Player ${player.name} was killed by ${killedByName}`);
    }

}
