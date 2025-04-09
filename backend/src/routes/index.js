const IngredientRoutes = require('./Ingredient');
const FoodRoutes = require('./Food');
const AuthRoutes = require('./Auth');
const RecipeRoutes = require('./Recipe');
const TableRoutes = require('./Table');
const CategoryRoutes = require('./Category');
const UploadRoutes = require("./Upload");

const Router = (app) => {
    app.use('/api/ingredients', IngredientRoutes);
    app.use('/api/foods', FoodRoutes);
    app.use('/api/auth', AuthRoutes);
    app.use('/api/recipes', RecipeRoutes);
    app.use('/api/tables', TableRoutes);
    app.use('/api/categories', CategoryRoutes);

    app.use("/api/uploads", UploadRoutes);

};
module.exports = Router;