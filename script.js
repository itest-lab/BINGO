let isAdmin = false;

// 「参加者モード」ボタンがクリックされたときの処理
function toggleAdminMode() {
    const popup = document.getElementById('password-popup');
    const overlay = document.getElementById('overlay');

    if (!popup || !overlay) {
        console.error("ポップアップまたはオーバーレイの要素が見つかりません。");
        return;
    }

    if (!isAdmin) {
        // ポップアップとオーバーレイを表示
        popup.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        // 管理者モード解除
        isAdmin = false;
        document.getElementById('admin-controls').style.display = 'none';
        document.getElementById('admin-button').textContent = '参加者モード';
        document.getElementById('admin-button').style.backgroundColor = '#4a4a4a';
        overlay.style.display = 'none';
    }
}

// ポップアップを閉じる
function closePasswordPopup() {
    const popup = document.getElementById('password-popup');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
}

// 管理者モードを切り替えるためにパスワードポップアップを表示する
function showPasswordPopup() {
    document.getElementById('password-popup').style.display = 'block';
    passwordInput.focus();
}

// パスワードを確認
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;

    console.log("入力されたパスワード:", password);
    if (password === '1111') {
        console.log("認証成功");
        document.getElementById('admin-controls').style.display = 'flex';
        document.getElementById('admin-button').textContent = '管理者モード';
        document.getElementById('admin-button').style.backgroundColor = '#007bff';
        closePasswordPopup();
        isAdmin = true;
    } else {
        console.log("認証失敗");
        alert('パスワードが間違っています');
    }
}

// イベントリスナーを追加
document.addEventListener('DOMContentLoaded', () => {
    const adminButton = document.getElementById('admin-button');
    if (adminButton) {
        adminButton.addEventListener('click', toggleAdminMode);
    } else {
        console.error("「参加者モード」ボタンが見つかりません。");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const confirmButton = document.getElementById('password-confirm');
    confirmButton.addEventListener('click', checkPassword);
});
