const IngredientRoutes = require('./Ingredient');
const FoodRoutes = require('./Food');
const AuthRoutes = require('./Auth');

const Router = (app) => {
    app.use('/api/ingredients', IngredientRoutes); 
    app.use('/api/foods', FoodRoutes);
    app.use('/api/auth', AuthRoutes);
};
module.exports = Router;