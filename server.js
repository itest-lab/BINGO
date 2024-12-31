const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');  // pathモジュールをインポート
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const basicAuth = require('express-basic-auth');

app.use(basicAuth({
    users: { 'admin': 'password' },
    challenge: true,
    unauthorizedResponse: 'Unauthorized'
}));

app.get('/admin', (req, res) => {
    res.send('管理者ページ');
});

// 静的ファイルを提供する設定（publicフォルダ内のファイルを提供）
app.use(express.static(path.join(__dirname, 'public')));

let numbers = []; // 現在表示している数字

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('updateNumbers', numbers);

    socket.on('newNumber', (number) => {
        if (!numbers.includes(number)) {
            numbers.push(number); // 新しい数字を追加
            io.emit('updateNumbers', numbers);
        }
    });

    socket.on('editNumber', (data) => {
        numbers[data.index] = data.value; // 数字の編集
        io.emit('updateNumbers', numbers);
    });

    socket.on('resetNumbers', () => {
        numbers = []; // 数字をリセット
        io.emit('updateNumbers', numbers);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
