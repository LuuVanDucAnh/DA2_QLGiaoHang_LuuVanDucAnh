// Quản lý trang hiển thị sản phẩm của nhà hàng
let currentRestaurant = null;
let restaurantProducts = [];

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', function() {
    // Lấy restaurantId từ sessionStorage
    const restaurantId = sessionStorage.getItem('selectedRestaurantId');
    
    if (!restaurantId) {
        // Nếu không có restaurantId, quay về trang chủ
        alert('Không tìm thấy nhà hàng. Đang chuyển về trang chủ...');
        window.location.href = 'index.html';
        return;
    }
    
    // Load thông tin nhà hàng và sản phẩm
    loadRestaurantInfo(restaurantId);
    loadRestaurantProducts(restaurantId);
    
    // Gán event listener cho các nút đặt hàng
    setTimeout(() => {
        attachOrderButtonListenersToAll();
    }, 200);
});

// Hàm load thông tin nhà hàng
function loadRestaurantInfo(restaurantId) {
    currentRestaurant = getRestaurantById(restaurantId);
    
    if (!currentRestaurant) {
        alert('Không tìm thấy nhà hàng. Đang chuyển về trang chủ...');
        window.location.href = 'index.html';
        return;
    }
    
    // Cập nhật tiêu đề menu nếu có category được chọn
    const selectedCategory = sessionStorage.getItem('selectedCategory');
    const menuTitle = document.getElementById('restaurant-menu-title');
    if (menuTitle && selectedCategory) {
        menuTitle.textContent = `Thực Đơn - ${getCategoryName(selectedCategory)}`;
    }
    
    const restaurantHeader = document.getElementById('restaurant-header');
    if (restaurantHeader) {
        restaurantHeader.innerHTML = `
            <div class="restaurant-header-content">
                <div class="restaurant-header-image">
                    <img src="${currentRestaurant.image}" alt="${currentRestaurant.name}" onerror="this.src='./img/Logo_icon.png'">
                </div>
                <div class="restaurant-header-info">
                    <h1 class="restaurant-header-name">${currentRestaurant.name}</h1>
                    <p class="restaurant-header-description">${currentRestaurant.description}</p>
                    <div class="restaurant-header-details">
                        <div class="restaurant-header-detail-item">
                            <i class="fa-solid fa-star"></i>
                            <span>${currentRestaurant.rating}</span>
                        </div>
                        <div class="restaurant-header-detail-item">
                            <i class="fa-solid fa-clock"></i>
                            <span>${currentRestaurant.deliveryTime}</span>
                        </div>
                        <div class="restaurant-header-detail-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${currentRestaurant.address}</span>
                        </div>
                        <div class="restaurant-header-detail-item">
                            <i class="fa-solid fa-phone"></i>
                            <span>${currentRestaurant.phone}</span>
                        </div>
                        <div class="restaurant-header-detail-item">
                            <i class="fa-solid fa-money-bill"></i>
                            <span>Tối thiểu: ${currentRestaurant.minOrder.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Hàm load sản phẩm của nhà hàng
function loadRestaurantProducts(restaurantId) {
    // Lấy category từ sessionStorage nếu có (khi click từ category)
    const selectedCategory = sessionStorage.getItem('selectedCategory');
    
    if (selectedCategory) {
        // Lọc sản phẩm theo category
        restaurantProducts = getRestaurantProductsByCategory(restaurantId, selectedCategory);
    } else {
        // Load tất cả sản phẩm
        restaurantProducts = getRestaurantProducts(restaurantId);
    }
    
    const productsContainer = document.getElementById('restaurant-products');
    
    if (!productsContainer) return;
    
    if (restaurantProducts.length === 0) {
        const categoryText = selectedCategory ? getCategoryName(selectedCategory) : '';
        productsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999; grid-column: 1 / -1;">
                <i class="fa-solid fa-box-open" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                <p>Nhà hàng chưa có sản phẩm${categoryText ? ' trong danh mục ' + categoryText : ''}</p>
            </div>
        `;
        return;
    }
    
    // Hiển thị sản phẩm
    productsContainer.innerHTML = restaurantProducts.map(product => {
        // Cập nhật products array để getProductData có thể tìm thấy
        if (typeof products !== 'undefined') {
            const existingIndex = products.findIndex(p => p.id === product.id);
            if (existingIndex === -1) {
                products.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    description: product.description,
                    category: product.category
                });
            }
        }
        
        return `
            <div class="product_item" data-product-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='./img/Logo_icon.png'">
                <h3>${product.name}</h3>
                <p>${product.price.toLocaleString('vi-VN')} VNĐ</p>
                <button>
                    <i class="fa-solid fa-cart-shopping"></i>
                    Đặt hàng
                </button>
            </div>
        `;
    }).join('');
}

// Hàm lấy tên category
function getCategoryName(category) {
    const categoryNames = {
        'mon_chay': 'Món Chay',
        'mon_man': 'Món Mặn',
        'mon_lau': 'Món Lẩu',
        'an_vat': 'Ăn Vặt',
        'hoa_qua': 'Hoa Quả',
        'nuoc_uong': 'Nước Uống'
    };
    return categoryNames[category] || category;
}

