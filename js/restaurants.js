// Quản lý dữ liệu nhà hàng - Utility Functions
// LƯU Ý: Dữ liệu mẫu được khởi tạo bởi init_sample_data.js
// File này chỉ chứa các hàm utility để truy xuất dữ liệu

// Hàm lấy tất cả nhà hàng
function getAllRestaurants() {
    const restaurantsData = localStorage.getItem('restaurants');
    if (restaurantsData) {
        return JSON.parse(restaurantsData);
    }
    return [];
}

// Hàm lấy nhà hàng theo ID
function getRestaurantById(restaurantId) {
    const restaurants = getAllRestaurants();
    return restaurants.find(r => r.id === restaurantId);
}

// Hàm lấy sản phẩm của nhà hàng
function getRestaurantProducts(restaurantId) {
    const restaurant = getRestaurantById(restaurantId);
    return restaurant ? restaurant.products : [];
}

// Hàm lấy sản phẩm của nhà hàng theo category
function getRestaurantProductsByCategory(restaurantId, category) {
    const products = getRestaurantProducts(restaurantId);
    return products.filter(p => p.category === category);
}

// Hàm lọc nhà hàng theo category
function getRestaurantsByCategory(category) {
    const allRestaurants = getAllRestaurants();
    return allRestaurants.filter(restaurant => {
        // Kiểm tra xem nhà hàng có sản phẩm thuộc category không
        return restaurant.products && restaurant.products.some(product => product.category === category);
    });
}

// Hàm đếm số lượng sản phẩm của nhà hàng theo category
function getRestaurantProductCountByCategory(restaurantId, category) {
    const products = getRestaurantProducts(restaurantId);
    return products.filter(p => p.category === category).length;
}

// LƯU Ý: Không tự động khởi tạo dữ liệu ở đây
// Dữ liệu mẫu được quản lý bởi init_sample_data.js
// File này chỉ chứa các hàm utility để truy xuất dữ liệu từ localStorage

