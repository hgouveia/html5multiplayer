import { intersectRect, IRect, toRad } from '../../common/helpers';
import Game from '../lib/Game';

export interface IEntity {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    gameInstance: Game;
    getRect(): IRect;
    isOutOfScreen(limitX: number, limitY: number): boolean;
    advance(speed: number): void;
    update(elapsedTime: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    setGameInstance(game: Game): void;
    intersect(target: IEntity): boolean;
}

export abstract class Entity implements IEntity {
    public gameInstance: Game = null;

    constructor(
        public id: string,
        public x: number,
        public y: number,
        public angle: number,
        public width: number,
        public height: number,
    ) { }

    public advance(speed: number): void {
        const ang: number = (this.angle < 0)
            ? (this.angle % 360) + 360
            : this.angle % 360;

        this.x += speed * Math.cos(toRad(ang));
        this.y += speed * Math.sin(toRad(ang));
    }

    public getRect(): IRect {
        const hW: number = this.width / 2;
        const hH: number = this.height / 2;
        return {
            top: this.y - hH,
            right: this.x + hW,
            bottom: this.y + hH,
            left: this.x - hW,
        } as IRect;
    }

    public isOutOfScreen(limitX: number, limitY: number): boolean {
        const hW: number = this.width / 2;
        const hH: number = this.height / 2;
        return (
            this.x + hW > limitX ||
            this.y - hH < 0 ||
            this.y + hH > limitY ||
            this.x - hW < 0
        );
    }

    public intersect(target: IEntity): boolean {
        return intersectRect(this.getRect(), target.getRect());
    }

    public setGameInstance(game: Game): void {
        this.gameInstance = game;
    }

    public toNetPackage(): any {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            angle: this.angle,
        };
    }

    public abstract update(elapsedTime: number): void;
    public abstract draw(ctx: CanvasRenderingContext2D): void;
}
