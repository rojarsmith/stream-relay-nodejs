const { WebSocket } = require('ws');
const http = require('http');
const fs = require('fs');
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

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

// Client
const CLIENT_PORT = process.env.CLIENT_PORT || 9090; // Define the port for the client server
const app = express();

app.use(express.static(
    path.join(__dirname, '../public')
));

app.listen(CLIENT_PORT, () => {
    console.log(`Static server running on http://127.0.0.1:${CLIENT_PORT}`);
});

// ffmpeg
let RTSP_URL = process.env.RTSP_URL || 'rtsp://169.254.113.84:554/user=admin_password=tlJwpbo6_channel=1_stream=0&amp;onvif=0.sdp?real_st';

console.log(ffmpegPath)
const ffmpeg = spawn(ffmpegPath, [
    '-i', RTSP_URL,
    '-q', '0',
    '-f', 'mpegts',
    '-codec:v', 'mpeg1video',
    '-s', '1920x1080',
    'http://127.0.0.1:9091/',
]);
