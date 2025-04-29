const models = require('../models/index');
const { Op } = require("sequelize");
const Table = {
    // Lấy danh sách tất cả bàn ăn
    getTables: async (req, res) => {
        try {
            const tables = await models.Table.findAll({
                include: [
                    { model: models.Area } // Khu vực
                ]
            });
            return res.status(200).json(tables);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách bàn ăn" });
        }
    },
    getTablesByArea: async (req, res) => {
        try {
            const { areaId } = req.params;
            if (!areaId) return res.status(400).json({ message: "Mã khu vực không hợp lệ" });
            const tables = await models.Table.findAll({
                where: { area_id: areaId }
            });
            return res.status(200).json(tables);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách bàn ăn theo khu vực" });
        }
    },
    // Lấy thông tin chi tiết một bàn ăn
    getTableById: async (req, res) => {
        try {
            const { tableId } = req.params;
            const table = await models.Table.findByPk(tableId);

            if (!table) return res.status(404).json({ message: "Không tìm thấy bàn ăn" });

            return res.status(200).json(table);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy thông tin bàn ăn" });
        }
    },

    // Thêm bàn ăn mới
    createTable: async (req, res) => {
        try {
            const { name, capacity, area_id } = req.body;

            if (!name || !capacity || !area_id) {
                return res.status(400).json({ message: "Thiếu thông tin bàn ăn" });
            }

            // Kiểm tra khu vực tồn tại 
            const areaCount = await models.Area.count({ where: { id: area_id } });
            if (areaCount === 0) return res.status(400).json({ message: "Không tìm thấy khu vực" });

            // Kiểm tra trùng tên trong khu vực
            const existTableName = await models.Table.findOne({
                where: { area_id, name }
            })
            if (existTableName) return res.status(400).json({ message: "Tên bàn đã tồn tại trong khu vực" });

            // Kiểm tra sức chứa hợp lệ > 0
            if (!Number.isInteger(capacity) || capacity <= 0) {
                return res.status(400).json({ message: "Sức chứa phải là số nguyên dương" });
            }

            const newTable = await models.Table.create({
                name,
                capacity,
                area_id,
                status: "Available" // Mặc định trạng thái là "Trống"
            });

            return res.status(201).json({ message: "Thêm bàn ăn thành công", table: newTable });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi thêm bàn ăn mới" });
        }
    },

    // Cập nhật thông tin bàn ăn
    updateTable: async (req, res) => {
        try {
            const { tableId } = req.params;
            const { name, capacity, area_id, status } = req.body;

            // Kiểm tra sức chứa hợp lệ > 0
            if (!Number.isInteger(capacity) || capacity <= 0) {
                return res.status(400).json({ message: "Sức chứa phải là số nguyên dương" });
            }

            // Kiểm tra bàn tồn tại
            const table = await models.Table.findByPk(tableId);
            if (!table) return res.status(404).json({ message: "Không tìm thấy bàn ăn" });

            // Kiểm tra khu vực tồn tại 
            const areaCount = await models.Area.count({ where: { id: area_id } });
            if (areaCount === 0) return res.status(400).json({ message: "Không tìm thấy khu vực" });

            // Kiểm tra trùng tên trong khu vực
            const existTableName = await models.Table.findOne({
                where: { area_id, name, id: { [Op.ne]: tableId } }
            })
            if (existTableName) return res.status(400).json({ message: "Tên bàn đã tồn tại trong khu vực" });

            await table.update({ name, capacity, area_id, status });

            return res.status(200).json({ message: "Cập nhật bàn ăn thành công", table });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi cập nhật bàn ăn" });
        }
    },

    // Xóa bàn ăn
    deleteTable: async (req, res) => {
        try {
            const { tableId } = req.params;

            const table = await models.Table.findOne({ where: { id: tableId } });
            if (!table) return res.status(404).json({ message: "Không tìm thấy bàn ăn" });

            // 1. Kiểm tra trạng thái bàn
            if (table.status !== "Available") {
                return res.status(400).json({ message: "Không thể xóa bàn đang sử dụng hoặc đã đặt trước" });
            }

            // 2. Kiểm tra đơn hàng chưa thanh toán
            const hasUnpaidOrders = await models.Order.count({ where: { table_id: tableId, status: { [Op.not]: ["Completed", "Cancelled"] } } });
            if (hasUnpaidOrders > 0) {
                return res.status(400).json({ message: "Không thể xóa bàn có đơn hàng chưa thanh toán" });
            }

            // 4. Xóa mềm (Ẩn bàn thay vì xóa khỏi DB)
            await models.Table.update({ is_deleted: true }, { where: { id: tableId } });

            return res.status(200).json({ message: "Xóa bàn ăn thành công" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi xóa bàn ăn" });
        }
    },
    restoreTable: async (req, res) => {
        try {
            const { tableId } = req.params;

            const table = await models.Table.findOne({ where: { id: tableId } });
            if (!table) return res.status(404).json({ message: "Không tìm thấy bàn ăn" });

            // Kiểm tra nếu bàn chưa bị xóa mềm thì không cần khôi phục
            if (!table.is_deleted) {
                return res.status(400).json({ message: "Bàn này chưa bị vô hiệu hóa, không cần khôi phục" });
            }

            // Khôi phục bàn ăn
            await table.update({ is_deleted: false });

            return res.status(200).json({ message: "Khôi phục bàn ăn thành công", table });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi khôi phục bàn ăn" });
        }
    },
    // Cập nhật trạng thái bàn (VD: Đang sử dụng, Trống, Đã đặt trước)
    updateTableStatus: async (req, res) => {
        try {
            const { tableId } = req.params;
            const { status } = req.body;

            const validStatuses = ["available", "occupied"];

            // 1. Kiểm tra trạng thái hợp lệ
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: "Trạng thái bàn không hợp lệ" });
            }

            const table = await models.Table.findByPk(tableId);
            if (!table) return res.status(404).json({ message: "Không tìm thấy bàn ăn" });


            // 2. Kiểm tra bàn đã bị xóa mềm chưa
            if (table.is_deleted) {
                return res.status(400).json({ message: "Bàn đã bị vô hiệu hóa, không thể cập nhật trạng thái" });
            }
            // 5. Kiểm tra chuyển trạng thái "occupied" -> "available"
            if (table.status === "occupied" && status === "available") {
                const hasUnpaidOrders = await models.Order.count({
                    where: { table_id: tableId, status: { [Op.not]: ["completed", "cancelled"] } }
                });
                if (hasUnpaidOrders > 0) {
                    return res.status(400).json({ message: "Bàn có hóa đơn chưa thanh toán, không thể chuyển sang trạng thái Trống" });
                }
            }

            await table.update({ status });

            res.status(200).json({ message: "Cập nhật trạng thái bàn thành công", table });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi cập nhật trạng thái bàn" });
        }
    }
};

module.exports = Table;
