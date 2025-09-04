require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: String(process.env.DB_USER),     
  host: String(process.env.DB_HOST),
  database: String(process.env.DB_NAME),
  password: String(process.env.DB_PASS),       // fuerza string
  port: parseInt(process.env.DB_PORT, 10),
});

module.exports = pool;
