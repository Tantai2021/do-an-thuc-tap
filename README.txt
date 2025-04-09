* Quy ước đặt tên biến theo Camelcase
* Quy ước đặt tên file viết hoa chữ cái đầu
* Trả về mã 404 khi không tìm thấy
* Trả về mã 400 khi có lỗi thực thi
* Trả về mã 200 khi thực thi thành công
* Trả về mã 500 khi lỗi server
* Chức năng phân trang cho những api trả về danh sách
* CRUD: get, add, update, delete
---- Công việc hoàn thành -----
- API Ingredients: 
    + GET /api/ingredients/
        -> Lấy tất cả nguyên liệu (chưa bị xóa mềm)
    + GET /api/ingredients/deleted
        -> Lấy tất cả nguyên liệu (đã bị xóa mềm)
    + GET /api/ingredients/search
        -> Tìm kiếm theo id,
        -> Tìm kiếm gần đúng theo name
        -> Tìm kiếm theo unit
    + GET /api/ingredients/:id
        -> Tìm nguyên liệu theo id
    + POST /api/ingredients/
        -> Thêm nguyên liệu mới (có kiểm tra trùng tên)
    + PUT /api/ingredients/:id
        -> Cập nhật nguyên liệu (có kiểm tra trùng tên với các nguyên liệu khác)
    + DELETE /api/ingredients/:id
        -> Xóa mềm một nguyên liệu (có kiểm tra nguyên liệu đang được sử dụng)
    + DELETE /api/ingredients/bulk-delete
        -> Xóa mềm nhiều nguyên liệu (có kiểm tra những nguyên liệu đang được sử dụng)
    + PATCH /api/ingredients/restore/:id
        -> Khôi phục nguyên liệu
    + PATCH /api/ingredients/restore/bulk-restore
        -> Khôi phục nhiều nguyên liệu nguyên liệu
- API Foods:
    + GET /api/foods/
        -> Lấy tất cả món ăn (chưa bị xóa mềm)
    + GET /api/foods/deleted
        -> Lấy tất cả món ăn (đã bị xóa mềm)
    + GET /api/foods/:id
        -> Tìm món ăn theo id
    + GET /api/foods/search
        -> Tìm kiếm theo id
        -> Tìm kiếm gần đúng theo tên
        -> Tìm kiếm theo < min, > max, >min và <max
    + POST /api/foods/
        -> Thêm một món ăn mới (có kiểm tra trùng tên)
    + DELETE /api/foods/:id
        -> Xóa mềm một món ăn (có kiểm tra món đang được sử dụng trong OrderDetail)
    + DELETE /api/foods/bulk-delete
        -> Xóa mềm nhiều món ăn (có kiểm tra các món đang sử dụng không thể xóa)
    + PUT /api/foods/:id 
        -> Cập nhật một món ăn (có kiểm tra trùng tên)
    + PATCH /api/foods/restore/:id
        -> Khôi phục món ăn đã bị xóa mềm
- API Auth
    + POST /api/auth/login
        -> Tìm kiếm user theo email để đăng nhập
    + POST /api/auth/register
        -> Tạo một user mới (có kiểm tra trùng email và mã hóa mật khẩu bằng bcrypt)
    + PUT /api/auth
        -> Cập nhật thông tin user (có kiểm tra trùng email và mã hóa mật khẩu bằng bcrypt);

****** FRONTEND ****
- Auth
    + Đăng nhập người dùng (hiển thị toast)
- Ingredients
    + Hiển thị danh sách nguyên liệu
    + Xóa nguyên liệu có ràng buộc (không được sử dụng trong món)