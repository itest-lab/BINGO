const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let numbers = []; // 数字リスト

io.on('connection', (socket) => {
    console.log('新しいクライアントが接続しました');

    // クライアントに現在の数字を送信
    socket.emit('updateNumbers', numbers);

    // 新しい数字を受信
    socket.on('newNumber', (number) => {
        console.log('受信した数字:', number);
        numbers.push(number);
        io.emit('updateNumbers', numbers); // すべてのクライアントに送信
    });

    // リセットリクエストを受信
    socket.on('resetNumbers', () => {
        console.log('リセットがリクエストされました');
        numbers = [];
        io.emit('updateNumbers', numbers); // すべてのクライアントに更新を通知
    });
});

server.listen(3000, () => {
    console.log('サーバーがポート3000で起動しました');
});
