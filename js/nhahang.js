// Quản lý sản phẩm cho nhà hàng
let products = JSON.parse(localStorage.getItem('products')) || [];

// Hàm thêm sản phẩm mới
function addProduct() {
    const category = document.getElementById('category').value;
    const name = document.getElementById('new-name').value.trim();
    const price = document.getElementById('new-price').value.trim();
    const imageLink = document.getElementById('link-img').value.trim();
    const description = document.getElementById('new-description').value.trim();

    // Validate
    if (!name || !price || !imageLink) {
        alert('Vui lòng điền đầy đủ thông tin: Tên món, Giá, và Link ảnh!');
        return;
    }

    // Validate giá
    const priceNum = parseInt(price.replace(/[^0-9]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
        alert('Giá không hợp lệ!');
        return;
    }

    // Tạo sản phẩm mới
    const newProduct = {
        id: Date.now() + Math.random(),
        category: category,
        name: name,
        price: priceNum,
        image: imageLink,
        description: description || name + ' - Món ăn ngon miệng',
        createdAt: new Date().toISOString()
    };

    // Thêm vào danh sách
    products.push(newProduct);
    
    // Lưu vào localStorage
    localStorage.setItem('products', JSON.stringify(products));

    // Reset form
    document.getElementById('new-name').value = '';
    document.getElementById('new-price').value = '';
    document.getElementById('link-img').value = '';
    document.getElementById('new-description').value = '';

    // Hiển thị lại danh sách
    displayProducts();
    
    alert('Thêm sản phẩm thành công!');
}

// Hàm xóa sản phẩm
function deleteAdminProduct(button) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }

    // Tìm sản phẩm từ button
    const productItem = button.closest('.product_item');
    if (!productItem) {
        alert('Không tìm thấy sản phẩm!');
        return;
    }

    // Lấy tên sản phẩm để tìm trong danh sách
    const nameElement = productItem.querySelector('.name-box strong');
    if (!nameElement) {
        alert('Không tìm thấy thông tin sản phẩm!');
        return;
    }

    const productName = nameElement.textContent.trim();
    
    // Xóa khỏi danh sách
    products = products.filter(p => p.name !== productName);
    
    // Lưu lại
    localStorage.setItem('products', JSON.stringify(products));
    
    // Xóa khỏi DOM
    productItem.remove();
    
    alert('Xóa sản phẩm thành công!');
}

// Hàm hiển thị sản phẩm
function displayProducts() {
    const category = document.getElementById('category').value;
    const productList = document.getElementById('product-list');
    
    if (!productList) return;
    
    // Lọc sản phẩm theo category
    const filteredProducts = products.filter(p => p.category === category);
    
    // Xóa nội dung cũ (giữ lại các sản phẩm mẫu nếu không có sản phẩm nào)
    if (filteredProducts.length === 0) {
        return; // Giữ lại sản phẩm mẫu
    }
    
    // Có thể cập nhật để hiển thị sản phẩm từ localStorage
    // productList.innerHTML = filteredProducts.map(p => createProductHTML(p)).join('');
}

// ========== QUẢN LÝ ĐƠN HÀNG ==========

let restaurantOrders = [];
let currentOrderFilter = 'all';

// Hàm chuyển tab
function showTab(tabName) {
    // Ẩn tất cả tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    if (tabName === 'products') {
        document.getElementById('products-tab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tabName === 'orders') {
        document.getElementById('orders-tab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        loadRestaurantOrders();
    }
}

// Hàm lọc đơn hàng
function filterOrders(filter) {
    currentOrderFilter = filter;
    
    // Cập nhật nút active
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadRestaurantOrders();
}

// Hàm load đơn hàng từ localStorage
function loadRestaurantOrders() {
    const ordersData = localStorage.getItem('restaurant_orders');
    if (ordersData) {
        try {
            restaurantOrders = JSON.parse(ordersData);
        } catch (error) {
            console.error('Lỗi khi đọc đơn hàng:', error);
            restaurantOrders = [];
        }
    } else {
        restaurantOrders = [];
    }
    
    displayRestaurantOrders();
    updateOrderNotification();
}

// Hàm hiển thị đơn hàng
function displayRestaurantOrders() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    // Lọc đơn hàng theo filter
    let filteredOrders = restaurantOrders;
    if (currentOrderFilter !== 'all') {
        filteredOrders = restaurantOrders.filter(order => {
            return order.restaurantStatus === currentOrderFilter;
        });
    }
    
    // Sắp xếp: đơn mới nhất lên đầu
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fa-solid fa-clipboard-list" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p>Không có đơn hàng nào</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => createOrderCardHTML(order)).join('');
    
    // Thêm event listeners
    attachOrderListeners();
}

