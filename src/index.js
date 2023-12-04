const { WebSocket } = require('ws');

// Websocket Server
let WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 9092;

let wss = new WebSocket.Server({ port: WEBSOCKET_PORT, perMessageDeflate: false });
wss.connectionCount = 0;
wss.on('connection', function (socket, upgradeReq) {
    wss.connectionCount++;
    console.log(
        'New WebSocket Connection: ',
        (upgradeReq || socket.upgradeReq).socket.remoteAddress,
        (upgradeReq || socket.upgradeReq).headers['user-agent'],
        '(' + wss.connectionCount + ' total)'
    );
    socket.on('close', function (code, message) {
        wss.connectionCount--;
        console.log(
            'Disconnected WebSocket (' + wss.connectionCount + ' total)'
        );
    });
});

console.log('Awaiting WebSocket connections on ws://127.0.0.1:' + WEBSOCKET_PORT + '/');
