# The Game
A simple multiplayer game using HTML5 Canvas in conjunction with nodejs

This game was made for learning purpose, is not fully complete, you will find bugs, is not ready for commercial or production used, doesn't has any security implementation

[Demo](http://game.joyalstudios.com/html5multiplayer) 

# Install

You will need to install [NodeJS](https://nodejs.org/) before continue

**The game** is in the root directory on this repository, just need to copy and paste to your webserver,and then run inside **scripts/libs/socket.io-client** folder
```bash
html5multiplayer/scripts/libs/socket.io-client$ npm install
```

**The server** is on the "server" folder in this repository, this can be moved wherever you like ex: dedicated server,
then you will need to run

```bash
html5multiplayer/server$ npm install
```

**Note**: if the socket.io is changed to a newer version, you'll need to copy and paste the ""

# Run the server

To run the server just need to type

```bash
html5multiplayer/server$ node server.js
```

To see how many players are in your game you can navigate to  : http://localhost:8000/list

the default settings are 
###Client:
file: **scripts/game/main.js line:6**

host="localhost", port = 8000;
###Server:
file: **server.js line:6** 

port = 8000;

# License
This game is released as it is, it has bugs, is not ready for commercial or production used, doesn't has any security implementation, this was made just for learning purpose
.You can do whatever you want with this code even for commercial use, but you must include the copyright text include on the LICENSE file

License: MIT License

Legal: http://opensource.org/licenses/MIT

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/hgouveia/html5multiplayer/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

