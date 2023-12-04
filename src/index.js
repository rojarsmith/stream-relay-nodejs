const { WebSocket } = require('ws');
const http = require('http');
const fs = require('fs');

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
wss.broadcast = function (data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

console.log('Awaiting WebSocket connections on ws://127.0.0.1:' + WEBSOCKET_PORT + '/');

// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
let STREAM_SECRET = process.env.STREAM_SECRET || '';
let STREAM_PORT = process.env.STREAM_PORT || 9091;
let RECORD_STREAM = process.env.RECORD_STREAM || false;

let ss = http.createServer(function (request, response) {
    const params = request.url.slice(1).split('/'); // Start with '/'

    console.log(params)
    if (params[0] !== STREAM_SECRET) {
        console.log(
            'Failed Stream Connection: ' + request.socket.remoteAddress + ':' +
            request.socket.remotePort + ' - wrong secret.'
        );
        response.end();
    }

    response.setTimeout(0);
    console.log(
        'Stream Connected: ' +
        request.socket.remoteAddress + ':' +
        request.socket.remotePort
    );
    request.on('data', function (data) {
        wss.broadcast(data);
        if (request.socket.recording) {
            request.socket.recording.write(data);
        }
    });
    request.on('end', function () {
        console.log('Http close');
        if (request.socket.recording) {
            request.socket.recording.close();
        }
    });

    // Record the stream to a local file?
    if (RECORD_STREAM) {
        var path = 'recordings/' + Date.now() + '.ts';
        request.socket.recording = fs.createWriteStream(path);
    }
})

ss.headersTimeout = 0;
ss.listen(STREAM_PORT); // Keep the socket open for streaming

console.log('Listening for incomming MPEG-TS stream on http://127.0.0.1:' + STREAM_PORT + '/' + STREAM_SECRET);