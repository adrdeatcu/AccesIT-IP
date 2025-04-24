const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with direct connection details
const sequelize = new Sequelize({
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    username: 'postgres.iyaaqszlcqhzsxooosdo',
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

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

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection to database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = { Utilizator, sequelize };