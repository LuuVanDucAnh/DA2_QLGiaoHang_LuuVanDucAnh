// Lưu trữ dữ liệu giỏ hàng trong localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sản phẩm từ nhà hàng
let products = JSON.parse(localStorage.getItem('products')) || [];

// Hàm lấy dữ liệu sản phẩm từ phần tử HTML
function getProductData(productItem) {
    const img = productItem.querySelector('img');
    const name = productItem.querySelector('h3');
    const price = productItem.querySelector('p');
    
    // Lấy ID từ data attribute hoặc tạo mới
    let productId = productItem.getAttribute('data-product-id');
    if (!productId) {
        productId = Date.now() + Math.random();
    }
    
    // Tìm sản phẩm trong danh sách để lấy description
    const foundProduct = products.find(p => p.id == productId);
    
    return {
        id: productId,
        name: name ? name.textContent.trim() : '',
        price: price ? parseInt(price.textContent.replace(/[^0-9]/g, '')) : 0,
        image: img ? img.src : '',
        description: foundProduct ? foundProduct.description : (name ? name.textContent.trim() + ' - Món ăn ngon miệng' : '')
    };
}

// Hàm kiểm tra đăng nhập
function checkLogin() {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
}

// Hàm mở modal với thông tin sản phẩm
function openOrderModal(productItem) {
    // Kiểm tra đăng nhập trước khi mở modal
    const user = checkLogin();
    if (!user) {
        if (confirm('Bạn cần đăng nhập để đặt hàng. Bạn có muốn chuyển đến trang đăng nhập không?')) {
            window.location.href = 'sign_in.html';
        }
        return;
    }
    
    const productData = getProductData(productItem);
    const modal = document.getElementById('orderModal');
    
    // Điền thông tin vào modal
    document.getElementById('modal-product-name').textContent = productData.name;
    document.getElementById('modal-product-image').src = productData.image;
    document.getElementById('modal-product-image').alt = productData.name;
    document.getElementById('modal-product-price').textContent = productData.price.toLocaleString('vi-VN');
    document.getElementById('modal-product-description').textContent = productData.description;
    document.getElementById('product-quantity').value = 1;
    updateTotalPrice(productData.price, 1);
    
    // Lưu dữ liệu sản phẩm vào data attribute của modal
    modal.setAttribute('data-product-id', productData.id);
    modal.setAttribute('data-product-name', productData.name);
    modal.setAttribute('data-product-price', productData.price);
    modal.setAttribute('data-product-image', productData.image);
    modal.setAttribute('data-product-description', productData.description);
    
    // Hiển thị modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hàm đóng modal
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Hàm cập nhật tổng tiền
function updateTotalPrice(price, quantity) {
    const total = price * quantity;
    document.getElementById('modal-total-price').textContent = total.toLocaleString('vi-VN');
}

// Hàm thêm vào giỏ hàng
function addToCart() {
    // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
    const user = checkLogin();
    if (!user) {
        closeOrderModal();
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Bạn có muốn chuyển đến trang đăng nhập không?')) {
            window.location.href = 'sign_in.html';
        }
        return;
    }
    
    const modal = document.getElementById('orderModal');
    const productId = modal.getAttribute('data-product-id');
    const productName = modal.getAttribute('data-product-name');
    const productPrice = parseInt(modal.getAttribute('data-product-price'));
    const productImage = modal.getAttribute('data-product-image');
    const productDescription = modal.getAttribute('data-product-description');
    const quantity = parseInt(document.getElementById('product-quantity').value);
    
    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex > -1) {
        // Nếu đã có, cập nhật số lượng
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Nếu chưa có, thêm mới
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            description: productDescription,
            quantity: quantity
        });
    }
    
    // Lưu vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật số lượng trong giỏ hàng
    updateCartCount();
    
    // Đóng modal
    closeOrderModal();
    
    // Hiển thị thông báo
    showNotification('Đã thêm vào giỏ hàng!');
}

