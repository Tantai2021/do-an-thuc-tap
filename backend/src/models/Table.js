const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Area = require('./Area');
const Table = sequelize.define('tables', {
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
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    area_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("available", "occupied", "reserved"),
        allowNull: false,
        defaultValue: "available"
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, { timestamps: true });

Area.hasMany(Table, { foreignKey: 'area_id' });
Table.belongsTo(Area, { foreignKey: 'area_id' });

module.exports = Table;