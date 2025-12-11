// Lưu trữ dữ liệu
let orders = [];
let products = JSON.parse(localStorage.getItem('restaurant_products')) || [];
let lastOrderCount = 0;

// Khởi tạo khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadProducts();
    updateNotifications();
    
    // Kiểm tra đơn hàng mới mỗi 3 giây
    setInterval(checkNewOrders, 3000);
    
    // Cập nhật thông báo mỗi 2 giây
    setInterval(updateNotifications, 2000);
});

// Hàm load đơn hàng từ localStorage
function loadOrders() {
    orders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    
    // Cập nhật số lượng đơn hàng
    updateOrderStats();
    
    // Hiển thị đơn hàng theo từng tab
    displayPendingOrders();
    displayPreparingOrders();
    displayReadyOrders();
    displayCompletedOrders();
    displayRecentOrders();
}

// Hàm kiểm tra đơn hàng mới
function checkNewOrders() {
    const currentOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const currentCount = currentOrders.filter(o => o.status === 'pending').length;
    
    if (currentCount > lastOrderCount) {
        // Có đơn hàng mới
        showNewOrderNotification();
        lastOrderCount = currentCount;
        loadOrders();
    }
}

// Hàm hiển thị thông báo đơn hàng mới
function showNewOrderNotification() {
    // Phát âm thanh thông báo (nếu có)
    if (typeof Audio !== 'undefined') {
        // Có thể thêm file âm thanh thông báo
    }
    
    // Hiển thị thông báo
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--orange), #e67339);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 999999999999;
        animation: slideInRight 0.5s ease;
        max-width: 350px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <i class="fa-solid fa-bell" style="font-size: 32px;"></i>
            <div>
                <h4 style="margin: 0 0 5px 0; font-size: 18px;">Đơn hàng mới!</h4>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Bạn có đơn hàng mới cần xử lý</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.5s ease reverse';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Hàm cập nhật thông báo
function updateNotifications() {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const notificationCount = pendingOrders.length;
    
    const notificationElement = document.getElementById('number_notifications');
    if (notificationElement) {
        if (notificationCount > 0) {
            notificationElement.textContent = notificationCount;
            notificationElement.style.display = 'block';
        } else {
            notificationElement.style.display = 'none';
        }
    }
    
    // Cập nhật badge
    const badgePending = document.getElementById('badge-pending');
    if (badgePending) {
        badgePending.textContent = notificationCount;
    }
}

// Hàm cập nhật thống kê
function updateOrderStats() {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-preparing').textContent = preparing;
    document.getElementById('stat-ready').textContent = ready;
    document.getElementById('stat-completed').textContent = completed;
    
    // Cập nhật badge
    document.getElementById('badge-pending').textContent = pending;
    document.getElementById('badge-preparing').textContent = preparing;
    document.getElementById('badge-ready').textContent = ready;
}

