// backend/src/models/Ingredient.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const Ingredient = sequelize.define('ingredients', {
    id: {
        type: DataTypes.STRING(6),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    timestamps: true,
});

module.exports = Ingredient;
