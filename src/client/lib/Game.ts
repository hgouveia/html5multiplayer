import { rand } from '../../common/helpers';
import { PlayersHandler } from '../../common/PlayersHandler';
import { Bullet } from '../entities/Bullet';
import { Player } from '../entities/Player';
import { StatsBox } from '../entities/StatsBox';
import { WebSocketHandler } from './WebSocketHandler';

export interface IGameOptions {
    host: string;
    port: number;
    width: number;
    height: number;
    canvasId: string;
}

export class Game {
    public ctx: CanvasRenderingContext2D = null;
    public isRunning: boolean = false;
    public inputKeys: { [key: string]: boolean } = {};
    public player: Player = null;
    public bullets: Bullet[] = [];

    private log: HTMLElement = null;
    private lastTime: number = 0;
    private statsBox: StatsBox = null;
    private logTimer: number = 0;
    private wsHandler: WebSocketHandler = null;
    private playersHandler: PlayersHandler = new PlayersHandler();

    constructor(public options: IGameOptions) {
        this.initCanvas();
        this.initInput();
        this.initPlayer();
        this.initWebSocket();
        this.initLog();
        this.initGameLoop();
    }

    public getWS(): WebSocketHandler {
        return this.wsHandler;
    }

    public getPlayer() {
        return this.player;
    }

    public getPlayersHandler(): PlayersHandler {
        return this.playersHandler;
    }

    public getKeyStatus(keyCode: string): boolean {
        keyCode = keyCode.toLowerCase();

        if (!this.inputKeys) {
            return false;
        }

        if (keyCode in this.inputKeys) {
            return this.inputKeys[keyCode];
        }
        return false;
    }

    public addLog(msg: string, color: string = 'white'): void {
        if (!this.log) {
            return;
        }

        const span: HTMLElement = document.createElement('span');
        if (color) {
            span.classList.add(color);
        }
        span.classList.add('message');
        span.innerHTML = msg;

        this.logTimer = 0;
        this.log.appendChild(span);
        this.log.scrollTop = this.log.scrollHeight;
    }

    private initCanvas(): void {
        const canvas: HTMLCanvasElement = document.getElementById(this.options.canvasId) as HTMLCanvasElement;
        const onResize = () => {
            const style: CSSStyleDeclaration = window.getComputedStyle(canvas);
            canvas.width = parseInt(style.getPropertyValue('width'), 10);
            canvas.height = parseInt(style.getPropertyValue('height'), 10);
        };

        canvas.width = this.options.width;
        canvas.height = this.options.height;
        this.ctx = canvas.getContext('2d');
        this.ctx.font = '14px Monospace';

        window.addEventListener('resize', onResize, false);
    }

    private initInput(): void {
        const onKeyEvent = (value: boolean): any => {
            return (event: KeyboardEvent) => {
                const charCode: string = event.key.toLowerCase();
                this.inputKeys[charCode] = value;
            };
        };
        document.addEventListener('keydown', onKeyEvent(true), false);
        document.addEventListener('keyup', onKeyEvent(false), false);
    }

    private initPlayer(): void {
        let playerName: string = 'Guest' + rand(1000, 2000);
        const playerColor: string = '#0000ff';
        const bounds: number = 100;
        const startX: number = rand(bounds, this.options.width - bounds);
        const startY: number = rand(bounds, this.options.height - bounds);
        const startAngle: number = 0;
        const startLife: number = 100;

        const playerNameInput = prompt('Please enter your name', playerName);
        if (playerNameInput != null) {
            playerName = playerNameInput;
        }

        this.player = new Player(
            '0',
            playerName,
            startX,
            startY,
            startAngle,
            startLife,
            playerColor,
            true,
        );
        this.player.setGameInstance(this);
    }

    private initWebSocket(): void {
        const ignoredPorts = [80, 443, -1];
        let socketURL: string = `${location.protocol}//${this.options.host}`;
        if (ignoredPorts.indexOf(this.options.port) === -1) {
            socketURL += `:${this.options.port}`;
        }
        this.wsHandler = new WebSocketHandler(socketURL, this);
        this.wsHandler.connect();
    }

    private initLog(): void {
        this.log = document.getElementById('log');

        const sbWidth: number = 600;
        const sbHeight: number = 400;
        this.statsBox = new StatsBox(
            (this.options.width - sbWidth) / 2,
            (this.options.height - sbHeight) / 2,
            sbWidth,
            sbHeight,
        );
        this.statsBox.setGameInstance(this);
    }

    private initGameLoop(): void {
        const animloop: any = () => {
            this.gameLoop();
            requestAnimationFrame(animloop);
        };
        this.lastTime = Date.now();
        this.isRunning = true;
        animloop();
    }

    private gameLoop(): void {
        if (this.isRunning && this.ctx) {
            this.update();
            this.draw();
        }
    }

    private update(): void {
        const elapsedTime: number = (Date.now() - this.lastTime) / 1000;

        // Remove first element every 5secs from the Chatlog
        if (this.log) {
            this.logTimer += elapsedTime;
            if (this.logTimer > 5) {
                const span: ChildNode = this.log.firstChild;
                if (span) {
                    this.log.removeChild(span);
                }
                this.logTimer = 0;
            }
        }

        if (!this.player || (this.wsHandler && !this.wsHandler.isConnected)) {
            return;
        }

        this.player.update(elapsedTime);
        this.statsBox.update(elapsedTime);
        this.playersHandler.getPlayers().forEach((remotePlayer: Player) => remotePlayer.update(elapsedTime));

        // Update Bullets, if go off the screen, delete
        this.bullets.forEach((bullet) => {
            if (bullet.isOutOfScreen(this.options.width, this.options.height)) {
                this.bullets.splice(this.bullets.indexOf(bullet), 1);
                return;
            }
            bullet.update(elapsedTime);

            if (!this.player.isDead && bullet.id !== this.player.id && bullet.intersect(this.player)) {
                this.bullets.splice(this.bullets.indexOf(bullet), 1);
                this.player.hitBy(bullet.id);
                return;
            }

            // remove bullet on players hit
            this.playersHandler.getPlayers().forEach((remotePlayer: Player) => {
                if (!remotePlayer.isDead && bullet.id !== remotePlayer.id && bullet.intersect(remotePlayer)) {
                    this.bullets.splice(this.bullets.indexOf(bullet), 1);
                }
            });

        });

        this.lastTime = Date.now();
    }

    private draw(): void {
        this.ctx.clearRect(0, 0, this.options.width, this.options.height);

        if (this.wsHandler && !this.wsHandler.isConnected) {
            const text: string = 'Connecting...';
            const textWidth = (text.length * 8) / 2;
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillText(text, (this.options.width / 2) - textWidth, (this.options.height / 2) - 8);
            return;
        }

        if (this.player) {
            this.player.draw(this.ctx);
        }

        this.playersHandler.getPlayers()
            .forEach((remotePlayer: Player) => remotePlayer.draw(this.ctx));
        this.bullets.forEach((bullet) => bullet.draw(this.ctx));

        // UI
        if (this.player) {
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillText('Dead: ' + this.player.getDead(), 10, 20);
            this.ctx.fillText('Kill: ' + this.player.getKill(), 100, 20);
            this.ctx.fillText("Press 'L' key to display stats", this.options.height - 220, 20);
        }

        if (this.statsBox) {
            this.statsBox.draw(this.ctx);
        }
    }
}
export default Game;
