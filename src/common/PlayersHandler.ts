import { IPlayer } from './IPlayer';

/**
 *
 *
 * @export
 * @class PlayersHandler
 */
export class PlayersHandler {

    /**
     *
     *
     * @protected
     * @type {IPlayer[]}
     * @memberof PlayersHandler
     */
    protected players: IPlayer[] = [];
    protected removedPlayers: IPlayer[] = [];

    /**
     *
     *
     * @returns {IPlayer[]}
     * @memberof PlayersHandler
     */
    public getPlayers(): IPlayer[] {
        return this.players;
    }

    /**
     *
     *
     * @returns {IPlayer[]}
     * @memberof PlayersHandler
     */
    public getRemovedPlayers(): IPlayer[] {
        return this.removedPlayers;
    }

    /**
     *
     *
     * @param {IPlayer} player
     * @memberof PlayersHandler
     */
    public addPlayer(player: IPlayer): void {
        this.players.push(player);
    }

    /**
     *
     *
     * @param {IPlayer} player
     * @memberof PlayersHandler
     */
    public updatePlayer(player: IPlayer): void {
        this.players = this.players.map(
            (p) => p.id === player.id ? { p, ...player } : p,
        ) as IPlayer[];
    }

    /**
     *
     *
     * @param {string} id
     * @returns {IPlayer}
     * @memberof PlayersHandler
     */
    public removePlayerById(id: string): IPlayer {
        const removedPlayer = this.getPlayerById(id);
        if (removedPlayer) {
            this.removedPlayers.push(removedPlayer);
        }
        this.players = this.players.filter((p) => p.id !== id);

        return removedPlayer;
    }

    /**
     *
     *
     * @param {string} id
     * @returns {IPlayer}
     * @memberof PlayersHandler
     */
    public getPlayerById(id: string): IPlayer {
        return this.players.find((player) => player.id === id) || null;
    }

    /**
     *
     *
     * @memberof PlayersHandler
     */
    public clear(): void {
        this.players = [];
        this.removedPlayers = [];
    }

}
