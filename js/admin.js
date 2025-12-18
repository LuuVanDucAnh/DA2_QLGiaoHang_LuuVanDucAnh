// Admin JavaScript - Quản lý hệ thống

let currentAdmin = null;
let currentFilter = 'all';
let currentOrderFilter = 'all';


document.addEventListener('DOMContentLoaded', function() {
    // Check login
    currentAdmin = getCurrentUser();
    
    if (!currentAdmin) {
        alert('Vui lòng đăng nhập!');
        window.location.href = 'sign_in.html';
        return;
    }
    
    if (currentAdmin.role !== 'admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'index.html';
        return;
    }
    
    setupMenuNavigation();
       
    loadDashboard();
    
       setupEventListeners();
});


function setupMenuNavigation() {
    document.querySelectorAll('input[type="radio"][name="tab"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const tabId = this.id.replace('tab-', '');
                showAdminTab(tabId);
            }
        });
    });
}

// Show admin tab
function showAdminTab(tabId) {
    
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    
    let tab = null;
    if (tabId === 'dashboard') {
        tab = document.getElementById('dashboard');
        loadDashboard();
    } else if (tabId === 'users') {
        tab = document.getElementById('users');
        loadUsers();
    } else if (tabId === 'restaurants') {
        tab = document.getElementById('restaurants');
        loadRestaurants();
    } else if (tabId === 'orders') {
        tab = document.getElementById('orders');
        loadOrders();
    } else if (tabId === 'statistics') {
        tab = document.getElementById('statistics');
        loadStatistics();
    }
    
    if (tab) {
        tab.classList.add('active');
    }
}


function setupEventListeners() {
    
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Add restaurant form
    const addRestaurantForm = document.getElementById('add-restaurant-form');
    if (addRestaurantForm) {
        addRestaurantForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addRestaurant();
        });
    }
}

// Load dashboard
function loadDashboard() {
    updateDashboardStats();
    loadBestSellers();
    loadTopRestaurants();
}

// Update dashboard statistics
function updateDashboardStats() {
    // Total users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const customers = users.filter(u => !u.role || u.role === 'customer' || u.role === 'Khách hàng');
    const restaurantStaff = users.filter(u => u.role === 'nhanvien' || u.role === 'Nhà hàng');
    const shippers = users.filter(u => u.role === 'shipper' || u.role === 'Shipper');
    
    document.getElementById('stat-total-users').textContent = users.length;
    document.getElementById('stat-customers').textContent = customers.length;
    document.getElementById('stat-restaurant-staff').textContent = restaurantStaff.length;
    document.getElementById('stat-shippers').textContent = shippers.length;
    
    
    const restaurants = getAllRestaurants();
    document.getElementById('stat-total-restaurants').textContent = restaurants.length;
    
 
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const completedOrders = allOrders.filter(o => o.restaurantStatus === 'completed' || o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    document.getElementById('stat-total-orders').textContent = allOrders.length;
    document.getElementById('stat-completed-orders').textContent = completedOrders.length;
    document.getElementById('stat-total-revenue').textContent = formatPrice(totalRevenue) + ' VNĐ';
}

// Load best sellers
function loadBestSellers() {
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const completedOrders = allOrders.filter(o => o.restaurantStatus === 'completed' || o.status === 'completed');
    
    
    const productSales = {};
    completedOrders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                if (productSales[item.name]) {
                    productSales[item.name].count += item.quantity;
                    productSales[item.name].revenue += (item.price * item.quantity);
                } else {
                    productSales[item.name] = {
                        count: item.quantity,
                        revenue: item.price * item.quantity,
                        name: item.name
                    };
                }
            });
        }
    });
    
    // Sort by count
    const sortedProducts = Object.values(productSales).sort((a, b) => b.count - a.count).slice(0, 5);
    
    const bestSellerList = document.getElementById('best-seller-list');
    if (bestSellerList) {
        if (sortedProducts.length === 0) {
            bestSellerList.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">Chưa có dữ liệu</li>';
        } else {
            bestSellerList.innerHTML = sortedProducts.map(product => `
                <li>
                    <img src="./img/Logo_icon.png" alt="${product.name}" onerror="this.src='./img/Logo_icon.png'">
                    <div>
                        <strong>${product.name}</strong>
                        <span style="color: #666; font-size: 12px;">Đã bán: ${product.count} | Doanh thu: ${formatPrice(product.revenue)} VNĐ</span>
                    </div>
                </li>
            `).join('');
        }
    }
}

