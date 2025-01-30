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
  let lastHandledUpdate = 0; // 最後に処理した更新のタイムスタンプ
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

  // Firebaseから秒数の同期
  db.ref("settings/randomStartTime").on("value", (snapshot) => {
    if (snapshot.exists()) {
      randomStartTime = snapshot.val();
    }
  });

  // Firebaseから最新の数字をリアルタイムで取得
  firebase.database().ref("bingo/latestNumber").on("value", (snapshot) => {
    const latestNumber = snapshot.val();

    numberBox.style.backgroundColor = "white"; // 白背景

    // 初回アクセス時はフラグを確認し、ランダム点滅をスキップ
    if (isFirstAccess) {
      if (latestNumber === null) {
        updateNumberBox("--"); // null の場合は「--」を表示
      } else {
        //numberBox.textContent(latestNumber); // 数字を表示
      }
      isFirstAccess = false; // フラグを切り替える
      return; // 初回アクセスではランダム点滅しない
    }

    // `latestNumber` が null の場合、表示を「--」に更新
    if (latestNumber === null) {
      updateNumberBox("--");
    } else {
      // 2回目以降の更新時にはランダム点滅を行う
      flashNumber(latestNumber);
    }
  });

  // アラートを表示する関数
  const showAlert = (message) => {
    // 他のポップアップを後ろに下げる（初期化）
    const allPopups = document.querySelectorAll(".popup");
    allPopups.forEach(popup => {
      popup.style.zIndex = 10; // 基本の z-index
    });

    // アラートポップアップを最前面に設定
    alertMessage.textContent = message;
    alertPopup.style.zIndex = 50; // 他のポップアップより前
    alertPopup.style.display = "flex"; // 表示する
  };

  // 数字の列に応じた色を取得
  const getColumnColor = (number) => {
    if (number <= 15) return "#3c739c"; // B (青)
    if (number <= 30) return "#9b3c47"; // I (赤)
    if (number <= 45) return "#3b6338"; // N (緑)
    if (number <= 60) return "#6d4e85"; // G (黄)
    return "#d56f03"; // O (紫)
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
      const latestNumber = data.latestNumber || null;
      const lastUpdated = data.lastUpdated || 0;
  
      // 自身が更新した場合や一定時間内の更新をスキップ
      const now = Date.now();
      if (lastUpdated > lastHandledUpdate && now - lastUpdated > 500) {
        // 最新の数字を表示
        displayNumber(latestNumber);
        lastHandledUpdate = lastUpdated; // 最後に処理した更新を記録
      }
  
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
  
    disableButtons(); // ボタンを無効化

    let randomNumber;
    // 過去に使用された数字を避けてランダムな数字を生成
    do {
      randomNumber = Math.floor(Math.random() * 75) + 1;
    } while (usedNumbers.includes(randomNumber));
  
    const now = Date.now(); // 現在のタイムスタンプ
  
    // データベースの latestNumber と lastUpdated を更新
    firebase.database().ref("bingo").update({
      latestNumber: randomNumber,
      lastUpdated: now, // タイムスタンプを保存
    });
  
    // ランダム点滅処理を実行
    flashNumber(randomNumber, () => {
      if (!usedNumbers.includes(randomNumber)) {
        usedNumbers.unshift(randomNumber);
        firebase.database().ref("bingo").update({
          history: usedNumbers,
        });
      }
      updateHistoryGrid();
    });
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

  // ランダム点滅処理の関数
  function flashNumber(targetNumber, callback) {
    isFlashing = true;

    // ボタンを無効化
    disableButtons();

    let flashInterval = setInterval(() => {
      numberBox.textContent = Math.floor(Math.random() * 75) + 1; // 点滅中にランダム数字を表示
      numberBox.style.backgroundColor = "white"; // 点滅中は白背景
      numberBox.style.color = "black" // ランダム点滅を開始する直前に文字色を黒に設定
    }, 100);

    // 点滅時間終了後に停止
    setTimeout(() => {
      clearInterval(flashInterval);
      isFlashing = false; // ランダム点滅終了

      // 点滅終了後に最新の数字を確実に表示
      numberBox.textContent = targetNumber;
      numberBox.style.backgroundColor = getColumnColor(targetNumber); // 該当の色を設定
      numberBox.style.color = "#fbcf87"; 

      // コールバック関数を呼び出し
      callback();

      // ボタンを再度有効化
      enableButtons();
    }, randomStartTime * 1000);
  }
  
  // 手動入力ポップアップの「OK」を押した場合
  manualSubmit.addEventListener("click", () => {
    const number = parseInt(manualNumberInput.value);
    if (!number || number < 1 || number > 75 || usedNumbers.includes(number)) {
      showAlert("1～75の間の数字を入力するか、すでに使用されている数字は入力できません。");
      return;
    }

    disableButtons();

    // データベースの latestNumber を先に更新
    firebase.database().ref("bingo").update({
      latestNumber: number,
    });
    numberBox.style.backgroundColor = "white"; // 白背景

    // ランダム点滅処理
    flashNumber(number, () => {
      // **ランダム点滅終了後の処理**
      if (!usedNumbers.includes(number)) { // 重複追加を防ぐ
        usedNumbers.unshift(number); // 最新の数字を先頭に追加
        firebase.database().ref("bingo").update({
          history: usedNumbers,
        });
      }

      // 最新の数字を表示
      displayNumber(number);
      updateHistoryGrid();
    });
  });
  
  // 最新の数字を表示
  const displayNumber = (number) => {
    numberBox.textContent = number || "--";
    numberBox.style.backgroundColor = number ? getColumnColor(number) : "#e3e3e3";
    numberBox.style.color = "#fbcf87"; 
  };

  // 過去の数字をクリックして編集ポップアップを表示
  const updateHistoryGrid = () => {
    historyGrid.innerHTML = "";
    for (let i = 0; i < 75; i++) {
      const numberElement = document.createElement("div");
      numberElement.className = "history-number";
      numberElement.textContent = usedNumbers[i] || "";
      numberElement.style.backgroundColor = usedNumbers[i] ? getColumnColor(usedNumbers[i]) : "transparent";
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
