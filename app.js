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
  const alertPopup = document.getElementById("alert-popup");
  const alertMessage = document.getElementById("alert-message");
  const closeAlertPopup = document.getElementById("close-alert-popup");
  const resetConfirmPopup = document.getElementById("reset-confirm-popup");
  const confirmResetBtn = document.getElementById("confirm-reset-btn");
  const cancelResetBtn = document.getElementById("cancel-reset-btn");
  const manualPopup = document.getElementById("manual-popup");
  const manualNumberInput = document.getElementById("manual-number-input");
  const manualSubmit = document.getElementById("manual-submit");
  const closeManualPopup = document.getElementById("close-manual-popup");
  const deleteNumberBtn = document.getElementById("delete-number-btn"); 
  const deleteConfirmPopup = document.getElementById("delete-confirm-popup"); 
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn"); 
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
  const settingsbtn = document.getElementById("settings-btn");
  const settingsPopup = document.getElementById("settings-popup");
  const randomstarttime = document.getElementById("random-start-time");
  const closesettingspopup = document.getElementById("close-settings-popup");
  const saveSettingsBtn = document.getElementById("save-settings");
  const displayElement = document.getElementById("random-start-time-display");

  const db = firebase.database();
  let isAdmin = false;
  let usedNumbers = [];
  let isFlashing = false; // ランダム点滅中かどうかを判定するフラグ
  // 初回アクセスフラグを追加
  let isFirstAccess = true;
  // 秒数設定をデータベースから取得して設定
  let randomStartTime = 2;
  db.ref("settings/randomStartTime").on("value", (snapshot) => {
    if (snapshot.exists()) {;
      randomstarttime = snapshot.val();
      updateRandomStartTimeDisplay()
    }
  });

  // Firebaseから最新の数字をリアルタイムで取得
  firebase.database().ref("bingo/latestNumber").on("value", (snapshot) => {
    const latestNumber = snapshot.val();

    if (latestNumber === null) {
      // 最新の数字がnullの場合、表示をリセット
      updateNumberBox("--");
      numberBox.style.backgroundColor = "white";
      return;
    }

    // ランダム点滅を強制的に実行
    flashNumber(latestNumber, () => {
      // 点滅終了後、数字を最新の状態に更新
      updateNumberBox(latestNumber);
      numberBox.style.backgroundColor = getColumnColor(latestNumber);
    });
  });

  // アラートを表示する関数
  const showAlert = (message) => {
    alertMessage.textContent = message;
    alertPopup.style.display = "flex";
  };

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
    if (isFlashing) return; // ランダム点滅中は更新しない

    // 「この数字はすでに使用されています。」を回避するために
    if (usedNumbers.includes(number)) {
      return; // 数字が過去に使われている場合は更新しない
    }

    usedNumbers.unshift(number); // 最新の数字を先頭に追加

    firebase.database().ref("bingo").update({
      latestNumber: number,
      history: usedNumbers,
    });

    displayNumber(number);
    updateHistoryGrid();
  };

  // リアルタイムリスナーの設定
  firebase.database().ref("bingo").on("value", (snapshot) => {
    const data = snapshot.val();

    if (data) {
      // 最新の数字を表示
      displayNumber(data.latestNumber || null);

      // 履歴を更新
      usedNumbers = data.history || [];
      updateHistoryGrid();
    }
  });
  
  // ランダムスタート
  startBtn.addEventListener("click", () => {
    if (usedNumbers.length >= 75) {
      showAlert("すべての数字が出ました！");
      return;
    }

    let randomNumber;
    // 過去に使用された数字を避けてランダムな数字を生成
    do {
      randomNumber = Math.floor(Math.random() * 75) + 1;
    } while (usedNumbers.includes(randomNumber)); // 過去の数字を避ける

    // データベースの latestNumber を先に更新
    firebase.database().ref("bingo").update({
      latestNumber: randomNumber,
    });

    // ランダム点滅処理
    flashNumber(randomNumber, () => {
      // **ランダム点滅終了後の処理**
      if (!usedNumbers.includes(randomNumber)) { // 重複追加を防ぐ
        usedNumbers.unshift(randomNumber); // 最新の数字を先頭に追加
        firebase.database().ref("bingo").update({
          history: usedNumbers,
        });
      }

      // 最新の数字を表示
      displayNumber(randomNumber);
      updateHistoryGrid();
    });

    // ボタンを一時的に無効化
    disableButtons();
  });

  // ボタンを一時的に無効化する関数
  function disableButtons() {
    startBtn.disabled = true;
    manualBtn.disabled = true;
    resetBtn.disabled = true;
    settingsbtn.disabled = true;
  }

  // ボタンを再度有効化する関数
  function enableButtons() {
    startBtn.disabled = false;
    manualBtn.disabled = false;
    resetBtn.disabled = false;
    settingsbtn.disabled = false;
  }

  // 数字をランダムに点滅させる処理
  function flashNumber(targetNumber, callback) {
    isFlashing = true; // 点滅中のフラグを設定
    let flashInterval = setInterval(() => {
      numberBox.textContent = Math.floor(Math.random() * 75) + 1; // ランダムな数字を表示
      numberBox.style.backgroundColor = "white"; // 点滅中は白背景
    }, 100);

    // ランダム点滅を一定時間実行後に停止
    setTimeout(() => {
      clearInterval(flashInterval); // 点滅を停止
      isFlashing = false; // 点滅中のフラグを解除

      // 点滅終了後に目標の数字を表示
      numberBox.textContent = targetNumber;
      numberBox.style.backgroundColor = getColumnColor(targetNumber);

      // コールバック関数を実行
      if (callback) callback();
    }, randomStartTime * 1000);
  }
  
  // 手動入力ポップアップの「OK」ボタンの処理
  manualSubmit.addEventListener("click", () => {
    const number = parseInt(manualNumberInput.value);

    // 入力値のバリデーション
    if (!number || number < 1 || number > 75 || usedNumbers.includes(number)) {
      showAlert("1～75の間の数字を入力するか、すでに使用されている数字は入力できません。");
      return;
    }

    // ボタンを無効化して操作を一時的に制限
    disableButtons();

    // FirebaseのlatestNumberを先に更新
    firebase.database().ref("bingo").update({
      latestNumber: number,
    });

    // ランダム点滅処理を実行
    flashNumber(number, () => {
      // 点滅終了後に履歴を更新
      if (!usedNumbers.includes(number)) {
        usedNumbers.unshift(number); // 最新の数字を履歴に追加
        firebase.database().ref("bingo").update({
          history: usedNumbers,
        });
      }

      // UIを更新
      displayNumber(number);
      updateHistoryGrid();

      // ボタンを再有効化
      enableButtons();
      manualPopup.style.display = "none";
    });
  });
  
  // 最新の数字を表示
  const displayNumber = (number) => {
    numberBox.textContent = number || "--";
    numberBox.style.backgroundColor = number ? getColumnColor(number) : "#e3e3e3";
  };

  // 過去の数字をクリックして編集ポップアップを表示
  const updateHistoryGrid = () => {
    historyGrid.innerHTML = "";
    for (let i = 0; i < 75; i++) {
      const numberElement = document.createElement("div");
      numberElement.className = "history-number";
      numberElement.textContent = usedNumbers[i] || "";
      numberElement.style.backgroundColor = usedNumbers[i] ? getColumnColor(usedNumbers[i]) : "transparent";
      numberElement.style.border = usedNumbers[i] ? "2px solid black" : "none";
      numberElement.style.width = "55px";
      numberElement.style.height = "55px";
      numberElement.style.boxShadow = usedNumbers[i] ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "none";

      // 数字をデータ属性として保持
      if (usedNumbers[i]) {
        numberElement.setAttribute("data-number", usedNumbers[i]);
      }

      numberElement.addEventListener("click", () => {
        if (isAdmin && usedNumbers[i]) {
          // クリックした数字をラベルに表示
          const selectedNumber = numberElement.getAttribute("data-number");
          selectedNumberLabel.textContent = `選択した数字: ${selectedNumber}`;
          editNumberInput.value = selectedNumber;
          editPopup.style.display = "flex";
        }
      });
      historyGrid.appendChild(numberElement);
    }
  };

  // 管理者ログインポップアップを開く
  adminLoginBtn.addEventListener("click", () => {
    adminPopup.style.display = "flex";
    adminPasswordInput.focus();
  });

  // 管理者ログイン処理
  adminLoginSubmit.addEventListener("click", () => {
    const password = adminPasswordInput.value;
    if (password === "admin123") {
      showAlert("管理者ログイン成功！");
      isAdmin = true;
      startBtn.style.display = "inline-block";
      manualBtn.style.display = "inline-block";
      resetBtn.style.display = "inline-block";
      settingsbtn.style.display = "inline-block";
      controls.style.display = "flex"; // フッターに表示
      adminPopup.style.display = "none";
      displayElement.style.display ="inline-block";
      updateRandomStartTimeDisplay();

    } else {
      showAlert("パスワードが間違っています！");
    }
  });

  settingsbtn.addEventListener("click", () => {
    settingsPopup.style.display = "flex";
    randomstarttime.value = randomStartTime;
  });

  const updateRandomStartTimeDisplay = () => {
    displayElement.textContent = `現在の秒数: ${randomStartTime}秒`;
  };

  // 設定保存
  saveSettingsBtn.addEventListener("click", () => {
    const newTime = parseInt(document.getElementById("random-start-time").value);
    if (newTime >= 1) {
      db.ref("settings/randomStartTime").set(newTime);
      showAlert("設定を保存しました！");
      settingsPopup.style.display = "none";
  
      // 秒数表示エリアを更新
      randomStartTime = newTime;
      updateRandomStartTimeDisplay();
    } else {
      showAlert("秒数は1以上で入力してください。");
    }
  });

  // 設定ポップアップを閉じる
  closesettingspopup.addEventListener("click", () => {
    settingsPopup.style.display = "none";
  });

  // 管理者ログインポップアップを閉じる
  closePopupBtn.addEventListener("click", () => {
    adminPopup.style.display = "none";
  });

  // 数字編集ポップアップを閉じる
  closeEditPopup.addEventListener("click", () => {
    editPopup.style.display = "none";

  });

  // アラートポップアップを閉じる
  closeAlertPopup.addEventListener("click", () => {
    alertPopup.style.display = "none";
  });

  // リセットボタンを押した際の確認ポップアップを表示
  resetBtn.addEventListener("click", () => {
    resetConfirmPopup.style.display = "flex";
  });

  // リセット確認ポップアップで「はい」を押した場合
  confirmResetBtn.addEventListener("click", () => {
    usedNumbers = [];
    firebase.database().ref("bingo").set({
      latestNumber: null,
      history: [],

    });
    displayNumber(null);
    updateHistoryGrid();
    resetConfirmPopup.style.display = "none";
  });

  // リセット確認ポップアップで「いいえ」を押した場合
  cancelResetBtn.addEventListener("click", () => {
    resetConfirmPopup.style.display = "none";
  });

  // 手動入力ポップアップを開く
  manualBtn.addEventListener("click", () => {
    manualPopup.style.display = "flex";
  });

  // 手動入力ポップアップの「OK」を押した場合
  manualSubmit.addEventListener("click", () => {
    const number = parseInt(manualNumberInput.value);
    if (!number || number < 1 || number > 75 || usedNumbers.includes(number)) {
      showAlert("1～75の間の数字を入力するか、すでに使用されている数字は入力できません。");
      return;
    }
    updateNumber(number);
    manualPopup.style.display = "none";
  });

  // 手動入力ポップアップを閉じる
  closeManualPopup.addEventListener("click", () => {
    manualPopup.style.display = "none";
  });

  // 数字ボックスを更新する関数
  function updateNumberBox(content) {
    const numberBox = document.getElementById("number-box");
    if (numberBox) {
      numberBox.textContent = content; // 数字を更新
    }
  }

  // Firebaseから過去の数字をリアルタイムで取得
  firebase.database().ref("bingo/history").on("value", (snapshot) => {
      usedNumbers = snapshot.val() || [];
      updateHistoryGrid();
  });

  // 編集ポップアップの「OK」ボタン処理
  editSubmit.addEventListener("click", () => {
    const newNumber = parseInt(editNumberInput.value);
    const oldNumber = parseInt(selectedNumberLabel.textContent.replace("選択した数字: ", ""));

    // 入力値のバリデーション
    if (!newNumber || newNumber < 1 || newNumber > 75) {
      showAlert("1～75の間の数字を入力してください。");
      return;
    }
    if (usedNumbers.includes(newNumber)) {
      showAlert("この数字はすでに使用されています。");
      return;
    }

    // 古い数字の位置を特定して更新
    const index = usedNumbers.indexOf(oldNumber);
    if (index > -1) {
      usedNumbers[index] = newNumber;

      // Firebase更新
      firebase.database().ref("bingo").update({
        history: usedNumbers,
        latestNumber: usedNumbers[0], // 最新の数字を保持
      });

      // ポップアップを閉じる & UI更新
      editPopup.style.display = "none";
      updateHistoryGrid();
      displayNumber(usedNumbers[0]);
    } else {
      showAlert("選択した数字を変更できません。");
    }
  });
  
  // 数字削除ボタンの処理
  deleteNumberBtn.addEventListener("click", () => {
    deleteConfirmPopup.style.display = "flex"; // 削除確認ポップアップを表示
  });

  // 削除確認ポップアップで「はい」を押した場合
  confirmDeleteBtn.addEventListener("click", () => {
    const oldNumber = parseInt(selectedNumberLabel.textContent.replace("選択した数字: ", ""));
    const index = usedNumbers.indexOf(oldNumber);
    if (index > -1) {
      usedNumbers.splice(index, 1); // 配列から数字を削除
      if (index === 0 && usedNumbers.length > 0) {
        // latestNumberを繰り上げ
        const newLatestNumber = usedNumbers[0];
        firebase.database().ref("bingo").update({
          latestNumber: newLatestNumber,
          history: usedNumbers,
        });
      } else {
        firebase.database().ref("bingo").update({
          history: usedNumbers,
        });
      }
    }

    deleteConfirmPopup.style.display = "none"; // 削除確認ポップアップを閉じる
    editPopup.style.display = "none"; // 数字編集ポップアップを閉じる
    updateHistoryGrid();
    displayNumber(usedNumbers[0] || "--"); // 最新の数字を更新して表示
  });

  // 削除確認ポップアップを閉じる
  cancelDeleteBtn.addEventListener("click", () => {
    deleteConfirmPopup.style.display = "none";
  });

});
