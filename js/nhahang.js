// Quản lý sản phẩm cho nhà hàng
let products = JSON.parse(localStorage.getItem('products')) || [];
let currentRestaurant = null; // Nhà hàng hiện tại của user đang đăng nhập

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

    // Lấy thông tin nhà hàng của user hiện tại
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.restaurantId) {
        alert('Không tìm thấy thông tin nhà hàng. Vui lòng đăng nhập lại!');
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
        createdAt: new Date().toISOString(),
        restaurantId: currentUser.restaurantId // Liên kết với nhà hàng
    };

    // Thêm vào danh sách products (để tương thích với code cũ)
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Đồng bộ vào restaurants data
    syncProductToRestaurant(newProduct, currentUser.restaurantId);
    
    // Đánh dấu có thay đổi để trang chủ tự động cập nhật
    localStorage.setItem('restaurants_last_update', Date.now().toString());

    // Reset form
    document.getElementById('new-name').value = '';
    document.getElementById('new-price').value = '';
    document.getElementById('link-img').value = '';
    document.getElementById('new-description').value = '';

    // Hiển thị lại danh sách
    displayProducts();
    
    alert('Thêm sản phẩm thành công! Sản phẩm đã được cập nhật trên trang chủ.');
}

// Hàm xóa sản phẩm
function deleteAdminProduct(button) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }

    // Lấy productId từ data attribute
    const productId = button.getAttribute('data-product-id');
    if (!productId) {
        alert('Không tìm thấy ID sản phẩm!');
        return;
    }

    // Lấy thông tin nhà hàng của user hiện tại
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.restaurantId) {
        alert('Không tìm thấy thông tin nhà hàng!');
        return;
    }

    // Xóa khỏi products array
    products = products.filter(p => p.id != productId);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Xóa khỏi restaurant
    removeProductFromRestaurant(productId, currentUser.restaurantId);
    
    // Đánh dấu có thay đổi để trang chủ tự động cập nhật
    localStorage.setItem('restaurants_last_update', Date.now().toString());

    // Hiển thị lại danh sách
    displayProducts();
    
    alert('Xóa sản phẩm thành công! Sản phẩm đã được xóa khỏi trang chủ.');
    
    // Lưu lại
    localStorage.setItem('products', JSON.stringify(products));
    
    // Xóa khỏi DOM
    productItem.remove();
    
    alert('Xóa sản phẩm thành công!');
}

// Hàm đồng bộ sản phẩm vào restaurant
function syncProductToRestaurant(product, restaurantId) {
    let restaurants = [];
    try {
        const restaurantsData = localStorage.getItem('restaurants');
        if (restaurantsData) {
            restaurants = JSON.parse(restaurantsData);
        }
    } catch (error) {
        console.error("Lỗi khi đọc dữ liệu nhà hàng:", error);
        return;
    }
    
    // Tìm nhà hàng
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) {
        console.error("Không tìm thấy nhà hàng:", restaurantId);
        return;
    }
    
    // Kiểm tra xem sản phẩm đã tồn tại chưa
    const existingIndex = restaurant.products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
        // Cập nhật sản phẩm
        restaurant.products[existingIndex] = product;
    } else {
        // Thêm sản phẩm mới
        restaurant.products.push(product);
    }
    
    // Lưu lại
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    console.log('Đã đồng bộ sản phẩm vào nhà hàng:', restaurantId);
}

// Hàm hiển thị sản phẩm
function displayProducts() {
    const category = document.getElementById('category').value;
    const productList = document.getElementById('product-list');
    
    if (!productList) return;
    
    // Lấy thông tin nhà hàng của user hiện tại
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.restaurantId) {
        // Hiển thị thông báo nếu chưa có nhà hàng
        productList.innerHTML = '<p style="padding: 20px; text-align: center;">Chưa có thông tin nhà hàng. Vui lòng đăng nhập lại!</p>';
        return;
    }
    
    // Lấy sản phẩm từ restaurant của user
    const restaurant = getRestaurantById(currentUser.restaurantId);
    if (!restaurant) {
        productList.innerHTML = '<p style="padding: 20px; text-align: center;">Không tìm thấy nhà hàng!</p>';
        return;
    }
    
    // Lọc sản phẩm theo category và chỉ lấy sản phẩm của nhà hàng này
    const filteredProducts = restaurant.products.filter(p => p.category === category);
    
    if (filteredProducts.length === 0) {
        productList.innerHTML = '<p style="padding: 20px; text-align: center;">Chưa có sản phẩm nào trong danh mục này.</p>';
        return;
    }
    
    // Hiển thị sản phẩm
    productList.innerHTML = filteredProducts.map(product => createProductHTML(product)).join('');
}

