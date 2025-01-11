document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.database(); // Firebaseのデータベース参照を取得

  const bingoBoard = document.getElementById("bingo-board");
  const controls = document.getElementById("controls");
  const adminLoginBtn = document.getElementById("admin-login-btn");
  const adminPopup = document.getElementById("admin-popup");
  const adminPasswordInput = document.getElementById("admin-password");
  const adminLoginSubmit = document.getElementById("admin-login-submit");
  const closePopupBtn = document.getElementById("close-popup");
  const submitNumberBtn = document.getElementById("submit-number");
  const randomStartBtn = document.getElementById("random-start");
  const numberInput = document.getElementById("number-input");
  const currentNumberDisplay = document.getElementById("current-number");

  let isAdmin = false;

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
  });

  createBingoBoard();

  // 管理者ログインポップアップを開く
  adminLoginBtn.addEventListener("click", () => {
    adminPopup.style.display = "flex";
  });

  // 管理者ログイン処理
  adminLoginSubmit.addEventListener("click", () => {
    const password = adminPasswordInput.value;
    if (password === "1111") { // 管理者パスワード
      alert("管理者ログイン成功！");
      isAdmin = true;
      controls.style.display = "block"; // 操作パネルを有効化
      adminPopup.style.display = "none";
    } else {
      alert("パスワードが間違っています！");
    }
  });

  // ポップアップを閉じる
  closePopupBtn.addEventListener("click", () => {
    adminPopup.style.display = "none";
  });

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
