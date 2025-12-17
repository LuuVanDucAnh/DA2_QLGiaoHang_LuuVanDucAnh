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

            // Chuyển hướng dựa vào role
            let redirectUrl = "index.html";
            if (foundUser.role === "admin" || foundUser.role === "Admin") {
                redirectUrl = "admin.html";
            } else if (foundUser.role === "nhanvien" || foundUser.role === "Nhân Viên") {
                redirectUrl = "NhaHang.html";
            } else if (foundUser.role === "shipper" || foundUser.role === "Shipper") {
                redirectUrl = "Shipper.html";
            }

            alert("Đăng nhập thành công!");
            window.location.href = redirectUrl;
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

    // Lấy role từ radio button accountType
    const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
    let role = 'khachhang'; // Mặc định là khách hàng
    
    for (const radio of accountTypeRadios) {
        if (radio.checked) {
            role = radio.value;
            break;
        }
    }
    
    // Nếu username là "admin" thì tự động set role admin
    if (username.toLowerCase() === "admin") {
        role = "admin";
    }

    const newUser = {
        fullname: fullname,
        username: username,
        password: password,
        createdAt: new Date().toISOString(),
        role: role
    };

    // Nếu là tài khoản nhà hàng, tạo nhà hàng mới
    if (role === "nhanvien" || role === "Nhà hàng") {
        const restaurantId = 'rest_' + Date.now();
        newUser.restaurantId = restaurantId;
        
        // Tạo nhà hàng mới
        createRestaurantForUser(restaurantId, fullname, username);
    }

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

// Hàm tạo nhà hàng cho user
function createRestaurantForUser(restaurantId, fullname, username) {
    let restaurants = [];
    try {
        const restaurantsData = localStorage.getItem('restaurants');
        if (restaurantsData) {
            restaurants = JSON.parse(restaurantsData);
        }
    } catch (error) {
        console.error("Lỗi khi đọc dữ liệu nhà hàng:", error);
    }
    
    // Kiểm tra xem nhà hàng đã tồn tại chưa
    const existingRestaurant = restaurants.find(r => r.id === restaurantId);
    if (existingRestaurant) {
        return; // Nhà hàng đã tồn tại
    }
    
    // Tạo nhà hàng mới
    const newRestaurant = {
        id: restaurantId,
        name: fullname || username + ' Restaurant',
        description: 'Nhà hàng của ' + fullname,
        image: './img/Logo_icon.png',
        address: 'Chưa cập nhật',
        phone: 'Chưa cập nhật',
        rating: 5.0,
        deliveryTime: '30-45 phút',
        minOrder: 50000,
        ownerUsername: username, // Liên kết với tài khoản
        products: []
    };
    
    restaurants.push(newRestaurant);
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    console.log('Đã tạo nhà hàng mới:', restaurantId);
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
    const nhanvienItem = document.getElementById('nhanvien');
    const shipperItem = document.getElementById('shipper');

    if (currentUser) {
        if (textDndk) textDndk.style.display = 'none';
        if (textTk) {
            textTk.style.display = 'inline';
            const displayName = currentUser.fullname || currentUser.username;
            textTk.innerHTML = displayName + '<i class="fa-solid fa-caret-down"></i>';
        }

        // Ẩn tất cả menu đăng nhập/đăng ký
        noAccItems.forEach(item => item.style.display = 'none');
        
        // Ẩn TẤT CẢ menu quản lý trước
        yesAccItems.forEach(item => item.style.display = 'none');
        if (adminItem) adminItem.style.display = 'none';
        if (nhanvienItem) nhanvienItem.style.display = 'none';
        if (shipperItem) shipperItem.style.display = 'none';

        // PHÂN QUYỀN - chỉ hiển thị menu phù hợp
        const userRole = (currentUser.role || '').toLowerCase();
        
        // Luôn hiển thị menu đăng xuất
        if (dangXuatBtn) {
            const dangXuatParent = dangXuatBtn.closest('.yes_acc');
            if (dangXuatParent) dangXuatParent.style.display = 'block';
            
            dangXuatBtn.addEventListener('click', function (e) {
                e.preventDefault();
                logout();
            });
        }
        
        // Hiển thị menu theo role
        switch (userRole) {
            case "admin":
                if (adminItem) adminItem.style.display = "block";
                if (nhanvienItem) nhanvienItem.style.display = "block";
                if (shipperItem) shipperItem.style.display = "block";
                break;
            case "nhân viên":
            case "nhanvien":
                if (nhanvienItem) nhanvienItem.style.display = "block";
                break;
            case "shipper":
                if (shipperItem) shipperItem.style.display = "block";
                break;
            case "khachhang":
            case "user":
            default:
                // Khách hàng => không hiển thị menu quản lý nào
                break;
        }
    } else {
        if (textDndk) textDndk.style.display = 'inline';
        if (textTk) textTk.style.display = 'none';

        noAccItems.forEach(item => item.style.display = 'block');
        yesAccItems.forEach(item => item.style.display = 'none');
    }
}
 

 //Phân quyền hiển thị giao diện

