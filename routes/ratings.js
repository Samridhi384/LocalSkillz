const express = require("express");
const routes = express.Router();

const ratingsController = require("../controllers/ratings");
const authMiddleware = require("../config/jwt-middleware");

routes.get(
  "/getCreateRating/:id",
  authMiddleware.auth,
  ratingsController.getCreateRating
);

routes.post(
  "/createRating",
  authMiddleware.auth,
  ratingsController.createRating
);

routes.get(
  "/getRatings",
  authMiddleware.auth,
  ratingsController.getServiceProviderRatings
);

module.exports = routes;
