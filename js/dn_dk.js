// Hàm đăng nhập
function login() {
    const username = document.getElementById('tk').value.trim();
    const password = document.getElementById('mk').value.trim();

    if (username === '' || password === '') {
        alert("Vui lòng điền đầy đủ tên tài khoản và mật khẩu!");
        return;
    }

    if (username.length < 3) {
        alert("Tên tài khoản phải có ít nhất 3 ký tự!");
        return;
    }

    if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    // Lấy dữ liệu người dùng từ localStorage
    const usersData = localStorage.getItem("users");
    if (!usersData) {
        alert("Không có dữ liệu người dùng! Vui lòng đăng ký tài khoản mới.");
        return;
    }

    try {
        const users = JSON.parse(usersData);
        const foundUser = users.find(user => user.username === username && user.password === password);

        if (foundUser) {
            // Lưu người dùng đang đăng nhập
            localStorage.setItem("currentUser", JSON.stringify(foundUser));
            localStorage.setItem("loginTime", new Date().toISOString());

            alert("Đăng nhập thành công!");
            window.location.href = "index.html";
        } else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    } catch (error) {
        console.error("Lỗi khi đọc dữ liệu:", error);
        alert("Có lỗi xảy ra! Vui lòng thử lại.");
    }
}

// Hàm đăng ký
function register() {
    const fullname = document.getElementById("fullname").value.trim();
    const username = document.getElementById("tk").value.trim();
    const password = document.getElementById("mk").value.trim();
    const confirmPassword = document.getElementById("mk2").value.trim();

    if (fullname === "" || username === "" || password === "" || confirmPassword === "") {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    if (fullname.length < 2) {
        alert("Họ và tên phải có ít nhất 2 ký tự!");
        return;
    }

    if (username.length < 3) {
        alert("Tên tài khoản phải có ít nhất 3 ký tự!");
        return;
    }

    if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp! Vui lòng nhập lại.");
        return;
    }

    let users = [];
    try {
        const usersData = localStorage.getItem("users");
        if (usersData) users = JSON.parse(usersData);
    } catch (error) {
        console.error("Lỗi khi đọc dữ liệu:", error);
        alert("Có lỗi xảy ra! Vui lòng thử lại.");
        return;
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        alert("Tài khoản đã tồn tại! Vui lòng chọn tên tài khoản khác.");
        return;
    }

    // GẮN QUYỀN MẶC ĐỊNH
    const role = (username === "admin") ? "admin" : "user";

    const newUser = {
        fullname: fullname,
        username: username,
        password: password,
        createdAt: new Date().toISOString(),
        role: role
    };

    users.push(newUser);

    try {
        localStorage.setItem("users", JSON.stringify(users));
        alert("Đăng ký thành công!");
        window.location.href = "sign_in.html";
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        alert("Có lỗi xảy ra! Vui lòng thử lại.");
    }
}

// Hàm đăng xuất
function logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("loginTime");
        alert("Đăng xuất thành công!");
        window.location.href = "index.html";
    }
}

function checkLoginStatus() {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
}

function getCurrentUser() {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        try {
            return JSON.parse(currentUser);
        } catch (error) {
            console.error("Lỗi khi đọc thông tin người dùng:", error);
            return null;
        }
    }
    return null;
}

// Hàm cập nhật header theo trạng thái đăng nhập + PHÂN QUYỀN
function updateHeader() {
    const currentUser = getCurrentUser();
    const textDndk = document.querySelector('.text_dndk');
    const textTk = document.querySelector('.text_tk');
    const noAccItems = document.querySelectorAll('.no_acc');
    const yesAccItems = document.querySelectorAll('.yes_acc');
    const dangXuatBtn = document.getElementById('dang_xuat');
    const adminItem = document.getElementById('admin');

    if (currentUser) {
        if (textDndk) textDndk.style.display = 'none';
        if (textTk) {
            textTk.style.display = 'inline';
            const displayName = currentUser.fullname || currentUser.username;
            textTk.innerHTML = displayName + '<i class="fa-solid fa-caret-down"></i>';
        }

        noAccItems.forEach(item => item.style.display = 'none');
        yesAccItems.forEach(item => item.style.display = 'block');

        // PHÂN QUYỀN ADMIN
        if (currentUser.role === "admin") {
            adminItem.style.display = "block";
        } else {
            adminItem.style.display = "none";
        }

        if (dangXuatBtn) {
            dangXuatBtn.addEventListener('click', function (e) {
                e.preventDefault();
                logout();
            });
        }
    } else {
        if (textDndk) textDndk.style.display = 'inline';
        if (textTk) textTk.style.display = 'none';

        noAccItems.forEach(item => item.style.display = 'block');
        yesAccItems.forEach(item => item.style.display = 'none');
    }
}
// Phân quyền hiển thị giao diện

function updateHeader() {
    const currentUser = getCurrentUser();
    const textDndk = document.querySelector('.text_dndk');
    const textTk = document.querySelector('.text_tk');
    const noAccItems = document.querySelectorAll('.no_acc');
    const yesAccItems = document.querySelectorAll('.yes_acc');

    const adminItem = document.getElementById('admin');
    const nhanvienItem = document.getElementById('nhanvien');
    const shipperItem = document.getElementById('shipper');
    const dangXuatBtn = document.getElementById('dang_xuat');

    if (currentUser) {
        // Hiển thị tên tài khoản
        if (textDndk) textDndk.style.display = 'none';
        if (textTk) {
            textTk.style.display = 'inline';
            textTk.innerHTML = currentUser.fullname + ' <i class="fa-solid fa-caret-down"></i>';
        }

        // Ẩn/Hiện mục cho người đã đăng nhập
        noAccItems.forEach(item => item.style.display = 'none');
        yesAccItems.forEach(item => item.style.display = 'block');

        // Ẩn tất cả phân quyền trước
        adminItem.style.display = "none";
        nhanvienItem.style.display = "none";
        shipperItem.style.display = "none";

        // PHÂN QUYỀN TRUY CẬP MENU
        switch (currentUser.role) {
            case "admin":
                adminItem.style.display = "block";
                nhanvienItem.style.display = "block";
                shipperItem.style.display = "block";
                break;

            case "nhanvien":
                nhanvienItem.style.display = "block";
                break;

            case "shipper":
                shipperItem.style.display = "block";
                break;

            default:
                // khách hàng chỉ có Đăng xuất
                break;
        }

        // Nút đăng xuất — luôn có cho mọi role
        if (dangXuatBtn) {
            dangXuatBtn.style.display = "block";  
            dangXuatBtn.addEventListener('click', function (e) {
                e.preventDefault();
                logout();
            });
        }

    } else {
        // CHƯA ĐĂNG NHẬP
        if (textDndk) textDndk.style.display = 'inline';
        if (textTk) textTk.style.display = 'none';

        noAccItems.forEach(item => item.style.display = 'block');
        yesAccItems.forEach(item => item.style.display = 'none');
    }
}



// Khởi tạo
function initPage() {
    updateHeader();
}
