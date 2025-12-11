// Lưu trữ dữ liệu giỏ hàng trong localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Hàm lấy dữ liệu sản phẩm từ phần tử HTML
function getProductData(productItem) {
    const img = productItem.querySelector('img');
    const name = productItem.querySelector('h3');
    const price = productItem.querySelector('p');
    
    return {
        id: Date.now() + Math.random(), // Tạo ID duy nhất
        name: name ? name.textContent.trim() : '',
        price: price ? parseInt(price.textContent.replace(/[^0-9]/g, '')) : 0,
        image: img ? img.src : '',
        description: name ? name.textContent.trim() + ' - Món ăn ngon miệng' : ''
    };
}

// Hàm mở modal với thông tin sản phẩm
function openOrderModal(productItem) {
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
    // Lấy tất cả các nút "Đặt hàng"
    const orderButtons = document.querySelectorAll('.product_item button');
    
    // Gán sự kiện click cho mỗi nút
    orderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productItem = this.closest('.product_item');
            if (productItem) {
                openOrderModal(productItem);
            }
        });
    });
    
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
});


