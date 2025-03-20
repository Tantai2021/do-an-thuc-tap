const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Order = require('../models/Order');
const Food = require('./Food');
const OrderDetail = sequelize.define('order_details', {
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order,
            key: 'id'
        },
        primaryKey: true
    },
    food_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Food,
            key: 'id'
        },
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, { timestamps: true });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id' });
OrderDetail.belongsTo(Food, { foreignKey: 'food_id' });
Order.hasMany(OrderDetail, { foreignKey: 'order_id' });
Food.hasMany(OrderDetail, { foreignKey: 'food_id' });


module.exports = OrderDetail;