// File khởi tạo dữ liệu mẫu ban đầu cho hệ thống
// Chạy tự động khi trang được load

// Hàm khởi tạo tất cả dữ liệu mẫu
function initializeAllSampleData() {
    console.log('Bắt đầu khởi tạo dữ liệu mẫu...');
    
    // 1. Khởi tạo tài khoản admin
    initializeDefaultAdmin();
    
    // 2. Khởi tạo nhà hàng mẫu
    initializeSampleRestaurants();
    
    // 3. Khởi tạo tài khoản cho nhà hàng mẫu
    initializeSampleRestaurantAccounts();
    
    // 4. Khởi tạo đơn hàng mẫu (nếu cần)
    // initializeSampleOrders();
    
    console.log('Hoàn tất khởi tạo dữ liệu mẫu!');
}

// Hàm khởi tạo tài khoản admin mặc định
function initializeDefaultAdmin() {
    try {
        const usersData = localStorage.getItem("users");
        let users = [];
        
        if (usersData) {
            users = JSON.parse(usersData);
        }
        
        // Kiểm tra xem đã có tài khoản admin chưa
        const adminExists = users.some(user => user.username.toLowerCase() === "admin");
        
        if (!adminExists) {
            // Tạo tài khoản admin mặc định
            const defaultAdmin = {
                fullname: "Administrator",
                username: "admin",
                password: "ducanh12345",
                role: "admin",
                createdAt: new Date().toISOString()
            };
            
            users.push(defaultAdmin);
            localStorage.setItem("users", JSON.stringify(users));
            console.log("✓ Đã tạo tài khoản admin: admin / ducanh12345");
        }
    } catch (error) {
        console.error("Lỗi khi khởi tạo tài khoản admin:", error);
    }
}

