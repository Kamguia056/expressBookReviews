const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Vérifier si username et password existent
    if (!username || !password) {
        return res.status(404).json({
        message: "Unable to register user."
        });
    }

    // Vérifier si l'utilisateur existe déjà
    if (isValid(username) === false) {
        return res.status(404).json({ message: "User already exists!" });
    }

    // Ajouter le nouvel utilisateur
    users.push({
        username: username,
        password: password
    });

    return res.status(200).json({
        message: "User successfully registered. Now you can login"
    });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    return res.status(200).json(books[isbn]);
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {

    const author = req.params.author;

    let filtered_books = {};

    // Récupérer toutes les clés des livres
    const bookKeys = Object.keys(books);

    // Parcourir les livres
    bookKeys.forEach(key => {

        if (books[key].author === author) {
            filtered_books[key] = books[key];
        }

    });

    return res.status(200).json(filtered_books);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {

    const title = req.params.title;

    let filtered_books = {};

    // Récupérer toutes les clés
    const bookKeys = Object.keys(books);

    // Parcourir les livres
    bookKeys.forEach(key => {

        if (books[key].title === title) {
            filtered_books[key] = books[key];
        }

    });

    return res.status(200).json(filtered_books);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

    // Récupérer l'ISBN
    const isbn = req.params.isbn;

    // Retourner les reviews du livre
    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
