const { Sequelize, Op, where } = require("sequelize");
const serviceModel = require("../models").Service;
const userModel = require("../models").User;
const ratingModel = require("../models").Rating;


exports.getCreateService = async (req, res) => {
  res.render("services/edit-service.ejs", {
    pageTitle: "Create Service",
    path: "/add-service",
    editing: false,
    user: req.user,
  });
};

exports.createService = async (req, res) => {
  try {
    const { service_category, service, description, price } = req.body;

    const userId = req.user.id;

    const servicing = await serviceModel.create({
      service_category,
      service,
      description,
      price,
      userId,
    });

    res.status(201).redirect("/getUserServices");
  } catch (error) {
    res.status(500).send("error while creating service");
    console.log(error);
  }
};

exports.getAllUserServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const services = await serviceModel.findAll({
      include: {
        model: userModel,
      },
      where: {
        userId,
      },
    });

    if (!services || services.length === 0) {
      res.status(400).send("No services found for this users");
    }
    // console.log(services[0].dataValues.id);
    res.status(200).render("services/all-service", {
      pageTitle: "User Services",
      path: "/getUserServices",
      services,
      user: req.user,
    });
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await serviceModel.findByPk(serviceId);

    if (!service) {
      res.status(400).send("service not found");
    }

    const allServices = await serviceModel.findAll({
      where: {
        service_category: service.dataValues.service_category,
      },
    });

    const rating = await ratingModel.findAll({
      where: {
        serviceDoneId: serviceId,
      },
    });

    let r;
    if (rating.length > 0) {
      r = rating;
    } else {
      r = 4.8;
    }

    res.status(200).render("customers/viewCategory", {
      pageTitle: service.dataValues.service_category,
      service,
      user: req.user,
      path: "/getServiceById",
      allServices,
      rating: r,
    });
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.getUpdateService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await serviceModel.findByPk(serviceId);

    if (!service) {
      res.status(400).send("service not found");
    }

    res.render("services/edit-service.ejs", {
      pageTitle: "Update Service",
      path: "/edit-service",
      editing: true,
      user: req.user,
      service,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

exports.updateService = async (req, res) => {
  try {
    console.log(req.body);
    const updates = Object.keys(req.body).filter((update) => {
      update !== "serviceId";
    });
    console.log(updates);

    const allowedUpdates = [
      "service_category",
      "service",
      "description",
      "price",
    ];

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send(`Invalid update!`);
    }

    const updatedService = await serviceModel.update(
      { ...req.body },
      {
        where: {
          id: req.body.serviceId,
        },
      }
    );

    res.status(200).redirect("/getUserServices");
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await serviceModel.destroy({ where: { id: serviceId } });

    if (!service) {
      return res.status(400).send("Failed to delete the service.");
    }

    res.status(200).redirect("/getUserServices");
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
};

exports.userDashboard = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).render("customers/dashboard", {
      pageTitle: "User Dashboard",
      path: "/userDashboard",
      user,
    });
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
};

exports.serviceDashboard = async (req, res) => {
  res.render("services/dashboard", {
    pageTitle: `Service Provider HomePage`,
    path: "/serviceDashboard",
    user: req.user,
  });
};

exports.serviceByCategory = async (req, res) => {
  try {
    const category = req.params.category;

    const services = await serviceModel.findAll({
      where: {
        service_category: category,
      },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
