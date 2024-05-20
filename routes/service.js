const express = require("express");

const routes = express.Router();
const serviceController = require("../controllers/service");
const authMiddleware = require("../config/jwt-middleware");

routes.get(
  "/add-service",
  authMiddleware.auth,
  serviceController.getCreateService
);

routes.post(
  "/add-service",
  authMiddleware.auth,
  serviceController.createService
);

routes.get(
  "/getUserServices",
  authMiddleware.auth,
  serviceController.getAllUserServices
);

// routes.get("/", serviceController.getServices);

routes.get(
  "/getServiceById/:id",
  authMiddleware.auth,
  serviceController.getServiceById
);

routes.get(
  "/edit-service/:id",
  authMiddleware.auth,
  serviceController.getUpdateService
);

routes.post(
  "/edit-service",
  authMiddleware.auth,
  serviceController.updateService
);

routes.get(
  "/deleteService/:id",
  authMiddleware.auth,
  serviceController.deleteService
);

routes.get(
  "/userDashboard",
  authMiddleware.auth,
  serviceController.userDashboard
);

routes.get(
  "/serviceDashboard",
  authMiddleware.auth,
  serviceController.serviceDashboard
);

routes.get(
  "/services/:category",
  authMiddleware.auth,
  serviceController.serviceByCategory
);

module.exports = routes;
