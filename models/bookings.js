"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bookings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Bookings.belongsTo(models.User, {
        foreignKey: "serviceProviderId",
        as: "serviceProvider",
      });
      Bookings.belongsTo(models.User, {
        foreignKey: "customerId",
        as: "customer",
      });
      Bookings.belongsTo(models.Service, {
        foreignKey: "serviceId",
        as: "service",
      });
      Bookings.hasMany(models.Payment, {
        foreignKey: "bookingId",
        as: "booking",
      });
      Bookings.hasMany(models.Rating, {
        foreignKey: "bookId",
        as: "book",
      });
    }
  }
  Bookings.init(
    {
      serviceProviderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
      },
      time: {
        type: DataTypes.STRING,
      },
      amount: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM,
        values: [
          "Pending",
          "Confirmed",
          "Approved",
          "Started",
          "Finished",
          "Cancelled",
        ],
        defaultValue: "Pending",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Bookings",
    }
  );
  return Bookings;
};
