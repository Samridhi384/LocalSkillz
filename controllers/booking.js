const { Sequelize, Op } = require("sequelize");
const bookingModel = require("../models").Bookings;
const userModel = require("../models").User;
const serviceModel = require("../models").Service;
const paymentModel = require("../models").Payment;
const ratingModel = require("../models").Rating;
const path = require("path");
const pdfkit = require("pdfkit");
const fs = require("fs");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const getServicesByIds = async (serviceIds) => {
  if (serviceIds.length > 0) {
    const servicePromises = serviceIds.map((serviceId) => {
      return serviceModel.findByPk(serviceId);
    });
    return await Promise.all(servicePromises);
  }
  return [];
};

exports.getCreateBooking = async (req, res) => {
  const serviceId = req.params.id;

  const service = await serviceModel.findByPk(serviceId);

  if (!service) {
    return res.status(401).send("service not found");
  }

  res.render("customers/edit-booking", {
    pageTitle: "Booking",
    path: "/getCreateBooking",
    editing: false,
    user: req.user,
    service,
  });
};

exports.createBooking = async (req, res) => {
  try {
    const { serviceProviderId, serviceId, date, time } = req.body;

    const customerId = req.user.id;

    const booking = await bookingModel.create({
      serviceProviderId,
      customerId,
      serviceId,
      date,
      time,
    });

    res.status(201).redirect("/getUserBookings");
  } catch (error) {
    res.status(500).send("error");
    console.log(error);
  }
};

