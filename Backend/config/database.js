const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Parse the connection details from SUPABASE_URL
const dbUrl = new URL(process.env.SUPABASE_URL);
const host = dbUrl.hostname;
const database = dbUrl.pathname.substr(1); // Remove leading slash

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: host,
  database: database,
  username: 'postgres',
  password: process.env.SUPABASE_KEY,
  port: 5432,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;