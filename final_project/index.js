const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {

    // Vérifier si une session d'autorisation existe
    if (!req.session.authorization) {
        return res.status(403).json({
            message: "User not logged in"
        });
    }

    // Récupérer le token depuis la session
    const token = req.session.authorization['accessToken'];

    // Vérifier et décoder le token JWT
    jwt.verify(token, "fingerprint_customer", (err, decoded) => {

        if (err) {
            return res.status(403).json({
                message: "User not authenticated"
            });
        }

        // utilisateur authentifié
        req.user = decoded;
        next();
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
