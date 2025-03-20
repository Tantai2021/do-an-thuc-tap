const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Table = sequelize.define('tables', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    table_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("Available", "Occupied", "Reserved"),
        allowNull: false,
        defaultValue: "Available"
    }
});
module.exports = Table;