document.addEventListener("DOMContentLoaded", function () {

    const textDNDK = document.getElementById("text_dndk");
    const textTK = document.getElementById("text_tk");

    const admin = document.getElementById("admin");
    const nhanvien = document.getElementById("nhanvien");
    const shipper = document.getElementById("shipper");
    const dangXuat = document.getElementById("dang_xuat");

    const noAcc = document.querySelectorAll(".no_acc");
    const yesAcc = document.querySelectorAll(".yes_acc");

    // lấy thông tin đăng nhập
    const user = JSON.parse(localStorage.getItem("currentUser"));
    
    // CHƯA ĐĂNG NHẬP
    if (!user) {
        textDNDK.style.display = "block";
        textTK.style.display = "none";

        noAcc.forEach(i => i.style.display = "block");
        yesAcc.forEach(i => i.style.display = "none");
        return;
    }

    // ĐÃ ĐĂNG NHẬP
    textDNDK.style.display = "none";
    textTK.style.display = "block";
    const displayName = user.fullname || user.username;
    textTK.innerHTML = displayName + '<i class="fa-solid fa-caret-down"></i>';

    // Ẩn tất cả menu đăng nhập/đăng ký
    noAcc.forEach(i => i.style.display = "none");
    
    // Ẩn TẤT CẢ menu quản lý trước, sau đó chỉ hiển thị menu phù hợp
    if (admin) admin.style.display = "none";
    if (nhanvien) nhanvien.style.display = "none";
    if (shipper) shipper.style.display = "none";
    
    // Hiển thị menu đăng xuất (luôn hiển thị khi đã đăng nhập)
    if (dangXuat) {
        const dangXuatParent = dangXuat.closest('.yes_acc');
        if (dangXuatParent) dangXuatParent.style.display = "block";
    }

    // KIỂM SOÁT QUYỀN THEO ROLE - chỉ hiển thị menu phù hợp
    const userRole = (user.role || '').toLowerCase();
    
    switch (userRole) {
        case "admin":
            if (admin) admin.style.display = "block";
            if (nhanvien) nhanvien.style.display = "block";
            if (shipper) shipper.style.display = "block";
            break;

        case "nhân viên":
        case "nhanvien":
            if (nhanvien) nhanvien.style.display = "block";
            break;

        case "shipper":
            if (shipper) shipper.style.display = "block";
            break;

        case "khachhang":
        case "user":
        default:
            // Khách hàng => KHÔNG hiển thị bất kỳ menu quản lý nào, chỉ có đăng xuất
            // Tất cả đã được ẩn ở trên
            break;
    }

    // Đăng xuất
    dangXuat.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("loginTime");
        window.location.href = "index.html";
    });
});

// Các hàm khởi tạo đã được chuyển sang init_sample_data.js
// Giữ lại để tương thích ngược

// Khởi tạo
function initPage() {
    // Dữ liệu mẫu được khởi tạo tự động bởi init_sample_data.js
    updateHeader();
}