// Hàm tạo HTML cho sản phẩm
function createProductHTML(product) {
    return `
        <div class="product_item">
            <div class="border img-box">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='./img/Logo_icon.png'">
            </div>
            <div class="border name-box">
                <strong>${product.name}</strong>
            </div>
            <div class="border price-box">Giá: ${product.price.toLocaleString('vi-VN')} VNĐ</div>
            <div class="border desc-box">
                <em>${product.description || ''}</em>
            </div>
            <div class="border btn-box">
                <button onclick="deleteAdminProduct(this)" data-product-id="${product.id}">Xóa</button>
            </div>
        </div>
    `;
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
        // Scroll đến phần đơn hàng
        setTimeout(() => {
            const ordersTab = document.getElementById('orders-tab');
            if (ordersTab) {
                ordersTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
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
    // Lấy thông tin nhà hàng của user hiện tại
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.restaurantId) {
        restaurantOrders = [];
        displayRestaurantOrders();
        return;
    }
    
    const ordersData = localStorage.getItem('restaurant_orders');
    if (ordersData) {
        try {
            const allOrders = JSON.parse(ordersData);
            // CHỈ LẤY ĐƠN HÀNG CỦA NHÀ HÀNG NÀY
            restaurantOrders = allOrders.filter(order => order.restaurantId === currentUser.restaurantId);
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
    
    // Lấy thông tin nhà hàng của user hiện tại để đảm bảo chỉ hiển thị đơn hàng của nhà hàng này
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.restaurantId) {
        ordersList.innerHTML = '<p style="padding: 20px; text-align: center;">Chưa có thông tin nhà hàng!</p>';
        return;
    }
    
    // Đảm bảo chỉ lấy đơn hàng của nhà hàng này (đã filter ở loadRestaurantOrders, nhưng kiểm tra lại để chắc chắn)
    const myRestaurantOrders = restaurantOrders.filter(order => order.restaurantId === currentUser.restaurantId);
    
    // Lọc đơn hàng theo filter
    let filteredOrders = myRestaurantOrders;
    if (currentOrderFilter !== 'all') {
        filteredOrders = myRestaurantOrders.filter(order => {
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
        // Lấy tên shipper từ assignedTo
        let shipperName = 'Chưa xác định';
        if (order.assignedTo) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const shipper = users.find(u => u.username === order.assignedTo);
            if (shipper) {
                shipperName = shipper.fullname || shipper.username;
            } else {
                shipperName = order.assignedTo;
            }
        } else if (order.shipperId) {
            // Fallback: nếu có shipperId (đã accept)
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const shipper = users.find(u => u.username === order.shipperId);
            if (shipper) {
                shipperName = shipper.fullname || shipper.username;
            } else {
                shipperName = order.shipperId;
            }
        }
        actionsHTML = `
            <span style="color: #28a745;">Đã giao cho shipper: ${shipperName}</span>
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
    syncCustomerOrders(orderId, order); // Đồng bộ customer_orders
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
    syncCustomerOrders(orderId, order); // Đồng bộ customer_orders
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
    syncCustomerOrders(orderId, order); // Đồng bộ customer_orders
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
    
    console.log('=== ASSIGN SHIPPER ===');
    console.log('Order ID:', order.id);
    console.log('Selected shipper username:', selectedShipperUser.username);
    console.log('Selected shipper fullname:', selectedShipperUser.fullname);
    console.log('Order trước khi cập nhật:', {
        restaurantStatus: order.restaurantStatus,
        status: order.status,
        shipperId: order.shipperId,
        assignedTo: order.assignedTo
    });
    
    // QUAN TRỌNG: Tạo một bản copy của order để tránh reference issues
    // Cập nhật order object trước
    order.restaurantStatus = 'assigned';
    order.shipperId = null; // Để shipper tự accept, không set ngay
    order.assignedTo = selectedShipperUser.username; // Lưu shipper được assign
    order.assignedAt = new Date().toISOString();
    order.status = 'pending'; // Trạng thái cho shipper
    
    // Tạo bản copy để lưu (tránh reference issues)
    const orderToSave = {
        ...order,
        restaurantStatus: 'assigned',
        shipperId: null,
        assignedTo: selectedShipperUser.username,
        assignedAt: order.assignedAt,
        status: 'pending'
    };
    
    console.log('Order sau khi cập nhật:', {
        restaurantStatus: order.restaurantStatus,
        status: order.status,
        shipperId: order.shipperId,
        assignedTo: order.assignedTo
    });
    console.log('OrderToSave:', {
        restaurantStatus: orderToSave.restaurantStatus,
        status: orderToSave.status,
        shipperId: orderToSave.shipperId,
        assignedTo: orderToSave.assignedTo
    });
    
    console.log('=== ASSIGN SHIPPER - ORDER TO SAVE ===');
    console.log('Order ID:', orderToSave.id);
    console.log('Assigned to:', orderToSave.assignedTo);
    console.log('Restaurant status:', orderToSave.restaurantStatus);
    console.log('Status:', orderToSave.status);
    console.log('Shipper ID:', orderToSave.shipperId);
    
    // QUAN TRỌNG: Lưu vào restaurant_orders TRƯỚC
    // Cập nhật order trong restaurantOrders array
    const orderIndex = restaurantOrders.findIndex(o => o.id === orderId);
    if (orderIndex >= 0) {
        restaurantOrders[orderIndex] = { ...orderToSave };
    }
    
    saveRestaurantOrders();
    console.log('Đã lưu vào restaurant_orders');
    
    // Kiểm tra lại sau khi lưu
    const checkRestaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const checkOrder = checkRestaurantOrders.find(o => o.id === order.id);
    if (checkOrder) {
        console.log('✓ Kiểm tra restaurant_orders - Order found:', {
            id: checkOrder.id,
            restaurantStatus: checkOrder.restaurantStatus,
            assignedTo: checkOrder.assignedTo,
            status: checkOrder.status,
            shipperId: checkOrder.shipperId
        });
    } else {
        console.error('❌ LỖI: Không tìm thấy đơn hàng trong restaurant_orders sau khi lưu!');
    }
    
    // Lưu vào danh sách đơn hàng cho shipper (tránh trùng lặp)
    // QUAN TRỌNG: Sử dụng orderToSave (bản copy) thay vì order (reference)
    let shipperOrders = JSON.parse(localStorage.getItem('shipper_orders')) || [];
    const existingIndex = shipperOrders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) {
        // Cập nhật đơn hàng đã có - sử dụng spread để tạo bản copy mới
        shipperOrders[existingIndex] = { ...orderToSave };
        console.log('✓ Cập nhật đơn hàng đã có trong shipper_orders');
    } else {
        // Thêm đơn hàng mới - sử dụng spread để tạo bản copy mới
        shipperOrders.push({ ...orderToSave });
        console.log('✓ Thêm đơn hàng mới vào shipper_orders');
    }
    localStorage.setItem('shipper_orders', JSON.stringify(shipperOrders));
    console.log('Tổng số đơn trong shipper_orders:', shipperOrders.length);
    
    // Kiểm tra lại sau khi lưu vào shipper_orders
    const checkShipperOrders = JSON.parse(localStorage.getItem('shipper_orders')) || [];
    const checkShipperOrder = checkShipperOrders.find(o => o.id === order.id);
    if (checkShipperOrder) {
        console.log('✓ Kiểm tra shipper_orders - Order found:', {
            id: checkShipperOrder.id,
            restaurantStatus: checkShipperOrder.restaurantStatus,
            assignedTo: checkShipperOrder.assignedTo,
            status: checkShipperOrder.status,
            shipperId: checkShipperOrder.shipperId
        });
    } else {
        console.error('❌ LỖI: Không tìm thấy đơn hàng trong shipper_orders sau khi lưu!');
    }
    
    // Đồng bộ customer_orders
    syncCustomerOrders(orderId, order);
    
    displayRestaurantOrders();
    updateOrderNotification();
    
    // Lấy tên đầy đủ của shipper để hiển thị
    const shipperDisplayName = selectedShipperUser.fullname || selectedShipperUser.username;
    showNotification(`Đã giao đơn hàng cho shipper: ${shipperDisplayName}!`);
}

// Hàm đồng bộ customer_orders khi nhà hàng cập nhật đơn
function syncCustomerOrders(orderId, updatedOrder) {
    let customerOrders = JSON.parse(localStorage.getItem('customer_orders')) || [];
    const customerOrderIndex = customerOrders.findIndex(o => o.id === orderId);
    if (customerOrderIndex >= 0) {
        // Cập nhật đơn hàng trong customer_orders
        customerOrders[customerOrderIndex] = {
            ...customerOrders[customerOrderIndex],
            restaurantStatus: updatedOrder.restaurantStatus,
            status: updatedOrder.status,
            confirmedAt: updatedOrder.confirmedAt || customerOrders[customerOrderIndex].confirmedAt,
            preparingAt: updatedOrder.preparingAt || customerOrders[customerOrderIndex].preparingAt,
            readyAt: updatedOrder.readyAt || customerOrders[customerOrderIndex].readyAt,
            assignedAt: updatedOrder.assignedAt || customerOrders[customerOrderIndex].assignedAt,
            assignedTo: updatedOrder.assignedTo || customerOrders[customerOrderIndex].assignedTo,
            shipperId: updatedOrder.shipperId || customerOrders[customerOrderIndex].shipperId
        };
        localStorage.setItem('customer_orders', JSON.stringify(customerOrders));
        console.log('Đã đồng bộ customer_orders cho đơn:', orderId);
    }
}

// Hàm lưu đơn hàng
function saveRestaurantOrders() {
    // Lấy tất cả đơn hàng từ localStorage
    const allOrdersData = localStorage.getItem('restaurant_orders');
    let allOrders = [];
    if (allOrdersData) {
        try {
            allOrders = JSON.parse(allOrdersData);
        } catch (error) {
            console.error('Lỗi khi đọc đơn hàng:', error);
            allOrders = [];
        }
    }
    
    // Lấy thông tin nhà hàng của user hiện tại
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.restaurantId) {
        return;
    }
    
    // Cập nhật các đơn hàng của nhà hàng này trong allOrders
    restaurantOrders.forEach(updatedOrder => {
        const index = allOrders.findIndex(o => o.id === updatedOrder.id);
        if (index >= 0) {
            allOrders[index] = updatedOrder;
        } else {
            // Nếu không tìm thấy, thêm mới (nhưng chỉ nếu là đơn hàng của nhà hàng này)
            if (updatedOrder.restaurantId === currentUser.restaurantId) {
                allOrders.push(updatedOrder);
            }
        }
    });
    
    // Lưu lại tất cả đơn hàng
    localStorage.setItem('restaurant_orders', JSON.stringify(allOrders));
}

// Hàm cập nhật thông báo đơn hàng mới
function updateOrderNotification() {
    // Lấy thông tin nhà hàng của user hiện tại
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.restaurantId) {
        return;
    }
    
    // Chỉ đếm đơn hàng mới của nhà hàng này
    const newOrdersCount = restaurantOrders.filter(o => 
        o.restaurantStatus === 'new' && o.restaurantId === currentUser.restaurantId
    ).length;
    const badge = document.getElementById('order-notification-badge');
    const notificationIcon = document.getElementById('notification_number_items') || document.getElementById('number_items');
    
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

// Hàm xóa sản phẩm khỏi restaurant
function removeProductFromRestaurant(productId, restaurantId) {
    let restaurants = [];
    try {
        const restaurantsData = localStorage.getItem('restaurants');
        if (restaurantsData) {
            restaurants = JSON.parse(restaurantsData);
        }
    } catch (error) {
        console.error("Lỗi khi đọc dữ liệu nhà hàng:", error);
        return;
    }
    
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
        restaurant.products = restaurant.products.filter(p => p.id != productId);
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
        console.log('Đã xóa sản phẩm khỏi nhà hàng:', productId);
    }
}

// Hàm load và đồng bộ sản phẩm từ restaurant
function loadProductsFromRestaurant() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.restaurantId) {
        return;
    }
    
    const restaurant = getRestaurantById(currentUser.restaurantId);
    if (restaurant && restaurant.products) {
        // Đồng bộ sản phẩm từ restaurant vào products array
        restaurant.products.forEach(product => {
            const existingIndex = products.findIndex(p => p.id === product.id);
            if (existingIndex >= 0) {
                products[existingIndex] = product;
            } else {
                products.push(product);
            }
        });
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Khởi tạo khi DOM đã tải
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Vui lòng đăng nhập!');
        window.location.href = 'sign_in.html';
        return;
    }
    
    // Nếu là tài khoản nhà hàng, đảm bảo có restaurantId
    if ((currentUser.role === 'nhanvien' || currentUser.role === 'Nhà hàng') && !currentUser.restaurantId) {
        // Tự động tạo restaurantId nếu chưa có
        const restaurantId = 'rest_' + Date.now();
        currentUser.restaurantId = restaurantId;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Cập nhật trong users array
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex >= 0) {
            users[userIndex].restaurantId = restaurantId;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Tạo nhà hàng mới
        createRestaurantForUser(restaurantId, currentUser.fullname, currentUser.username);
    }
    
    // Load và đồng bộ sản phẩm từ restaurant
    loadProductsFromRestaurant();
    
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

