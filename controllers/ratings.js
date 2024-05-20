const ratingModel = require("../models").Rating;
const bookingModel = require("../models").Bookings;
const serviceModel = require("../models").Service;
const userModel = require("../models").User;

exports.getCreateRating = async (req, res) => {
  const id = req.params.id;

  const booking = await bookingModel.findByPk(id);

  if (!booking) {
    res.status(400).send("booking not found");
  }
  //   console.log(booking);
  const bookingData = booking.dataValues;

  const serviceProvider = await userModel.findByPk(
    bookingData.serviceProviderId
  );
  const service = await serviceModel.findByPk(bookingData.serviceId);

  res.render("customers/ratings", {
    pageTitle: "Create Reviews",
    path: "/getCreateRating",
    user: req.user,
    booking: bookingData,
    serviceProvider: serviceProvider.dataValues,
    service: service.dataValues,
  });
};

exports.createRating = async (req, res) => {
  try {
    const {
      ratings,
      reviews,
      bookId,
      serviceProvideId,
      serviceUserId,
      serviceDoneId,
    } = req.body;

    await ratingModel.create({
      serviceProvideId,
      serviceUserId,
      bookId,
      serviceDoneId,
      ratings,
      reviews,
    });

    res.status(201).redirect("/getFinishedBookings");
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

exports.getServiceProviderRatings = async (req, res) => {
  try {
    const service_providerId = req.user.id;

    const serviceProvider = await userModel.findByPk(service_providerId, {
      include: [
        {
          model: ratingModel,
          as: "serviceProvide",
        },
      ],
    });

    const ratingArray = serviceProvider.serviceProvide;

    const ratings = ratingArray.map((rating) => rating.dataValues);

    const serviceIds = ratings.map((rating) => rating.serviceDoneId);

    const customerId = ratings.map((rating) => rating.serviceUserId);

    const services = await serviceModel.findAll({
      where: {
        id: serviceIds,
      },
    });

    const customers = await userModel.findAll({
      where: {
        id: customerId,
      },
    });

    const servicesMap = services.reduce((acc, service) => {
      acc[service.id] = service.dataValues.service;
      return acc;
    }, {});

    const customersMap = customers.reduce((acc, customer) => {
      acc[customer.id] = customer.dataValues.name;
      return acc;
    }, {});

    const combinedData = ratings.map((rating) => ({
      id: rating.id,
      rating: rating.ratings,
      review: rating.reviews,
      createdDate: rating.createdAt,
      service: servicesMap[rating.serviceDoneId],
      customer: customersMap[rating.serviceUserId],
    }));

    console.log(combinedData);

    res.status(200).render("services/ratings", {
      path: "/getRatings",
      pageTitle: "Ratings",
      user: req.user,
      ratings: combinedData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};
