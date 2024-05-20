const express = require("express");
const routes = express.Router();

const bookingController = require("../controllers/booking");
const authMiddleware = require("../config/jwt-middleware");

routes.get(
  "/getCreateBooking/:id",
  authMiddleware.auth,
  bookingController.getCreateBooking
);

routes.post(
  "/createBooking",
  authMiddleware.auth,
  bookingController.createBooking
);

routes.get(
  "/getUserBookings",
  authMiddleware.auth,
  bookingController.getPendingBookings
);

routes.get(
  "/getConfirmedBookings",
  authMiddleware.auth,
  bookingController.getConfirmedBookings
);

routes.get(
  "/getFinishedBookings",
  authMiddleware.auth,
  bookingController.getFinishedBookings
);

routes.get(
  "/getServiceProviderBookings",
  authMiddleware.auth,
  bookingController.getServiceProviderBooking
);

routes.get("/getHistory", authMiddleware.auth, bookingController.getHistory);

routes.get(
  "/getPayment/success/:id",
  authMiddleware.auth,
  bookingController.getPaymentSuccess
);
routes.get(
  "/getPayment/:amount",
  authMiddleware.auth,
  bookingController.getPayment
);
routes.get(
  "/getPayment/cancel",
  authMiddleware.auth,
  bookingController.getPayment
);

routes.get(
  "/edit-booking/:id",
  authMiddleware.auth,
  bookingController.getUpdateBooking
);

routes.post(
  "/edit-booking",
  authMiddleware.auth,
  bookingController.updateBooking
);

routes.get(
  "/deleteBooking/:id",
  authMiddleware.auth,
  bookingController.getDeleteBooking
);

routes.get(
  "/getStatusChange/:id",
  authMiddleware.auth,
  bookingController.getStatus
);

routes.post("/changeStatus", authMiddleware.auth, bookingController.postStatus);

routes.get(
  "/download-invoice/:id",
  authMiddleware.auth,
  bookingController.downloadInvoice
);
module.exports = routes;
