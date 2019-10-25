export const WS_EVENTS = {
    SOCKET_CONNECT: 'connect',
    SOCKET_CONNECTION: 'connection',
    SOCKET_DISCONNECT: 'disconnect',
    CLIENT_DISCONNECT: 'disconnect',
};

export enum SERVER_EVENTS {
    MESSAGE = 100,
    PLAYER_LIST,
    STATS,
}

export enum PLAYER_EVENTS {
    JOIN = 200,
    MOVE,
    SHOT,
    HIT,
    DIE,
    REMOVE,
    SENT_MESSAGE,
    KILLED_PLAYER,
}

export const INPUT_KEY = {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    SPACE: ' ',
    L: 'l',
};
