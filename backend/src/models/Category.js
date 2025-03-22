// backend/src/models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const Category = sequelize.define('categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

}, {
    timestamps: true,
});

module.exports = Category;
