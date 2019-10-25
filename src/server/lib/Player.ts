import { IPlayer } from '../../common/IPlayer';

/**
 *
 *
 * @export
 * @class Player
 */
export class Player implements IPlayer {
    /**
     *
     *
     * @protected
     * @type {number}
     * @memberof Player
     */
    protected life: number = 100;

    /**
     *
     *
     * @protected
     * @type {number}
     * @memberof Player
     */
    protected lifeDamage: number = 5;

    /**
     *
     *
     * @protected
     * @type {number}
     * @memberof Player
     */
    protected deadCount: number = 0;

    /**
     *
     *
     * @protected
     * @type {number}
     * @memberof Player
     */
    protected killCount: number = 0;

    /**
     * Creates an instance of Player.
     * @param {string} id
     * @param {string} name
     * @param {number} x
     * @param {number} y
     * @param {number} angle
     * @param {SocketIO.Socket} client
     * @memberof Player
     */
    constructor(
        public id: string,
        public name: string,
        public x: number,
        public y: number,
        public angle: number,
        public client: SocketIO.Socket,
    ) { }

    /**
     *
     *
     * @returns {number}
     * @memberof Player
     */
    public getLife(): number {
        return this.life;
    }

    /**
     *
     *
     * @returns {number}
     * @memberof Player
     */
    public getDead(): number {
        return this.deadCount;
    }

    /**
     *
     *
     * @returns {number}
     * @memberof Player
     */
    public getKill(): number {
        return this.killCount;
    }

    /**
     *
     *
     * @memberof Player
     */
    public addKill(): void {
        this.killCount++;
    }

    /**
     *
     *
     * @memberof Player
     */
    public hit(): void {
        if (this.life > 0) {
            this.life -= this.lifeDamage;
        }
    }

    /**
     *
     *
     * @memberof Player
     */
    public dead(): void {
        this.life = 100;
        this.deadCount++;
    }

    /**
     *
     *
     * @returns {*}
     * @memberof Player
     */
    public toNetPackage(): any {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            angle: this.angle,
            life: this.life,
        };
    }
}