exports.getPendingBookings = async (req, res) => {
  try {
    const customerId = req.user.id;
    const customer = await userModel.findByPk(customerId, {
      include: [
        {
          model: bookingModel,
          as: "customers",
        },
      ],
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const bookingArray = customer.customers.filter(
      (booking) => booking.dataValues.status === "Pending"
    );
    const serviceBookedId = bookingArray.map(
      (booking) => booking.dataValues.serviceId
    );

    const services = await getServicesByIds(serviceBookedId);

    if (services.length > 0) {
      const servicesBooked = await serviceModel.findByPk(
        services[0].dataValues.id,
        {
          include: [
            {
              model: bookingModel,
              as: "services",
            },
          ],
        }
      );

      const bookingId = servicesBooked.services[0].dataValues.id;

      res.status(200).render("customers/manage-booking", {
        pageTitle: "Manage Booking",
        path: "/getUserBookings",
        user: req.user.id,
        customers: bookingArray,
        services,
        bookingId,
      });
    } else {
      res.status(200).render("customers/manage-booking", {
        pageTitle: "Manage Booking",
        path: "/getUserBookings",
        user: req.user.id,
        customers: bookingArray,
        services: [],
        bookingId: null,
      });
    }
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getConfirmedBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

    const customer = await userModel.findByPk(customerId, {
      include: [
        {
          model: bookingModel,
          as: "customers",
        },
      ],
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const bookingArray = customer.customers.filter(
      (booking) =>
        booking.dataValues.status === "Confirmed" ||
        booking.dataValues.status === "Approved" ||
        booking.dataValues.status === "Started"
    );

    const bookings = bookingArray.map((booking) => booking.dataValues);
    // console.log("Booking array", bookings);

    if (bookingArray.length === 0) {
      return res.render("customers/trackOrder", {
        path: "/getConfirmedBooking",
        pageTitle: "Track Booking",
        user: req.user,
        customers: [],
        services: [],
        booking: null,
        serviceProvider: null,
      });
    }

    const serviceBookedIds = bookingArray.map(
      (booking) => booking.dataValues.serviceId
    );

    const servicing = await serviceModel.findAll({
      where: {
        id: serviceBookedIds,
      },
    });

    const services = servicing.map((service) => service.dataValues);
    // console.log("services array", services);

    if (!services.length) {
      throw new Error("Services not found");
    }

    // Fetch all service providers related to these services
    const bookedServiceProviderId = [
      ...new Set(
        bookingArray.map((booking) => booking.dataValues.serviceProviderId)
      ),
    ];

    const serviceProviders = await userModel.findAll({
      where: {
        id: bookedServiceProviderId,
      },
    });

    const serviceProviderMap = serviceProviders.reduce(
      (acc, serviceProvider) => {
        acc[serviceProvider.id] = serviceProvider.dataValues;
        return acc;
      },
      {}
    );

    const combinedData = bookings.map((booking) => {
      const service = services.find(
        (service) => service.id === booking.serviceId
      );
      const serviceProvider = serviceProviderMap[booking.serviceProviderId];
      return {
        booking,
        service,
        serviceProvider,
      };
    });

    res.render("customers/trackOrder", {
      path: "/getConfirmedBooking",
      pageTitle: "Track Booking",
      user: req.user,
      customer: bookingArray,
      services: combinedData,
      bookings: combinedData,
      serviceProviders: combinedData.map((data) => data.customer),
    });
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getConfirmedBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

    const customer = await userModel.findByPk(customerId, {
      include: [
        {
          model: bookingModel,
          as: "customers",
        },
      ],
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const bookingArray = customer.customers.filter(
      (booking) =>
        booking.dataValues.status === "Confirmed" ||
        booking.dataValues.status === "Approved" ||
        booking.dataValues.status === "Started"
    );

    const bookings = bookingArray.map((booking) => booking.dataValues);
    // console.log("Booking array", bookings);

    if (bookingArray.length === 0) {
      return res.render("customers/trackOrder", {
        path: "/getConfirmedBooking",
        pageTitle: "Track Booking",
        user: req.user,
        customers: [],
        services: [],
        booking: null,
        serviceProvider: null,
      });
    }

    const serviceBookedIds = bookingArray.map(
      (booking) => booking.dataValues.serviceId
    );

    const servicing = await serviceModel.findAll({
      where: {
        id: serviceBookedIds,
      },
    });

    const services = servicing.map((service) => service.dataValues);
    // console.log("services array", services);

    if (!services.length) {
      throw new Error("Services not found");
    }

    // Fetch all service providers related to these services
    const bookedServiceProviderId = [
      ...new Set(
        bookingArray.map((booking) => booking.dataValues.serviceProviderId)
      ),
    ];

    const serviceProviders = await userModel.findAll({
      where: {
        id: bookedServiceProviderId,
      },
    });

    const serviceProviderMap = serviceProviders.reduce(
      (acc, serviceProvider) => {
        acc[serviceProvider.id] = serviceProvider.dataValues;
        return acc;
      },
      {}
    );

    const combinedData = bookings.map((booking) => {
      const service = services.find(
        (service) => service.id === booking.serviceId
      );
      const serviceProvider = serviceProviderMap[booking.serviceProviderId];
      return {
        booking,
        service,
        serviceProvider,
      };
    });

    res.render("customers/trackOrder", {
      path: "/getConfirmedBooking",
      pageTitle: "Track Booking",
      user: req.user,
      customer: bookingArray,
      services: combinedData,
      bookings: combinedData,
      serviceProviders: combinedData.map((data) => data.customer),
    });
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getFinishedBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

    const customer = await userModel.findByPk(customerId, {
      include: [
        {
          model: bookingModel,
          as: "customers",
        },
      ],
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const bookingArray = customer.customers.filter(
      (booking) =>
        booking.dataValues.status === "Finished" ||
        booking.dataValues.status === "Cancelled"
    );

    const bookings = bookingArray.map((booking) => booking.dataValues);
    // console.log("Booking array", bookings);

    if (bookingArray.length === 0) {
      return res.render("customers/my-bookings", {
        path: "/getFinishedBooking",
        pageTitle: "Booking History",
        user: req.user,
        customers: [],
        services: [],
        booking: null,
        serviceProvider: null,
      });
    }

    const serviceBookedIds = bookingArray.map(
      (booking) => booking.dataValues.serviceId
    );

    const servicing = await serviceModel.findAll({
      where: {
        id: serviceBookedIds,
      },
    });

    const services = servicing.map((service) => service.dataValues);
    // console.log("services array", services);

    if (!services.length) {
      throw new Error("Services not found");
    }

    // Fetch all service providers related to these services
    const bookedServiceProviderId = [
      ...new Set(
        bookingArray.map((booking) => booking.dataValues.serviceProviderId)
      ),
    ];

    const serviceProviders = await userModel.findAll({
      where: {
        id: bookedServiceProviderId,
      },
    });

    const serviceProviderMap = serviceProviders.reduce(
      (acc, serviceProvider) => {
        acc[serviceProvider.id] = serviceProvider.dataValues;
        return acc;
      },
      {}
    );

    const combinedData = bookings.map((booking) => {
      const service = services.find(
        (service) => service.id === booking.serviceId
      );
      const serviceProvider = serviceProviderMap[booking.serviceProviderId];
      return {
        booking,
        service,
        serviceProvider,
      };
    });

    const rating = await ratingModel.findAll({
      where: {
        serviceUserId: customerId,
      },
    });

    let r;
    if (rating.length > 0) {
      r = rating;
    } else {
      r = [];
    }

    res.render("customers/my-bookings", {
      path: "/getFinishedBooking",
      pageTitle: "Booking History",
      user: req.user,
      customer: bookingArray,
      services: combinedData,
      bookings: combinedData,
      serviceProviders: combinedData.map((data) => data.customer),
      rating: r,
    });
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getPayment = async (req, res) => {
  try {
    const amount = parseInt(req.params.amount, 10);
    const serviceId = parseInt(req.query.id, 10);

    // Find the specific booking by serviceId
    const bookings = await bookingModel.findOne({
      where: {
        serviceId: serviceId,
        status: "Pending",
      },
    });

    if (!bookings) {
      return res.status(404).send("Booking not found");
    }

    // Update the amount for the found booking
    bookings.amount = amount;
    await bookings.save();

    const service = await serviceModel.findByPk(bookings.serviceId, {
      include: [
        {
          model: bookingModel,
          as: "services",
        },
      ],
    });

    if (!service) {
      throw new Error("Service not found");
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: service.dataValues.service,
              },
              unit_amount: bookings.amount * 100, // Stripe expects the amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get(
          "host"
        )}/getPayment/success/${serviceId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/getPayment/cancel`,
        client_reference_id: bookings.customerId,
        metadata: {
          servicerId: bookings.serviceProviderId,
          bookingId: bookings.id,
          serviceId: serviceId,
        },
      });

      res.render("customers/paymentPage", {
        path: "/getPayment",
        pageTitle: "Payment",
        booking: bookings,
        user: req.user,
        sessionId: session.id,
        service: service.dataValues,
      });
    } catch (e) {
      console.log("Stripe session creation error:", e);
      return res.status(500).send("Failed to create Stripe session");
    }
  } catch (e) {
    res.status(500).send(e.message);
    console.log(e);
  }
};

exports.getPaymentSuccess = async (req, res) => {
  const serviceId = parseInt(req.params.id, 10);

  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      throw new Error("Session ID not found");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      throw new Error("Unable to retrieve payment session");
    }

    const payment = await paymentModel.create({
      userId: session.client_reference_id,
      servicerId: session.metadata.servicerId,
      bookingId: session.metadata.bookingId,
      amount: session.amount_total / 100,
      currency: session.currency,
      paymentStatus: session.payment_status,
      paymentId: session.payment_intent,
      paymentMethod: session.payment_method_types[0],
    });

    await payment.save();

    await bookingModel.update(
      {
        status: "Confirmed",
      },
      {
        where: {
          id: session.metadata.bookingId,
        },
      }
    );

    res.render("customers/paymentSuccess", {
      path: "/getPayment/success",
      pageTitle: "Payment successful and saved.",
      user: req.user,
      serviceId,
    });
    // res.status(200).send("Payment Done")
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
};

exports.getPaymentCancel = async (req, res) => {
  try {
    res.render("customers/paymentCancel", {
      path: "/getPayment/cancel",
      pageTitle: "Your payment was cancelled",
      user: req.user,
    });
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
};

exports.getDeleteBooking = async (req, res) => {
  try {
    const id = req.params.id;

    const booking = await bookingModel.destroy({
      where: {
        id,
      },
    });
    if (!booking) {
      return res.status(400).send("no such booking done");
    }

    res.status(200).redirect("/getUserBookings");
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getUpdateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await bookingModel.findByPk(bookingId);

    if (!booking) {
      res.status(400).send("booking not found");
    }

    res.render("customers/edit-booking.ejs", {
      pageTitle: "Update booking",
      path: "/edit-booking",
      editing: true,
      user: req.user,
      booking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

exports.updateBooking = async (req, res) => {
  try {
    console.log(req.body);
    const updates = Object.keys(req.body).filter((update) => {
      update !== "bookingId";
    });
    console.log(updates);

    const allowedUpdates = ["date", "time"];

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send(`Invalid update!`);
    }

    const updatedBooking = await bookingModel.update(
      { ...req.body },
      {
        where: {
          id: req.body.bookingId,
        },
      }
    );

    if (req.user.role === "user") {
      res.status(200).redirect("/getConfirmedBookings");
    } else {
      res.status(200).redirect("/getServiceProviderBookings");
    }
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getServiceProviderBooking = async (req, res) => {
  try {
    const service_providerId = req.user.id;

    const service_provider = await userModel.findByPk(service_providerId, {
      include: [
        {
          model: bookingModel,
          as: "serviceProviders",
        },
      ],
    });
    if (!service_provider) {
      throw new Error("Service Provider not found");
    }

    const service_providerArray = service_provider.serviceProviders.filter(
      (booking) =>
        booking.dataValues.status === "Confirmed" ||
        booking.dataValues.status === "Approved" ||
        booking.dataValues.status === "Started"
    );

    const bookings = service_providerArray.map((booking) => booking.dataValues);
    // console.log("Booking array", bookings);

    if (service_providerArray.length === 0) {
      return res.status(200).render("services/mybookings", {
        path: "/getServiceProviderBookings",
        pageTitle: "My Bookings",
        user: req.user,
        service_providers: [],
        services: [],
        bookings: null,
        customer: null,
      });
    }

    const bookedServicesId = service_providerArray.map(
      (booking) => booking.dataValues.serviceId
    );

    const servicing = await serviceModel.findAll({
      where: {
        id: bookedServicesId,
      },
    });

    const services = servicing.map((service) => service.dataValues);
    // console.log("services array", services);

    if (!services || services.length === 0) {
      return res.status(400).send("No services found for this user");
    }

    const bookedCustomerIds = [
      ...new Set(
        service_providerArray.map((booking) => booking.dataValues.customerId)
      ),
    ];

    const customers = await userModel.findAll({
      where: {
        id: bookedCustomerIds,
      },
    });

    const customerMap = customers.reduce((acc, customer) => {
      acc[customer.id] = customer.dataValues;
      return acc;
    }, {});

    // console.log("customer array", customers);

    const combinedData = bookings.map((booking) => {
      const service = services.find(
        (service) => service.id === booking.serviceId
      );
      const customer = customerMap[booking.customerId];
      return {
        booking,
        service,
        customer,
      };
    });

    // console.log("Combined Data", combinedData);

    res.status(200).render("services/mybookings", {
      path: "/getServiceProviderBookings",
      pageTitle: "My Bookings",
      user: req.user,
      service_provider: service_providerArray,
      services: combinedData,
      bookings: combinedData,
      customers: combinedData.map((data) => data.customer),
    });
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getHistory = async (req, res) => {
  try {
    const service_providerId = req.user.id;

    const service_provider = await userModel.findByPk(service_providerId, {
      include: [
        {
          model: bookingModel,
          as: "serviceProviders",
        },
      ],
    });
    if (!service_provider) {
      throw new Error("Service Provider not found");
    }

    const service_providerArray = service_provider.serviceProviders.filter(
      (booking) =>
        booking.dataValues.status === "Finished" ||
        booking.dataValues.status === "Cancelled"
    );

    const bookings = service_providerArray.map((booking) => booking.dataValues);
    // console.log("Booking array", bookings);

    if (service_providerArray.length === 0) {
      return res.status(200).render("services/history", {
        path: "/getHistory",
        pageTitle: "Past History",
        user: req.user,
        service_providers: [],
        services: [],
        bookings: null,
        customer: null,
      });
    }

    const bookedServicesId = service_providerArray.map(
      (booking) => booking.dataValues.serviceId
    );

    const servicing = await serviceModel.findAll({
      where: {
        id: bookedServicesId,
      },
    });

    const services = servicing.map((service) => service.dataValues);
    // console.log("services array", services);

    if (!services || services.length === 0) {
      return res.status(400).send("No services found for this user");
    }

    const bookedCustomerIds = [
      ...new Set(
        service_providerArray.map((booking) => booking.dataValues.customerId)
      ),
    ];

    const customers = await userModel.findAll({
      where: {
        id: bookedCustomerIds,
      },
    });

    const customerMap = customers.reduce((acc, customer) => {
      acc[customer.id] = customer.dataValues;
      return acc;
    }, {});

    // console.log("customer array", customers);

    const combinedData = bookings.map((booking) => {
      const service = services.find(
        (service) => service.id === booking.serviceId
      );
      const customer = customerMap[booking.customerId];
      return {
        booking,
        service,
        customer,
      };
    });

    // console.log("Combined Data", combinedData);

    res.status(200).render("services/history", {
      path: "/getHistory",
      pageTitle: "Past history",
      user: req.user,
      service_provider: service_providerArray,
      services: combinedData,
      bookings: combinedData,
      customers: combinedData.map((data) => data.customer),
    });
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getStatus = async (req, res) => {
  const id = req.params.id;

  const booking = await bookingModel.findByPk(id);

  if (!booking) {
    return res.status(400).send("No such booking");
  }

  res.render("services/status", {
    pageTitle: "Change Status",
    path: "/getStatusChange",
    user: req.user,
    booking,
  });
};

exports.postStatus = async (req, res) => {
  try {
    const { gridRadios, bookingId } = req.body;

    const booking = await bookingModel.findByPk(bookingId);

    if (!booking) {
      return res.status(400).send("No such booking");
    }

    const validStatuses = ["Approved", "Started", "Finished", "Cancelled"];

    if (validStatuses.includes(gridRadios)) {
      booking.status = gridRadios;
      await booking.save();
      return res.status(200).redirect("/getServiceProviderBookings");
    } else {
      return res.status(400).send("Invalid status");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const serviceId = req.query.serviceId;

    const booking = await bookingModel.findByPk(id);
    const service = await serviceModel.findByPk(serviceId);

    if (!booking || !service) {
      console.error("Invalid booking or service ID");
      return res.status(400).send("Invalid booking or service ID");
    }

    console.log("Booking data:", booking.dataValues);
    console.log("Service data:", service.dataValues);

    const bookingAmount = parseFloat(booking.dataValues.amount);
    const servicePrice = parseFloat(service.dataValues.price);

    if (isNaN(bookingAmount) || isNaN(servicePrice)) {
      console.error("Invalid booking amount or service price");
      return res.status(400).send("Invalid booking amount or service price");
    }

    const doc = new pdfkit();
    console.log("PDF document initialized");

    const invoicePath = path.join(__dirname, "invoice", "invoice.pdf");
    const writeStream = fs.createWriteStream(invoicePath);
    // Handle stream errors
    writeStream.on("error", (err) => {
      console.error("Error writing to file:", err);
      res.status(500).send("Error generating or serving invoice");
    });

    // Pipe the PDF document to the write stream
    doc.pipe(writeStream);
    console.log("------");

    // Add content to the PDF
    doc.fontSize(20).text("Your Invoice Details", {
      align: "center",
      bold: "true",
    });

    doc.moveDown();

    doc
      .fontSize(16)
      .text(
        `Invoice Number: ${
          Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
        }`,
        { underline: true }
      );

    doc.moveDown();

    doc.fontSize(14).text("Service Booked", { underline: true });

    doc.fontSize(12).text(`${service.dataValues.service}: ${servicePrice}/-`);

    doc
      .fontSize(12)
      .text(`Quantity: ${Math.floor(bookingAmount / servicePrice)}`);

    doc.moveDown();

    doc.fontSize(14).text("Payment Summary", { underline: true });

    doc.fontSize(12).text(`Total Service Charge: ${bookingAmount - 69}/-`);

    doc.fontSize(12).text(`Taxes & Fare: 19/- \n Visitation fees: 50/-`);

    doc.fontSize(12).text(`Total: ${bookingAmount}/-`);

    doc.moveDown();
    doc.moveDown();

    doc
      .fontSize(14)
      .text(
        "Hope you liked the services. Explore more in future to have a luxurious life.:-)"
      );

    // End PDF generation
    doc.end();
    console.log("PDF generation completed");

    // Wait for the write stream to finish
    writeStream.on("finish", () => {
      console.log("PDF written to file");

      res.download(invoicePath, "invoice.pdf", (err) => {
        if (err) {
          console.error("Error downloading invoice:", err);
          res.status(500).send("Error generating or serving invoice");
        } else {
          fs.unlink(invoicePath, (err) => {
            if (err) {
              console.error("Error deleting invoice file:", err);
            }
          });
          res.status(200).redirect("/getConfirmedBookings");
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send("in catch block ---- Error generating or serving invoice");
  }
};
