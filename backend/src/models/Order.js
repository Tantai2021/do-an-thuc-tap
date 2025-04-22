const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/database');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Table = require('../models/Table');

const Order = sequelize.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Customer,
            key: 'id'
        }
    },
    staff_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Staff,
            key: 'id'
        }
    },
    table_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Table,
            key: 'id'
        }
    },
    number_of_guests: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM("pending", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "pending"
    },
    start_time: {
        type: DataTypes.TIME,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
}, {
    timestamps: true,
    hooks: {
        beforeCreate: (order) => {
            if (!order.id) {
                order.id = Math.random().toString(36).substring(2, 8).toUpperCase();
            }
            if (!order.start_time) {
                order.start_time = new Date();
            }
            const durationInHours = 1;
            order.end_time = new Date(order.start_time.getTime() + durationInHours * 60 * 60 * 1000);
        },

    }
});

Order.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Order, { foreignKey: 'customer_id' });

Order.belongsTo(Staff, { foreignKey: 'staff_id' });
Staff.hasMany(Order, { foreignKey: 'staff_id' });

Order.belongsTo(Table, { foreignKey: 'table_id' });
Table.hasMany(Order, { foreignKey: 'table_id' });

module.exports = Order;