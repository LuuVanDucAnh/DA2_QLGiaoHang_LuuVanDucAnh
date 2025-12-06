// Shipper JavaScript

let currentShipper = null;
let allOrders = [];
let currentFilter = 'all';

// Initialize shipper page
function initShipper() {
    // Get current user
    currentShipper = getCurrentUser();
    
    if (!currentShipper) {
        alert("Vui lòng đăng nhập để sử dụng giao diện shipper!");
        window.location.href = "sign_in.html";
        return;
    }

    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadOrders();
    loadStatistics();
    
    // Setup menu navigation
    setupMenuNavigation();
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterMyOrders(currentFilter);
        });
    });

    // Modal close
    const modal = document.getElementById('order-modal');
    const closeModal = document.querySelector('.close-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Setup menu navigation
function setupMenuNavigation() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding tab
            const tabId = this.dataset.tab;
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.classList.add('active');
                
                // Load data for the tab
                if (tabId === 'pending-orders') {
                    loadPendingOrders();
                } else if (tabId === 'my-orders') {
                    loadMyOrders();
                } else if (tabId === 'completed-orders') {
                    loadCompletedOrders();
                } else if (tabId === 'statistics') {
                    loadStatistics();
                } else if (tabId === 'dashboard') {
                    loadDashboard();
                }
            }
        });
    });
}

// Load all orders
function loadOrders() {
    const ordersData = localStorage.getItem('orders');
    if (ordersData) {
        try {
allOrders = JSON.parse(ordersData);
        } catch (error) {
            console.error("Error parsing orders:", error);
            allOrders = [];
        }
    } else {
        allOrders = [];
    }
    
    // Initialize with sample data if empty
    if (allOrders.length === 0) {
        initializeSampleOrders();
    }
    
    updateStats();
    loadDashboard();
}

// Initialize sample orders for testing
function initializeSampleOrders() {
    if (localStorage.getItem('orders')) return; // Don't override existing orders
    
    const sampleOrders = [
        {
            id: 'ORD001',
            customerName: 'Nguyễn Văn A',
            customerPhone: '0123456789',
            customerAddress: '123 Đường ABC, Quận 1, TP.HCM',
            items: [
                { name: 'Gà chiên mắm', quantity: 2, price: 45000 },
                { name: 'Cơm trắng', quantity: 2, price: 10000 }
            ],
            total: 110000,
            status: 'pending',
            createdAt: new Date().toISOString(),
            shipperId: null
        },
        {
            id: 'ORD002',
            customerName: 'Trần Thị B',
            customerPhone: '0987654321',
            customerAddress: '456 Đường XYZ, Quận 2, TP.HCM',
            items: [
                { name: 'Lẩu thái chua cay', quantity: 1, price: 220000 },
                { name: 'Nước ngọt', quantity: 2, price: 15000 }
            ],
            total: 250000,
            status: 'pending',
            createdAt: new Date().toISOString(),
            shipperId: null
        }
    ];
    
    localStorage.setItem('orders', JSON.stringify(sampleOrders));
    allOrders = sampleOrders;
}

// Load dashboard
function loadDashboard() {
    updateStats();
    loadRecentOrders();
}

// Load recent orders
function loadRecentOrders() {
    const recentOrdersContainer = document.getElementById('recent-orders-list');
    if (!recentOrdersContainer) return;

    // Get recent orders (last 5)
    const myOrders = allOrders.filter(order => 
        order.shipperId === currentShipper.username && 
        order.status === 'completed'
    ).slice(-5).reverse();

    if (myOrders.length === 0) {
        recentOrdersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-box-open"></i>
                <p>Chưa có đơn hàng nào</p>
            </div>
        `;
        return;
    }

    recentOrdersContainer.innerHTML = myOrders.map(order => 
        createOrderCard(order, false)
    ).join('');
    
    // Add event listeners
    attachOrderCardListeners(recentOrdersContainer);
}

// Load pending orders
function loadPendingOrders() {
    const pendingOrdersContainer = document.getElementById('pending-orders-list');
    if (!pendingOrdersContainer) return;

    const pendingOrders = allOrders.filter(order => 
        order.status === 'pending' && !order.shipperId
    );

    if (pendingOrders.length === 0) {
pendingOrdersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clock"></i>
                <p>Không có đơn hàng chờ nào</p>
            </div>
        `;
        updateBadge('badge-pending', 0);
        return;
    }

    pendingOrdersContainer.innerHTML = pendingOrders.map(order => 
        createOrderCard(order, true)
    ).join('');
    
    updateBadge('badge-pending', pendingOrders.length);
    attachOrderCardListeners(pendingOrdersContainer);
}

