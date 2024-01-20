const { Sequelize, DataTypes, Model } = require('sequelize');
// const sequelize = new Sequelize('sqlite::memory:');
const sequelize = require("./index");

const Blog = sequelize.define('Blog', {
    // Model attributes are defined here
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postedBy: {
        type: DataTypes.INTEGER,
        references: {
            model: "users",
            key: "id"
        }
        // allowNull: false
    }
}, {
    tableName: "blogs"
    // Other model options go here
});

const User = sequelize.define('User', {
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
},
    {
        tableName: "users"
    }
);

const Comments = sequelize.define('Comments', {
    content: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    blogId: {
        type: DataTypes.INTEGER,
        references: {
            model: "blogs",
            key: "id"
        }
    },
    commentBy: {
        type: DataTypes.INTEGER,
        references: {
            model: "users",
            key: "id"
        }
    }
},
    {
        tableName: "comments"
    }
);

// Blog.sync();
// sequelize.sync();

module.exports = { Blog, User, Comments };