import Game, { IGameOptions } from './lib/Game';

window.addEventListener('load', (): void => {
    const game: Game = new Game({
        host: location.hostname,
        port: location.port ? parseInt(location.port, 10) : -1,
        width: 1024,
        height: 650,
        canvasId: 'game-canvas',
    } as IGameOptions);
}, true);
