* Quy ước đặt tên biến theo Camelcase
* Quy ước đặt tên file viết hoa chữ cái đầu
* Chức năng phân trang cho những api trả về danh sách

------ Danh sách endpoint -------
0. Xác thực 
    - /api/auth
1. Nguyên liệu 
    - /api/ingredients
2. Món ăn
    - /api/foods
3. Bộ thành phẩm (công thức món)
    - /api/recipes
4. Chổ ngổi
    - /api/tables
5. Danh mục món
    - /api/categories
6. Khách hàng
    - /api/customer
7. Khu vực chổ ngồi
    - /api/areas
8. Nhân viên
    - /api/staffs
9. Đơn hàng
    - /api/orders
10. Chi tiết đơn hàng
    - /api/order-details
11. Upload file hình ảnh
    - /api/uploads

---- Công việc hoàn thành -----
- API Ingredients: 
    + GET /api/ingredients?page=?&limit=?
        -> Lấy tất cả nguyên liệu (chưa bị xóa mềm), có thực hiện phân trang
        - Response: {
                totalItems: totalIngredients, // Tổng số nguyên liệu
                totalPages: Math.ceil(totalIngredients / limit), // Tổng số trang
                currentPage: page, // Trang hiện tại
                data: ingredients // danh sách lấy được
            }
    + GET /api/ingredients/deleted?page=?&limit=?
        -> Lấy tất cả nguyên liệu (đã bị xóa mềm), có thực hiện phân trang
        - Response: {
                totalItems: totalIngredients, // Tổng số nguyên liệu
                totalPages: Math.ceil(totalIngredients / limit), // Tổng số trang
                currentPage: page, // Trang hiện tại
                data: ingredients // danh sách lấy được
            }
    + GET /api/ingredients/search
        - Query: 
            + Mã nguyên liệu: ?id=?
            + Tên nguyên liệu: ?name=?
            + Đơn vị tính: ?unit=?
        - Response: {
                data: rows, // Danh sách nguyên liệu tìm được
                currentPage: parseInt(page), // Trang hiện tại
                totalPages: Math.ceil(count / limit), // Tổng số trang
                totalItems: count, // Tổng số nguyên liệu
            }
    + GET /api/ingredients/:id
        - Response: {
            id:
            name:
            unit:
            quantity:
            is_deleted: false
        }
    + POST /api/ingredients/
        -> Thêm nguyên liệu mới (có kiểm tra trùng tên)
        - Request: {name, unit}
        - Response: { 
            message: "Đã thêm nguyên liệu mới",
            newIngredient: newIngredient 
        }
    + PUT /api/ingredients/:id
        -> Cập nhật nguyên liệu (có kiểm tra trùng tên với các nguyên liệu khác)
        - Request: {name, unit}
        - Response: { 
            message: "Đã thêm nguyên liệu mới",
            newIngredient: newIngredient 
        }
    + DELETE /api/ingredients/:id
        -> Xóa mềm một nguyên liệu (có kiểm tra nguyên liệu đang được sử dụng)
        - Response: { message: "Đã xóa nguyên liệu này" }
    + DELETE /api/ingredients/bulk-delete
        -> Xóa mềm nhiều nguyên liệu (có kiểm tra những nguyên liệu đang được sử dụng)
        - Request: { ingredientIds } // Danh sách mã nguyên liệu 
        - Response: {
            message: `Đã xóa {2} nguyên liệu`,
            deletedIngredientIds: unUsedIngredientIds, // Danh sách mã nguyên liệu đã xóa thành công
            usedIngredientIds // Danh sách mã nguyên liệu đang được sử dụng
        }
    + PATCH /api/ingredients/restore/:id
        -> Khôi phục nguyên liệu
        - Response: { message: "Đã khôi phục nguyên liệu" }
    + PATCH /api/ingredients/restore/bulk-restore
        -> Khôi phục nhiều nguyên liệu nguyên liệu
        - Request: { ingredientIds } 
        - Response: { message: `Đã khôi phục ${4} nguyên liệu` }

- API Foods:
    + GET /api/foods?page=?$limit=?
        -> Lấy tất cả món ăn (chưa bị xóa mềm), có thực hiện phân trang
        - Response: {
                data: foods, // Danh sách món ăn 
                currentPage: page, // Trang hiện tại
                totalPages: Math.ceil(count / limit), // Tổng số trang
                totalItems: count, // Tổng số món
            }
    + GET /api/foods/deleted
        -> Lấy tất cả món ăn (đã bị xóa mềm), có thực hiện phân trang
         - Response: {
                data: foods, // Danh sách món ăn 
                currentPage: page, // Trang hiện tại
                totalPages: Math.ceil(count / limit), // Tổng số trang
                totalItems: count, // Tổng số món
            }
    + GET /api/foods/:id
        - Response: { message: "Đã tìm thấy.", data: existFood }

    + GET /api/foods/search?page=?&limit=
        -> Lọc những món chưa bị xóa mềm
        - Query: 
            + Mã món: ?foodId=?
            + Tên món: ?name=?
            + Danh mục: ?category_id=?
            + Giá thấp nhất: ?minPrice=?
            + Giá cao nhất: ?maxPrice=?
        - Response: {
                data: rows, // Danh sách món ăn
                currentPage: parseInt(page), // Trang hiện tại
                totalPages: Math.ceil(count / limit), // Tổng số trang
                totalItems: count // Tổng số món
            }
    + POST /api/foods/
        -> Thêm một món ăn mới (có kiểm tra trùng tên)
        - Request: { name, category_id, image, price, description } 
        - Response: { message: "Thêm món ăn mới thành công" }
    + DELETE /api/foods/:id
        -> Xóa mềm một món ăn (có kiểm tra món đang được sử dụng trong OrderDetail)
        - Response: { message: "Đã ẩn một món ăn" }
    + DELETE /api/foods/bulk-delete
        -> Xóa mềm nhiều món ăn (có kiểm tra các món đang sử dụng không thể xóa)
        - Request: { foodIds } 
        - Response: {
                    message: `Đã ẩn ${3} món ăn`,
                    usedFoodIds, // Danh sách mã món đang sử dụng
                    unUsedFoodIds // Danh sách mã món không sử dụng
                }
    + PUT /api/foods/:id 
        -> Cập nhật một món ăn (có kiểm tra trùng tên)
        - Request: { name, category_id, price, description, image }
        - Response: { message: "Cập nhật món ăn thành công!" }
    + PATCH /api/foods/restore/:id
        -> Khôi phục món ăn đã bị xóa mềm
        - Response: { message: "Khôi phục món ăn thành công" }
    + PATCH /api/foods/restore/bulk-restore
        -> Khôi phục nhiều món ăn bị xóa mềm
        - Request: { foodIds }
        - Response: {message: `Đã mở khóa ${updatedFoods[0]} món ăn`,}
    
