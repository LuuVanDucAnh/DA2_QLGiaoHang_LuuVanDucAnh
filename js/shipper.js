// Shipper JavaScript

let currentShipper = null;
let allOrders = [];
let currentFilter = 'all';

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initShipper();
    });
} else {
    initShipper();
}

// Initialize shipper page
function initShipper() {
    // Get current user
    currentShipper = getCurrentUser();
    
    console.log('=== INIT SHIPPER ===');
    console.log('Current shipper:', currentShipper);
    
    if (!currentShipper) {
        alert("Vui lòng đăng nhập để sử dụng giao diện shipper!");
        window.location.href = "sign_in.html";
        return;
    }
    
    console.log('Shipper username:', currentShipper.username);
    console.log('Shipper role:', currentShipper.role);

    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadOrders();
    loadStatistics();
    
    // Setup menu navigation
    setupMenuNavigation();
    
    // QUAN TRỌNG: Load pending orders ngay khi khởi tạo (sau khi loadOrders hoàn tất)
    setTimeout(() => {
        console.log('=== TỰ ĐỘNG LOAD PENDING ORDERS SAU KHI KHỞI TẠO ===');
        loadPendingOrders();
    }, 1000);
    
    // Kiểm tra đơn hàng mới mỗi 3 giây (tăng tần suất để phát hiện đơn mới nhanh hơn)
    setInterval(() => {
        loadOrders(); // Đồng bộ từ restaurant_orders
        updateStats();
        updateShipperNotification();
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            if (activeTab.id === 'pending-orders') {
                loadPendingOrders();
            } else if (activeTab.id === 'my-orders') {
                loadMyOrders();
            } else if (activeTab.id === 'dashboard') {
                loadDashboard();
            }
        }
    }, 3000);
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
    // Handle radio button navigation (for Shipper.html)
    document.querySelectorAll('input[type="radio"][name="tab"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const tabId = this.id.replace('tab-', '');
                console.log('Tab changed to:', tabId);
                showShipperTab(tabId);
            }
        });
    });
    
    // Trigger load pending orders when page loads if pending tab is checked
    const pendingRadio = document.getElementById('tab-pending');
    if (pendingRadio && pendingRadio.checked) {
        setTimeout(() => {
            loadOrders();
            loadPendingOrders();
        }, 500);
    }
    
    // Handle menu item clicks (fallback)
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
            if (tabId) {
                showShipperTab(tabId);
            } else {
                // Try to get from label's for attribute
                const label = this.closest('label');
                if (label && label.getAttribute('for')) {
                    const radioId = label.getAttribute('for');
                    const radio = document.getElementById(radioId);
                    if (radio) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change'));
                    }
                }
            }
        });
    });
}

// Show shipper tab
function showShipperTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    // Show selected tab
    let tab = null;
    if (tabId === 'dashboard') {
        tab = document.getElementById('dashboard');
    } else if (tabId === 'pending') {
        tab = document.getElementById('pending-orders');
    } else if (tabId === 'my-orders') {
        tab = document.getElementById('my-orders');
    } else if (tabId === 'completed') {
        tab = document.getElementById('completed-orders');
    } else if (tabId === 'statistics') {
        tab = document.getElementById('statistics');
    }
    
    if (tab) {
        tab.classList.add('active');
        
        // Load data for the tab
        if (tabId === 'pending' || tabId === 'pending-orders') {
            loadPendingOrders();
        } else if (tabId === 'my-orders') {
            loadMyOrders();
        } else if (tabId === 'completed' || tabId === 'completed-orders') {
            loadCompletedOrders();
        } else if (tabId === 'statistics') {
            loadStatistics();
        } else if (tabId === 'dashboard') {
            loadDashboard();
        }
    }
}