// Hàm khởi tạo nhà hàng mẫu (từ restaurants.js hoặc định nghĩa tại đây)
function initializeSampleRestaurants() {
    // Kiểm tra xem đã có dữ liệu nhà hàng chưa
    const existingRestaurants = localStorage.getItem('restaurants');
    if (existingRestaurants) {
        const restaurants = JSON.parse(existingRestaurants);
        // Kiểm tra xem có đủ 15 nhà hàng chưa (dữ liệu mới)
        if (restaurants.length >= 15) {
            console.log(`✓ Đã có ${restaurants.length} nhà hàng trong hệ thống`);
            return; // Đã có đủ dữ liệu mới
        } else {
            console.log(`⚠ Phát hiện ${restaurants.length} nhà hàng cũ, đang cập nhật lên 15 nhà hàng...`);
            // Tiếp tục tạo dữ liệu mới (sẽ ghi đè)
        }
    }
    
    // Tạo 8 nhà hàng mẫu với sản phẩm đầy đủ
    const restaurants = [
        {
            id: 'rest_001',
            name: 'Nhà Hàng Chay Tâm An',
            description: 'Chuyên phục vụ các món chay thanh đạm, tốt cho sức khỏe',
            image: './img/Nhahang1.jpeg',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            phone: '0123 456 789',
            rating: 4.8,
            deliveryTime: '30-45 phút',
            minOrder: 50000,
            ownerUsername: 'nhahang1',
            products: [
                {
                    id: 'prod_001',
                    name: 'Nấm sốt đông',
                    price: 20000,
                    image: './img/Nam-dong.png',
                    description: 'Nấm tươi sốt đông thơm ngon, thanh đạm',
                    category: 'mon_chay',
                    restaurantId: 'rest_001'
                },
                {
                    id: 'prod_002',
                    name: 'Tàu hũ chiên giòn',
                    price: 30000,
                    image: './img/Tau-hu-chien.png',
                    description: 'Tàu hũ chiên giòn với tỏi ớt và gia vị',
                    category: 'mon_chay',
                    restaurantId: 'rest_001'
                },
                {
                    id: 'prod_003',
                    name: 'Tàu hũ non sốt đông',
                    price: 25000,
                    image: './img/Tau-hu-non-sot-dong.png',
                    description: 'Tàu hũ non mềm mại với sốt đông đậm đà',
                    category: 'mon_chay',
                    restaurantId: 'rest_001'
                },
                {
                    id: 'prod_004',
                    name: 'Nấm kim châm xào',
                    price: 35000,
                    image: './img/Nam-kim-cham-xao.png',
                    description: 'Nấm kim châm xào với rau củ tươi ngon',
                    category: 'mon_chay',
                    restaurantId: 'rest_001'
                },
                {
                    id: 'prod_017',
                    name: 'Đậu phụ sốt cà chua',
                    price: 28000,
                    image: './img/Tau-hu-chien.png',
                    description: 'Đậu phụ mềm sốt cà chua chua ngọt',
                    category: 'mon_chay',
                    restaurantId: 'rest_001'
                },
                {
                    id: 'prod_018',
                    name: 'Rau củ xào chay',
                    price: 32000,
                    image: './img/Nam-kim-cham-xao.png',
                    description: 'Rau củ tươi xào chay thanh đạm',
                    category: 'mon_chay',
                    restaurantId: 'rest_001'
                },
                {
                    id: 'prod_019',
                    name: 'Chả chay',
                    price: 40000,
                    image: './img/Nam-dong.png',
                    description: 'Chả chay thơm ngon, đậm đà',
                    category: 'mon_chay',
                    restaurantId: 'rest_001'
                },
                {
                    id: 'prod_020',
                    name: 'Canh chua chay',
                    price: 35000,
                    image: './img/Tau-hu-non-sot-dong.png',
                    description: 'Canh chua chay thanh mát',
                    category: 'mon_chay',
                    restaurantId: 'rest_001'
                }
            ]
        },
        {
            id: 'rest_002',
            name: 'Nhà Hàng Gia Đình',
            description: 'Món ăn gia đình đậm đà, ấm cúng',
            image: './img/Nhahang2.jpg',
            address: '456 Đường XYZ, Quận 2, TP.HCM',
            phone: '0987 654 321',
            rating: 4.6,
            deliveryTime: '25-40 phút',
            minOrder: 60000,
            ownerUsername: 'nhahang2',
            products: [
                {
                    id: 'prod_005',
                    name: 'Gà chiên mắm',
                    price: 45000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Gà chiên giòn với mắm đặc biệt',
                    category: 'mon_man',
                    restaurantId: 'rest_002'
                },
                {
                    id: 'prod_006',
                    name: 'Thịt kho trứng',
                    price: 50000,
                    image: './img/Thit-kho-trung.jpg',
                    description: 'Thịt ba chỉ kho trứng thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_002'
                },
                {
                    id: 'prod_007',
                    name: 'Cá kho tộ',
                    price: 55000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Cá kho tộ đậm đà, thơm lừng',
                    category: 'mon_man',
                    restaurantId: 'rest_002'
                },
                {
                    id: 'prod_008',
                    name: 'Sườn ram mặn',
                    price: 45000,
                    image: './img/Suon-ram-man.jpg',
                    description: 'Sườn ram mặn ngọt vừa miệng',
                    category: 'mon_man',
                    restaurantId: 'rest_002'
                },
                {
                    id: 'prod_021',
                    name: 'Thịt heo quay',
                    price: 60000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Thịt heo quay giòn da, thơm lừng',
                    category: 'mon_man',
                    restaurantId: 'rest_002'
                },
                {
                    id: 'prod_022',
                    name: 'Cá chiên giòn',
                    price: 50000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Cá chiên giòn, vàng ruộm',
                    category: 'mon_man',
                    restaurantId: 'rest_002'
                },
                {
                    id: 'prod_023',
                    name: 'Canh chua cá',
                    price: 55000,
                    image: './img/Thit-kho-trung.jpg',
                    description: 'Canh chua cá chua ngọt, thanh mát',
                    category: 'mon_man',
                    restaurantId: 'rest_002'
                },
                {
                    id: 'prod_024',
                    name: 'Thịt bò xào',
                    price: 65000,
                    image: './img/Suon-ram-man.jpg',
                    description: 'Thịt bò xào mềm, đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_002'
                }
            ]
        },
        {
            id: 'rest_003',
            name: 'Lẩu & Nướng Hải Sản',
            description: 'Chuyên các món lẩu và nướng hải sản tươi sống',
            image: './img/Nhahang3.png',
            address: '789 Đường DEF, Quận 3, TP.HCM',
            phone: '0912 345 678',
            rating: 4.9,
            deliveryTime: '40-60 phút',
            minOrder: 150000,
            ownerUsername: 'nhahang3',
            products: [
                {
                    id: 'prod_009',
                    name: 'Lẩu thái chua cay',
                    price: 220000,
                    image: './img/Lau-thai.jpg',
                    description: 'Lẩu thái chua cay với hải sản tươi',
                    category: 'mon_lau',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_010',
                    name: 'Lẩu bò nhúng giấm',
                    price: 230000,
                    image: './img/Lau-bo-nam.jpg',
                    description: 'Lẩu bò nhúng giấm thơm ngon',
                    category: 'mon_lau',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_011',
                    name: 'Lẩu hải sản',
                    price: 300000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Lẩu hải sản đầy đủ tôm, cua, mực',
                    category: 'mon_lau',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_012',
                    name: 'Lẩu cá chua cay',
                    price: 280000,
                    image: './img/Lau-ca-chua-cay.jpg',
                    description: 'Lẩu cá chua cay đậm đà',
                    category: 'mon_lau',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_025',
                    name: 'Lẩu riêu cua',
                    price: 250000,
                    image: './img/Lau-thai.jpg',
                    description: 'Lẩu riêu cua đậm đà, thơm ngon',
                    category: 'mon_lau',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_026',
                    name: 'Lẩu gà lá é',
                    price: 200000,
                    image: './img/Lau-bo-nam.jpg',
                    description: 'Lẩu gà lá é thơm lừng',
                    category: 'mon_lau',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_013',
                    name: 'Khoai tây chiên',
                    price: 25000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Khoai tây chiên giòn tan',
                    category: 'an_vat',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_014',
                    name: 'Bánh tráng trộn',
                    price: 30000,
                    image: './img/Banh-trang-tron.jpg',
                    description: 'Bánh tráng trộn đầy đủ topping',
                    category: 'an_vat',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_015',
                    name: 'Dưa hấu',
                    price: 60000,
                    image: './img/Dua-hau.jpg',
                    description: 'Dưa hấu tươi ngon',
                    category: 'hoa_qua',
                    restaurantId: 'rest_003'
                },
                {
                    id: 'prod_016',
                    name: 'Sinh tố bơ',
                    price: 45000,
                    image: './img/Sinh-to-bo.jpg',
                    description: 'Sinh tố bơ thơm ngon',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_003'
                }
            ]
        },
        {
            id: 'rest_004',
            name: 'Quán Ăn Vặt Hương Vị',
            description: 'Chuyên các món ăn vặt đa dạng, hấp dẫn',
            image: './img/Nhahang4.jpg',
            address: '321 Đường GHI, Quận 4, TP.HCM',
            phone: '0901 234 567',
            rating: 4.7,
            deliveryTime: '20-30 phút',
            minOrder: 40000,
            ownerUsername: 'nhahang4',
            products: [
                {
                    id: 'prod_027',
                    name: 'Khoai tây chiên',
                    price: 25000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Khoai tây chiên giòn tan',
                    category: 'an_vat',
                    restaurantId: 'rest_004'
                },
                {
                    id: 'prod_028',
                    name: 'Bánh tráng trộn',
                    price: 30000,
                    image: './img/Banh-trang-tron.jpg',
                    description: 'Bánh tráng trộn đầy đủ topping',
                    category: 'an_vat',
                    restaurantId: 'rest_004'
                },
                {
                    id: 'prod_029',
                    name: 'Gỏi xoài khô bò',
                    price: 50000,
                    image: './img/Goi-xoai.jpg',
                    description: 'Gỏi xoài khô bò chua ngọt',
                    category: 'an_vat',
                    restaurantId: 'rest_004'
                },
                {
                    id: 'prod_030',
                    name: 'Cá viên chiên',
                    price: 25000,
                    image: './img/Ca-vien-chien.jpg',
                    description: 'Cá viên chiên giòn, thơm ngon',
                    category: 'an_vat',
                    restaurantId: 'rest_004'
                },
                {
                    id: 'prod_031',
                    name: 'Bánh mì nướng',
                    price: 20000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Bánh mì nướng bơ tỏi thơm lừng',
                    category: 'an_vat',
                    restaurantId: 'rest_004'
                },
                {
                    id: 'prod_032',
                    name: 'Nem nướng',
                    price: 35000,
                    image: './img/Banh-trang-tron.jpg',
                    description: 'Nem nướng thơm ngon, đậm đà',
                    category: 'an_vat',
                    restaurantId: 'rest_004'
                },
                {
                    id: 'prod_033',
                    name: 'Chả cá',
                    price: 40000,
                    image: './img/Ca-vien-chien.jpg',
                    description: 'Chả cá chiên giòn, vàng ruộm',
                    category: 'an_vat',
                    restaurantId: 'rest_004'
                },
                {
                    id: 'prod_034',
                    name: 'Bánh tráng nướng',
                    price: 15000,
                    image: './img/Goi-xoai.jpg',
                    description: 'Bánh tráng nướng giòn, thơm',
                    category: 'an_vat',
                    restaurantId: 'rest_004'
                }
            ]
        },
        {
            id: 'rest_005',
            name: 'Trái Cây Tươi Sạch',
            description: 'Hoa quả tươi ngon, đảm bảo chất lượng',
            image: './img/Nhahang5.jpg',
            address: '654 Đường JKL, Quận 5, TP.HCM',
            phone: '0902 345 678',
            rating: 4.5,
            deliveryTime: '15-25 phút',
            minOrder: 30000,
            ownerUsername: 'nhahang5',
            products: [
                {
                    id: 'prod_035',
                    name: 'Dưa hấu',
                    price: 60000,
                    image: './img/Dua-hau.jpg',
                    description: 'Dưa hấu tươi ngon, mát lạnh',
                    category: 'hoa_qua',
                    restaurantId: 'rest_005'
                },
                {
                    id: 'prod_036',
                    name: 'Mít',
                    price: 50000,
                    image: './img/Mit.jpg',
                    description: 'Mít chín cây, thơm ngọt',
                    category: 'hoa_qua',
                    restaurantId: 'rest_005'
                },
                {
                    id: 'prod_037',
                    name: 'Thanh long',
                    price: 40000,
                    image: './img/Thanh-long.jpg',
                    description: 'Thanh long tươi ngon, ngọt mát',
                    category: 'hoa_qua',
                    restaurantId: 'rest_005'
                },
                {
                    id: 'prod_038',
                    name: 'Xoài chín',
                    price: 25000,
                    image: './img/Xoai-chin.jpg',
                    description: 'Xoài chín cây, ngọt thanh',
                    category: 'hoa_qua',
                    restaurantId: 'rest_005'
                },
                {
                    id: 'prod_039',
                    name: 'Ổi',
                    price: 30000,
                    image: './img/Dua-hau.jpg',
                    description: 'Ổi giòn ngọt, tươi ngon',
                    category: 'hoa_qua',
                    restaurantId: 'rest_005'
                },
                {
                    id: 'prod_040',
                    name: 'Chuối',
                    price: 20000,
                    image: './img/Mit.jpg',
                    description: 'Chuối chín cây, thơm ngon',
                    category: 'hoa_qua',
                    restaurantId: 'rest_005'
                },
                {
                    id: 'prod_041',
                    name: 'Cam',
                    price: 35000,
                    image: './img/Thanh-long.jpg',
                    description: 'Cam tươi, ngọt mát',
                    category: 'hoa_qua',
                    restaurantId: 'rest_005'
                },
                
            ]
        },
        {
            id: 'rest_006',
            name: 'Quán Nước Giải Khát',
            description: 'Nước uống đa dạng, tươi mát',
            image: './img/Nhahang6.jpg',
            address: '987 Đường MNO, Quận 6, TP.HCM',
            phone: '0903 456 789',
            rating: 4.4,
            deliveryTime: '15-20 phút',
            minOrder: 30000,
            ownerUsername: 'nhahang6',
            products: [
                {
                    id: 'prod_043',
                    name: 'Sinh tố bơ',
                    price: 45000,
                    image: './img/Sinh-to-bo.jpg',
                    description: 'Sinh tố bơ thơm ngon, béo ngậy',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_006'
                },
                {
                    id: 'prod_044',
                    name: 'Trà đào cam xả',
                    price: 30000,
                    image: './img/Tra-dao-cam-xa.jpg',
                    description: 'Trà đào cam xả thanh mát',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_006'
                },
                {
                    id: 'prod_045',
                    name: 'Trà sữa matcha',
                    price: 50000,
                    image: './img/Tra-sua-matcha.jpg',
                    description: 'Trà sữa matcha thơm ngon',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_006'
                },
                {
                    id: 'prod_046',
                    name: 'Trà sữa trân châu đường đen',
                    price: 35000,
                    image: './img/Tra-sua-tran-chau-duong-den.jpg',
                    description: 'Trà sữa trân châu đường đen đậm đà',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_006'
                },
                {
                    id: 'prod_047',
                    name: 'Nước ép cam',
                    price: 40000,
                    image: './img/Sinh-to-bo.jpg',
                    description: 'Nước ép cam tươi, ngọt mát',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_006'
                },
                {
                    id: 'prod_048',
                    name: 'Sinh tố dâu',
                    price: 45000,
                    image: './img/Tra-dao-cam-xa.jpg',
                    description: 'Sinh tố dâu tươi ngon',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_006'
                },
                {
                    id: 'prod_049',
                    name: 'Cà phê sữa đá',
                    price: 25000,
                    image: './img/Tra-sua-matcha.jpg',
                    description: 'Cà phê sữa đá đậm đà',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_006'
                },
                {
                    id: 'prod_050',
                    name: 'Nước chanh dây',
                    price: 30000,
                    image: './img/Tra-sua-tran-chau-duong-den.jpg',
                    description: 'Nước chanh dây chua ngọt, thanh mát',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_006'
                }
            ]
        },
        {
            id: 'rest_007',
            name: 'Nhà Hàng Đặc Sản Miền Bắc',
            description: 'Món ăn đặc sản miền Bắc đậm đà',
            image: './img/Nhahang7.jpg',
            address: '147 Đường PQR, Quận 7, TP.HCM',
            phone: '0904 567 890',
            rating: 4.7,
            deliveryTime: '30-45 phút',
            minOrder: 70000,
            ownerUsername: 'nhahang7',
            products: [
                {
                    id: 'prod_051',
                    name: 'Phở bò',
                    price: 60000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Phở bò truyền thống, nước dùng đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_007'
                },
                {
                    id: 'prod_052',
                    name: 'Bún chả',
                    price: 55000,
                    image: './img/Thit-kho-trung.jpg',
                    description: 'Bún chả Hà Nội thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_007'
                },
                {
                    id: 'prod_053',
                    name: 'Bánh mì pate',
                    price: 30000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Bánh mì pate giòn tan',
                    category: 'mon_man',
                    restaurantId: 'rest_007'
                },
                {
                    id: 'prod_054',
                    name: 'Chả cá Lã Vọng',
                    price: 80000,
                    image: './img/Suon-ram-man.jpg',
                    description: 'Chả cá Lã Vọng nổi tiếng',
                    category: 'mon_man',
                    restaurantId: 'rest_007'
                },
                {
                    id: 'prod_055',
                    name: 'Bún ốc',
                    price: 50000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Bún ốc chua cay, đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_007'
                },
                {
                    id: 'prod_056',
                    name: 'Bánh cuốn',
                    price: 40000,
                    image: './img/Thit-kho-trung.jpg',
                    description: 'Bánh cuốn mềm mại, thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_007'
                },
                {
                    id: 'prod_057',
                    name: 'Nem rán',
                    price: 45000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Nem rán giòn tan, đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_007'
                },
                {
                    id: 'prod_058',
                    name: 'Bún thang',
                    price: 55000,
                    image: './img/Suon-ram-man.jpg',
                    description: 'Bún thang thanh đạm, thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_007'
                }
            ]
        },
        {
            id: 'rest_008',
            name: 'Nhà Hàng Lẩu Buffet',
            description: 'Lẩu buffet đa dạng, thỏa sức lựa chọn',
            image: './img/Nhahang8.jpeg',
            address: '258 Đường STU, Quận 8, TP.HCM',
            phone: '0905 678 901',
            rating: 4.6,
            deliveryTime: '35-50 phút',
            minOrder: 200000,
            ownerUsername: 'nhahang8',
            products: [
                {
                    id: 'prod_059',
                    name: 'Lẩu thái chua cay',
                    price: 220000,
                    image: './img/Lau-thai.jpg',
                    description: 'Lẩu thái chua cay với hải sản tươi',
                    category: 'mon_lau',
                    restaurantId: 'rest_008'
                },
                {
                    id: 'prod_060',
                    name: 'Lẩu bò nhúng giấm',
                    price: 230000,
                    image: './img/Lau-bo-nam.jpg',
                    description: 'Lẩu bò nhúng giấm thơm ngon',
                    category: 'mon_lau',
                    restaurantId: 'rest_008'
                },
                {
                    id: 'prod_061',
                    name: 'Lẩu hải sản',
                    price: 300000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Lẩu hải sản đầy đủ tôm, cua, mực',
                    category: 'mon_lau',
                    restaurantId: 'rest_008'
                },
                {
                    id: 'prod_062',
                    name: 'Lẩu cá chua cay',
                    price: 280000,
                    image: './img/Lau-ca-chua-cay.jpg',
                    description: 'Lẩu cá chua cay đậm đà',
                    category: 'mon_lau',
                    restaurantId: 'rest_008'
                },
                {
                    id: 'prod_063',
                    name: 'Lẩu nấm',
                    price: 180000,
                    image: './img/Lau-thai.jpg',
                    description: 'Lẩu nấm thanh đạm, tốt cho sức khỏe',
                    category: 'mon_lau',
                    restaurantId: 'rest_008'
                },
                {
                    id: 'prod_064',
                    name: 'Lẩu gà',
                    price: 200000,
                    image: './img/Lau-bo-nam.jpg',
                    description: 'Lẩu gà thơm ngon, đậm đà',
                    category: 'mon_lau',
                    restaurantId: 'rest_008'
                },
                {
                    id: 'prod_065',
                    name: 'Lẩu tôm',
                    price: 250000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Lẩu tôm tươi ngon, ngọt đậm',
                    category: 'mon_lau',
                    restaurantId: 'rest_008'
                },
                {
                    id: 'prod_066',
                    name: 'Lẩu cua',
                    price: 320000,
                    image: './img/Lau-ca-chua-cay.jpg',
                    description: 'Lẩu cua đậm đà, thơm ngon',
                    category: 'mon_lau',
                    restaurantId: 'rest_008'
                }
            ]
        },
        {
            id: 'rest_009',
            name: 'Nhà Hàng Chay Thanh Tịnh',
            description: 'Món chay thuần khiết, tốt cho sức khỏe và tâm hồn',
            image: './img/Nhahang9.jpg',
            address: '159 Đường VWX, Quận 9, TP.HCM',
            phone: '0906 789 012',
            rating: 4.9,
            deliveryTime: '25-35 phút',
            minOrder: 45000,
            ownerUsername: 'nhahang9',
            products: [
                {
                    id: 'prod_067',
                    name: 'Đậu hũ sốt nấm',
                    price: 35000,
                    image: './img/Tau-hu-chien.png',
                    description: 'Đậu hũ mềm sốt nấm thơm ngon',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_068',
                    name: 'Chả chay chiên',
                    price: 40000,
                    image: './img/Nam-dong.png',
                    description: 'Chả chay chiên giòn, đậm đà',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_069',
                    name: 'Rau củ xào tỏi',
                    price: 30000,
                    image: './img/Nam-kim-cham-xao.png',
                    description: 'Rau củ tươi xào tỏi thơm lừng',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_070',
                    name: 'Canh khổ qua chay',
                    price: 32000,
                    image: './img/Tau-hu-non-sot-dong.png',
                    description: 'Canh khổ qua chay thanh mát',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_071',
                    name: 'Bún chay',
                    price: 40000,
                    image: './img/Nam-dong.png',
                    description: 'Bún chay đầy đủ rau củ',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_072',
                    name: 'Phở chay',
                    price: 45000,
                    image: './img/Tau-hu-chien.png',
                    description: 'Phở chay nước dùng thanh đạm',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_073',
                    name: 'Cơm chay thập cẩm',
                    price: 50000,
                    image: './img/Nam-kim-cham-xao.png',
                    description: 'Cơm chay với nhiều món phụ',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_074',
                    name: 'Gỏi cuốn chay',
                    price: 35000,
                    image: './img/Tau-hu-non-sot-dong.png',
                    description: 'Gỏi cuốn chay tươi ngon',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_075',
                    name: 'Nấm đùi gà chay',
                    price: 45000,
                    image: './img/Nam-dong.png',
                    description: 'Nấm đùi gà chay giòn ngon',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                },
                {
                    id: 'prod_076',
                    name: 'Lẩu chay',
                    price: 180000,
                    image: './img/Lau-thai.jpg',
                    description: 'Lẩu chay thanh đạm, đầy đủ',
                    category: 'mon_chay',
                    restaurantId: 'rest_009'
                }
            ]
        },
        {
            id: 'rest_010',
            name: 'Nhà Hàng Hải Sản Tươi Sống',
            description: 'Hải sản tươi sống, đa dạng các món',
            image: './img/Nhahang10.jpeg',
            address: '357 Đường YZA, Quận 10, TP.HCM',
            phone: '0907 890 123',
            rating: 4.8,
            deliveryTime: '30-45 phút',
            minOrder: 80000,
            ownerUsername: 'nhahang10',
            products: [
                {
                    id: 'prod_077',
                    name: 'Tôm hùm nướng',
                    price: 350000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Tôm hùm nướng thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_078',
                    name: 'Cua rang me',
                    price: 280000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Cua rang me chua ngọt',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_079',
                    name: 'Mực nướng',
                    price: 120000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Mực nướng giòn thơm',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_080',
                    name: 'Nghêu hấp sả',
                    price: 80000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Nghêu hấp sả thơm lừng',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_081',
                    name: 'Sò điệp nướng mỡ hành',
                    price: 150000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Sò điệp nướng mỡ hành béo ngậy',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_082',
                    name: 'Cá hồi nướng',
                    price: 200000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Cá hồi nướng thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_083',
                    name: 'Tôm sú rang muối',
                    price: 180000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Tôm sú rang muối giòn tan',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_084',
                    name: 'Lẩu hải sản đặc biệt',
                    price: 350000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Lẩu hải sản đầy đủ, tươi ngon',
                    category: 'mon_lau',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_085',
                    name: 'Cháo hải sản',
                    price: 90000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Cháo hải sản đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                },
                {
                    id: 'prod_086',
                    name: 'Gỏi hải sản',
                    price: 120000,
                    image: './img/Goi-xoai.jpg',
                    description: 'Gỏi hải sản tươi ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_010'
                }
            ]
        },
        {
            id: 'rest_011',
            name: 'Quán Cơm Văn Phòng',
            description: 'Cơm văn phòng nhanh gọn, đầy đủ dinh dưỡng',
            image: './img/Nhahang11.jpeg',
            address: '741 Đường BCD, Quận 11, TP.HCM',
            phone: '0908 901 234',
            rating: 4.3,
            deliveryTime: '15-25 phút',
            minOrder: 50000,
            ownerUsername: 'nhahang11',
            products: [
                {
                    id: 'prod_087',
                    name: 'Cơm sườn nướng',
                    price: 55000,
                    image: './img/Suon-ram-man.jpg',
                    description: 'Cơm sườn nướng thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                },
                {
                    id: 'prod_088',
                    name: 'Cơm gà nướng',
                    price: 50000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Cơm gà nướng đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                },
                {
                    id: 'prod_089',
                    name: 'Cơm thịt kho',
                    price: 50000,
                    image: './img/Thit-kho-trung.jpg',
                    description: 'Cơm thịt kho trứng',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                },
                {
                    id: 'prod_090',
                    name: 'Cơm cá kho',
                    price: 55000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Cơm cá kho tộ',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                },
                {
                    id: 'prod_091',
                    name: 'Cơm chả cá',
                    price: 60000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Cơm chả cá chiên',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                },
                {
                    id: 'prod_092',
                    name: 'Cơm thịt bò xào',
                    price: 65000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Cơm thịt bò xào mềm',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                },
                {
                    id: 'prod_093',
                    name: 'Cơm tôm rang',
                    price: 60000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Cơm tôm rang thơm',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                },
                {
                    id: 'prod_094',
                    name: 'Cơm trứng chiên',
                    price: 35000,
                    image: './img/Thit-kho-trung.jpg',
                    description: 'Cơm trứng chiên đơn giản',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                },
                {
                    id: 'prod_095',
                    name: 'Cơm thập cẩm',
                    price: 70000,
                    image: './img/Suon-ram-man.jpg',
                    description: 'Cơm thập cẩm đầy đủ',
                    category: 'mon_man',
                    restaurantId: 'rest_011'
                }
            ]
        },
        {
            id: 'rest_012',
            name: 'Quán Bánh Mì & Bánh Bao',
            description: 'Bánh mì, bánh bao nóng hổi, thơm ngon',
            image: './img/Khoai-tay-chien.jpg',
            address: '852 Đường EFG, Quận 12, TP.HCM',
            phone: '0909 012 345',
            rating: 4.5,
            deliveryTime: '10-20 phút',
            minOrder: 30000,
            ownerUsername: 'nhahang12',
            products: [
                {
                    id: 'prod_096',
                    name: 'Bánh mì thịt nướng',
                    price: 35000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Bánh mì thịt nướng thơm ngon',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_097',
                    name: 'Bánh mì chả cá',
                    price: 30000,
                    image: './img/Banh-trang-tron.jpg',
                    description: 'Bánh mì chả cá giòn',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_098',
                    name: 'Bánh mì xíu mại',
                    price: 32000,
                    image: './img/Ca-vien-chien.jpg',
                    description: 'Bánh mì xíu mại đậm đà',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_099',
                    name: 'Bánh bao nhân thịt',
                    price: 25000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Bánh bao nhân thịt nóng hổi',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_100',
                    name: 'Bánh bao chay',
                    price: 20000,
                    image: './img/Banh-trang-tron.jpg',
                    description: 'Bánh bao chay thanh đạm',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_101',
                    name: 'Bánh mì ốp la',
                    price: 30000,
                    image: './img/Ca-vien-chien.jpg',
                    description: 'Bánh mì ốp la béo ngậy',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_102',
                    name: 'Bánh mì bì',
                    price: 35000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Bánh mì bì giòn tan',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_103',
                    name: 'Bánh mì chảo',
                    price: 40000,
                    image: './img/Banh-trang-tron.jpg',
                    description: 'Bánh mì chảo đầy đủ',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_104',
                    name: 'Bánh bao kim sa',
                    price: 30000,
                    image: './img/Ca-vien-chien.jpg',
                    description: 'Bánh bao kim sa ngọt ngào',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                },
                {
                    id: 'prod_105',
                    name: 'Bánh mì sandwich',
                    price: 35000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Bánh mì sandwich đầy đủ',
                    category: 'an_vat',
                    restaurantId: 'rest_012'
                }
            ]
        },
        {
            id: 'rest_013',
            name: 'Quán Trà Sữa & Cà Phê',
            description: 'Trà sữa, cà phê đa dạng, hương vị tuyệt vời',
            image: './img/Tra-sua-matcha.jpg',
            address: '963 Đường HIJ, Quận Bình Thạnh, TP.HCM',
            phone: '0910 123 456',
            rating: 4.6,
            deliveryTime: '15-25 phút',
            minOrder: 40000,
            ownerUsername: 'nhahang13',
            products: [
                {
                    id: 'prod_106',
                    name: 'Trà sữa truyền thống',
                    price: 35000,
                    image: './img/Tra-sua-tran-chau-duong-den.jpg',
                    description: 'Trà sữa truyền thống đậm đà',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_107',
                    name: 'Trà sữa matcha',
                    price: 50000,
                    image: './img/Tra-sua-matcha.jpg',
                    description: 'Trà sữa matcha thơm ngon',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_108',
                    name: 'Trà sữa trân châu đường đen',
                    price: 40000,
                    image: './img/Tra-sua-tran-chau-duong-den.jpg',
                    description: 'Trà sữa trân châu đường đen',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_109',
                    name: 'Trà đào cam xả',
                    price: 35000,
                    image: './img/Tra-dao-cam-xa.jpg',
                    description: 'Trà đào cam xả thanh mát',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_110',
                    name: 'Cà phê đen',
                    price: 20000,
                    image: './img/Tra-sua-matcha.jpg',
                    description: 'Cà phê đen đậm đà',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_111',
                    name: 'Cà phê sữa',
                    price: 25000,
                    image: './img/Tra-sua-tran-chau-duong-den.jpg',
                    description: 'Cà phê sữa thơm ngon',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_112',
                    name: 'Cà phê bạc xỉu',
                    price: 30000,
                    image: './img/Tra-dao-cam-xa.jpg',
                    description: 'Cà phê bạc xỉu béo ngậy',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_113',
                    name: 'Trà chanh',
                    price: 25000,
                    image: './img/Tra-sua-matcha.jpg',
                    description: 'Trà chanh thanh mát',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_114',
                    name: 'Trà đá',
                    price: 15000,
                    image: './img/Tra-sua-tran-chau-duong-den.jpg',
                    description: 'Trà đá mát lạnh',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_115',
                    name: 'Nước chanh tươi',
                    price: 20000,
                    image: './img/Tra-dao-cam-xa.jpg',
                    description: 'Nước chanh tươi thanh mát',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_116',
                    name: 'Nước cam ép',
                    price: 40000,
                    image: './img/Sinh-to-bo.jpg',
                    description: 'Nước cam ép tươi ngon',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                },
                {
                    id: 'prod_117',
                    name: 'Sinh tố đa dạng',
                    price: 45000,
                    image: './img/Sinh-to-bo.jpg',
                    description: 'Sinh tố đa dạng hương vị',
                    category: 'nuoc_uong',
                    restaurantId: 'rest_013'
                }
            ]
        },
        {
            id: 'rest_014',
            name: 'Nhà Hàng BBQ & Nướng',
            description: 'BBQ và nướng đa dạng, thơm ngon',
            image: './img/Ga-chien-mam.jpg',
            address: '147 Đường KLM, Quận Tân Bình, TP.HCM',
            phone: '0911 234 567',
            rating: 4.7,
            deliveryTime: '30-45 phút',
            minOrder: 100000,
            ownerUsername: 'nhahang14',
            products: [
                {
                    id: 'prod_118',
                    name: 'Thịt nướng xiên',
                    price: 80000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Thịt nướng xiên thơm lừng',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_119',
                    name: 'Gà nướng mật ong',
                    price: 120000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Gà nướng mật ong ngọt ngào',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_120',
                    name: 'Sườn nướng BBQ',
                    price: 150000,
                    image: './img/Suon-ram-man.jpg',
                    description: 'Sườn nướng BBQ đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_121',
                    name: 'Bò nướng lá lốt',
                    price: 100000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Bò nướng lá lốt thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_122',
                    name: 'Tôm nướng muối ớt',
                    price: 180000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Tôm nướng muối ớt cay nồng',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_123',
                    name: 'Mực nướng sa tế',
                    price: 140000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Mực nướng sa tế đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_124',
                    name: 'Cá nướng giấy bạc',
                    price: 160000,
                    image: './img/Ca-kho-to.jpg',
                    description: 'Cá nướng giấy bạc thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_125',
                    name: 'Nấm nướng',
                    price: 60000,
                    image: './img/Nam-dong.png',
                    description: 'Nấm nướng thơm lừng',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_126',
                    name: 'Rau củ nướng',
                    price: 50000,
                    image: './img/Nam-kim-cham-xao.png',
                    description: 'Rau củ nướng thanh đạm',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                },
                {
                    id: 'prod_127',
                    name: 'Combo BBQ',
                    price: 250000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Combo BBQ đầy đủ',
                    category: 'mon_man',
                    restaurantId: 'rest_014'
                }
            ]
        },
        {
            id: 'rest_015',
            name: 'Nhà Hàng Món Nhật',
            description: 'Món ăn Nhật Bản chính thống, tươi ngon',
            image: './img/Lau-thai.jpg',
            address: '258 Đường NOP, Quận Phú Nhuận, TP.HCM',
            phone: '0912 345 678',
            rating: 4.8,
            deliveryTime: '25-40 phút',
            minOrder: 90000,
            ownerUsername: 'nhahang15',
            products: [
                {
                    id: 'prod_128',
                    name: 'Sushi tổng hợp',
                    price: 200000,
                    image: './img/Lau-thai.jpg',
                    description: 'Sushi tổng hợp đa dạng',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_129',
                    name: 'Sashimi cá hồi',
                    price: 180000,
                    image: './img/Lau-hs-tc.jpg',
                    description: 'Sashimi cá hồi tươi ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_130',
                    name: 'Ramen',
                    price: 120000,
                    image: './img/Lau-thai.jpg',
                    description: 'Ramen nước dùng đậm đà',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_131',
                    name: 'Udon',
                    price: 100000,
                    image: './img/Lau-bo-nam.jpg',
                    description: 'Udon mềm mại, thơm ngon',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_132',
                    name: 'Tempura',
                    price: 150000,
                    image: './img/Khoai-tay-chien.jpg',
                    description: 'Tempura giòn tan',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_133',
                    name: 'Yakitori',
                    price: 80000,
                    image: './img/Ga-chien-mam.jpg',
                    description: 'Yakitori thơm lừng',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_134',
                    name: 'Teriyaki',
                    price: 140000,
                    image: './img/Thit-kho-trung.jpg',
                    description: 'Teriyaki ngọt ngào',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_135',
                    name: 'Miso soup',
                    price: 50000,
                    image: './img/Lau-thai.jpg',
                    description: 'Miso soup thanh đạm',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_136',
                    name: 'Gyoza',
                    price: 90000,
                    image: './img/Banh-trang-tron.jpg',
                    description: 'Gyoza giòn tan',
                    category: 'mon_man',
                    restaurantId: 'rest_015'
                },
                {
                    id: 'prod_137',
                    name: 'Takoyaki',
                    price: 70000,
                    image: './img/Ca-vien-chien.jpg',
                    description: 'Takoyaki béo ngậy',
                    category: 'an_vat',
                    restaurantId: 'rest_015'
                }
            ]
        }
    ];
    
    // Lưu vào localStorage
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    
    // Đếm tổng số sản phẩm
    const totalProducts = restaurants.reduce((sum, r) => sum + (r.products ? r.products.length : 0), 0);
    console.log(`✓ Đã tạo ${restaurants.length} nhà hàng mẫu với ${totalProducts} sản phẩm`);
}

// Hàm khởi tạo tài khoản cho 15 nhà hàng mẫu
function initializeSampleRestaurantAccounts() {
    try {
        const usersData = localStorage.getItem("users");
        let users = [];
        
        if (usersData) {
            users = JSON.parse(usersData);
        }
        
        // Đếm số tài khoản nhà hàng hiện có
        const restaurantUsernames = ["nhahang1", "nhahang2", "nhahang3", "nhahang4", "nhahang5", 
                                     "nhahang6", "nhahang7", "nhahang8", "nhahang9", "nhahang10",
                                     "nhahang11", "nhahang12", "nhahang13", "nhahang14", "nhahang15"];
        const existingCount = users.filter(user => restaurantUsernames.includes(user.username)).length;
        
        if (existingCount >= 15) {
            console.log(`✓ Đã có ${existingCount} tài khoản nhà hàng mẫu`);
            return; // Đã có đủ tài khoản
        } else if (existingCount > 0) {
            console.log(`⚠ Phát hiện ${existingCount} tài khoản nhà hàng cũ, đang bổ sung thêm...`);
            // Xóa các tài khoản nhà hàng cũ để tạo lại
            users = users.filter(user => !restaurantUsernames.includes(user.username));
        }
        
        // Lấy danh sách nhà hàng mẫu
        const restaurantsData = localStorage.getItem('restaurants');
        if (!restaurantsData) {
            console.log("⚠ Chưa có nhà hàng mẫu, sẽ tạo sau");
            return;
        }
        
        const restaurants = JSON.parse(restaurantsData);
        
        // Tạo tài khoản cho 15 nhà hàng mẫu
        const sampleAccounts = [
            {
                fullname: "Nhà Hàng Chay Tâm An",
                username: "nhahang1",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_001",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Nhà Hàng Gia Đình",
                username: "nhahang2",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_002",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Lẩu & Nướng Hải Sản",
                username: "nhahang3",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_003",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Quán Ăn Vặt Hương Vị",
                username: "nhahang4",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_004",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Trái Cây Tươi Sạch",
                username: "nhahang5",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_005",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Quán Nước Giải Khát",
                username: "nhahang6",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_006",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Nhà Hàng Đặc Sản Miền Bắc",
                username: "nhahang7",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_007",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Nhà Hàng Lẩu Buffet",
                username: "nhahang8",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_008",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Nhà Hàng Chay Thanh Tịnh",
                username: "nhahang9",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_009",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Nhà Hàng Hải Sản Tươi Sống",
                username: "nhahang10",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_010",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Quán Cơm Văn Phòng",
                username: "nhahang11",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_011",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Quán Bánh Mì & Bánh Bao",
                username: "nhahang12",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_012",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Quán Trà Sữa & Cà Phê",
                username: "nhahang13",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_013",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Nhà Hàng BBQ & Nướng",
                username: "nhahang14",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_014",
                createdAt: new Date().toISOString()
            },
            {
                fullname: "Nhà Hàng Món Nhật",
                username: "nhahang15",
                password: "123456",
                role: "nhanvien",
                restaurantId: "rest_015",
                createdAt: new Date().toISOString()
            }
        ];
        
        // Thêm các tài khoản vào danh sách
        // (restaurants đã được lấy ở trên, không cần lấy lại)
        sampleAccounts.forEach(account => {
            // Kiểm tra xem nhà hàng có tồn tại không
            const restaurant = restaurants.find(r => r.id === account.restaurantId);
            if (restaurant) {
                // Liên kết ownerUsername với tài khoản
                restaurant.ownerUsername = account.username;
                // Chỉ thêm nếu chưa có tài khoản này
                const userExists = users.some(u => u.username === account.username);
                if (!userExists) {
                    users.push(account);
                }
            }
        });
        
        // Lưu lại
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("restaurants", JSON.stringify(restaurants));
        
        console.log("✓ Đã tạo/cập nhật tài khoản cho 15 nhà hàng mẫu:");
        console.log("  - nhahang1 / 123456 (Nhà Hàng Chay Tâm An)");
        console.log("  - nhahang2 / 123456 (Nhà Hàng Gia Đình)");
        console.log("  - nhahang3 / 123456 (Lẩu & Nướng Hải Sản)");
        console.log("  - nhahang4 / 123456 (Quán Ăn Vặt Hương Vị)");
        console.log("  - nhahang5 / 123456 (Trái Cây Tươi Sạch)");
        console.log("  - nhahang6 / 123456 (Quán Nước Giải Khát)");
        console.log("  - nhahang7 / 123456 (Nhà Hàng Đặc Sản Miền Bắc)");
        console.log("  - nhahang8 / 123456 (Nhà Hàng Lẩu Buffet)");
        console.log("  - nhahang9 / 123456 (Nhà Hàng Chay Thanh Tịnh)");
        console.log("  - nhahang10 / 123456 (Nhà Hàng Hải Sản Tươi Sống)");
        console.log("  - nhahang11 / 123456 (Quán Cơm Văn Phòng)");
        console.log("  - nhahang12 / 123456 (Quán Bánh Mì & Bánh Bao)");
        console.log("  - nhahang13 / 123456 (Quán Trà Sữa & Cà Phê)");
        console.log("  - nhahang14 / 123456 (Nhà Hàng BBQ & Nướng)");
        console.log("  - nhahang15 / 123456 (Nhà Hàng Món Nhật)");
    } catch (error) {
        console.error("Lỗi khi khởi tạo tài khoản nhà hàng mẫu:", error);
    }
}

// Hàm khởi tạo đơn hàng mẫu (tùy chọn)
function initializeSampleOrders() {
    // Kiểm tra xem đã có đơn hàng chưa
    const existingOrders = localStorage.getItem('restaurant_orders');
    if (existingOrders) {
        const orders = JSON.parse(existingOrders);
        if (orders.length > 0) {
            console.log("✓ Đã có dữ liệu đơn hàng");
            return;
        }
    }
    
    // Tạo một số đơn hàng mẫu
    const sampleOrders = [
        {
            id: 'ORD' + Date.now(),
            customerName: 'Nguyễn Văn A',
            customerPhone: '0123456789',
            customerAddress: '123 Đường ABC, Quận 1, TP.HCM',
            items: [
                { name: 'Nấm sốt đông', quantity: 2, price: 20000 },
                { name: 'Tàu hũ chiên giòn', quantity: 1, price: 30000 }
            ],
            total: 70000,
            paymentMethod: 'cod',
            note: 'Giao hàng trước 12h trưa',
            status: 'pending',
            restaurantStatus: 'new',
            shipperId: null,
            createdAt: new Date().toISOString(),
            confirmedAt: null,
            preparingAt: null,
            readyAt: null,
            assignedAt: null
        }
    ];
    
    localStorage.setItem('restaurant_orders', JSON.stringify(sampleOrders));
    console.log("✓ Đã tạo đơn hàng mẫu");
}

// Tự động khởi tạo khi load
if (typeof window !== 'undefined') {
    // Chờ một chút để đảm bảo các file khác đã load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeAllSampleData, 100);
        });
    } else {
        setTimeout(initializeAllSampleData, 100);
    }
}

