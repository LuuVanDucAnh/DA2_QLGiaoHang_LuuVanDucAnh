// Quản lý đơn hàng của khách hàng

let currentCustomer = null;
let currentOrderFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check login
    currentCustomer = getCurrentUser();
    
    if (!currentCustomer) {
        alert('Vui lòng đăng nhập để xem đơn hàng!');
        window.location.href = 'sign_in.html';
        return;
    }
    
    // Load orders
    loadMyOrders();
    
    // Auto refresh every 5 seconds
    setInterval(() => {
        loadMyOrders();
    }, 5000);
    
    // Setup modal
    setupModal();
});

// Setup modal
function setupModal() {
    const modal = document.getElementById('order-detail-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Load my orders
function loadMyOrders() {
    if (!currentCustomer) {
        currentCustomer = getCurrentUser();
        if (!currentCustomer) return;
    }
    
    // Lấy username của người dùng hiện tại
    const currentUsername = currentCustomer.username;
    if (!currentUsername) {
        console.error('Không tìm thấy username của người dùng!');
        return;
    }
    
    // Helper function để kiểm tra đơn hàng có thuộc về người dùng hiện tại không
    function isMyOrder(order) {
        // Ưu tiên kiểm tra customerId/customerUsername (cho đơn hàng mới)
        const orderCustomerId = order.customerId || order.customerUsername;
        if (orderCustomerId) {
            return orderCustomerId.toLowerCase() === currentUsername.toLowerCase();
        }
        
        // Fallback: Kiểm tra customerName và customerPhone (cho đơn hàng cũ)
        // So sánh với thông tin của người dùng hiện tại
        const currentFullname = currentCustomer.fullname || '';
        const currentPhone = currentCustomer.phone || '';
        
        const nameMatch = order.customerName && currentFullname && 
                         order.customerName.toLowerCase().includes(currentFullname.toLowerCase());
        const phoneMatch = order.customerPhone && currentPhone && 
                          order.customerPhone.replace(/\s/g, '') === currentPhone.replace(/\s/g, '');
        
        return nameMatch || phoneMatch;
    }
    
    // Get orders from customer_orders (synced from restaurant_orders)
    let customerOrders = JSON.parse(localStorage.getItem('customer_orders')) || [];
    
    // Lọc chỉ đơn hàng của người dùng hiện tại
    customerOrders = customerOrders.filter(order => isMyOrder(order));
    
    // Also sync from restaurant_orders to ensure we have latest status
    const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const myRestaurantOrders = restaurantOrders.filter(order => isMyOrder(order));
    
    // Merge and update customer_orders
    myRestaurantOrders.forEach(restaurantOrder => {
        const existingIndex = customerOrders.findIndex(o => o.id === restaurantOrder.id);
        if (existingIndex >= 0) {
            // Update existing order with latest status
            customerOrders[existingIndex] = {
                ...customerOrders[existingIndex],
                restaurantStatus: restaurantOrder.restaurantStatus,
                status: restaurantOrder.status,
                confirmedAt: restaurantOrder.confirmedAt || customerOrders[existingIndex].confirmedAt,
                preparingAt: restaurantOrder.preparingAt || customerOrders[existingIndex].preparingAt,
                readyAt: restaurantOrder.readyAt || customerOrders[existingIndex].readyAt,
                assignedAt: restaurantOrder.assignedAt || customerOrders[existingIndex].assignedAt,
                assignedTo: restaurantOrder.assignedTo || customerOrders[existingIndex].assignedTo,
                shipperId: restaurantOrder.shipperId || customerOrders[existingIndex].shipperId,
                completedAt: restaurantOrder.completedAt || customerOrders[existingIndex].completedAt
            };
        } else {
            // Add new order (chỉ nếu là đơn hàng của người dùng này)
            if (isMyOrder(restaurantOrder)) {
                // Đảm bảo đơn hàng có customerId để dễ lọc sau này
                if (!restaurantOrder.customerId && !restaurantOrder.customerUsername) {
                    restaurantOrder.customerId = currentUsername;
                    restaurantOrder.customerUsername = currentUsername;
                }
                customerOrders.push(restaurantOrder);
            }
        }
    });
    
    // Lọc lại một lần nữa để đảm bảo chỉ đơn hàng của người dùng hiện tại
    // Và cập nhật customerId cho các đơn hàng cũ chưa có
    customerOrders = customerOrders.filter(order => {
        if (isMyOrder(order)) {
            // Cập nhật customerId cho đơn hàng cũ chưa có
            if (!order.customerId && !order.customerUsername) {
                order.customerId = currentUsername;
                order.customerUsername = currentUsername;
            }
            return true;
        }
        return false;
    });
    
    // Save updated customer_orders (chỉ đơn hàng của người dùng này)
    localStorage.setItem('customer_orders', JSON.stringify(customerOrders));
    
    // Filter orders by status
    let filteredOrders = customerOrders;
    if (currentOrderFilter !== 'all') {
        filteredOrders = customerOrders.filter(order => {
            const status = order.restaurantStatus || order.status || 'new';
            return status === currentOrderFilter;
        });
    }
    
    // Lọc lại một lần nữa để đảm bảo chỉ đơn hàng của người dùng hiện tại
    filteredOrders = filteredOrders.filter(order => isMyOrder(order));
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    displayOrders(filteredOrders);
}

// Display orders
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="fa-solid fa-clipboard-list"></i>
                <h3>Chưa có đơn hàng nào</h3>
                <p>Bạn chưa có đơn hàng nào trong danh mục này</p>
                <a href="index.html" class="btn-primary">
                    <i class="fa-solid fa-utensils"></i> Đặt món ngay
                </a>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => createOrderCard(order)).join('');
    
    // Attach event listeners
    attachOrderListeners();
}

