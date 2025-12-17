// Quản lý dữ liệu nhà hàng
let restaurants = [];

// Hàm khởi tạo dữ liệu nhà hàng mẫu
function initializeSampleRestaurants() {
    // Kiểm tra xem đã có dữ liệu nhà hàng chưa
    const existingRestaurants = localStorage.getItem('restaurants');
    if (existingRestaurants) {
        restaurants = JSON.parse(existingRestaurants);
        return; // Không ghi đè dữ liệu hiện có
    }
    
    // Tạo 3 nhà hàng mẫu với sản phẩm
    restaurants = [
        {
            id: 'rest_001',
            name: 'Nhà Hàng Chay Tâm An',
            description: 'Chuyên phục vụ các món chay thanh đạm, tốt cho sức khỏe',
            image: './img/Nam-dong.png',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            phone: '0123 456 789',
            rating: 4.8,
            deliveryTime: '30-45 phút',
            minOrder: 50000,
            products: [
                {
                    id: 'prod_001',
                    name: 'Nấm sốt đông',
                    price: 20000,
                    image: './img/Nam-dong.png',
                    description: 'Nấm tươi sốt đông thơm ngon, thanh đạm',
                    category: 'mon_chay'
                },
                {
                    id: 'prod_002',
                    name: 'Tàu hũ chiên giòn',
                    price: 30000,
                    image: './img/Tau-hu-chien.png',
                    description: 'Tàu hũ chiên giòn với tỏi ớt và gia vị',
                    category: 'mon_chay'
                },
                {
                    id: 'prod_003',
                    name: 'Tàu hũ non sốt đông',
                    price: 25000,
                    image: './img/Tau-hu-non-sot-dong.png',
                    description: 'Tàu hũ non mềm mại với sốt đông đậm đà',
                    category: 'mon_chay'
                },
                {
                    id: 'prod_004',
                    name: 'Nấm kim châm xào',
                    price: 35000,
                    image: './img/Nam-kim-cham-xao.png',
                    description: 'Nấm kim châm xào với rau củ tươi ngon',
                    category: 'mon_chay'
                }
            ]
        },
        {
            id: 'rest_002',
            name: 'Nhà Hàng Gia Đình',
            description: 'Món ăn gia đình đậm đà, ấm cúng',
            image: './img/Ga-chien-mam.jpg',
            address: '456 Đường XYZ, Quận 2, TP.HCM',
            phone: '0987 654 321',
            rating: 4.6,
            deliveryTime: '25-40 phút',
            minOrder: 60000,
            products: [
                {
                    id: 'prod_005',
                    name: 'Gà chiên mắm',
                    price: 45000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Gà chiên giòn với mắm đặc biệt',
                    category: 'mon_man'
                },
                {
                    id: 'prod_006',
                    name: 'Thịt kho trứng',
                    price: 50000,
                    image: './img/Thit-kho-trung.jpg',
                    description: 'Thịt ba chỉ kho trứng thơm ngon',
                    category: 'mon_man'
                },
                {
                    id: 'prod_007',
                    name: 'Cá kho tộ',
                    price: 55000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Cá kho tộ đậm đà, thơm lừng',
                    category: 'mon_man'
                },
                {
                    id: 'prod_008',
                    name: 'Sườn ram mặn',
                    price: 45000,
                    image: './img/Suon-ram-man.jpg',
                    description: 'Sườn ram mặn ngọt vừa miệng',
                    category: 'mon_man'
                }
            ]
        },
        {
            id: 'rest_003',
            name: 'Lẩu & Nướng Hải Sản',
            description: 'Chuyên các món lẩu và nướng hải sản tươi sống',
            image: './img/Lau-thai.jpg',
            address: '789 Đường DEF, Quận 3, TP.HCM',
            phone: '0912 345 678',
            rating: 4.9,
            deliveryTime: '40-60 phút',
            minOrder: 150000,
            products: [
                {
                    id: 'prod_009',
                    name: 'Lẩu thái chua cay',
                    price: 220000,
                    image: './img/Lau-thai.jpg',
                    description: 'Lẩu thái chua cay với hải sản tươi',
                    category: 'mon_lau'
                },
                {
                    id: 'prod_010',
                    name: 'Lẩu bò nhúng giấm',
                    price: 230000,
                    image: './img/Lau-bo-nam.jpg',
                    description: 'Lẩu bò nhúng giấm thơm ngon',
                    category: 'mon_lau'
                },
                {
                    id: 'prod_011',
                    name: 'Lẩu hải sản',
                    price: 300000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Lẩu hải sản đầy đủ tôm, cua, mực',
                    category: 'mon_lau'
                },
                {
                    id: 'prod_012',
                    name: 'Lẩu cá chua cay',
                    price: 280000,
                    image: './img/Lau-ca-chua-cay.jpg',
                    description: 'Lẩu cá chua cay đậm đà',
                    category: 'mon_lau'
                },
                {
                    id: 'prod_013',
                    name: 'Khoai tây chiên',
                    price: 25000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Khoai tây chiên giòn tan',
                    category: 'an_vat'
                },
                {
                    id: 'prod_014',
                    name: 'Bánh tráng trộn',
                    price: 30000,
                    image: './img/Banh-trang-tron.jpg',
                    description: 'Bánh tráng trộn đầy đủ topping',
                    category: 'an_vat'
                },
                {
                    id: 'prod_015',
                    name: 'Dưa hấu',
                    price: 60000,
                    image: './img/Dua-hau.jpg',
                    description: 'Dưa hấu tươi ngon',
                    category: 'hoa_qua'
                },
                {
                    id: 'prod_016',
                    name: 'Sinh tố bơ',
                    price: 45000,
                    image: './img/Sinh-to-bo.jpg',
                    description: 'Sinh tố bơ thơm ngon',
                    category: 'nuoc_uong'
                }
            ]
        }
    ];
    
    // Lưu vào localStorage
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    console.log('Đã khởi tạo dữ liệu nhà hàng mẫu');
}

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

// Hàm lấy nhà hàng có sản phẩm thuộc category
function getRestaurantsByCategory(category) {
    const restaurants = getAllRestaurants();
    return restaurants.filter(restaurant => {
        return restaurant.products.some(product => product.category === category);
    });
}

// Hàm lọc nhà hàng theo category
function getRestaurantsByCategory(category) {
    const allRestaurants = getAllRestaurants();
    return allRestaurants.filter(restaurant => {
        // Kiểm tra xem nhà hàng có sản phẩm thuộc category không
        return restaurant.products && restaurant.products.some(product => product.category === category);
    });
}

// Khởi tạo khi load
if (typeof window !== 'undefined') {
    initializeSampleRestaurants();
}

