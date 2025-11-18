function login() {
    const username = document.getElementById('tk').value.trim();
    const password = document.getElementById('mk').value.trim();

    if (username === '' || password === '') {
        return;
    }

    const usersData = localStorage.getItem("users");
    if (!usersData) {
        alert("Không có dữ liệu người dùng!");
        return;
    }

    const users = JSON.parse(usersData);
    const foundUser = users.find(user => user.username === username && user.password === password);

    if (foundUser) {
        // Lưu người dùng đang đăng nhập vào localStorage
        localStorage.setItem("currentUser", JSON.stringify(foundUser));

        // Chuyển hướng sang trang index.html (cùng cấp)
        window.location.href = "index.html";
    } else {
        alert("Sai tài khoản hoặc mật khẩu!");
    }
}

function register() {
    const fullname = document.getElementById("fullname").value.trim();
    const username = document.getElementById("tk").value.trim();
    const password = document.getElementById("mk").value.trim();
    const confirmPassword = document.getElementById("mk2").value.trim();

    if (username === "" || password === "" || confirmPassword === "") {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        alert("Tài khoản đã tồn tại!");
        return;
    }

    users.push({fullname, username, password });
    localStorage.setItem("users", JSON.stringify(users));

    window.location.href = "sign_in.html";
    alert("Đăng ký thành công!");
}