// Create order card
function createOrderCard(order) {
    const statusInfo = getOrderStatusInfo(order);
    const restaurant = getRestaurantById(order.restaurantId);
    const restaurantName = restaurant ? restaurant.name : 'N/A';
    
    return `
        <div class="customer-order-card" data-order-id="${order.id}">
            <div class="order-card-header">
                <div class="order-id-section">
                    <h4><i class="fa-solid fa-receipt"></i> Đơn hàng #${order.id}</h4>
                    <span class="order-date">${formatDateTime(order.createdAt)}</span>
                </div>
                <div class="order-status-section">
                    <span class="order-status-badge status-${statusInfo.class}">
                        <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                    </span>
                </div>
            </div>
            
            <div class="order-card-body">
                <div class="order-info-row">
                    <i class="fa-solid fa-store"></i>
                    <span><strong>Nhà hàng:</strong> ${restaurantName}</span>
                </div>
                <div class="order-info-row">
                    <i class="fa-solid fa-location-dot"></i>
                    <span><strong>Địa chỉ giao:</strong> ${order.customerAddress || 'N/A'}</span>
                </div>
                <div class="order-info-row">
                    <i class="fa-solid fa-money-bill-wave"></i>
                    <span><strong>Tổng tiền:</strong> <span class="order-total">${formatPrice(order.total || 0)} VNĐ</span></span>
                </div>
                ${order.items && order.items.length > 0 ? `
                <div class="order-items-preview">
                    <strong>Món ăn:</strong>
                    <div class="items-list">
                        ${order.items.slice(0, 3).map(item => `
                            <span class="item-tag">${item.name} x${item.quantity}</span>
                        `).join('')}
                        ${order.items.length > 3 ? `<span class="item-tag">+${order.items.length - 3} món khác</span>` : ''}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="order-card-footer">
                <button class="btn-view-detail" onclick="viewOrderDetail('${order.id}')">
                    <i class="fa-solid fa-eye"></i> Xem chi tiết
                </button>
                ${statusInfo.canCancel ? `
                <button class="btn-cancel-order" onclick="cancelMyOrder('${order.id}')">
                    <i class="fa-solid fa-times"></i> Hủy đơn
                </button>
                ` : ''}
            </div>
            
            ${statusInfo.timeline ? `
            <div class="order-timeline">
                ${statusInfo.timeline}
            </div>
            ` : ''}
        </div>
    `;
}

// Get order status info
function getOrderStatusInfo(order) {
    const status = order.restaurantStatus || order.status || 'new';
    
    const statusMap = {
        'new': {
            text: 'Đơn mới',
            class: 'new',
            icon: 'fa-solid fa-clock',
            canCancel: true,
            timeline: null
        },
        'confirmed': {
            text: 'Đã xác nhận',
            class: 'confirmed',
            icon: 'fa-solid fa-check',
            canCancel: true,
            timeline: order.confirmedAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Nhà hàng đã xác nhận đơn hàng</span>
                    <small>${formatDateTime(order.confirmedAt)}</small>
                </div>
            ` : null
        },
        'preparing': {
            text: 'Đang chuẩn bị',
            class: 'preparing',
            icon: 'fa-solid fa-utensils',
            canCancel: false,
            timeline: `
                ${order.confirmedAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Nhà hàng đã xác nhận</span>
                    <small>${formatDateTime(order.confirmedAt)}</small>
                </div>
                ` : ''}
                <div class="timeline-item active">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Nhà hàng đang chuẩn bị món</span>
                    ${order.preparingAt ? `<small>${formatDateTime(order.preparingAt)}</small>` : ''}
                </div>
            `
        },
        'ready': {
            text: 'Sẵn sàng giao',
            class: 'ready',
            icon: 'fa-solid fa-check-circle',
            canCancel: false,
            timeline: `
                ${order.confirmedAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã xác nhận</span>
                    <small>${formatDateTime(order.confirmedAt)}</small>
                </div>
                ` : ''}
                ${order.preparingAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã chuẩn bị xong</span>
                    <small>${formatDateTime(order.preparingAt)}</small>
                </div>
                ` : ''}
                <div class="timeline-item active">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Món đã sẵn sàng, đang chờ shipper</span>
                    ${order.readyAt ? `<small>${formatDateTime(order.readyAt)}</small>` : ''}
                </div>
            `
        },
        'assigned': {
            text: 'Đang giao hàng',
            class: 'delivering',
            icon: 'fa-solid fa-truck',
            canCancel: false,
            timeline: `
                ${order.confirmedAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã xác nhận</span>
                    <small>${formatDateTime(order.confirmedAt)}</small>
                </div>
                ` : ''}
                ${order.preparingAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã chuẩn bị</span>
                    <small>${formatDateTime(order.preparingAt)}</small>
                </div>
                ` : ''}
                ${order.readyAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã sẵn sàng</span>
                    <small>${formatDateTime(order.readyAt)}</small>
                </div>
                ` : ''}
                <div class="timeline-item active">
                    <i class="fa-solid fa-truck fa-bounce"></i>
                    <span>Shipper đang giao hàng đến bạn</span>
                    ${order.assignedAt ? `<small>${formatDateTime(order.assignedAt)}</small>` : ''}
                </div>
            `
        },
        'completed': {
            text: 'Hoàn thành',
            class: 'completed',
            icon: 'fa-solid fa-check-double',
            canCancel: false,
            timeline: `
                ${order.confirmedAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã xác nhận</span>
                    <small>${formatDateTime(order.confirmedAt)}</small>
                </div>
                ` : ''}
                ${order.preparingAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã chuẩn bị</span>
                    <small>${formatDateTime(order.preparingAt)}</small>
                </div>
                ` : ''}
                ${order.readyAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã sẵn sàng</span>
                    <small>${formatDateTime(order.readyAt)}</small>
                </div>
                ` : ''}
                ${order.assignedAt ? `
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Đã giao cho shipper</span>
                    <small>${formatDateTime(order.assignedAt)}</small>
                </div>
                ` : ''}
                <div class="timeline-item completed">
                    <i class="fa-solid fa-check-double"></i>
                    <span>Đã giao hàng thành công</span>
                    ${order.completedAt ? `<small>${formatDateTime(order.completedAt)}</small>` : ''}
                </div>
            `
        },
        'cancelled': {
            text: 'Đã hủy',
            class: 'cancelled',
            icon: 'fa-solid fa-times-circle',
            canCancel: false,
            timeline: `
                <div class="timeline-item cancelled">
                    <i class="fa-solid fa-times-circle"></i>
                    <span>Đơn hàng đã bị hủy</span>
                    ${order.cancelledAt ? `<small>${formatDateTime(order.cancelledAt)}</small>` : ''}
                </div>
            `
        }
    };
    
    return statusMap[status] || statusMap['new'];
}

// Filter orders
function filterMyOrders(filter) {
    currentOrderFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    loadMyOrders();
}

// View order detail
function viewOrderDetail(orderId) {
    const customerOrders = JSON.parse(localStorage.getItem('customer_orders')) || [];
    const order = customerOrders.find(o => o.id === orderId);
    
    if (!order) {
        // Try to get from restaurant_orders
        const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
        const restaurantOrder = restaurantOrders.find(o => o.id === orderId);
        if (restaurantOrder) {
            showOrderDetailModal(restaurantOrder);
            return;
        }
        alert('Không tìm thấy đơn hàng!');
        return;
    }
    
    showOrderDetailModal(order);
}

// Show order detail modal
function showOrderDetailModal(order) {
    const restaurant = getRestaurantById(order.restaurantId);
    const restaurantName = restaurant ? restaurant.name : 'N/A';
    const statusInfo = getOrderStatusInfo(order);
    
    const itemsHTML = order.items ? order.items.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-quantity">x${item.quantity}</span>
            </div>
            <span class="order-item-price">${formatPrice(item.price * item.quantity)} VNĐ</span>
        </div>
    `).join('') : '<p>Không có món ăn</p>';
    
    const content = document.getElementById('order-detail-content');
    if (content) {
        content.innerHTML = `
            <div class="order-detail-section">
                <h4><i class="fa-solid fa-info-circle"></i> Thông tin đơn hàng</h4>
                <div class="order-detail-item">
                    <strong>Mã đơn hàng:</strong> ${order.id}
                </div>
                <div class="order-detail-item">
                    <strong>Trạng thái:</strong> 
                    <span class="order-status-badge status-${statusInfo.class}">
                        <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                    </span>
                </div>
                <div class="order-detail-item">
                    <strong>Nhà hàng:</strong> ${restaurantName}
                </div>
                <div class="order-detail-item">
                    <strong>Thời gian đặt:</strong> ${formatDateTime(order.createdAt)}
                </div>
            </div>
            
            <div class="order-detail-section">
                <h4><i class="fa-solid fa-user"></i> Thông tin giao hàng</h4>
                <div class="order-detail-item">
                    <strong>Người nhận:</strong> ${order.customerName || 'N/A'}
                </div>
                <div class="order-detail-item">
                    <strong>Số điện thoại:</strong> ${order.customerPhone || 'N/A'}
                </div>
                <div class="order-detail-item">
                    <strong>Địa chỉ:</strong> ${order.customerAddress || 'N/A'}
                </div>
                ${order.note ? `
                <div class="order-detail-item">
                    <strong>Ghi chú:</strong> ${order.note}
                </div>
                ` : ''}
            </div>
            
            <div class="order-detail-section">
                <h4><i class="fa-solid fa-list"></i> Danh sách món ăn</h4>
                <div class="order-items">
                    ${itemsHTML}
                </div>
            </div>
            
            <div class="order-detail-section">
                <h4><i class="fa-solid fa-money-bill-wave"></i> Thanh toán</h4>
                <div class="order-detail-item">
                    <strong>Phương thức:</strong> ${getPaymentMethodText(order.paymentMethod)}
                </div>
                <div class="order-detail-item">
                    <strong>Tổng tiền:</strong> 
                    <span style="color: var(--orange); font-size: 20px; font-weight: bold;">
                        ${formatPrice(order.total || 0)} VNĐ
                    </span>
                </div>
            </div>
            
            ${statusInfo.timeline ? `
            <div class="order-detail-section">
                <h4><i class="fa-solid fa-clock-rotate-left"></i> Lịch sử cập nhật</h4>
                <div class="order-timeline">
                    ${statusInfo.timeline}
                </div>
            </div>
            ` : ''}
        `;
    }
    
    document.getElementById('order-detail-modal').style.display = 'block';
}