// Load top restaurants
function loadTopRestaurants() {
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const completedOrders = allOrders.filter(o => o.restaurantStatus === 'completed' || o.status === 'completed');
    const restaurants = getAllRestaurants();
    
    // Count restaurant orders and revenue
    const restaurantStats = {};
    restaurants.forEach(restaurant => {
        restaurantStats[restaurant.id] = {
            id: restaurant.id,
            name: restaurant.name,
            orderCount: 0,
            revenue: 0
        };
    });
    
    completedOrders.forEach(order => {
        if (order.restaurantId && restaurantStats[order.restaurantId]) {
            restaurantStats[order.restaurantId].orderCount++;
            restaurantStats[order.restaurantId].revenue += (order.total || 0);
        }
    });
    
    // Sort by revenue
    const sortedRestaurants = Object.values(restaurantStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    const topRestaurantsList = document.getElementById('top-restaurants-list');
    if (topRestaurantsList) {
        if (sortedRestaurants.length === 0) {
            topRestaurantsList.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">Chưa có dữ liệu</li>';
        } else {
            topRestaurantsList.innerHTML = sortedRestaurants.map(restaurant => {
                const restaurantData = restaurants.find(r => r.id === restaurant.id);
                return `
                    <li>
                        <img src="${restaurantData ? restaurantData.image : './img/Logo_icon.png'}" alt="${restaurant.name}" onerror="this.src='./img/Logo_icon.png'">
                        <div>
                            <strong>${restaurant.name}</strong>
                            <span style="color: #666; font-size: 12px;">${restaurant.orderCount} đơn | ${formatPrice(restaurant.revenue)} VNĐ</span>
                        </div>
                    </li>
                `;
            }).join('');
        }
    }
}

// Load users
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filteredUsers = filterUsersList(users, currentFilter);
    
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">Không có dữ liệu</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredUsers.map(user => {
        const roleText = {
            'admin': 'Quản trị viên',
            'nhanvien': 'Nhà hàng',
            'shipper': 'Shipper',
            'customer': 'Khách hàng',
            'Khách hàng': 'Khách hàng',
            'Nhà hàng': 'Nhà hàng',
            'Shipper': 'Shipper'
        }[user.role] || user.role || 'Khách hàng';
        
        const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        
        return `
            <tr>
                <td>${user.username}</td>
                <td>${user.fullname || 'N/A'}</td>
                <td>${user.username}</td>
                <td><span class="badge badge-${user.role || 'customer'}">${roleText}</span></td>
                <td>${createdAt}</td>
                <td>
                    <button class="btn-action btn-danger" onclick="deleteUser('${user.username}')" title="Xóa">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter users
function filterUsers(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    loadUsers();
}

// Filter users list
function filterUsersList(users, filter) {
    if (filter === 'all') return users;
    
    const roleMap = {
        'customer': ['customer', 'Khách hàng', null, undefined],
        'nhanvien': ['nhanvien', 'Nhà hàng'],
        'shipper': ['shipper', 'Shipper']
    };
    
    const allowedRoles = roleMap[filter] || [];
    return users.filter(user => allowedRoles.includes(user.role));
}

// Delete user
function deleteUser(username) {
    if (username === 'admin') {
        alert('Không thể xóa tài khoản admin!');
        return;
    }
    
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filteredUsers = users.filter(u => u.username !== username);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // If user is logged in, log them out
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.username === username) {
        localStorage.removeItem('currentUser');
        window.location.href = 'sign_in.html';
        return;
    }
    
    loadUsers();
    showNotification('Đã xóa người dùng thành công!');
}

// Load restaurants
function loadRestaurants() {
    const restaurants = getAllRestaurants();
    const grid = document.getElementById('restaurants-grid');
    
    if (!grid) return;
    
    if (restaurants.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 40px; color: #999; grid-column: 1 / -1;">Chưa có nhà hàng nào</div>';
        return;
    }
    
    grid.innerHTML = restaurants.map(restaurant => {
        const owner = getRestaurantOwner(restaurant.id);
        const productCount = restaurant.products ? restaurant.products.length : 0;
        
        return `
            <div class="restaurant-card-admin">
                <div class="restaurant-card-image">
                    <img src="${restaurant.image || './img/Logo_icon.png'}" alt="${restaurant.name}" onerror="this.src='./img/Logo_icon.png'">
                </div>
                <div class="restaurant-card-info">
                    <h4>${restaurant.name}</h4>
                    <p>${restaurant.description || 'Chưa có mô tả'}</p>
                    <div class="restaurant-card-details">
                        <div><i class="fa-solid fa-star"></i> ${restaurant.rating || 'N/A'}</div>
                        <div><i class="fa-solid fa-box"></i> ${productCount} món</div>
                        <div><i class="fa-solid fa-user"></i> ${owner ? owner.fullname || owner.username : 'Chưa có'}</div>
                    </div>
                    <div class="restaurant-card-actions">
                        <button class="btn-action btn-primary" onclick="viewRestaurantDetails('${restaurant.id}')">
                            <i class="fa-solid fa-eye"></i> Xem chi tiết
                        </button>
                        <button class="btn-action btn-danger" onclick="deleteRestaurant('${restaurant.id}')">
                            <i class="fa-solid fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get restaurant owner
function getRestaurantOwner(restaurantId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => u.restaurantId === restaurantId);
}

