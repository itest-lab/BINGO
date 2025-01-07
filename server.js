const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
let numbers = []; // 数字リスト
// 静的ファイルの提供（ルートディレクトリから提供）
app.use(express.static(__dirname)); // これでルートディレクトリ内のファイルを提供
// サーバー起動
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // 'index.html'がルートパスで表示される
});
io.on('connection', (socket) => {
    console.log('新しいクライアントが接続しました');
    // クライアントに現在の数字を送信
    socket.emit('updateNumbers', numbers);
    // クライアントから送信された「newNumber」を受け取る
    socket.on('newNumber', (number) => {
        console.log('新しい数字:', number);
        numbers.push(number); // 数字を保存
        io.emit('updateNumbers', numbers); // クライアントに数字を更新して送信
    });
    // 数字の編集が送信されたとき
    socket.on('editNumber', ({ index, value }) => {
        if (index >= 0 && index < numbers.length) {
            const oldValue = numbers[index]; // 編集前の値を取得
            console.log(`数字編集: 変更前: ${oldValue}, 新しい値: ${value}`); // 編集前と新しい値をログに表示
            numbers[index] = value; // 新しい値に更新
            io.emit('updateNumbers', numbers); // 全てのクライアントに更新された数字を送信
        } else {
            console.log(`無効なインデックス: ${index}, 編集されませんでした。`);
        }
    });
    // リセットリクエストを受信
    socket.on('resetNumbers', () => {
        console.log('リセットがリクエストされました');
        numbers = [];
        io.emit('updateNumbers', numbers); // すべてのクライアントに更新を通知
    });
});
// サーバーが正常に起動しているか確認
server.listen(3000, () => {
    console.log('サーバーがポート3000で起動しました');
});
