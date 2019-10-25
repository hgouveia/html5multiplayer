export interface IEventHandler {
    attachEvents(client: SocketIO.Socket): void;
}
