const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Customer = sequelize.define('customers', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: true,
    hooks: {
        beforeCreate: (customer) => {
            if (!customer.id) {
                customer.id = Math.random().toString(36).substring(2, 8).toUpperCase();
            }
        }
    }
});
module.exports = Customer;