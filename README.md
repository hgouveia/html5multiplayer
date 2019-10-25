# Multiplayer Game

A very basic multiplayer implementations using HTML5 Canvas and socket.io for learning purpose

[Demo](https://game.joyalstudios.com/html5multiplayer) 

## Usage

```bash
npm install
npm run build
```

Access via http://localhost:3478/play to play the game

Access stats info via http://localhost:3478/list

Running using **docker-compose** 
```bash
docker-compose up -d
```

or plain docker

Build:
```bash
docker build -t hgouveia/html-mp:latest .
```
Run:
```
docker run -d --name mp-game -e PORT=3478 -e DEBUG=ts-mp:* -p 3478:3478 hgouveia/html-mp:latest
```

if you want to hide the port, you could use Nginx Proxy

```conf
server {
    listen 80;
    root /www/game;
    server_name mydomain.com;

    location /mygame/ {
      proxy_pass http://127.0.0.1:3478/;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## TODO
- Move HIT/DIE/BULLETS events to be processed on the server
- Add basic predictions
- Add security aspects (for ex: any player data could be altered via client)

## License

Read [License](LICENSE) for more licensing information.

## Contributing

Read [here](CONTRIBUTING.md) for more information.