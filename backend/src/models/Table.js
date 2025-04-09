const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Table = sequelize.define('tables', {
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
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    area_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("Available", "Occupied", "Reserved"),
        allowNull: false,
        defaultValue: "Available"
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, { timestamps: true });
module.exports = Table;