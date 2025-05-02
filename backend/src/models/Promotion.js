const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Promotion = sequelize.define('promotions', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('percent_discount', 'fixed_discount', 'free_item', 'combo'),
        allowNull: false
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    min_order_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    auto_apply: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
}, { timestamps: true });
module.exports = Promotion;