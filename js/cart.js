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
    const cartCountElement = document.getElementById('cart_number_items') || document.getElementById('number_items');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        if (totalItems > 0) {
            cartCountElement.style.display = 'block';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

// Hàm kiểm tra đăng nhập
function checkLogin() {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
}

// Hàm mở form đặt hàng
function placeOrder() {
    // Kiểm tra đăng nhập trước
    const user = checkLogin();
    if (!user) {
        if (confirm('Bạn cần đăng nhập để đặt hàng. Bạn có muốn chuyển đến trang đăng nhập không?')) {
            // Lưu lại giỏ hàng trước khi chuyển trang
            localStorage.setItem('cart', JSON.stringify(cart));
            window.location.href = 'sign_in.html';
        }
        return;
    }
    
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }
    
    // Tính tổng tiền
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Hiển thị tóm tắt đơn hàng
    displayOrderSummary();
    
    // Cập nhật tổng tiền trong form
    document.getElementById('order-total-summary').textContent = totalPrice.toLocaleString('vi-VN');
    
    // Điền thông tin khách hàng từ tài khoản đã đăng nhập (nếu có)
    if (user.fullname) {
        const nameInput = document.getElementById('customer-name');
        if (nameInput) nameInput.value = user.fullname;
    }
    
    // Hiển thị modal
    const modal = document.getElementById('orderFormModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hàm hiển thị tóm tắt đơn hàng
function displayOrderSummary() {
    const summaryContent = document.getElementById('order-summary-content');
    summaryContent.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const summaryItem = document.createElement('div');
        summaryItem.className = 'order-summary-item';
        summaryItem.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">x${item.quantity}</span>
            <span class="item-price">${itemTotal.toLocaleString('vi-VN')} VNĐ</span>
        `;
        summaryContent.appendChild(summaryItem);
    });
}

// Hàm đóng form đặt hàng
function closeOrderForm() {
    const modal = document.getElementById('orderFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('orderForm').reset();
}

// Hàm xử lý submit form đặt hàng
function submitOrder(event) {
    event.preventDefault();
    
    // Lấy thông tin từ form
    const formData = {
        customerName: document.getElementById('customer-name').value.trim(),
        customerPhone: document.getElementById('customer-phone').value.trim(),
        customerAddress: document.getElementById('customer-address').value.trim(),
        paymentMethod: document.getElementById('payment-method').value,
        orderNote: document.getElementById('order-note').value.trim()
    };
    
    // Validate
    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress || !formData.paymentMethod) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    // Validate số điện thoại (ít nhất 10 số)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
        alert('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại từ 10-11 chữ số.');
        return;
    }
    
    // Kiểm tra tất cả sản phẩm trong giỏ hàng có cùng restaurantId không
    const restaurantIds = cart.map(item => item.restaurantId).filter(id => id);
    const uniqueRestaurantIds = [...new Set(restaurantIds)];
    
    if (uniqueRestaurantIds.length === 0) {
        alert('Không thể xác định nhà hàng. Vui lòng thêm sản phẩm vào giỏ hàng lại!');
        return;
    }
    
    if (uniqueRestaurantIds.length > 1) {
        alert('Giỏ hàng của bạn có sản phẩm từ nhiều nhà hàng khác nhau. Vui lòng đặt hàng từng nhà hàng một!');
        return;
    }
    
    // Lấy restaurantId từ sản phẩm đầu tiên
    const orderRestaurantId = uniqueRestaurantIds[0];
    
    // Tạo đơn hàng
    const order = {
        id: 'ORD' + Date.now(),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: JSON.parse(JSON.stringify(cart)).map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: formData.paymentMethod,
        note: formData.orderNote,
        restaurantId: orderRestaurantId, // QUAN TRỌNG: Lưu restaurantId của đơn hàng
        status: 'pending', // Chờ nhà hàng xác nhận
        restaurantStatus: 'new', // Trạng thái ở nhà hàng: new, confirmed, preparing, ready, assigned
        shipperId: null,
        createdAt: new Date().toISOString(),
        confirmedAt: null,
        preparingAt: null,
        readyAt: null,
        assignedAt: null
    };
    
    // Lưu đơn hàng vào localStorage cho nhà hàng
    let restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders')) || [];
    restaurantOrders.push(order);
    localStorage.setItem('restaurant_orders', JSON.stringify(restaurantOrders));
    
    // Lưu đơn hàng vào localStorage cho khách hàng (lịch sử đơn hàng)
    let customerOrders = JSON.parse(localStorage.getItem('customer_orders')) || [];
    customerOrders.push(order);
    localStorage.setItem('customer_orders', JSON.stringify(customerOrders));
    
    // Xóa giỏ hàng
    cart = [];
    saveCart();
    displayCart();
    updateCartCount();
    
    // Đóng modal
    closeOrderForm();
    
    // Hiển thị thông báo thành công
    showSuccessMessage('Đặt hàng thành công! Đơn hàng của bạn đã được gửi đến nhà hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.');
}

// Hàm hiển thị thông báo thành công
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px 40px;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 999999999999;
        text-align: center;
        max-width: 400px;
        animation: popIn 0.3s ease;
    `;
    
    messageDiv.innerHTML = `
        <div style="color: var(--orange); font-size: 48px; margin-bottom: 15px;">
            <i class="fa-solid fa-circle-check"></i>
        </div>
        <h3 style="color: var(--orange); margin-bottom: 15px; font-size: 20px;">Thành công!</h3>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">${message}</p>
        <button onclick="this.parentElement.remove(); window.location.href='index.html';" 
                style="padding: 10px 30px; background-color: var(--orange); color: white; 
                       border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">
            Về trang chủ
        </button>
    `;
    
    // Thêm animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes popIn {
            from {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
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
    
    // Gán sự kiện cho form đặt hàng
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }
    
    // Gán sự kiện cho nút đóng modal
    const closeModalBtn = document.querySelector('#orderFormModal .close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeOrderForm);
    }
    
    // Đóng modal khi click bên ngoài
    const orderModal = document.getElementById('orderFormModal');
    if (orderModal) {
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                closeOrderForm();
            }
        });
    }
    
    // Đóng modal khi nhấn ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('orderFormModal');
            if (modal && modal.style.display === 'block') {
                closeOrderForm();
            }
        }
    });
});
