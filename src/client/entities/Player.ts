import { INPUT_KEY, PLAYER_EVENTS } from '../../common/constants';
import { toRad } from '../../common/helpers';
import { IPlayer } from '../../common/IPlayer';
import { Bullet } from './Bullet';
import { Entity } from './Entity';

export class Player extends Entity implements IPlayer {
    public isDead: boolean = false;
    private alpha: number = 1;
    private speed: number = 150;
    private deadCount: number = 0;
    private killCount: number = 0;
    private lifeDamage: number = 5;
    private respawnWait: number = 1500;
    private fontWidth: number = 0;
    private fontSize: number = 12;
    private lastX: number = 0;
    private lastY: number = 0;
    private lastKeyState: boolean = false;
    private flickeringToggle: boolean = false;
    private time: number = 0;

    constructor(
        public id: string,
        public name: string,
        public x: number,
        public y: number,
        public angle: number,
        public life: number,
        public color: string,
        public isLocalPlayer: boolean,
    ) {
        super(id, x, y, angle, 20, 20);
        this.fontWidth = (name.length / 2) * 5;
    }

    public getDead(): number {
        return this.deadCount;
    }

    public getKill(): number {
        return this.killCount;
    }

    public addKill(): void {
        this.killCount++;
    }

    public update(elapsedTime: number): void {

        if (!this.gameInstance) {
            return;
        }

        if (this.isDead) {
            this.time += elapsedTime;

            // flickering
            if (this.time > 0.1) {
                this.time = 0;
                this.alpha = (this.flickeringToggle) ? 1 : 0.5;
                this.flickeringToggle = !this.flickeringToggle;
            }
        }

        // Keyboard
        if (this.isLocalPlayer) {
            this.localPlayerUpdate(elapsedTime);
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {

        if (this.isDead) {
            ctx.globalAlpha = this.alpha;
        }

        ctx.save(); // Save State - saved to be able to rotate only the following draw

        // Body
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(toRad(this.angle));
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        const cannon: any = {
            width: 10,
            height: 3,
        };
        ctx.fillStyle = '#999';
        ctx.fillRect(this.width - cannon.width, -cannon.height / 2, cannon.width, cannon.height);

        ctx.restore(); // End state

        // Life bar
        const lifeBar: any = {
            width: 30,
            height: 5,
            maxWidth: 30,
            color: '#00FF00',
        };

        if (this.life <= 100) { lifeBar.color = '#00FF00'; } // Green - 00FF00
        if (this.life <= 75) { lifeBar.color = '#FFFF00'; } // Yellow - FFFF00
        if (this.life <= 50) { lifeBar.color = '#FFA420'; } // Orange - FFA420
        if (this.life <= 25) { lifeBar.color = '#FF0000'; } // Red	 - FF0000

        lifeBar.width = (this.life * lifeBar.maxWidth) / 100;
        ctx.fillStyle = lifeBar.color;
        ctx.fillRect(this.x - lifeBar.width / 2, this.y - 30, lifeBar.width, lifeBar.height);

        // Name
        ctx.fillStyle = '#FFF';
        ctx.font = this.fontSize + 'px Verdana';
        ctx.fillText(this.name, this.x - this.fontWidth, this.y - 40);

        // Restore Alpha
        ctx.globalAlpha = 1;
    }

    public hitBy(playerId: string): void {
        if (this.life > 0) {
            this.life -= this.lifeDamage;
            this.send(PLAYER_EVENTS.HIT, { id: this.id, hitBy: playerId });
        }
    }

    public killedBy(playerId: string): void {
        this.isDead = true;
        this.deadCount++;
        setTimeout(() => this.wakeup(), this.respawnWait);
    }

    private wakeup(): void {
        this.life = 100;
        this.isDead = false;
    }

    private localPlayerUpdate(elapsedTime: number): void {

        if (!this.isDead) {
            // Space - FIRE
            const currentKeyState: boolean = this.gameInstance.getKeyStatus(INPUT_KEY.SPACE);
            if (currentKeyState !== this.lastKeyState) {
                const bullet: Bullet = new Bullet(this.id, this.x, this.y, this.angle);
                this.send(PLAYER_EVENTS.SHOT, bullet.toNetPackage());
                this.gameInstance.bullets.push(bullet);
            }
            this.lastKeyState = currentKeyState;
        }

        let isMovementUpdated: boolean = false;

        // Right
        if (this.gameInstance.getKeyStatus(INPUT_KEY.RIGHT)) {
            this.angle += this.speed * elapsedTime;
            isMovementUpdated = true;
        }
        // Left
        if (this.gameInstance.getKeyStatus(INPUT_KEY.LEFT)) {
            this.angle -= this.speed * elapsedTime;
            isMovementUpdated = true;
        }
        // Up
        if (this.gameInstance.getKeyStatus(INPUT_KEY.UP)) {
            this.advance(this.speed * elapsedTime);
            isMovementUpdated = true;
        }
        // Down
        if (this.gameInstance.getKeyStatus(INPUT_KEY.DOWN)) {
            this.advance(-this.speed * elapsedTime);
            isMovementUpdated = true;
        }

        // Send local player data to the game server if detect movement
        if (isMovementUpdated) {
            this.send(PLAYER_EVENTS.MOVE, this.toNetPackage());
        }

        if (this.isOutOfScreen(this.gameInstance.options.width, this.gameInstance.options.height)) {
            this.x = this.lastX;
            this.y = this.lastY;
            this.send(PLAYER_EVENTS.MOVE, this.toNetPackage());
        }

        this.lastX = this.x;
        this.lastY = this.y;
    }

    private send(type: number, data: any): void {
        if (!this.gameInstance || !this.gameInstance.getWS()) {
            return;
        }
        // TODO: DIE, HIT event's should be processed by the server
        this.gameInstance.getWS().emit(type, data);
    }
}
