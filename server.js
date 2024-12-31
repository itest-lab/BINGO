const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let numbers = []; // グローバル変数で数字を保持

io.on('connection', (socket) => {
    console.log('クライアントが接続しました');

    // クライアントに現在の numbers を送信
    socket.emit('updateNumbers', numbers);

    // クライアントから新しい数字が送られた場合
    socket.on('newNumber', (number) => {
        if (!numbers.includes(number)) {
            numbers.push(number);
            io.emit('updateNumbers', numbers); // 全クライアントに更新通知
        }
    });

    // リセット要求
    socket.on('resetNumbers', () => {
        numbers = [];
        io.emit('updateNumbers', numbers); // 全クライアントにリセットを通知
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('サーバーがポート 3000 で起動しました');
});
