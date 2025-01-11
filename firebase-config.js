// Firebaseの設定
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

// Firebaseアプリの初期化
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.getDatabase(app);
