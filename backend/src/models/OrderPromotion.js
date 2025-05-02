const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Order = require('./Order');
const Promotion = require('./Promotion');
const OrderPromotion = sequelize.define('order_promotions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.STRING,
        references: {
            model: Order,
            key: 'id'
        }
    },
    promotion_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Promotion,
            key: 'id'
        }
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

Order.belongsToMany(Promotion, { through: OrderPromotion, foreignKey: 'order_id' });
Promotion.belongsToMany(Order, { through: OrderPromotion, foreignKey: 'promotion_id' });
module.exports = OrderPromotion;