// backend/src/models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const Category = sequelize.define('categories', {
    id: {
        type: DataTypes.STRING(6),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true,
});

module.exports = Category;
