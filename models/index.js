const dotenv = require("dotenv");
dotenv.config()

const { Sequelize, DataTypes } = require('sequelize');
const Blog = require("./blog");

const sequelize = new Sequelize("blog", "root", "sqlYES!12=21", {
    host: "localhost",
    dialect: "mysql"
})

try {
    sequelize.authenticate();
    console.log("Connection success");
} catch (error) {
    // console.log(error);
    console.log("Connection failed");
}

module.exports = sequelize;
