const models = require('../models/index');
const { Op } = require('sequelize');
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment
const PaymentTransaction = {
    createTransaction: async (req, res) => {
        try {
            const { order_id, method, amount_paid, change_amount, transaction_code } = req.body;
            if (!order_id || !method || !amount_paid) {
                return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
            }
            const order = await models.Order.findByPk(order_id);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            }

            const { discount_amount } = await models.OrderPromotion.findOne({
                where: { order_id: order.id }
            })

            if (amount_paid < (Number(order.total_price) - Number(discount_amount))) {
                return res.status(400).json({ message: "Số tiền thanh toán không đủ" });
            }
            const transactionCreated = await models.PaymentTransaction.create({
                order_id,
                method,
                amount_paid,
                change_amount,
                transaction_code,
            }, { returning: true });

            if (transactionCreated) {
                await models.Order.update(
                    { status: "completed" },
                    { where: { id: order_id } }
                );
                await models.Table.update(
                    { status: "available" },
                    { where: { id: order.table_id } }
                );
                await models.OrderDetail.update(
                    { status: "cancelled" },
                    { where: { order_id: order_id, status: { [Op.not]: 'served' } } }
                );
            }

            return res.status(201).json({ message: "Đơn hàng đã được thanh toán thành công", data: transactionCreated });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    },
    zalopayTransaction: async (req, res) => {
        const { orderPayment } = req.body;
        if (!orderPayment) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }
        const orderPromotion = await models.OrderPromotion.findOne({ where: { order_id: orderPayment?.id } })

        const config = {
            app_id: "2553",
            key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
            key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
            endpoint: "https://sb-openapi.zalopay.vn/v2/create"
        };

        const embed_data = { order_id: orderPayment?.id ?? "order123" }; // thông tin bổ sung cho đơn hàng (tùy chọn)

        const items = [{}];
        const transID = Math.floor(Math.random() * 1000000);
        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
            app_user: orderPayment?.customer?.id ?? "user123", // user_id của người thanh toán (người dùng ZaloPay)
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: (Number(orderPayment?.total_price ?? 0) - Number(orderPromotion?.discount_amount)), // ZaloPay yêu cầu số tiền phải là số nguyên (đơn vị là đồng)
            description: `Bạn có đơn hàng cần thanh toán #${transID}`,
            bank_code: "",
            callback_url: `${process.env.VIRTUAL_HOST}/api/payment-transactions/zalopay/callback`,
        };

        // appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        try {
            const result = await axios.post(config.endpoint, null, { params: order });
            // console.log(result);
            return res.status(200).json(result.data);
        } catch (error) {
            res.status(200).json({
                message: "some thing went wrong",
            });
            console.log(error.message);
        }
    },
    zalopayTransactionCallback: async (req, res) => {
        const config = {
            key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz"
        };

        let result = {};

        try {
            let dataStr = req.body.data;
            let reqMac = req.body.mac;

            let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

            // kiểm tra callback hợp lệ (đến từ ZaloPay server)
            if (reqMac !== mac) {
                // callback không hợp lệ
                result.return_code = -1;
                result.return_message = "mac not equal";
            }
            else {
                // thanh toán thành công
                // merchant cập nhật trạng thái cho đơn hàng
                let dataJson = JSON.parse(dataStr, config.key2);
                if (dataJson) {
                    const embedData = JSON.parse(dataJson.embed_data ?? '{}');
                    const order = await models.Order.findOne({ where: { id: embedData.order_id } });
                    if (!order) {
                        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
                    }
                    const transactionCreated = await models.PaymentTransaction.create({
                        order_id: embedData.order_id,
                        method: "zalopay",
                        amount_paid: dataJson.amount,
                        change_amount: 0,
                        transaction_code: dataJson.app_trans_id
                    });
                    console.log(transactionCreated);

                    if (transactionCreated) {
                        await models.Order.update(
                            { status: "completed" },
                            { where: { id: embedData.order_id } }
                        );
                        await models.Table.update(
                            { status: "available" },
                            { where: { id: order.table_id } }
                        );
                        await models.OrderDetail.update(
                            { status: "cancelled" },
                            { where: { order_id: embedData.order_id, status: { [Op.not]: 'served' } } }
                        );
                        req.io.emit("transaction-created", transactionCreated);
                    }
                }

                result.return_code = 1;
                result.return_message = "success";
            }
        } catch (ex) {
            result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
            result.return_message = ex.message;
        }

        // thông báo kết quả cho ZaloPay server
        res.json(result);
    }
};

module.exports = PaymentTransaction;
