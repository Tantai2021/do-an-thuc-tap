// backend/src/models/Food_Ingredient.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Food = require('./Food');
const Ingredient = require('./Ingredient');

const Food_Ingredient = sequelize.define('food_ingredients', {
    food_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Food,
            key: 'id'
        },
        primaryKey: true
    },
    ingredient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Ingredient,
            key: 'id'
        },
        primaryKey: true

    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    timestamps: true,
});

Food_Ingredient.belongsTo(Food, { foreignKey: 'food_id' });
Food_Ingredient.belongsTo(Ingredient, { foreignKey: 'ingredient_id' });
Food.hasMany(Food_Ingredient, { foreignKey: 'food_id' });
Ingredient.hasMany(Food_Ingredient, { foreignKey: 'food_id' });

module.exports = Food_Ingredient;