// Hàm tạo HTML cho order card
function createOrderCardHTML(order) {
    const statusText = {
        'new': 'Đơn mới',
        'confirmed': 'Đã xác nhận',
        'preparing': 'Đang chuẩn bị',
        'ready': 'Sẵn sàng giao',
        'assigned': 'Đã giao shipper'
    };
    
    const statusClass = {
        'new': 'status-new',
        'confirmed': 'status-confirmed',
        'preparing': 'status-preparing',
        'ready': 'status-ready',
        'assigned': 'status-assigned'
    };
    
    const itemsHTML = order.items.map(item => 
        `<li>${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)} VNĐ</li>`
    ).join('');
    
    let actionsHTML = '';
    if (order.restaurantStatus === 'new') {
        actionsHTML = `
            <button class="btn-action btn-confirm" onclick="confirmOrder('${order.id}')">
                <i class="fa-solid fa-check"></i> Xác nhận đơn
            </button>
            <button class="btn-action btn-cancel" onclick="cancelOrder('${order.id}')">
                <i class="fa-solid fa-times"></i> Hủy đơn
            </button>
        `;
    } else if (order.restaurantStatus === 'confirmed') {
        actionsHTML = `
            <button class="btn-action btn-preparing" onclick="startPreparing('${order.id}')">
                <i class="fa-solid fa-utensils"></i> Bắt đầu chuẩn bị
            </button>
        `;
    } else if (order.restaurantStatus === 'preparing') {
        actionsHTML = `
            <button class="btn-action btn-ready" onclick="markReady('${order.id}')">
                <i class="fa-solid fa-check-circle"></i> Đã sẵn sàng
            </button>
        `;
    } else if (order.restaurantStatus === 'ready') {
        actionsHTML = `
            <button class="btn-action btn-assign" onclick="assignToShipper('${order.id}')">
                <i class="fa-solid fa-truck"></i> Giao cho shipper
            </button>
        `;
    } else if (order.restaurantStatus === 'assigned') {
        actionsHTML = `
            <span style="color: #28a745;">Đã giao cho shipper: ${order.shipperId || 'Chưa xác định'}</span>
        `;
    }
    
    return `
        <div class="restaurant-order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div>
                    <strong>Đơn hàng #${order.id}</strong>
                    <span class="order-status ${statusClass[order.restaurantStatus]}">${statusText[order.restaurantStatus]}</span>
                </div>
                <div class="order-time">
                    <i class="fa-solid fa-clock"></i> ${formatDateTime(order.createdAt)}
                </div>
            </div>
            <div class="order-info">
                <div class="info-row">
                    <i class="fa-solid fa-user"></i>
                    <span><strong>Khách hàng:</strong> ${order.customerName}</span>
                </div>
                <div class="info-row">
                    <i class="fa-solid fa-phone"></i>
                    <span><strong>SĐT:</strong> ${order.customerPhone}</span>
                </div>
                <div class="info-row">
                    <i class="fa-solid fa-location-dot"></i>
                    <span><strong>Địa chỉ:</strong> ${order.customerAddress}</span>
                </div>
                <div class="info-row">
                    <i class="fa-solid fa-credit-card"></i>
                    <span><strong>Thanh toán:</strong> ${getPaymentMethodText(order.paymentMethod)}</span>
                </div>
                ${order.note ? `
                <div class="info-row">
                    <i class="fa-solid fa-note-sticky"></i>
                    <span><strong>Ghi chú:</strong> ${order.note}</span>
                </div>
                ` : ''}
            </div>
            <div class="order-items">
                <strong>Danh sách món:</strong>
                <ul>${itemsHTML}</ul>
            </div>
            <div class="order-footer">
                <div class="order-total">
                    <strong>Tổng tiền: <span style="color: var(--orange); font-size: 18px;">${formatPrice(order.total)} VNĐ</span></strong>
                </div>
                <div class="order-actions">
                    ${actionsHTML}
                </div>
            </div>
        </div>
    `;
}

// Hàm xác nhận đơn hàng
function confirmOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn xác nhận đơn hàng này?')) {
        return;
    }
    
    const order = restaurantOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }
    
    order.restaurantStatus = 'confirmed';
    order.confirmedAt = new Date().toISOString();
    
    saveRestaurantOrders();
    displayRestaurantOrders();
    updateOrderNotification();
    
    showNotification('Đã xác nhận đơn hàng!');
}

// Hàm hủy đơn hàng
function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        return;
    }
    
    const order = restaurantOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }
    
    order.restaurantStatus = 'cancelled';
    order.cancelledAt = new Date().toISOString();
    
    saveRestaurantOrders();
    displayRestaurantOrders();
    updateOrderNotification();
    
    showNotification('Đã hủy đơn hàng!');
}

