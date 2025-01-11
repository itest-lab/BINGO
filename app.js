document.addEventListener("DOMContentLoaded", () => {
  const adminLoginBtn = document.getElementById("admin-login-btn");
  const adminPopup = document.getElementById("admin-popup");
  const adminPasswordInput = document.getElementById("admin-password");
  const adminLoginSubmit = document.getElementById("admin-login-submit");
  const closePopupBtn = document.getElementById("close-popup");
  const startBtn = document.getElementById("start-btn");
  const manualBtn = document.getElementById("manual-btn");
  const resetBtn = document.getElementById("reset-btn");
  const currentNumberDisplay = document.getElementById("current-number");
  const numberGrid = document.getElementById("number-grid");
  const editPopup = document.getElementById("edit-popup");
  const currentNumberEdit = document.getElementById("current-number-edit");
  const newNumberInput = document.getElementById("new-number");
  const editConfirmBtn = document.getElementById("edit-confirm");
  const editCancelBtn = document.getElementById("edit-cancel");

  const db = firebase.database();
  let isAdmin = false;
  let usedNumbers = [];

  // 過去の数字を表示する関数
  const renderGrid = () => {
    numberGrid.innerHTML = ""; // グリッドをリセット
    usedNumbers.forEach((number) => {
      const cell = document.createElement("div");
      cell.classList.add("number-cell");
      const column = getColumn(number);
      cell.dataset.column = column;
      cell.textContent = number;
      cell.addEventListener("click", () => openEditPopup(number));
      numberGrid.appendChild(cell);
    });
  };

  const getColumn = (number) => {
    if (number <= 15) return "B";
    if (number <= 30) return "I";
    if (number <= 45) return "N";
    if (number <= 60) return "G";
    return "O";
  };

  // 編集ポップアップを開く
  const openEditPopup = (number) => {
    currentNumberEdit.value = number;
    newNumberInput.value = "";
    editPopup.style.display = "flex";
  };

  // 編集ポップアップを閉じる
  const closeEditPopup = () => {
    editPopup.style.display = "none";
  };

  // 数字を更新する
  const updateNumber = (number) => {
    if (usedNumbers.includes(number)) return;
    usedNumbers.push(number);
    firebase.database().ref("bingo").update({
      latestNumber: number,
      history: usedNumbers,
    });
  };

  // ポップアップ操作
  editConfirmBtn.addEventListener("click", () => {
    const oldNumber = parseInt(currentNumberEdit.value);
    const newNumber = parseInt(newNumberInput.value);

    if (!newNumber || newNumber < 1 || newNumber > 75) {
      alert("1～75の間の数字を入力してください。");
      return;
    }

    const index = usedNumbers.indexOf(oldNumber);
    if (index !== -1) {
      usedNumbers[index] = newNumber;
      firebase.database().ref("bingo").update({
        history: usedNumbers,
      });
    }

    closeEditPopup();
  });

  editCancelBtn.addEventListener("click", closeEditPopup);

  // リアルタイム最新数字更新
  firebase.database().ref("bingo/latestNumber").on("value", (snapshot) => {
    const latestNumber = snapshot.val();
    currentNumberDisplay.textContent = latestNumber || "--";
  });

  // リアルタイム過去の数字更新
  firebase.database().ref("bingo/history").on("value", (snapshot) => {
    usedNumbers = snapshot.val() || [];
    renderGrid();
  });

  // リセット
  resetBtn.addEventListener("click", () => {
    usedNumbers = [];
    firebase.database().ref("bingo").set({
      latestNumber: null,
      history: [],
    });
  });
});
