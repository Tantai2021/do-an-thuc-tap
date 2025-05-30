const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Staff = sequelize.define('staffs', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("accounting", "manager", "chef", "customer-service"),
        allowNull: false,
        defaultValue: "chef"
    }
}, { timestamps: true });
module.exports = Staff;