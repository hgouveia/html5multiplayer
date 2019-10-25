import { INPUT_KEY, SERVER_EVENTS } from '../../common/constants';
import { Entity } from './Entity';

export class StatsBox extends Entity {
    private statsList: any[] = [];
    private lastKeyState: boolean = false;
    private isVisible: boolean = false;

    constructor(x: number, y: number, width: number, height: number) {
        super('statsBox', x, y, 0, width, height);
    }

    public update(elapsedTime: number): void {
        const currentKeyState: boolean = this.gameInstance.getKeyStatus(INPUT_KEY.L);
        if (currentKeyState !== this.lastKeyState) {
            // Request the stats from the server and wait until the response
            this.gameInstance.getWS()
                .emit(SERVER_EVENTS.STATS, (data: any[]) => this.statsList = data);
        }
        this.lastKeyState = currentKeyState;

        // Show while is key hold down
        this.isVisible = currentKeyState;
    }

    public draw(ctx: CanvasRenderingContext2D): void {

        if (this.isVisible && this.statsList.length) {
            const tablePadding: number = 20;
            const columnGap: number = this.width / 3;
            ctx.save();

            // Blue Rect
            ctx.fillStyle = 'blue';
            ctx.globalAlpha = 0.2;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Font
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 1;

            // Header
            ctx.fillText('Player:', this.x + tablePadding, this.y + tablePadding);
            ctx.fillText('Kill:', this.x + columnGap * 1, this.y + tablePadding);
            ctx.fillText('Dead:', this.x + columnGap * 2, this.y + tablePadding);

            // Stats
            this.statsList.forEach((playerStat: any, index: number) => {
                const incrementY: number = (this.y + (tablePadding * 2)) + (tablePadding * index);
                ctx.fillText(playerStat.name, this.x + tablePadding, incrementY);
                ctx.fillText(playerStat.kill, this.x + columnGap * 1, incrementY);
                ctx.fillText(playerStat.dead, this.x + columnGap * 2, incrementY);
            });
            ctx.restore();
        }
    }
}
