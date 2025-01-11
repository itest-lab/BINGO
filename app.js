document.addEventListener("DOMContentLoaded", () => {
  const loginScreen = document.getElementById("login-screen");
  const gameScreen = document.getElementById("game-screen");
  const loginBtn = document.getElementById("login-btn");
  const passwordInput = document.getElementById("password");
  const bingoBoard = document.getElementById("bingo-board");
  const submitNumberBtn = document.getElementById("submit-number");
  const randomStartBtn = document.getElementById("random-start");
  const numberInput = document.getElementById("number-input");
  const currentNumberDisplay = document.getElementById("current-number");

  const db = firebase.database();

  // ログイン処理
  loginBtn.addEventListener("click", () => {
    const password = passwordInput.value;
    if (password === "admin123") { // 簡易的な管理者認証
      loginScreen.style.display = "none";
      gameScreen.style.display = "block";
    } else {
      alert("パスワードが間違っています！");
    }
  });

  // ビンゴボードを生成
  const createBingoBoard = () => {
    const columns = ["B", "I", "N", "G", "O"];
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement("div");
      cell.classList.add("bingo-cell");
      const column = columns[Math.floor(i / 5)];
      cell.dataset.column = column;
      cell.textContent = i === 12 ? "FREE" : Math.floor(Math.random() * 15) + 1 + 15 * (i % 5);
      bingoBoard.appendChild(cell);
    }
  };

  createBingoBoard();

  // 数字送信
  submitNumberBtn.addEventListener("click", () => {
    const number = numberInput.value;
    if (number < 1 || number > 75) {
      alert("1から75の間の数字を入力してください。");
      return;
    }
    firebase.database().ref("bingo/latestNumber").set(number);
  });

  // ランダムスタート
  randomStartBtn.addEventListener("click", () => {
    const randomNum = Math.floor(Math.random() * 75) + 1;
    firebase.database().ref("bingo/latestNumber").set(randomNum);
  });

  // リアルタイム更新
  firebase.database().ref("bingo/latestNumber").on("value", (snapshot) => {
    const latestNumber = snapshot.val();
    currentNumberDisplay.textContent = latestNumber || "--";
  });
});