// Cancel my order
function cancelMyOrder(orderId) {
    if (!currentCustomer) {
        currentCustomer = getCurrentUser();
        if (!currentCustomer) return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        return;
    }
    
    // Update in restaurant_orders (chỉ nếu là đơn hàng của người dùng này)
    const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const orderIndex = restaurantOrders.findIndex(o => o.id === orderId && isMyOrder(o));
    
    if (orderIndex >= 0) {
        restaurantOrders[orderIndex].restaurantStatus = 'cancelled';
        restaurantOrders[orderIndex].status = 'cancelled';
        restaurantOrders[orderIndex].cancelledAt = new Date().toISOString();
        localStorage.setItem('restaurant_orders', JSON.stringify(restaurantOrders));
    } else {
        alert('Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn hàng này!');
        return;
    }
    
    // Update in customer_orders
    const customerOrders = JSON.parse(localStorage.getItem('customer_orders')) || [];
    const customerOrderIndex = customerOrders.findIndex(o => o.id === orderId && isMyOrder(o));
    
    if (customerOrderIndex >= 0) {
        customerOrders[customerOrderIndex].restaurantStatus = 'cancelled';
        customerOrders[customerOrderIndex].status = 'cancelled';
        customerOrders[customerOrderIndex].cancelledAt = new Date().toISOString();
        localStorage.setItem('customer_orders', JSON.stringify(customerOrders));
    }
    
    loadMyOrders();
    showNotification('Đã hủy đơn hàng thành công!');
}

// Attach order listeners
function attachOrderListeners() {
    // View detail buttons are already attached via onclick
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

// Format date time
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

// Get payment method text
function getPaymentMethodText(method) {
    const methods = {
        'cash': 'Thanh toán khi nhận hàng (COD)',
        'bank': 'Chuyển khoản ngân hàng',
        'momo': 'Ví điện tử MoMo',
        'zalopay': 'Ví điện tử ZaloPay'
    };
    return methods[method] || method || 'N/A';
}

// Show notification
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

