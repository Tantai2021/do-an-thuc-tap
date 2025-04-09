// backend/src/models/Food.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Category = require('./Category');

const Food = sequelize.define('foods', {
    id: {
        type: DataTypes.STRING(6),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category_id: {
        type: DataTypes.STRING(6),
        allowNull: false,
        references: {
            model: Category,
            key: 'id'
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true,
});

Food.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Food, { foreignKey: "category_id" });

module.exports = Food;
