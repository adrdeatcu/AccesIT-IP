const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilizator = sequelize.define('Utilizator', {
    id_utilizator: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
        allowNull: false
    },
    nume_utilizator: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    parola_hash: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    rol: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Angajat'
    },
    data_creare: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'utilizatori',
    schema: 'public',
    timestamps: false
});

module.exports = Utilizator;