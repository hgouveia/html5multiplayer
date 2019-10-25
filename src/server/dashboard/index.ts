import { Application, NextFunction, Request, Response, static as eStatic } from 'express';
import { resolve as pathResolve } from 'path';
import { PlayersHandler } from '../../common/PlayersHandler';
/**
 *
 *
 * @export
 * @class Dashboard
 */
export class Dashboard {
    private rootPath = pathResolve(__dirname, '../../../');

    constructor(
        protected app: Application,
        protected playersHandler: PlayersHandler,
    ) { }

    /**
     *
     *
     * @memberof Dashboard
     */
    public init(): void {
        // express setup
        this.app.set('views', __dirname + '/views');
        this.app.set('view engine', 'ejs');
        // this.app.use(eStatic(__dirname));
        this.app.use(eStatic(this.rootPath));
        this.app.use(this.errorHandler);
        this.routes();
    }

    /**
     *
     *
     * @private
     * @memberof Dashboard
     */
    private routes(): void {
        // Home
        this.app.get('/', (req: Request, res: Response) => {
            res.render('layout', { section: 'home', body: '<h1>Server</h1>' });
        });

        // Play
        this.app.get('/play', (req: Request, res: Response) => {
            res.sendFile(`${this.rootPath}/index.html`);
        });

        // List
        this.app.get('/list', (req: Request, res: Response) => {
            res.render('layout', {
                section: 'playerList',
                players: this.playersHandler.getPlayers(),
                removedPlayers: this.playersHandler.getRemovedPlayers(),
            });
        });
    }

    /**
     *
     *
     * @private
     * @param {*} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof Dashboard
     */
    private errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
        res.status(err.status || 500);
        res.render('layout', {
            section: 'error',
            message: err.message,
            error: (this.app.get('env') === 'development') ? err : {},
        });
    }
}
