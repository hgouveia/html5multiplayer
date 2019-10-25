import { toRad } from '../../common/helpers';
import { Entity } from './Entity';

export class Bullet extends Entity {
    private speed: number = 300;
    private color: string = '#FFA420';

    constructor(id: string, x: number, y: number, angle: number) {
        super(id, x, y, angle, 5, 1);
    }

    public update(elapsedTime: number): void {
        this.advance(this.speed * elapsedTime);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(toRad(this.angle));
        ctx.fillRect(-this.width / 2 + 15, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}
