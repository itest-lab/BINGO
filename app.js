document.addEventListener("DOMContentLoaded", () => {
  const adminLoginBtn = document.getElementById("admin-login-btn");
  const adminPopup = document.getElementById("admin-popup");
  const adminPasswordInput = document.getElementById("admin-password");
  const adminLoginSubmit = document.getElementById("admin-login-submit");
  const closePopupBtn = document.getElementById("close-popup");
  const startBtn = document.getElementById("start-btn");
  const resetBtn = document.getElementById("reset-btn");
  const currentNumberDisplay = document.getElementById("current-number");
  const numberHistoryList = document.getElementById("number-history");
  const controls = document.getElementById("controls");

  const db = firebase.database();
  let isAdmin = false;
  let usedNumbers = [];

  // 管理者ログインポップアップを開く
  adminLoginBtn.addEventListener("click", () => {
    adminPopup.style.display = "flex";
  });

  // 管理者ログイン処理
  adminLoginSubmit.addEventListener("click", () => {
    const password = adminPasswordInput.value;
    if (password === "admin123") { // 管理者パスワード
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

  // スタートボタンをクリック
  startBtn.addEventListener("click", () => {
    if (usedNumbers.length >= 75) {
      alert("すべての数字が出ました！");
      return;
    }

    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * 75) + 1;
    } while (usedNumbers.includes(randomNumber));

    usedNumbers.push(randomNumber);
    updateNumber(randomNumber);
  });

  // リセットボタンをクリック
  resetBtn.addEventListener("click", () => {
    usedNumbers = [];
    firebase.database().ref("bingo").set({
      latestNumber: null,
      history: []
    });
  });

  // 数字を更新
  const updateNumber = (number) => {
    firebase.database().ref("bingo").update({
      latestNumber: number,
      history: usedNumbers
    });
  };

  // 最新の数字をリアルタイム更新
  firebase.database().ref("bingo/latestNumber").on("value", (snapshot) => {
    const latestNumber = snapshot.val();
    currentNumberDisplay.textContent = latestNumber || "--";
  });

  // 過去の数字一覧をリアルタイム更新
  firebase.database().ref("bingo/history").on("value", (snapshot) => {
    const history = snapshot.val() || [];
    numberHistoryList.innerHTML = ""; // リストをクリア
    history.forEach((number) => {
      const li = document.createElement("li");
      li.textContent = number;
      numberHistoryList.appendChild(li);
    });
  });
});