// Hàm bắt đầu chuẩn bị
function startPreparing(orderId) {
    const order = restaurantOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }
    
    order.restaurantStatus = 'preparing';
    order.preparingAt = new Date().toISOString();
    
    saveRestaurantOrders();
    displayRestaurantOrders();
    updateOrderNotification();
    
    showNotification('Đã bắt đầu chuẩn bị đơn hàng!');
}

// Hàm đánh dấu sẵn sàng
function markReady(orderId) {
    const order = restaurantOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }
    
    order.restaurantStatus = 'ready';
    order.readyAt = new Date().toISOString();
    
    saveRestaurantOrders();
    displayRestaurantOrders();
    updateOrderNotification();
    
    showNotification('Đơn hàng đã sẵn sàng giao!');
}

// Hàm giao cho shipper
function assignToShipper(orderId) {
    const order = restaurantOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }
    
    // Lấy danh sách shipper (từ users có role shipper)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const shippers = users.filter(u => u.role === 'shipper' || u.role === 'Shipper');
    
    if (shippers.length === 0) {
        alert('Hiện chưa có shipper nào trong hệ thống!');
        return;
    }
    
    // Hiển thị dialog chọn shipper
    const shipperList = shippers.map(s => 
        `<option value="${s.username}">${s.fullname || s.username}</option>`
    ).join('');
    
    const selectedShipper = prompt(`Chọn shipper:\n${shippers.map((s, i) => `${i+1}. ${s.fullname || s.username}`).join('\n')}\n\nNhập số thứ tự:`, '1');
    
    if (!selectedShipper) return;
    
    const shipperIndex = parseInt(selectedShipper) - 1;
    if (shipperIndex < 0 || shipperIndex >= shippers.length) {
        alert('Lựa chọn không hợp lệ!');
        return;
    }
    
    const selectedShipperUser = shippers[shipperIndex];
    
    order.restaurantStatus = 'assigned';
    order.shipperId = selectedShipperUser.username;
    order.assignedAt = new Date().toISOString();
    order.status = 'pending'; // Trạng thái cho shipper
    
    // Lưu vào danh sách đơn hàng cho shipper
    let shipperOrders = JSON.parse(localStorage.getItem('shipper_orders')) || [];
    shipperOrders.push(order);
    localStorage.setItem('shipper_orders', JSON.stringify(shipperOrders));
    
    saveRestaurantOrders();
    displayRestaurantOrders();
    updateOrderNotification();
    
    showNotification(`Đã giao đơn hàng cho shipper: ${selectedShipperUser.fullname || selectedShipperUser.username}!`);
}

// Hàm lưu đơn hàng
function saveRestaurantOrders() {
    localStorage.setItem('restaurant_orders', JSON.stringify(restaurantOrders));
}

// Hàm cập nhật thông báo đơn hàng mới
function updateOrderNotification() {
    const newOrdersCount = restaurantOrders.filter(o => o.restaurantStatus === 'new').length;
    const badge = document.getElementById('order-notification-badge');
    const notificationIcon = document.getElementById('number_items');
    
    if (badge) {
        if (newOrdersCount > 0) {
            badge.textContent = newOrdersCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
    
    if (notificationIcon) {
        if (newOrdersCount > 0) {
            notificationIcon.textContent = newOrdersCount;
            notificationIcon.style.display = 'block';
        } else {
            notificationIcon.style.display = 'none';
        }
    }
}

// Hàm attach event listeners
function attachOrderListeners() {
    // Có thể thêm các event listeners khác ở đây
}

// Hàm format giá
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

// Hàm format datetime
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Hàm lấy text phương thức thanh toán
function getPaymentMethodText(method) {
    const methods = {
        'cash': 'Thanh toán khi nhận hàng (COD)',
        'bank': 'Chuyển khoản ngân hàng',
        'momo': 'Ví điện tử MoMo',
        'zalopay': 'Ví điện tử ZaloPay'
    };
    return methods[method] || method;
}

// Hàm hiển thị thông báo
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: var(--orange);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 999999;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Khởi tạo khi DOM đã tải
document.addEventListener('DOMContentLoaded', function() {
    // Load sản phẩm từ localStorage
    products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Hiển thị sản phẩm
    displayProducts();
    
    // Thêm sự kiện cho select category
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', displayProducts);
    }
    
    // Load đơn hàng
    loadRestaurantOrders();
    
    // Kiểm tra đơn hàng mới mỗi 5 giây
    setInterval(() => {
        loadRestaurantOrders();
    }, 5000);
});

