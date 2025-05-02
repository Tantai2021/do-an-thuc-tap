const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Order = require("./Order");
const PaymentTransaction = sequelize.define('payment_transactions', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.STRING(6),
        allowNull: false,
        references: {
            model: Order,
            key: 'id'
        },
    },
    method: {
        type: DataTypes.ENUM('cash', 'momo', 'zalopay', 'banking'),
        allowNull: false,
        defaultValue: 'cash'
    },
    amount_paid: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    change_amount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    transaction_code: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, { timestamps: true });

Order.hasMany(PaymentTransaction, { foreignKey: 'order_id' });
PaymentTransaction.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = PaymentTransaction;