// Show add restaurant modal
function showAddRestaurantModal() {
    document.getElementById('add-restaurant-modal').style.display = 'block';
}

// Close add restaurant modal
function closeAddRestaurantModal() {
    document.getElementById('add-restaurant-modal').style.display = 'none';
    document.getElementById('add-restaurant-form').reset();
}

// Add restaurant
function addRestaurant() {
    const name = document.getElementById('restaurant-name').value.trim();
    const description = document.getElementById('restaurant-description').value.trim();
    const address = document.getElementById('restaurant-address').value.trim();
    const phone = document.getElementById('restaurant-phone').value.trim();
    const image = document.getElementById('restaurant-image').value.trim() || './img/Logo_icon.png';
    const minOrder = parseInt(document.getElementById('restaurant-min-order').value) || 50000;
    
    if (!name || !address || !phone) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    const restaurants = getAllRestaurants();
    const newRestaurant = {
        id: 'rest_' + Date.now(),
        name: name,
        description: description,
        address: address,
        phone: phone,
        image: image,
        rating: 0,
        deliveryTime: '30-45 phút',
        minOrder: minOrder,
        products: []
    };
    
    restaurants.push(newRestaurant);
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    
    closeAddRestaurantModal();
    loadRestaurants();
    showNotification('Đã thêm nhà hàng thành công!');
}

// Delete restaurant
function deleteRestaurant(restaurantId) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà hàng này?')) {
        return;
    }
    
    const restaurants = getAllRestaurants();
    const filteredRestaurants = restaurants.filter(r => r.id !== restaurantId);
    localStorage.setItem('restaurants', JSON.stringify(filteredRestaurants));
    
    loadRestaurants();
    showNotification('Đã xóa nhà hàng thành công!');
}

// View restaurant details
function viewRestaurantDetails(restaurantId) {
    const restaurant = getRestaurantById(restaurantId);
    if (!restaurant) {
        alert('Không tìm thấy nhà hàng!');
        return;
    }
    
    alert(`Thông tin nhà hàng:\n\nTên: ${restaurant.name}\nĐịa chỉ: ${restaurant.address}\nSĐT: ${restaurant.phone}\nSố món: ${restaurant.products ? restaurant.products.length : 0}`);
}