// Hàm cập nhật số lượng hiển thị trong giỏ hàng
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('number_items');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        if (totalItems > 0) {
            cartCountElement.style.display = 'block';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

// Hàm hiển thị thông báo
function showNotification(message) {
    // Tạo element thông báo
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
        z-index: 999999999999;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    // Thêm animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Xóa sau 3 giây
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Khởi tạo khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Load và hiển thị danh sách nhà hàng nổi bật
    loadRestaurants();
    
    // Load nhà hàng theo từng category
    loadRestaurantsByCategory('mon_chay', 'restaurants_mon_chay');
    loadRestaurantsByCategory('mon_man', 'restaurants_mon_man');
    loadRestaurantsByCategory('mon_lau', 'restaurants_mon_lau');
    loadRestaurantsByCategory('an_vat', 'restaurants_an_vat');
    loadRestaurantsByCategory('hoa_qua', 'restaurants_hoa_qua');
    loadRestaurantsByCategory('nuoc_uong', 'restaurants_nuoc_uong');
    
    // Xóa TẤT CẢ sản phẩm mẫu ngay từ đầu (ẩn phần cũ)
    clearAllSampleProducts();
    
    // Gán sự kiện click cho tất cả nút "Đặt hàng" (sau khi load sản phẩm)
    setTimeout(() => {
        attachOrderButtonListenersToAll();
    }, 200);
    
    // Xử lý nút đóng modal
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeOrderModal);
    }
    
    // Đóng modal khi click bên ngoài
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeOrderModal();
            }
        });
    }
    
    // Xử lý nút tăng/giảm số lượng
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const quantityInput = document.getElementById('product-quantity');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value);
            if (quantity > 1) {
                quantity--;
                quantityInput.value = quantity;
                const price = parseInt(document.getElementById('modal-product-price').textContent.replace(/[^0-9]/g, ''));
                updateTotalPrice(price, quantity);
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value);
            quantity++;
            quantityInput.value = quantity;
            const price = parseInt(document.getElementById('modal-product-price').textContent.replace(/[^0-9]/g, ''));
            updateTotalPrice(price, quantity);
        });
    }
    
    // Xử lý nút thêm vào giỏ hàng
    const addToCartBtn = document.getElementById('btn-add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
    
    // Cập nhật số lượng giỏ hàng khi tải trang
    updateCartCount();
    
    // Kiểm tra đăng nhập khi click vào giỏ hàng
    const cartLink = document.querySelector('.cart a');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            const user = checkLogin();
            if (!user) {
                e.preventDefault();
                if (confirm('Bạn cần đăng nhập để xem giỏ hàng. Bạn có muốn chuyển đến trang đăng nhập không?')) {
                    window.location.href = 'sign_in.html';
                }
            }
        });
    }
    
    // Gán lại event listener sau khi load sản phẩm
    setTimeout(() => {
        attachOrderButtonListenersToAll();
    }, 100);
    
    // Kiểm tra sản phẩm mới mỗi 5 giây (để cập nhật khi nhà hàng thêm sản phẩm)
    setInterval(() => {
        loadProductsFromRestaurant();
        setTimeout(() => {
            attachOrderButtonListenersToAll();
        }, 100);
    }, 5000);
});

