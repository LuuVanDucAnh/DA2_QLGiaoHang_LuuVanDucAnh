// Lấy dữ liệu giỏ hàng từ localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Hàm hiển thị giỏ hàng
function displayCart() {
    const productList = document.getElementById('product-list');
    const totalPriceElement = document.getElementById('total-price');
    
    if (!productList) return;
    
    // Xóa nội dung cũ
    productList.innerHTML = '';
    
    if (cart.length === 0) {
        productList.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Giỏ hàng của bạn đang trống</p>';
        if (totalPriceElement) {
            totalPriceElement.textContent = '0 VNĐ';
        }
        return;
    }
    
    // Tính tổng tiền
    let totalPrice = 0;
    
    // Hiển thị từng sản phẩm
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Giá: ${item.price.toLocaleString('vi-VN')} VNĐ</p>
                <p>Mô tả: ${item.description}</p>
                <div class="quantity-controls">
                    <button onclick="decreaseQuantity(${index})">-</button>
                    <span>Số lượng: ${item.quantity}</span>
                    <button onclick="increaseQuantity(${index})">+</button>
                </div>
                <p style="margin-top: 10px; font-weight: bold; color: var(--orange);">
                    Thành tiền: ${itemTotal.toLocaleString('vi-VN')} VNĐ
                </p>
            </div>
            <div class="cart-item-actions">
                <button onclick="removeItem(${index})">Xóa</button>
            </div>
        `;
        
        productList.appendChild(cartItem);
    });
    
    // Hiển thị tổng tiền
    if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice.toLocaleString('vi-VN') + ' VNĐ';
    }
}

// Hàm giảm số lượng
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart();
        displayCart();
    }
}

// Hàm tăng số lượng
function increaseQuantity(index) {
    cart[index].quantity++;
    saveCart();
    displayCart();
}

// Hàm xóa sản phẩm
function removeItem(index) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        cart.splice(index, 1);
        saveCart();
        displayCart();
        updateCartCount();
    }
}

// Hàm lưu giỏ hàng vào localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
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

// Hàm đặt hàng
function placeOrder() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }
    
    if (confirm('Bạn có chắc chắn muốn đặt hàng?')) {
        // Lưu đơn hàng vào localStorage (có thể mở rộng để gửi lên server)
        const order = {
            id: Date.now(),
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        // Lưu danh sách đơn hàng
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Xóa giỏ hàng
        cart = [];
        saveCart();
        displayCart();
        updateCartCount();
        
        alert('Đặt hàng thành công! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.');
    }
}

// Khởi tạo khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    displayCart();
    updateCartCount();
    
    // Gán sự kiện cho nút đặt hàng
    const orderBtn = document.getElementById('btn_order');
    if (orderBtn) {
        orderBtn.addEventListener('click', placeOrder);
    }
});

