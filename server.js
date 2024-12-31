const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let numbers = [];

// サーバーのルートを指定（クライアントのHTMLを返す）
app.use(express.static('public'));

// クライアントからの接続を待機
io.on('connection', (socket) => {
    console.log('a user connected');

    // 新しい数字を受け取る処理
    socket.on('newNumber', (number) => {
        if (number >= 1 && number <= 75 && !numbers.includes(number)) {
            numbers.push(number);
            io.emit('updateNumbers', numbers);  // 全クライアントに更新を通知
        }
    });

    // 数字リセット処理
    socket.on('resetNumbers', () => {
        numbers = [];
        io.emit('updateNumbers', numbers);  // 全クライアントにリセットを通知
    });

    // 切断時の処理
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// サーバーを3000番ポートで起動
server.listen(3000, () => {
    console.log('listening on *:3000');
});
