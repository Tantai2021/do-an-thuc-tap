const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Area = sequelize.define('areas', {
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
}, { timestamps: true });
module.exports = Area;