// Load orders
function loadOrders() {
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const filteredOrders = filterOrdersList(allOrders, currentOrderFilter);
    
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">Không có dữ liệu</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    tbody.innerHTML = filteredOrders.map(order => {
        const restaurant = getRestaurantById(order.restaurantId);
        const restaurantName = restaurant ? restaurant.name : 'N/A';
        
        const statusText = {
            'new': 'Đơn mới',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'ready': 'Sẵn sàng giao',
            'assigned': 'Đã giao shipper',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        
        const status = order.restaurantStatus || order.status || 'new';
        const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A';
        
        return `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName || 'N/A'}</td>
                <td>${restaurantName}</td>
                <td>${formatPrice(order.total || 0)} VNĐ</td>
                <td><span class="badge badge-${status}">${statusText[status] || status}</span></td>
                <td>${createdAt}</td>
                <td>
                    <button class="btn-action btn-primary" onclick="viewOrderDetail('${order.id}')" title="Xem chi tiết">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter orders
function filterOrders(filter) {
    currentOrderFilter = filter;
    
    // Update active button
    document.querySelectorAll('#orders .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    loadOrders();
}

// Filter orders list
function filterOrdersList(orders, filter) {
    if (filter === 'all') return orders;
    return orders.filter(order => {
        const status = order.restaurantStatus || order.status || 'new';
        return status === filter;
    });
}

// View order detail
function viewOrderDetail(orderId) {
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const order = allOrders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }
    
    const restaurant = getRestaurantById(order.restaurantId);
    const restaurantName = restaurant ? restaurant.name : 'N/A';
    
    const itemsHTML = order.items ? order.items.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.name}</span>
            <span class="order-item-quantity">x${item.quantity}</span>
            <span class="order-item-price">${formatPrice(item.price * item.quantity)} VNĐ</span>
        </div>
    `).join('') : '<p>Không có món ăn</p>';
    
    const statusText = {
        'new': 'Đơn mới',
        'confirmed': 'Đã xác nhận',
        'preparing': 'Đang chuẩn bị',
        'ready': 'Sẵn sàng giao',
        'assigned': 'Đã giao shipper',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    
    const status = order.restaurantStatus || order.status || 'new';
    
    const content = document.getElementById('order-detail-content');
    if (content) {
        content.innerHTML = `
            <div class="order-detail-item">
                <strong>Mã đơn hàng:</strong> ${order.id}
            </div>
            <div class="order-detail-item">
                <strong>Trạng thái:</strong> 
                <span class="badge badge-${status}">${statusText[status] || status}</span>
            </div>
            <div class="order-detail-item">
                <strong>Khách hàng:</strong> ${order.customerName || 'N/A'}
            </div>
            <div class="order-detail-item">
                <strong>Số điện thoại:</strong> ${order.customerPhone || 'N/A'}
            </div>
            <div class="order-detail-item">
                <strong>Địa chỉ giao hàng:</strong> ${order.customerAddress || 'N/A'}
            </div>
            <div class="order-detail-item">
                <strong>Nhà hàng:</strong> ${restaurantName}
            </div>
            <div class="order-detail-item">
                <strong>Thời gian đặt:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}
            </div>
            <div class="order-detail-item">
                <strong>Danh sách món ăn:</strong>
                <div class="order-items">
                    ${itemsHTML}
                </div>
            </div>
            <div class="order-detail-item">
                <strong>Tổng tiền:</strong> 
                <span style="color: var(--orange); font-size: 20px; font-weight: bold;">
                    ${formatPrice(order.total || 0)} VNĐ
                </span>
            </div>
        `;
    }
    
    document.getElementById('order-modal').style.display = 'block';
}

// Load statistics
function loadStatistics() {
    loadMonthlyRevenue();
    loadOrdersByStatus();
    loadTopProducts();
    loadTopRestaurantsStats();
}

// Load monthly revenue
function loadMonthlyRevenue() {
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const completedOrders = allOrders.filter(o => o.restaurantStatus === 'completed' || o.status === 'completed');
    
    // Group by month
    const monthlyRevenue = {};
    completedOrders.forEach(order => {
        if (order.completedAt || order.createdAt) {
            const date = new Date(order.completedAt || order.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyRevenue[monthKey]) {
                monthlyRevenue[monthKey] = 0;
            }
            monthlyRevenue[monthKey] += (order.total || 0);
        }
    });
    
    const container = document.getElementById('monthly-revenue');
    if (container) {
        if (Object.keys(monthlyRevenue).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Chưa có dữ liệu</p>';
        } else {
            container.innerHTML = Object.entries(monthlyRevenue)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 6)
                .map(([month, revenue]) => `
                    <div class="stat-row">
                        <span>${month}</span>
                        <strong>${formatPrice(revenue)} VNĐ</strong>
                    </div>
                `).join('');
        }
    }
}

