const express = require("express");
const routes = express.Router();

const userController = require("../controllers/user");
const authMiddleware = require("../config/jwt-middleware");

routes.get("/signup", userController.getSignUp);

routes.post("/signup", userController.signUp);

routes.get("/login", userController.getLogin);

routes.post("/login", userController.login);

routes.get("/logout", authMiddleware.auth, userController.logout);

routes.get("/getProfile/:id", authMiddleware.auth, userController.getProfile);

routes.get("/update/:id", authMiddleware.auth, userController.getUpdate);

routes.post("/update", authMiddleware.auth, userController.update);

routes.get("/deleteUser", authMiddleware.auth, userController.deleteUser);

module.exports = routes;
