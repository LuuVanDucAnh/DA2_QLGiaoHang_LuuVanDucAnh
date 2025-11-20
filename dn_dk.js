// Hàm đăng nhập
function login() {
    const username = document.getElementById('tk').value.trim();
    const password = document.getElementById('mk').value.trim();

    // Kiểm tra các trường bắt buộc
    if (username === '' || password === '') {
        alert("Vui lòng điền đầy đủ tên tài khoản và mật khẩu!");
        return;
    }

    // Kiểm tra độ dài tối thiểu
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
            // Lưu người dùng đang đăng nhập vào localStorage
            localStorage.setItem("currentUser", JSON.stringify(foundUser));
            
            // Lưu thời gian đăng nhập
            localStorage.setItem("loginTime", new Date().toISOString());

            alert("Đăng nhập thành công!");
            
            // Chuyển hướng sang trang index.html
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

    // Kiểm tra các trường bắt buộc
    if (fullname === "" || username === "" || password === "" || confirmPassword === "") {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Kiểm tra độ dài họ tên
    if (fullname.length < 2) {
        alert("Họ và tên phải có ít nhất 2 ký tự!");
        return;
    }

    // Kiểm tra độ dài tên tài khoản
    if (username.length < 3) {
        alert("Tên tài khoản phải có ít nhất 3 ký tự!");
        return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp! Vui lòng nhập lại.");
        return;
    }

    // Lấy danh sách người dùng từ localStorage
    let users = [];
    try {
        const usersData = localStorage.getItem("users");
        if (usersData) {
            users = JSON.parse(usersData);
        }
    } catch (error) {
        console.error("Lỗi khi đọc dữ liệu:", error);
        alert("Có lỗi xảy ra! Vui lòng thử lại.");
        return;
    }

    // Kiểm tra tài khoản đã tồn tại
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        alert("Tài khoản đã tồn tại! Vui lòng chọn tên tài khoản khác.");
        return;
    }

    // Tạo đối tượng người dùng mới
    const newUser = {
        fullname: fullname,
        username: username,
        password: password,
        createdAt: new Date().toISOString()
    };

    // Thêm người dùng mới vào danh sách
    users.push(newUser);
    
    // Lưu vào localStorage
    try {
        localStorage.setItem("users", JSON.stringify(users));
        alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
        
        // Chuyển hướng sang trang đăng nhập
        window.location.href = "sign_in.html";
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        alert("Có lỗi xảy ra khi lưu dữ liệu! Vui lòng thử lại.");
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

// Hàm kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
}

// Hàm lấy thông tin người dùng hiện tại
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

// Hàm xóa tất cả dữ liệu (dùng cho testing)
function clearAllData() {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác!")) {
        localStorage.removeItem("users");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("loginTime");
        alert("Đã xóa tất cả dữ liệu!");
    }
}

// Hàm cập nhật header dựa trên trạng thái đăng nhập
function updateHeader() {
    const currentUser = getCurrentUser();
    const textDndk = document.querySelector('.text_dndk');
    const textTk = document.querySelector('.text_tk');
    const noAccItems = document.querySelectorAll('.no_acc');
    const yesAccItems = document.querySelectorAll('.yes_acc');
    const dangXuatBtn = document.getElementById('dang_xuat');

    if (currentUser) {
        // Người dùng đã đăng nhập
        if (textDndk) {
            textDndk.style.display = 'none';
        }
        if (textTk) {
            textTk.style.display = 'inline';
            // Hiển thị tên người dùng hoặc tên tài khoản
            const displayName = currentUser.fullname || currentUser.username;
            textTk.innerHTML = displayName + '<i class="fa-solid fa-caret-down"></i>';
        }
        
        // Ẩn menu đăng nhập/đăng ký, hiện menu tài khoản
        noAccItems.forEach(item => {
            item.style.display = 'none';
        });
        yesAccItems.forEach(item => {
            item.style.display = 'block';
        });

        // Thêm sự kiện cho nút đăng xuất
        if (dangXuatBtn) {
            dangXuatBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    } else {
        // Người dùng chưa đăng nhập
        if (textDndk) {
            textDndk.style.display = 'inline';
        }
        if (textTk) {
            textTk.style.display = 'none';
        }
        
        // Hiện menu đăng nhập/đăng ký, ẩn menu tài khoản
        noAccItems.forEach(item => {
            item.style.display = 'block';
        });
        yesAccItems.forEach(item => {
            item.style.display = 'none';
        });
    }
}

// Hàm khởi tạo khi trang được tải
function initPage() {
    // Cập nhật header khi trang được tải
    updateHeader();
}