// Hàm load và hiển thị danh sách nhà hàng
function loadRestaurants() {
    // Kiểm tra xem hàm getAllRestaurants có tồn tại không
    if (typeof getAllRestaurants === 'undefined') {
        console.error('getAllRestaurants function not found. Make sure restaurants.js is loaded.');
        return;
    }
    
    const restaurants = getAllRestaurants();
    const restaurantsList = document.getElementById('restaurants-list');
    
    if (!restaurantsList) return;
    
    if (restaurants.length === 0) {
        restaurantsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999; grid-column: 1 / -1;">
                <i class="fa-solid fa-store-slash" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                <p>Chưa có nhà hàng nào</p>
            </div>
        `;
        return;
    }
    
    restaurantsList.innerHTML = restaurants.map(restaurant => createRestaurantCardHTML(restaurant)).join('');
}

// Hàm load nhà hàng theo category
function loadRestaurantsByCategory(category, containerId) {
    // Kiểm tra xem hàm getRestaurantsByCategory có tồn tại không
    if (typeof getRestaurantsByCategory === 'undefined') {
        console.error('getRestaurantsByCategory function not found. Make sure restaurants.js is loaded.');
        return;
    }
    
    const restaurants = getRestaurantsByCategory(category);
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    if (restaurants.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999; grid-column: 1 / -1;">
                <i class="fa-solid fa-store-slash" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                <p>Chưa có nhà hàng nào phục vụ ${getCategoryName(category)}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = restaurants.map(restaurant => createRestaurantCardHTML(restaurant)).join('');
}

// Hàm lấy tên category tiếng Việt
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

// Hàm tạo HTML cho restaurant card
function createRestaurantCardHTML(restaurant) {
    return `
        <div class="restaurant-card" data-restaurant-id="${restaurant.id}">
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${restaurant.name}" onerror="this.src='./img/Logo_icon.png'">
                <div class="restaurant-rating">
                    <i class="fa-solid fa-star"></i>
                    <span>${restaurant.rating}</span>
                </div>
            </div>
            <div class="restaurant-info">
                <h3 class="restaurant-name">${restaurant.name}</h3>
                <p class="restaurant-description">${restaurant.description}</p>
                <div class="restaurant-details">
                    <div class="restaurant-detail-item">
                        <i class="fa-solid fa-clock"></i>
                        <span>${restaurant.deliveryTime}</span>
                    </div>
                    <div class="restaurant-detail-item">
                        <i class="fa-solid fa-money-bill"></i>
                        <span>Tối thiểu: ${restaurant.minOrder.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                </div>
                <div class="restaurant-actions">
                    <button class="btn-view-menu" onclick="viewRestaurantMenu('${restaurant.id}')">
                        <i class="fa-solid fa-utensils"></i>
                        Xem thực đơn
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Hàm xem thực đơn nhà hàng (global function)
window.viewRestaurantMenu = function(restaurantId, category = null) {
    // Lưu restaurantId và category vào sessionStorage để trang restaurant.html có thể đọc
    sessionStorage.setItem('selectedRestaurantId', restaurantId);
    if (category) {
        sessionStorage.setItem('selectedCategory', category);
    } else {
        sessionStorage.removeItem('selectedCategory');
    }
    window.location.href = 'restaurant.html';
};

// Hàm xóa tất cả sản phẩm mẫu
function clearAllSampleProducts() {
    const containers = [
        'product_mon_chay',
        'product_mon_man',
        'product_mon_lau',
        'product_an_vat',
        'product_hoa_qua',
        'product_nuoc_uong'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    });
}

// Hàm load sản phẩm từ localStorage (từ nhà hàng)
function loadProductsFromRestaurant() {
    try {
        const productsData = localStorage.getItem('products');
        if (productsData) {
            products = JSON.parse(productsData);
        } else {
            products = [];
        }
        
        // Hiển thị sản phẩm theo từng category
        displayProductsByCategory('mon_chay', 'product_mon_chay');
        displayProductsByCategory('mon_man', 'product_mon_man');
        displayProductsByCategory('mon_lau', 'product_mon_lau');
        displayProductsByCategory('an_vat', 'product_an_vat');
        displayProductsByCategory('hoa_qua', 'product_hoa_qua');
        displayProductsByCategory('nuoc_uong', 'product_nuoc_uong');
    } catch (error) {
        console.error('Lỗi khi load sản phẩm:', error);
    }
}

// Hàm hiển thị sản phẩm theo category
function displayProductsByCategory(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Lọc sản phẩm theo category
    const categoryProducts = products.filter(p => p.category === category);
    
    // Xóa TẤT CẢ sản phẩm cũ (cả sản phẩm mẫu và sản phẩm từ nhà hàng cũ)
    container.innerHTML = '';
    
    // Nếu không có sản phẩm từ nhà hàng, hiển thị thông báo
    if (categoryProducts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999; grid-column: 1 / -1;">
                <i class="fa-solid fa-box-open" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                <p>Chưa có sản phẩm nào trong danh mục này</p>
                <p style="font-size: 12px; margin-top: 10px;">Nhà hàng sẽ thêm sản phẩm sớm nhất</p>
            </div>
        `;
        return;
    }
    
    // Hiển thị tối đa 8 sản phẩm mỗi category
    const productsToShow = categoryProducts.slice(0, 8);
    
    productsToShow.forEach(product => {
        const productItem = createProductItemHTML(product);
        container.appendChild(productItem);
    });
    
    // Gán lại event listener cho các nút đặt hàng mới
    attachOrderButtonListeners(container);
}

// Hàm gán event listener cho nút đặt hàng trong một container
function attachOrderButtonListeners(container) {
    const orderButtons = container.querySelectorAll('.product_item button');
    orderButtons.forEach(button => {
        // Xóa listener cũ nếu có
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Thêm listener mới
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            const productItem = this.closest('.product_item');
            if (productItem) {
                openOrderModal(productItem);
            }
        });
    });
}

// Hàm gán event listener cho tất cả nút đặt hàng trên trang
function attachOrderButtonListenersToAll() {
    const orderButtons = document.querySelectorAll('.product_item button');
    orderButtons.forEach(button => {
        // Kiểm tra xem button đã có listener chưa
        if (!button.hasAttribute('data-listener-attached')) {
            button.setAttribute('data-listener-attached', 'true');
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productItem = this.closest('.product_item');
                if (productItem) {
                    openOrderModal(productItem);
                }
            });
        }
    });
}

// Hàm tạo HTML cho product item
function createProductItemHTML(product) {
    const productItem = document.createElement('div');
    productItem.className = 'product_item';
    productItem.setAttribute('data-product-id', product.id);
    
    // Xử lý đường dẫn ảnh
    let imageSrc = product.image || './img/Logo_icon.png';
    
    // Nếu là đường dẫn tương đối từ thư mục img, giữ nguyên
    // Nếu là URL đầy đủ, giữ nguyên
    // Nếu chỉ là tên file, thêm prefix ./img/
    if (imageSrc && !imageSrc.startsWith('http') && !imageSrc.startsWith('./') && !imageSrc.startsWith('/')) {
        imageSrc = './img/' + imageSrc;
    }
    
    productItem.innerHTML = `
        <img src="${imageSrc}" alt="${product.name}" onerror="this.src='./img/Logo_icon.png'">
        <h3>${product.name}</h3>
        <p>${product.price.toLocaleString('vi-VN')} VNĐ</p>
        <button>
            <i class="fa-solid fa-cart-shopping"></i>
            Đặt hàng
        </button>
    `;
    
    return productItem;
}
