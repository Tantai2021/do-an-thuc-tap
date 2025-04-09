// backend/src/models/Recipe.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Food = require('./Food');
const Ingredient = require('./Ingredient');

const Recipe = sequelize.define('recipes', {
    food_id: {
        type: DataTypes.STRING(6),
        allowNull: false,
        references: {
            model: Food,
            key: 'id'
        },
        primaryKey: true
    },
    ingredient_id: {
        type: DataTypes.STRING(6),
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

Recipe.belongsTo(Food, { foreignKey: 'food_id' });
Recipe.belongsTo(Ingredient, { foreignKey: 'ingredient_id' });
Food.hasMany(Recipe, { foreignKey: 'food_id' });
Ingredient.hasMany(Recipe, { foreignKey: 'ingredient_id' });

module.exports = Recipe;