// Load my orders
function loadMyOrders() {
    const myOrdersContainer = document.getElementById('my-orders-list');
    if (!myOrdersContainer) return;

    let myOrders = allOrders.filter(order => 
        order.shipperId === currentShipper.username && 
        (order.status === 'picking' || order.status === 'delivering')
    );

    // Apply filter
    if (currentFilter !== 'all') {
        myOrders = myOrders.filter(order => {
            if (currentFilter === 'picking') return order.status === 'picking';
            if (currentFilter === 'delivering') return order.status === 'delivering';
            if (currentFilter === 'completed') return order.status === 'completed';
            return true;
        });
    }

    if (myOrders.length === 0) {
        myOrdersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-motorcycle"></i>
                <p>Bạn chưa nhận đơn hàng nào</p>
            </div>
        `;
        updateBadge('badge-my-orders', 0);
        return;
    }

    myOrdersContainer.innerHTML = myOrders.map(order => 
        createOrderCard(order, false)
    ).join('');
    
    updateBadge('badge-my-orders', myOrders.length);
    attachOrderCardListeners(myOrdersContainer);
}

// Filter my orders
function filterMyOrders(filter) {
    currentFilter = filter;
    loadMyOrders();
}

// Load completed orders
function loadCompletedOrders() {
    const completedOrdersContainer = document.getElementById('completed-orders-list');
    if (!completedOrdersContainer) return;

    const completedOrders = allOrders.filter(order => 
        order.shipperId === currentShipper.username && 
        order.status === 'completed'
    ).reverse();

    if (completedOrders.length === 0) {
        completedOrdersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-check-circle"></i>
                <p>Chưa có đơn hàng đã giao</p>
            </div>
        `;
        return;
    }

    completedOrdersContainer.innerHTML = completedOrders.map(order => 
        createOrderCard(order, false)
    ).join('');
    
    attachOrderCardListeners(completedOrdersContainer);
}

// Create order card HTML
function createOrderCard(order, showAcceptButton = false) {
    const statusText = {
        'pending': 'Chờ nhận',
        'picking': 'Đang lấy hàng',
        'delivering': 'Đang giao',
        'completed': 'Đã giao'
    };
const statusClass = {
        'pending': 'pending',
        'picking': 'picking',
        'delivering': 'delivering',
        'completed': 'completed'
    };

    let actionsHTML = '';
    if (showAcceptButton) {
        actionsHTML = `
            <button class="btn-action btn-accept" onclick="acceptOrder('${order.id}')">
                <i class="fa-solid fa-check"></i> Nhận đơn
            </button>
        `;
    } else {
        if (order.status === 'picking') {
            actionsHTML = `
                <button class="btn-action btn-delivering" onclick="updateOrderStatus('${order.id}', 'delivering')">
                    <i class="fa-solid fa-motorcycle"></i> Bắt đầu giao
                </button>
            `;
        } else if (order.status === 'delivering') {
            actionsHTML = `
                <button class="btn-action btn-complete" onclick="updateOrderStatus('${order.id}', 'completed')">
                    <i class="fa-solid fa-check-circle"></i> Hoàn thành
                </button>
            `;
        }
        actionsHTML += `
            <button class="btn-action btn-detail" onclick="showOrderDetail('${order.id}')">
                <i class="fa-solid fa-eye"></i> Chi tiết
            </button>
        `;
    }

    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <span class="order-id">Đơn hàng #${order.id}</span>
                <span class="order-status ${statusClass[order.status]}">${statusText[order.status]}</span>
            </div>
            <div class="order-info">
                <div class="info-item">
                    <i class="fa-solid fa-user"></i>
                    <span><strong>Khách hàng:</strong> ${order.customerName}</span>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-phone"></i>
                    <span><strong>SĐT:</strong> ${order.customerPhone}</span>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-location-dot"></i>
                    <span><strong>Địa chỉ:</strong> ${order.customerAddress}</span>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-clock"></i>
                    <span><strong>Thời gian:</strong> ${formatDateTime(order.createdAt)}</span>
                </div>
            </div>
            <div class="order-total">
                Tổng tiền: ${formatPrice(order.total)} VNĐ
            </div>
            ${actionsHTML ? `<div class="order-actions">${actionsHTML}</div>` : ''}
        </div>
    `;
}

// Attach event listeners to order cards
function attachOrderCardListeners(container) {
    container.querySelectorAll('.order-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
if (!e.target.closest('.btn-action')) {
                const orderId = this.dataset.orderId;
                showOrderDetail(orderId);
            }
        });
    });
}

// Accept order
function acceptOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn nhận đơn hàng này?')) {
        return;
    }

    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }

    order.shipperId = currentShipper.username;
    order.status = 'picking';
    order.acceptedAt = new Date().toISOString();

    saveOrders();
    updateStats();
    
    // Reload current tab
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab.id === 'pending-orders') {
        loadPendingOrders();
    } else if (activeTab.id === 'my-orders') {
        loadMyOrders();
    } else {
        loadDashboard();
    }

    alert('Nhận đơn hàng thành công!');
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }

    let confirmMessage = '';
    if (newStatus === 'delivering') {
        confirmMessage = 'Bạn có chắc chắn đã lấy hàng và bắt đầu giao?';
    } else if (newStatus === 'completed') {
        confirmMessage = 'Bạn có chắc chắn đã giao hàng thành công?';
    }

    if (!confirm(confirmMessage)) {
        return;
    }

    order.status = newStatus;
    if (newStatus === 'delivering') {
        order.deliveringAt = new Date().toISOString();
    } else if (newStatus === 'completed') {
        order.completedAt = new Date().toISOString();
    }

    saveOrders();
    updateStats();
    
    // Reload current tab
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab.id === 'my-orders') {
        loadMyOrders();
    } else if (activeTab.id === 'completed-orders') {
        loadCompletedOrders();
    } else {
        loadDashboard();
    }

    alert('Cập nhật trạng thái thành công!');
}

// Show order detail
function showOrderDetail(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }

    const modal = document.getElementById('order-modal');
    const content = document.getElementById('order-detail-content');

    const itemsHTML = order.items.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.name}</span>
            <span class="order-item-quantity">x${item.quantity}</span>
            <span class="order-item-price">${formatPrice(item.price * item.quantity)} VNĐ</span>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="order-detail-item">
            <strong>Mã đơn hàng:</strong> ${order.id}
        </div>
        <div class="order-detail-item">
<strong>Trạng thái:</strong> 
            <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
        </div>
        <div class="order-detail-item">
            <strong>Khách hàng:</strong> ${order.customerName}
        </div>
        <div class="order-detail-item">
            <strong>Số điện thoại:</strong> ${order.customerPhone}
        </div>
        <div class="order-detail-item">
            <strong>Địa chỉ giao hàng:</strong> ${order.customerAddress}
        </div>
        <div class="order-detail-item">
            <strong>Thời gian đặt:</strong> ${formatDateTime(order.createdAt)}
        </div>
        ${order.acceptedAt ? `<div class="order-detail-item"><strong>Thời gian nhận:</strong> ${formatDateTime(order.acceptedAt)}</div>` : ''}
        ${order.deliveringAt ? `<div class="order-detail-item"><strong>Thời gian bắt đầu giao:</strong> ${formatDateTime(order.deliveringAt)}</div>` : ''}
        ${order.completedAt ? `<div class="order-detail-item"><strong>Thời gian hoàn thành:</strong> ${formatDateTime(order.completedAt)}</div>` : ''}
        <div class="order-detail-item">
            <strong>Danh sách món ăn:</strong>
            <div class="order-items">
                ${itemsHTML}
            </div>
        </div>
        <div class="order-detail-item">
            <strong>Tổng tiền:</strong> 
            <span style="color: var(--orange); font-size: 20px; font-weight: bold;">
                ${formatPrice(order.total)} VNĐ
            </span>
        </div>
    `;

    modal.style.display = 'block';
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ nhận',
        'picking': 'Đang lấy hàng',
        'delivering': 'Đang giao',
        'completed': 'Đã giao'
    };
    return statusMap[status] || status;
}