- API Recipes:
    + GET /api/recipes/:foodId
        -> Tìm kiếm danh sách nguyên liệu của 1 món ăn cụ thể
        - Response: { data: recipes } // Danh sách những nguyên liệu đang được sử dụng trong món đó
    + POST /api/recipes/
        -> Thêm cùng lúc nhiều nguyên liệu vào 1 món ăn
        - Request: { formRecipes: [{ ingredient_id, quantity, food_id }] }
        - Response: { message: "Thêm công thức thành công" }
        
- API Orders:
    + GET /api/orders/status
        -> Lấy danh sách đơn hàng theo trạng thái (pending, completed, cancelled)
        - Query: ?status=
        - Response: { data: orders } // Danh sách đơn hàng
    + GET /api/orders/table
        -> Lấy danh sách đơn hàng theo bàn và trạng thái đơn hàng
    + GET /api/orders/search
        -> Tìm kiếm đơn hàng theo các tiêu chí
        - Query: {
                order_id,
                staff_id,
                table_name,
                customer_name,
                start_date,
                end_date,
                status
            }
        - Response: { data: orders }
    + GET /api/orders/:orderId
        -> Tìm kiếm đơn hàng theo mã đơn hàng 
        - Response: { data: order }
    + POST /api/orders/
        -> Tạo đơn hàng mới với trạng thái chờ (pending)
        - Request: { table_id, number_of_guests, customer_phone, customer_name, staff_id }
        - Response: { message: "Tạo đơn hàng thành công", data: createdOrder }
    + DELETE /api/orders/:orderId
        -> Hủy 1 đơn hàng theo mã đơn
        - Response: { message: "Hủy đơn hàng thành công!" }
- API Staff:
    + GET /api/staffs/search:
        -> Tìm kiếm nhân viên theo mã và tên
        - Query: ?search=value
        - Response: {staff} // Thông tin nhân viên

- API Auth
    + POST /api/auth/login
        - Request: { username, password }
        - Response: {
                message: "Đăng nhập thành công",
                user: payload,
                token: userToken
            }


****** FRONTEND ****
1. Những hoàn thành
- Gửi header token bảo mật dữ liệu phía backend
- Đăng nhập và phân quyền (hiển thị thông báo), 
- Quản lý nguyên liệu:
    + Hiển thị danh sách nguyên liệu chưa bị xóa mềm và đã bị xóa mềm
    + Thêm 1 nguyên liệu mới, thông báo khi thêm thành công
    + Cập nhật thông tin 1 nguyên liệu, thông báo khi cập nhật thành công
    + Xóa 1 nguyên liệu và xóa cùng lúc nhiều nguyên liệu, có hiển thị xác nhận trước khi xóa, thông báo khi xóa thành công
    + Lọc nguyên liệu theo các tiêu chí mã, tên nguyên liệu 
    + Khôi phục 1 nguyên liệu và cùng lúc nhiều nguyên liệu, thông báo khi khôi phục thành công
- Quản lý món ăn:
    + Hiển thị danh sách món ăn chưa bị xóa mềm và đã bị xóa mềm
    + Thêm 1 nguyên liệu mới, có xử lý hình ảnh, có validate dữ liệu, thông báo khi thêm thành công
    + Cập nhật thông tin 1 nguyên liệu, có validate dữ liệu, thông báo khi cập nhật thành công
    + Xóa mềm 1 nguyên liệu và cùng lúc nhiều nguyên liệu, có xác nhận trước khi xóa, thông báo khi xóa thành công
    + Lọc món ăn theo các tiêu chí mã, tên, giá cả, danh mục những món chưa bị xóa mềm và đã bị xóa mềm
    + Xem bộ thành phẩm (công thức món) của 1 món ăn
    + Khôi phục 1 nguyên liệu và cùng lúc nhiều nguyên liệu đã bị xóa mềm, thông báo khi khôi phục thành công
    + Sắp xếp món ăn theo giá tăng dần và giảm dần
- Quản lý bộ thành phẩm (công thức món ăn):
    + Hiển thị danh sách món ăn đang được sử dụng
    + Hiển thị danh sách nguyên liệu được sử dụng của 1 món ăn cụ thể
    + Thêm cùng lúc nhiều nguyên liệu vào bộ thành phẩm, có validate dữ liệu, chỉ sử dụng những nguyên liệu chưa bị xóa mềm
- Quản lý don hang
    + Lọc don hàng theo mã don, bàn, khách hàng, nhân viên mở bàn, ngày tạo don hàng
2. Những chức năng cập nhật sau
- Quản lý bộ thành phẩm:
    + Cập nhật công thức
- 