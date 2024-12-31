const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let numbers = []; // 数字を保持する配列

io.on('connection', (socket) => {
    console.log('クライアントが接続しました');

    // 初期の numbers をクライアントに送信
    socket.emit('updateNumbers', numbers);

    // 新しい数字を受信
    socket.on('newNumber', (number) => {
        console.log('受信した数字:', number);

        // 数値型に変換して確認
        number = parseInt(number, 10);

        if (isNaN(number)) {
            console.error('無効な値:', number);
            return;
        }

        // 配列に含まれていない場合のみ追加
        if (!numbers.includes(number)) {
            numbers.push(number);
            io.emit('updateNumbers', numbers); // 全クライアントに通知
        }
    });

    // リセット処理
    socket.on('resetNumbers', () => {
        numbers = [];
        io.emit('updateNumbers', numbers); // 全クライアントに通知
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('サーバーがポート 3000 で起動しました');
});
