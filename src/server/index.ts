import debug, { Debugger } from 'debug';
import express, { Application } from 'express';
import { Server as httpServer } from 'http';
import { PlayersHandler } from '../common/PlayersHandler';
import { Dashboard } from './dashboard';
import { WebSocketHandler } from './lib/WebSocketHandler';

const PORT: number = parseInt(process.env.PORT, 10) || 3478;
const HOST: string = process.env.HOST || '0.0.0.0';
const dinfo: Debugger = debug('ts-mp:server');

const app: Application = express();
const server: httpServer = app.listen(PORT, HOST);
const playersHandler: PlayersHandler = new PlayersHandler();
const wsHandler: WebSocketHandler = new WebSocketHandler(server, playersHandler);
const dashboard: Dashboard = new Dashboard(app, playersHandler);

wsHandler.init();
dashboard.init();

dinfo(`Server Initialized ${HOST}:${PORT}`);
dinfo(`Dashboard Initialized http://${HOST}:${PORT}/list`);
