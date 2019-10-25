import debug, { Debugger } from 'debug';
import { SERVER_EVENTS } from '../../common/constants';
import { PlayersHandler } from '../../common/PlayersHandler';
import { Player } from '../lib/Player';
import { IEventHandler } from './IEventHandler';

const dinfo: Debugger = debug('ts-mp:server:ws:playerevents');

export class ServerEventsHandler implements IEventHandler {

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
        // Listen for player stats request
        client.on(`${SERVER_EVENTS.STATS}`, (responseFn: any) => this.onPlayersStats(client, responseFn));
    }

    /**
     *
     *
     * @protected
     * @param {SocketIO.Socket} client
     * @memberof PlayerEventsHandler
     */
    protected onPlayersStats(client: SocketIO.Socket, responseFn: any): void {
        const playersStats = this.playersHandler.getPlayers()
            .reduce((acc: any[], player: Player) => {
                acc.push({
                    name: player.name,
                    kill: player.getKill(),
                    dead: player.getDead(),
                });
                return acc;
            }, []);
        responseFn(playersStats);
        dinfo(`Players Stats[${playersStats.length}]`, playersStats);
    }
}