// Update statistics
function updateStats() {
    const pendingCount = allOrders.filter(o => o.status === 'pending' && !o.shipperId).length;
    const inProgressCount = allOrders.filter(o => 
        o.shipperId === currentShipper.username && 
        (o.status === 'picking' || o.status === 'delivering')
    ).length;
    const completedCount = allOrders.filter(o => 
        o.shipperId === currentShipper.username && 
        o.status === 'completed'
    ).length;

    // Calculate earnings (assuming 10% commission)
    const earnings = allOrders
        .filter(o => o.shipperId === currentShipper.username && o.status === 'completed')
        .reduce((sum, o) => sum + (o.total * 0.1), 0);

    document.getElementById('stat-pending').textContent = pendingCount;
    document.getElementById('stat-in-progress').textContent = inProgressCount;
    document.getElementById('stat-completed').textContent = completedCount;
    document.getElementById('stat-earnings').textContent = formatPrice(earnings) + ' VNĐ';

    updateBadge('badge-pending', pendingCount);
    updateBadge('badge-my-orders', inProgressCount);
}
// Update badge
function updateBadge(badgeId, count) {
    const badge = document.getElementById(badgeId);
    if (badge) {
        badge.textContent = count;
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'inline-block';
        }
    }
}

// Load statistics
function loadStatistics() {
    const myCompletedOrders = allOrders.filter(o => 
        o.shipperId === currentShipper.username && 
        o.status === 'completed'
    );

    const totalEarnings = myCompletedOrders.reduce((sum, o) => sum + (o.total * 0.1), 0);
    
    // Today's orders
    const today = new Date().toDateString();
    const todayOrders = myCompletedOrders.filter(o => {
        const orderDate = new Date(o.completedAt || o.createdAt).toDateString();
        return orderDate === today;
    });

    document.getElementById('stat-total-completed').textContent = myCompletedOrders.length;
    document.getElementById('stat-total-earnings').textContent = formatPrice(totalEarnings) + ' VNĐ';
    document.getElementById('stat-today-orders').textContent = todayOrders.length;
}

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(allOrders));
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
