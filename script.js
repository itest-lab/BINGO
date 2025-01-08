// Firebase 設定（Firebaseコンソールから取得した情報を記載）
const firebaseConfig = {
    apiKey: "AIzaSyBv7bPCjXzKEtzqGtmWl9fJWLCw_1qXOIc",
    authDomain: "bingo-main.firebaseapp.com",
    databaseURL: "https://bingo-main-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bingo-main",
    storageBucket: "bingo-main.firebasestorage.app",
    messagingSenderId: "945725247317",
    appId: "1:945725247317:web:bfb58e8a76b452665b69dc",
    measurementId: "G-QJJ73C5KBX"
};

// Firebase 初期化
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM 要素
const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const startBtn = document.getElementById('start');
const setNumberBtn = document.getElementById('set-number');
const manualNumberInput = document.getElementById('manual-number');

// 状態
let history = [];
let currentNumber = null;

// 過去の数字をリアルタイムで同期
const historyRef = ref(db, 'bingo/history');
onValue(historyRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    history = data;
    updateHistory();
  }
});

// 現在の数字をリアルタイムで同期
const currentRef = ref(db, 'bingo/current');
onValue(currentRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    currentNumber = data;
    currentEl.textContent = currentNumber;
  }
});

// スタートボタンでランダム生成
startBtn.addEventListener('click', () => {
  const interval = setInterval(() => {
    currentNumber = Math.floor(Math.random() * 75) + 1; // 1〜75のランダム数字
    currentEl.textContent = currentNumber;
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    if (!history.includes(currentNumber)) {
      history.push(currentNumber);
      updateDatabase();
    }
  }, 3000); // 3秒後停止
});

// 手動入力で設定
setNumberBtn.addEventListener('click', () => {
  const input = parseInt(manualNumberInput.value, 10);
  if (!isNaN(input) && input > 0 && input <= 75 && !history.includes(input)) {
    currentNumber = input;
    updateDatabase();
  }
});

// Firebase データベース更新
function updateDatabase() {
  set(currentRef, currentNumber);
  set(historyRef, history);
}

// 過去の数字を表示
function updateHistory() {
  historyEl.innerHTML = history.join(', ');
}
