const express = require("express");
const jwt = require("jsonwebtoken");

const authenticated = express.Router();
const regd_users = express.Router();
let users = [];

// REGISTER
authenticated.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    const exists = users.find(u => u.username === username);
    if (exists) {
        return res.status(400).json({ message: "User already exists!" });
    }

    users.push({ username, password });

    return res.json({ message: "User registered successfully" });
});

// LOGIN
authenticated.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { username },
        "fingerprint_customer",
        { expiresIn: "1h" }
    );

    req.session.authorization = {
        accessToken: token
    };

    return res.json({ message: "Login successful", token });
});

// helper
function isValid(username) {
    return users.some(u => u.username === username);
}

module.exports = {
    authenticated
};
authenticated.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    const username = req.session.authorization?.accessToken
        ? require("jsonwebtoken").verify(
            req.session.authorization.accessToken,
            "fingerprint_customer"
        ).username
        : null;

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    let books = require("./booksdb.js");

    // si livre n'existe pas
    if (!books[isbn]) {
        return res.status(404).json({ message: "ISBN not found" });
    }

    // init reviews si pas existant
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // add or update review
    books[isbn].reviews[username] = review;

    return res.json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

authenticated.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    const token = req.session.authorization?.accessToken;

    if (!token) {
        return res.status(403).json({ message: "User not logged in" });
    }

    const username = jwt.verify(token, "fingerprint_customer").username;

    let books = require("./booksdb.js");

    if (!books[isbn]) {
        return res.status(404).json({ message: "ISBN not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(400).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    return res.json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});