// Load orders by status
function loadOrdersByStatus() {
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    
    const statusCount = {
        'new': 0,
        'confirmed': 0,
        'preparing': 0,
        'ready': 0,
        'assigned': 0,
        'completed': 0,
        'cancelled': 0
    };
    
    allOrders.forEach(order => {
        const status = order.restaurantStatus || order.status || 'new';
        if (statusCount.hasOwnProperty(status)) {
            statusCount[status]++;
        }
    });
    
    const container = document.getElementById('orders-by-status');
    if (container) {
        const statusText = {
            'new': 'Đơn mới',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'ready': 'Sẵn sàng giao',
            'assigned': 'Đã giao shipper',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        
        container.innerHTML = Object.entries(statusCount)
            .map(([status, count]) => `
                <div class="stat-row">
                    <span>${statusText[status] || status}</span>
                    <strong>${count}</strong>
                </div>
            `).join('');
    }
}

// Load top products
function loadTopProducts() {
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const completedOrders = allOrders.filter(o => o.restaurantStatus === 'completed' || o.status === 'completed');
    
    const productSales = {};
    completedOrders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                if (productSales[item.name]) {
                    productSales[item.name].count += item.quantity;
                    productSales[item.name].revenue += (item.price * item.quantity);
                } else {
                    productSales[item.name] = {
                        count: item.quantity,
                        revenue: item.price * item.quantity,
                        name: item.name
                    };
                }
            });
        }
    });
    
    const sortedProducts = Object.values(productSales).sort((a, b) => b.count - a.count).slice(0, 10);
    
    const container = document.getElementById('top-products-list');
    if (container) {
        if (sortedProducts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Chưa có dữ liệu</p>';
        } else {
            container.innerHTML = sortedProducts.map((product, index) => `
                <div class="stat-row">
                    <span>${index + 1}. ${product.name}</span>
                    <strong>${product.count} đơn (${formatPrice(product.revenue)} VNĐ)</strong>
                </div>
            `).join('');
        }
    }
}

// Load top restaurants stats
function loadTopRestaurantsStats() {
    const allOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    const completedOrders = allOrders.filter(o => o.restaurantStatus === 'completed' || o.status === 'completed');
    const restaurants = getAllRestaurants();
    
    const restaurantStats = {};
    restaurants.forEach(restaurant => {
        restaurantStats[restaurant.id] = {
            id: restaurant.id,
            name: restaurant.name,
            orderCount: 0,
            revenue: 0
        };
    });
    
    completedOrders.forEach(order => {
        if (order.restaurantId && restaurantStats[order.restaurantId]) {
            restaurantStats[order.restaurantId].orderCount++;
            restaurantStats[order.restaurantId].revenue += (order.total || 0);
        }
    });
    
    const sortedRestaurants = Object.values(restaurantStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    
    const container = document.getElementById('top-restaurants-stats');
    if (container) {
        if (sortedRestaurants.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Chưa có dữ liệu</p>';
        } else {
            container.innerHTML = sortedRestaurants.map((restaurant, index) => `
                <div class="stat-row">
                    <span>${index + 1}. ${restaurant.name}</span>
                    <strong>${restaurant.orderCount} đơn (${formatPrice(restaurant.revenue)} VNĐ)</strong>
                </div>
            `).join('');
        }
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
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

