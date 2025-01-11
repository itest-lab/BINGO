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
  const historyGrid = document.getElementById("history-grid");
  const editPopup = document.getElementById("edit-popup");
  const editNumberInput = document.getElementById("edit-number-input");
  const editSubmit = document.getElementById("edit-submit");
  const closeEditPopup = document.getElementById("close-edit-popup");
  const selectedNumberLabel = document.getElementById("selected-number-label");

  const db = firebase.database();
  let isAdmin = false;
  let usedNumbers = [];
  let currentNumber = null;

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
    usedNumbers.unshift(number); // 最新の数字を先頭に追加

    firebase.database().ref("bingo").update({
      latestNumber: number,
      history: usedNumbers,
    });

    displayNumber(number);
    updateHistoryGrid();
  };

  // 最新の数字を表示
  const displayNumber = (number) => {
    numberBox.textContent = number || "--";
    numberBox.style.backgroundColor = number ? getColumnColor(number) : "#e3e3e3";
  };

  // 過去の数字を表示
  const updateHistoryGrid = () => {
    historyGrid.innerHTML = "";
    for (let i = 0; i < 70; i++) {
      const numberElement = document.createElement("div");
      numberElement.className = "history-number";
      numberElement.textContent = usedNumbers[i] || "";
      numberElement.style.backgroundColor = usedNumbers[i] ? getColumnColor(usedNumbers[i]) : "transparent";
      numberElement.style.border = usedNumbers[i] ? "2px solid black" : "none"; // 黒枠を追加
      numberElement.style.width = "75px";  // 各グリッドの幅
      numberElement.style.height = "75px"; // 各グリッドの高さ
      numberElement.style.boxShadow = usedNumbers[i] ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "none"; // 影を削除
      numberElement.addEventListener("click", () => {
        if (isAdmin && usedNumbers[i]) {
          selectedNumberLabel.textContent = `選択した数字: ${usedNumbers[i]}`;
          editNumberInput.value = usedNumbers[i];
          editPopup.style.display = "flex";
        }
      });
      historyGrid.appendChild(numberElement);
    }
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
      startBtn.style.display = "inline-block";
      manualBtn.style.display = "inline-block";
      resetBtn.style.display = "inline-block";
      controls.style.display = "flex"; // フッターに表示
      adminPopup.style.display = "none";
    } else {
      alert("パスワードが間違っています！");
    }
  });

  closePopupBtn.addEventListener("click", () => {
    adminPopup.style.display = "none";
  });

  // 数字編集ポップアップを閉じる
  closeEditPopup.addEventListener("click", () => {
    editPopup.style.display = "none";
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

    // ボタンを無効化
    startBtn.disabled = true;
    manualBtn.disabled = true;
    resetBtn.disabled = true;

    // 数字がランダムに点滅
    let flashInterval = setInterval(() => {
      numberBox.textContent = Math.floor(Math.random() * 75) + 1;
      numberBox.style.backgroundColor = "white";
    }, 100);

    setTimeout(() => {
      clearInterval(flashInterval);
      numberBox.style.backgroundColor = getColumnColor(randomNumber);
      updateNumber(randomNumber);
      // ボタンを再度有効化
      startBtn.disabled = false;
      manualBtn.disabled = false;
      resetBtn.disabled = false;
    }, 2000);
  });

  // 手動入力
  manualBtn.addEventListener("click", () => {
    const manualNumber = prompt("数字を入力してください (1～75):");
    const number = parseInt(manualNumber);
    if (!number || number < 1 || number > 75 || usedNumbers.includes(number)) {
      alert("1～75の間の数字を入力するか、すでに使用されている数字は入力できません。");
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
    updateHistoryGrid();
  });

  // Firebaseから最新の数字をリアルタイムで取得
  firebase.database().ref("bingo/latestNumber").on("value", (snapshot) => {
    const latestNumber = snapshot.val();
    displayNumber(latestNumber);
  });

  // Firebaseから過去の数字をリアルタイムで取得
  firebase.database().ref("bingo/history").on("value", (snapshot) => {
    usedNumbers = snapshot.val() || [];
    updateHistoryGrid();
  });

  // 過去の数字をクリックして編集
  editSubmit.addEventListener("click", () => {
    const newNumber = parseInt(editNumberInput.value);
    if (!newNumber || newNumber < 1 || newNumber > 75 || usedNumbers.includes(newNumber)) {
      alert("1～75の間の数字を入力するか、すでに使用されている数字は入力できません。");
      return;
    }

    const oldNumber = parseInt(selectedNumberLabel.textContent.replace("選択した数字: ", ""));
    const index = usedNumbers.indexOf(oldNumber);
    if (index > -1) {
      usedNumbers[index] = newNumber;
    }

    firebase.database().ref("bingo").update({
      history: usedNumbers,
    });

    editPopup.style.display = "none";
    updateHistoryGrid();
  });
});
