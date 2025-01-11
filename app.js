document.addEventListener("DOMContentLoaded", () => {
  const adminLoginBtn = document.getElementById("admin-login-btn");
  const adminPopup = document.getElementById("admin-popup");
  const adminPasswordInput = document.getElementById("admin-password");
  const adminLoginSubmit = document.getElementById("admin-login-submit");
  const closePopupBtn = document.getElementById("close-popup");
  const startBtn = document.getElementById("start-btn");
  const manualBtn = document.getElementById("manual-btn");
  const resetBtn = document.getElementById("reset-btn");
  const numberBox = document.getElementById("number-box");
  const controls = document.getElementById("controls");

  const db = firebase.database();
  let isAdmin = false;
  let usedNumbers = [];

  // 数字の列に応じた色を取得
  const getColumnColor = (number) => {
    if (number <= 15) return "#add8e6"; // B (青)
    if (number <= 30) return "#f08080"; // I (赤)
    if (number <= 45) return "#90ee90"; // N (緑)
    if (number <= 60) return "#ffd700"; // G (黄)
    return "#dda0dd"; // O (紫)
  };

  // 数字を更新して表示
  const updateNumber = (number) => {
    if (usedNumbers.includes(number)) return;
    usedNumbers.push(number);

    firebase.database().ref("bingo").update({
      latestNumber: number,
      history: usedNumbers,
    });

    displayNumber(number);
  };

  // 最新の数字を表示
  const displayNumber = (number) => {
    numberBox.textContent = number || "--";
    numberBox.style.backgroundColor = number ? getColumnColor(number) : "#e3e3e3";
  };

  // 管理者ログインポップアップを開く
  adminLoginBtn.addEventListener("click", () => {
    adminPopup.style.display = "flex";
  });

  // 管理者ログイン処理
  adminLoginSubmit.addEventListener("click", () => {
    const password = adminPasswordInput.value;
    if (password === "admin123") {
      alert("管理者ログイン成功！");
      isAdmin = true;
      controls.style.display = "block";
      adminPopup.style.display = "none";
    } else {
      alert("パスワードが間違っています！");
    }
  });

  closePopupBtn.addEventListener("click", () => {
    adminPopup.style.display = "none";
  });

  // ランダムスタート
  startBtn.addEventListener("click", () => {
    if (usedNumbers.length >= 75) {
      alert("すべての数字が出ました！");
      return;
    }

    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * 75) + 1;
    } while (usedNumbers.includes(randomNumber));

    updateNumber(randomNumber);
  });

  // 手動入力
  manualBtn.addEventListener("click", () => {
    const manualNumber = prompt("数字を入力してください (1～75):");
    const number = parseInt(manualNumber);
    if (!number || number < 1 || number > 75) {
      alert("1～75の間の数字を入力してください。");
      return;
    }
    updateNumber(number);
  });

  // リセット
  resetBtn.addEventListener("click", () => {
    usedNumbers = [];
    firebase.database().ref("bingo").set({
      latestNumber: null,
      history: [],
    });
    displayNumber(null);
  });

  // Firebaseから最新の数字をリアルタイムで取得
  firebase.database().ref("bingo/latestNumber").on("value", (snapshot) => {
    const latestNumber = snapshot.val();
    displayNumber(latestNumber);
  });
});