// Hàm hiển thị đơn hàng chờ
function displayPendingOrders() {
    const container = document.getElementById('pending-orders-list');
    if (!container) return;
    
    const pendingOrders = orders.filter(o => o.status === 'pending');
    
    if (pendingOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-inbox"></i>
                <p>Không có đơn hàng chờ xử lý</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pendingOrders.map(order => createOrderCard(order)).join('');
}

// Hàm hiển thị đơn hàng đang làm
function displayPreparingOrders() {
    const container = document.getElementById('preparing-orders-list');
    if (!container) return;
    
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    
    if (preparingOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-utensils"></i>
                <p>Không có đơn hàng đang làm món</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = preparingOrders.map(order => createOrderCard(order)).join('');
}

// Hàm hiển thị đơn hàng sẵn sàng giao
function displayReadyOrders() {
    const container = document.getElementById('ready-orders-list');
    if (!container) return;
    
    const readyOrders = orders.filter(o => o.status === 'ready');
    
    if (readyOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-check-circle"></i>
                <p>Không có đơn hàng sẵn sàng giao</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = readyOrders.map(order => createOrderCard(order)).join('');
}

// Hàm hiển thị đơn hàng đã hoàn thành
function displayCompletedOrders() {
    const container = document.getElementById('completed-orders-list');
    if (!container) return;
    
    const completedOrders = orders.filter(o => o.status === 'completed').slice(0, 20); // Chỉ hiển thị 20 đơn gần nhất
    
    if (completedOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clipboard-check"></i>
                <p>Chưa có đơn hàng đã hoàn thành</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = completedOrders.map(order => createOrderCard(order)).join('');
}

// Hàm hiển thị đơn hàng gần đây
function displayRecentOrders() {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;
    
    const recentOrders = orders.slice(-5).reverse(); // 5 đơn hàng gần nhất
    
    if (recentOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-inbox"></i>
                <p>Chưa có đơn hàng nào</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentOrders.map(order => createOrderCard(order)).join('');
}

// Hàm tạo card đơn hàng
function createOrderCard(order) {
    const statusClass = order.status;
    const statusText = {
        'pending': 'Chờ xử lý',
        'preparing': 'Đang làm món',
        'ready': 'Sẵn sàng giao',
        'completed': 'Đã hoàn thành'
    };
    
    let actionButtons = '';
    if (order.status === 'pending') {
        actionButtons = `
            <button class="btn-action btn-accept" onclick="acceptOrder('${order.id}')">
                <i class="fa-solid fa-check"></i> Nhận đơn
            </button>
            <button class="btn-action btn-detail" onclick="showOrderDetail('${order.id}')">
                <i class="fa-solid fa-eye"></i> Chi tiết
            </button>
        `;
    } else if (order.status === 'preparing') {
        actionButtons = `
            <button class="btn-action btn-ready" onclick="markAsReady('${order.id}')">
                <i class="fa-solid fa-check-circle"></i> Hoàn thành món
            </button>
            <button class="btn-action btn-detail" onclick="showOrderDetail('${order.id}')">
                <i class="fa-solid fa-eye"></i> Chi tiết
            </button>
        `;
    } else if (order.status === 'ready') {
        actionButtons = `
            <button class="btn-action btn-detail" onclick="showOrderDetail('${order.id}')">
                <i class="fa-solid fa-eye"></i> Chi tiết
            </button>
        `;
    } else {
        actionButtons = `
            <button class="btn-action btn-detail" onclick="showOrderDetail('${order.id}')">
                <i class="fa-solid fa-eye"></i> Chi tiết
            </button>
        `;
    }
    
    const itemsList = order.items.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.name}</span>
            <span class="order-item-quantity">x${item.quantity}</span>
            <span class="order-item-price">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</span>
        </div>
    `).join('');
    
    return `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Đơn hàng #${order.id}</span>
                <span class="order-status ${statusClass}">${statusText[order.status]}</span>
            </div>
            <div class="order-info">
                <div class="info-item">
                    <i class="fa-solid fa-user"></i>
                    <span><strong>Khách hàng:</strong> ${order.customer.name}</span>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-phone"></i>
                    <span><strong>SĐT:</strong> ${order.customer.phone}</span>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-location-dot"></i>
                    <span><strong>Địa chỉ:</strong> ${order.customer.address}</span>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-clock"></i>
                    <span><strong>Thời gian:</strong> ${order.createdAt}</span>
                </div>
            </div>
            <div class="order-items">
                <h4>Danh sách món ăn:</h4>
                ${itemsList}
            </div>
            <div class="order-total">
                Tổng tiền: ${order.total.toLocaleString('vi-VN')} VNĐ
            </div>
            ${order.note ? `<p style="margin-top: 10px; color: #666; font-style: italic;"><strong>Ghi chú:</strong> ${order.note}</p>` : ''}
            <div class="order-actions">
                ${actionButtons}
            </div>
        </div>
    `;
}

// Hàm nhận đơn hàng (chuyển từ pending sang preparing)
function acceptOrder(orderId) {
    if (confirm('Bạn có chắc chắn muốn nhận đơn hàng này?')) {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex > -1) {
            orders[orderIndex].status = 'preparing';
            orders[orderIndex].acceptedAt = new Date().toLocaleString('vi-VN');
            saveOrders();
            loadOrders();
            updateNotifications();
        }
    }
}

// Hàm đánh dấu sẵn sàng giao (chuyển từ preparing sang ready)
function markAsReady(orderId) {
    if (confirm('Món ăn đã hoàn thành và sẵn sàng giao?')) {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex > -1) {
            orders[orderIndex].status = 'ready';
            orders[orderIndex].readyAt = new Date().toLocaleString('vi-VN');
            saveOrders();
            loadOrders();
            
            // Thông báo cho shipper (lưu vào shipper_orders)
            notifyShipper(orders[orderIndex]);
        }
    }
}

// Hàm thông báo cho shipper
function notifyShipper(order) {
    let shipperOrders = JSON.parse(localStorage.getItem('shipper_orders')) || [];
    shipperOrders.push({
        ...order,
        shipperStatus: 'pending' // Chờ shipper nhận
    });
    localStorage.setItem('shipper_orders', JSON.stringify(shipperOrders));
}

// Hàm hiển thị chi tiết đơn hàng
function showOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const itemsList = order.items.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.name}</span>
            <span class="order-item-quantity">x${item.quantity}</span>
            <span class="order-item-price">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</span>
        </div>
    `).join('');
    
    alert(`
Đơn hàng #${order.id}
Khách hàng: ${order.customer.name}
SĐT: ${order.customer.phone}
Địa chỉ: ${order.customer.address}
Phương thức thanh toán: ${getPaymentMethodText(order.paymentMethod)}
${order.note ? `Ghi chú: ${order.note}` : ''}

Danh sách món ăn:
${order.items.map(item => `- ${item.name} x${item.quantity}: ${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ`).join('\n')}

Tổng tiền: ${order.total.toLocaleString('vi-VN')} VNĐ
Thời gian đặt: ${order.createdAt}
    `);
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

// Hàm lưu đơn hàng
function saveOrders() {
    localStorage.setItem('restaurant_orders', JSON.stringify(orders));
}

// ========== QUẢN LÝ MÓN ĂN ==========

// Hàm load món ăn
function loadProducts() {
    const container = document.getElementById('product-list');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-utensils"></i>
                <p>Chưa có món ăn nào. Hãy thêm món ăn mới!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map((product, index) => `
        <div class="product_item">
            <div class="img-box">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="name-box">
                <strong>${product.name}</strong>
            </div>
            <div class="price-box">
                ${product.price.toLocaleString('vi-VN')} VNĐ
            </div>
            <div class="desc-box">
                <em>${product.description}</em>
            </div>
            <div class="btn-box">
                <button class="btn-edit" onclick="editProduct(${index})">
                    <i class="fa-solid fa-edit"></i> Sửa
                </button>
                <button class="btn-delete" onclick="deleteProduct(${index})">
                    <i class="fa-solid fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `).join('');
}

// Hàm thêm món ăn
function addProduct() {
    const name = document.getElementById('new-name').value.trim();
    const price = parseInt(document.getElementById('new-price').value);
    const image = document.getElementById('link-img').value.trim();
    const description = document.getElementById('new-description').value.trim();
    const category = document.getElementById('category').value;
    
    if (!name || !price || !image) {
        alert('Vui lòng điền đầy đủ thông tin: Tên, Giá, và Link ảnh!');
        return;
    }
    
    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        image: image,
        description: description || name,
        category: category
    };
    
    products.push(newProduct);
    saveProducts();
    loadProducts();
    
    // Reset form
    document.getElementById('new-name').value = '';
    document.getElementById('new-price').value = '';
    document.getElementById('link-img').value = '';
    document.getElementById('new-description').value = '';
    
    alert('Đã thêm món ăn thành công!');
}

// Hàm sửa món ăn
function editProduct(index) {
    const product = products[index];
    if (!product) return;
    
    const newName = prompt('Tên món ăn mới:', product.name);
    if (!newName) return;
    
    const newPrice = prompt('Giá mới (VNĐ):', product.price);
    if (!newPrice) return;
    
    const newImage = prompt('Link ảnh mới:', product.image);
    if (!newImage) return;
    
    const newDescription = prompt('Mô tả mới:', product.description);
    
    products[index] = {
        ...product,
        name: newName,
        price: parseInt(newPrice),
        image: newImage,
        description: newDescription || newName
    };
    
    saveProducts();
    loadProducts();
    alert('Đã cập nhật món ăn thành công!');
}

// Hàm xóa món ăn
function deleteProduct(index) {
    if (confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
        products.splice(index, 1);
        saveProducts();
        loadProducts();
        alert('Đã xóa món ăn thành công!');
    }
}

// Hàm lưu món ăn
function saveProducts() {
    localStorage.setItem('restaurant_products', JSON.stringify(products));
}

