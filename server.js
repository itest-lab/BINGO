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
            console.log('Received number:', number); // 受信した数字をログに出力
            io.emit('updateNumbers', [number]);  // 新しい数字を全クライアントに送信
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