// Load all orders
function loadOrders() {
    console.log('=== LOAD ORDERS - BẮT ĐẦU ===');
    
    // Đọc đơn hàng từ shipper_orders (đơn hàng được nhà hàng giao)
    const shipperOrdersData = localStorage.getItem('shipper_orders');
    if (shipperOrdersData) {
        try {
            allOrders = JSON.parse(shipperOrdersData);
            console.log('Đọc từ shipper_orders:', allOrders.length, 'đơn');
        } catch (error) {
            console.error("Error parsing shipper orders:", error);
            allOrders = [];
        }
    } else {
        allOrders = [];
        console.log('shipper_orders trống');
    }
    
    // Đồng bộ từ restaurant_orders - lấy các đơn đã được assign (restaurantStatus = 'assigned')
    const restaurantOrdersData = localStorage.getItem('restaurant_orders');
    if (restaurantOrdersData) {
        try {
            const restaurantOrders = JSON.parse(restaurantOrdersData);
            console.log('Đọc từ restaurant_orders:', restaurantOrders.length, 'đơn');
            
            const assignedOrders = restaurantOrders.filter(o => o.restaurantStatus === 'assigned');
            console.log('Đơn đã được assign (restaurantStatus = "assigned"):', assignedOrders.length);
            console.log('Chi tiết đơn đã assign:', assignedOrders.map(o => ({
                id: o.id,
                assignedTo: o.assignedTo,
                restaurantStatus: o.restaurantStatus,
                status: o.status,
                shipperId: o.shipperId
            })));
            
            // QUAN TRỌNG: Đồng bộ tất cả đơn đã assign, ưu tiên dữ liệu từ restaurant_orders
            assignedOrders.forEach(restaurantOrder => {
                const existingIndex = allOrders.findIndex(o => o.id === restaurantOrder.id);
                if (existingIndex >= 0) {
                    // Cập nhật đơn hàng đã có (đảm bảo có assignedTo mới nhất từ restaurant_orders)
                    console.log('Cập nhật đơn:', restaurantOrder.id, 'assignedTo:', restaurantOrder.assignedTo);
                    // Merge: giữ lại thông tin từ shipper_orders nếu đã accept, nhưng cập nhật assignedTo từ restaurant_orders
                    if (!allOrders[existingIndex].shipperId || allOrders[existingIndex].shipperId === null || allOrders[existingIndex].shipperId === '') {
                        // Chưa accept, cập nhật toàn bộ từ restaurant_orders (QUAN TRỌNG: đảm bảo có assignedTo)
                        // Đảm bảo status là 'pending' nếu chưa accept
                        allOrders[existingIndex] = { 
                            ...restaurantOrder,
                            status: restaurantOrder.status || 'pending' // Đảm bảo có status
                        };
                        console.log('  -> Đã cập nhật toàn bộ từ restaurant_orders');
                    } else {
                        // Đã accept, chỉ cập nhật một số trường (không thay đổi status nếu đã accept)
                        allOrders[existingIndex].assignedTo = restaurantOrder.assignedTo;
                        allOrders[existingIndex].restaurantStatus = restaurantOrder.restaurantStatus;
                        console.log('  -> Đã cập nhật assignedTo và restaurantStatus');
                    }
                } else {
                    // Thêm đơn hàng mới
                    console.log('Thêm đơn mới:', restaurantOrder.id, 'assignedTo:', restaurantOrder.assignedTo);
                    // Đảm bảo status là 'pending' cho đơn mới chưa accept
                    allOrders.push({ 
                        ...restaurantOrder,
                        status: restaurantOrder.status || 'pending' // Đảm bảo có status
                    });
                }
            });
        } catch (error) {
            console.error("Error parsing restaurant orders:", error);
        }
    } else {
        console.log('restaurant_orders trống');
    }
    
    // Lưu lại shipper_orders đã được đồng bộ
    localStorage.setItem('shipper_orders', JSON.stringify(allOrders));
    console.log('=== LOAD ORDERS - KẾT THÚC ===');
    console.log('Tổng số đơn trong allOrders:', allOrders.length);
    console.log('Đơn hàng có assignedTo:', allOrders.filter(o => o.assignedTo).map(o => ({
        id: o.id,
        assignedTo: o.assignedTo,
        restaurantStatus: o.restaurantStatus,
        status: o.status,
        shipperId: o.shipperId
    })));
    
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
    const recentOrdersContainer = document.querySelector('#dashboard .orders-list, #dashboard .recent-orders .orders-list');
    if (!recentOrdersContainer) {
        const fallback = document.getElementById('recent-orders-list');
        if (fallback) {
            return loadRecentOrdersFallback(fallback);
        }
        return;
    }

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

// Fallback function for recent orders
function loadRecentOrdersFallback(container) {
    const myOrders = allOrders.filter(order => 
        order.shipperId === currentShipper.username && 
        order.status === 'completed'
    ).slice(-5).reverse();

    if (myOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-box-open"></i>
                <p>Chưa có đơn hàng nào</p>
            </div>
        `;
        return;
    }

    container.innerHTML = myOrders.map(order => 
        createOrderCard(order, false)
    ).join('');
    
    attachOrderCardListeners(container);
}

// Load pending orders
function loadPendingOrders() {
    const pendingOrdersContainer = document.querySelector('#pending-orders .orders-list');
    if (!pendingOrdersContainer) {
        // Fallback nếu không tìm thấy
        const fallback = document.getElementById('pending-orders-list');
        if (fallback) {
            return loadPendingOrdersFallback(fallback);
        }
        return;
    }

    // Lấy đơn hàng được assign cho shipper này (assignedTo = currentShipper.username) và chưa accept (shipperId = null)
    console.log('=== LOAD PENDING ORDERS ===');
    console.log('Current shipper username:', currentShipper.username);
    console.log('Current shipper object:', JSON.stringify(currentShipper, null, 2));
    console.log('Tổng số đơn trong allOrders:', allOrders.length);
    
    // Debug: Hiển thị tất cả đơn có assignedTo
    const ordersWithAssignedTo = allOrders.filter(o => o.assignedTo);
    console.log('Đơn hàng có assignedTo:', ordersWithAssignedTo.length);
    ordersWithAssignedTo.forEach(o => {
        console.log('  - Đơn:', o.id, '| assignedTo:', o.assignedTo, '| restaurantStatus:', o.restaurantStatus, '| status:', o.status, '| shipperId:', o.shipperId);
        console.log('    So sánh:', o.assignedTo, '===', currentShipper.username, '?', o.assignedTo === currentShipper.username);
    });
    
    const pendingOrders = allOrders.filter(order => {
        // Đơn hàng phải có restaurantStatus = 'assigned' (đã được nhà hàng giao)
        if (order.restaurantStatus !== 'assigned') {
            return false;
        }
        
        // Đơn hàng chưa được shipper accept (shipperId = null hoặc chưa có)
        if (order.shipperId && order.shipperId !== null && order.shipperId !== '') {
            return false;
        }
        
        // Đơn hàng phải được assign cho shipper này HOẶC chưa assign cho ai cụ thể
        const assignedToMe = order.assignedTo && order.assignedTo.toLowerCase() === currentShipper.username.toLowerCase();
        const notAssignedToAnyone = !order.assignedTo || order.assignedTo === '';
        
        console.log(`Đơn ${order.id}: assignedTo="${order.assignedTo}", currentShipper.username="${currentShipper.username}", assignedToMe=${assignedToMe}, notAssignedToAnyone=${notAssignedToAnyone}`);
        
        if (!assignedToMe && !notAssignedToAnyone) {
            console.log(`  -> Bỏ qua: được assign cho shipper khác (${order.assignedTo})`);
            return false; // Được assign cho shipper khác
        }
        
        // Đơn hàng chưa hoàn thành (status không phải 'completed' hoặc 'cancelled')
        if (order.status === 'completed' || order.status === 'cancelled') {
            console.log(`  -> Bỏ qua: đơn hàng đã ${order.status}`);
            return false;
        }
        
        // Status có thể là 'pending', 'assigned', hoặc các trạng thái khác (trừ completed/cancelled)
        // Không bắt buộc phải là 'pending' vì có thể có đơn hàng cũ với status khác
        
        console.log(`  -> ✓ Đơn hàng hợp lệ!`);
        return true;
    });
    
    console.log('=== KẾT QUẢ ===');
    console.log('Số đơn hàng chờ nhận:', pendingOrders.length);
    if (pendingOrders.length > 0) {
        console.log('Danh sách đơn hàng:');
        pendingOrders.forEach(o => {
            console.log('  - Đơn:', o.id, '| assignedTo:', o.assignedTo);
        });
    } else {
        console.log('KHÔNG CÓ ĐƠN HÀNG NÀO!');
        console.log('Kiểm tra lại:');
        console.log('  1. Shipper username có đúng không?', currentShipper.username);
        console.log('  2. Có đơn nào có assignedTo khớp không?', ordersWithAssignedTo.filter(o => o.assignedTo === currentShipper.username).length);
    }

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

// Fallback function for pending orders
function loadPendingOrdersFallback(container) {
    const pendingOrders = allOrders.filter(order => 
        order.status === 'pending' && !order.shipperId
    );

    if (pendingOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clock"></i>
                <p>Không có đơn hàng chờ nào</p>
            </div>
        `;
        updateBadge('badge-pending', 0);
        return;
    }

    container.innerHTML = pendingOrders.map(order => 
        createOrderCard(order, true)
    ).join('');
    
    updateBadge('badge-pending', pendingOrders.length);
    attachOrderCardListeners(container);
}

// Load my orders
function loadMyOrders() {
    const myOrdersContainer = document.querySelector('#my-orders .orders-list');
    if (!myOrdersContainer) {
        const fallback = document.getElementById('my-orders-list');
        if (fallback) {
            return loadMyOrdersFallback(fallback);
        }
        return;
    }

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

// Fallback function for my orders
function loadMyOrdersFallback(container) {
    let myOrders = allOrders.filter(order => 
        order.shipperId === currentShipper.username && 
        (order.status === 'picking' || order.status === 'delivering')
    );

    if (currentFilter !== 'all') {
        myOrders = myOrders.filter(order => {
            if (currentFilter === 'picking') return order.status === 'picking';
            if (currentFilter === 'delivering') return order.status === 'delivering';
            if (currentFilter === 'completed') return order.status === 'completed';
            return true;
        });
    }

    if (myOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-motorcycle"></i>
                <p>Bạn chưa nhận đơn hàng nào</p>
            </div>
        `;
        updateBadge('badge-my-orders', 0);
        return;
    }

    container.innerHTML = myOrders.map(order => 
        createOrderCard(order, false)
    ).join('');
    
    updateBadge('badge-my-orders', myOrders.length);
    attachOrderCardListeners(container);
}

// Filter my orders
function filterMyOrders(filter) {
    currentFilter = filter;
    loadMyOrders();
}

// Load completed orders
function loadCompletedOrders() {
    const completedOrdersContainer = document.querySelector('#completed-orders .orders-list');
    if (!completedOrdersContainer) {
        const fallback = document.getElementById('completed-orders-list');
        if (fallback) {
            return loadCompletedOrdersFallback(fallback);
        }
        return;
    }

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

// Fallback function for completed orders
function loadCompletedOrdersFallback(container) {
    const completedOrders = allOrders.filter(order => 
        order.shipperId === currentShipper.username && 
        order.status === 'completed'
    ).reverse();

    if (completedOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-check-circle"></i>
                <p>Chưa có đơn hàng đã giao</p>
            </div>
        `;
        return;
    }

    container.innerHTML = completedOrders.map(order => 
        createOrderCard(order, false)
    ).join('');
    
    attachOrderCardListeners(container);
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
    
    // Kiểm tra đơn hàng có được assign cho shipper này không
    if (order.assignedTo && order.assignedTo.toLowerCase() !== currentShipper.username.toLowerCase()) {
        alert('Đơn hàng này không được assign cho bạn!');
        return;
    }

    // Cập nhật đơn hàng
    order.shipperId = currentShipper.username;
    order.status = 'picking';
    order.acceptedAt = new Date().toISOString();
    
    // Cập nhật trong restaurant_orders
    const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const restaurantOrder = restaurantOrders.find(ro => ro.id === orderId);
    if (restaurantOrder) {
        restaurantOrder.shipperId = currentShipper.username;
        restaurantOrder.status = 'picking';
        restaurantOrder.acceptedAt = new Date().toISOString();
        localStorage.setItem('restaurant_orders', JSON.stringify(restaurantOrders));
        
        // Đồng bộ customer_orders
        syncCustomerOrdersFromShipper(orderId, restaurantOrder);
    }

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
    
    // Cập nhật trong restaurant_orders
    const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const restaurantOrder = restaurantOrders.find(ro => ro.id === orderId);
    if (restaurantOrder) {
        restaurantOrder.status = newStatus;
        if (newStatus === 'delivering') {
            restaurantOrder.deliveringAt = new Date().toISOString();
        } else if (newStatus === 'completed') {
            restaurantOrder.completedAt = new Date().toISOString();
            restaurantOrder.restaurantStatus = 'completed'; // QUAN TRỌNG: Đồng bộ restaurantStatus
        }
        // Đồng bộ các trường khác
        restaurantOrder.shipperId = order.shipperId;
        restaurantOrder.acceptedAt = order.acceptedAt;
        restaurantOrder.deliveringAt = order.deliveringAt;
        restaurantOrder.completedAt = order.completedAt;
        localStorage.setItem('restaurant_orders', JSON.stringify(restaurantOrders));
        
        // Đồng bộ customer_orders
        syncCustomerOrdersFromShipper(orderId, restaurantOrder);
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
    const pendingCount = allOrders.filter(o => {
        if (o.restaurantStatus !== 'assigned') return false;
        if (o.shipperId && o.shipperId !== null) return false;
        const assignedToMe = o.assignedTo === currentShipper.username;
        const notAssignedToAnyone = !o.assignedTo;
        if (!assignedToMe && !notAssignedToAnyone) return false;
        return o.status === 'pending';
    }).length;
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

    // Update stats elements if they exist
    const statPending = document.getElementById('stat-pending');
    const statInProgress = document.getElementById('stat-in-progress');
    const statCompleted = document.getElementById('stat-completed');
    const statEarnings = document.getElementById('stat-earnings');
    
    if (statPending) statPending.textContent = pendingCount;
    if (statInProgress) statInProgress.textContent = inProgressCount;
    if (statCompleted) statCompleted.textContent = completedCount;
    if (statEarnings) statEarnings.textContent = formatPrice(earnings) + ' VNĐ';

    updateBadge('badge-pending', pendingCount);
    updateBadge('badge-my-orders', inProgressCount);
    
    // Update notification badge
    updateShipperNotification();
}

// Hàm cập nhật notification badge cho shipper
function updateShipperNotification() {
    if (!currentShipper) return;
    
    const pendingCount = allOrders.filter(o => {
        if (o.restaurantStatus !== 'assigned') return false;
        if (o.shipperId && o.shipperId !== null) return false;
        const assignedToMe = o.assignedTo === currentShipper.username;
        const notAssignedToAnyone = !o.assignedTo;
        if (!assignedToMe && !notAssignedToAnyone) return false;
        return o.status === 'pending';
    }).length;
    
    const notificationBadge = document.getElementById('notification_number_items') || document.querySelector('.Notification #number_items');
    if (notificationBadge) {
        if (pendingCount > 0) {
            notificationBadge.textContent = pendingCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
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
    // Lưu vào cả orders và shipper_orders
    localStorage.setItem('orders', JSON.stringify(allOrders));
    localStorage.setItem('shipper_orders', JSON.stringify(allOrders));
    
    // Cập nhật lại restaurant_orders nếu có thay đổi
    const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    allOrders.forEach(order => {
        const restaurantOrder = restaurantOrders.find(ro => ro.id === order.id);
        if (restaurantOrder) {
            // Cập nhật trạng thái từ shipper
            if (order.status === 'picking' || order.status === 'delivering' || order.status === 'completed') {
                restaurantOrder.status = order.status;
                restaurantOrder.shipperId = order.shipperId;
                restaurantOrder.acceptedAt = order.acceptedAt;
                restaurantOrder.deliveringAt = order.deliveringAt;
                restaurantOrder.completedAt = order.completedAt;
                
                // QUAN TRỌNG: Đồng bộ restaurantStatus khi completed
                if (order.status === 'completed') {
                    restaurantOrder.restaurantStatus = 'completed';
                }
                
                // Đồng bộ customer_orders
                syncCustomerOrdersFromShipper(order.id, restaurantOrder);
            }
        }
    });
    localStorage.setItem('restaurant_orders', JSON.stringify(restaurantOrders));
}

// Đồng bộ customer_orders khi shipper cập nhật đơn hàng
function syncCustomerOrdersFromShipper(orderId, updatedOrder) {
    let customerOrders = JSON.parse(localStorage.getItem('customer_orders')) || [];
    const customerOrderIndex = customerOrders.findIndex(o => o.id === orderId);
    if (customerOrderIndex >= 0) {
        // Cập nhật đơn hàng trong customer_orders
        customerOrders[customerOrderIndex] = {
            ...customerOrders[customerOrderIndex],
            status: updatedOrder.status,
            restaurantStatus: updatedOrder.restaurantStatus,
            shipperId: updatedOrder.shipperId,
            acceptedAt: updatedOrder.acceptedAt,
            deliveringAt: updatedOrder.deliveringAt,
            completedAt: updatedOrder.completedAt
        };
        localStorage.setItem('customer_orders', JSON.stringify(customerOrders));
        console.log('Đã đồng bộ customer_orders từ shipper cho đơn:', orderId);
    }
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
