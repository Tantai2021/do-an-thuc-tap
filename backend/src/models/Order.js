const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/database');
const Table = require('../models/Table');

const Order = sequelize.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    table_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Table,
            key: 'id'
        }
    },
    total_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("Pending", "Preparing", "Completed", "Cancelled"),
        allowNull: false,
        defaultValue: "Pending"
    },
    order_time: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    }
}, { timestamps: true });
Order.belongsTo(Table, { foreignKey: 'table_id' });
Table.hasMany(Order, { foreignKey: 'table_id' });

module.exports = Order;