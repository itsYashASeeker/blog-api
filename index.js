const dotenv = require("dotenv");
dotenv.config()

const { Sequelize, DataTypes } = require('sequelize');
const express = require("express");
const bodyParser = require("body-parser");
const { Blog, User, Comments } = require("./models/blog");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express()
const port = 5000;
app.use(bodyParser.json())



// Blog.sync({});
// User.sync({});


const jwtMiddleware = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);
        req.user_id = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
};

async function h() {
    Blog.create({ content: "Hello world!" });
    const allBlogs = await Blog.findAll();
    // console.log(allBlogs);
    console.log("All users:", JSON.stringify(allBlogs, null, 2));


}
// h()

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(402).json({ "error": "Please provide username & password both" });
        return;
    }
    const pp = await bcrypt.hash(password, 15);
    await User.create({
        username: username,
        password: pp
    })
    const allUsers = await User.findOne({ username: username });
    const token = jwt.sign({ id: allUsers.dataValues.id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    // res.cookie(
    //     "token", token
    // ).send("success");
    res.send("Registration successful")
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(402).json({ "error": "Please provide username & password both" });
        return;
    }
    const pp = await bcrypt.hash(password, 15);
    const allUsers = await User.findOne({ username: username });
    if (allUsers) {
        const user = allUsers.dataValues;
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            res.cookie(
                "token", token
            ).send("success");
        }
        else {
            res.status(402).json({ "error": "Incorrect username or password" });
        }
    }
    else {
        res.status(402).json({ "error": "Incorrect username or password" });
    }
})

app.post("/logout", (req, res) => {
    jwt.destroy(req.headers['authorization']);
    res.send("Logout success");
})

app.post("/blog/c", jwtMiddleware, async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(402).json({ "error": "Please provide content of blog" });
    }
    try {
        // console.log(req.user_id);
        await Blog.sync();
        await Blog.create({ postedBy: req.user_id, content: content })
        res.send("success");
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.post("/blog/u", jwtMiddleware, async (req, res) => {
    const { blogId, content } = req.body;
    if (!blogId || !content) {
        return res.status(402).json({ "error": "Please provide content as well as id of blog" });
    }
    try {
        // console.log(req.user_id);
        await Blog.sync();
        const blogExists = await Blog.findAll({
            where: {
                id: blogId,
                postedBy: req.user_id
            }
        })
        if (blogExists.length) {
            await Blog.update({ content: content }, {
                where: {
                    id: blogId
                }
            })

            res.send("success");
        }
        else {
            return res.status(402).json({ "error": "You are not the creator of the blog" });
        }
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.post("/blog/d", jwtMiddleware, async (req, res) => {
    const { blogId } = req.body;
    if (!blogId) {
        return res.status(402).json({ "error": "Please provide id of blog" });
    }
    try {
        // console.log(req.user_id);
        await Blog.sync();
        const blogExists = await Blog.findAll({
            where: {
                id: blogId,
                postedBy: req.user_id
            }
        })
        if (blogExists.length) {
            await Blog.destroy({
                where: {
                    id: blogId
                }
            })

            res.send("success");
        }
        else {
            return res.status(402).json({ "error": "You are not the creator of the blog" });
        }
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.get("/blog/getid/:id", jwtMiddleware, async (req, res) => {
    const blogId = req.params.id;
    if (!blogId) {
        return res.status(402).json({ "error": "Please provide id of blog" });
    }
    try {
        // console.log(req.user_id);
        await Blog.sync();
        const blogExists = await Blog.findAll({
            where: {
                id: blogId,
            }
        })
        return res.json(blogExists)
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.get("/blog/getall/", jwtMiddleware, async (req, res) => {
    try {
        // console.log(req.user_id);
        await Blog.sync();
        const blogExists = await Blog.findAll()
        return res.json(blogExists)
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.post("/blog/comment/c", jwtMiddleware, async (req, res) => {
    const { content, blogId } = req.body;
    if (!blogId || !content) {
        return res.status(402).json({ "error": "Please provide content as well as id of comment" });
    }
    try {
        // console.log(req.user_id);
        await Comments.sync();
        await Comments.create({ postedBy: req.user_id, content: content, blogId: blogId, commentBy: req.user_id })
        res.send("success");
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.post("/blog/comment/u", jwtMiddleware, async (req, res) => {
    const { commId, content } = req.body;
    if (!commId || !content) {
        return res.status(402).json({ "error": "Please provide content as well as id of comment" });
    }
    try {
        // console.log(req.user_id);
        await Comments.sync();
        const commExists = await Comments.findAll({
            where: {
                id: commId,
                commentBy: req.user_id
            }
        })
        if (commExists.length) {
            await Comments.update({ content: content }, {
                where: {
                    id: commId
                }
            })

            res.send("success");
        }
        else {
            return res.status(402).json({ "error": "You are not the creator of the comment" });
        }
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.post("/blog/comment/d", jwtMiddleware, async (req, res) => {
    const { commId } = req.body;
    if (!commId) {
        return res.status(402).json({ "error": "Please provide id of comment" });
    }
    try {
        // console.log(req.user_id);
        await Comments.sync();
        const commExists = await Comments.findAll({
            where: {
                id: commId,
                commentBy: req.user_id
            }
        })
        if (commExists.length) {
            await Comments.destroy({
                where: {
                    id: commId
                }
            })

            res.send("success");
        }
        else {
            return res.status(402).json({ "error": "You are not the creator of the comment" });
        }
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.get("/blog/comment/getall", jwtMiddleware, async (req, res) => {
    const { blogId } = req.body;
    if (!blogId) {
        return res.status(402).json({ "error": "Please provide id of Blog" });
    }
    try {
        // console.log(req.user_id);
        await Comments.sync();
        const blogExists = await Comments.findAll({
            where: {
                blogId: blogId
            }
        })
        return res.json(blogExists)
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": "Some error occurred" });
    }

})

app.listen(port, () => {
    console.log("listening on port " + port);
})


