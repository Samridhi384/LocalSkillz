"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.belongsTo(models.User, {
        foreignKey: "servicerId",
        as: "servicer",
      });
      Payment.belongsTo(models.User, {
        foreignKey: "serviceUserId",
        as: "serviceUser",
      });
      Payment.belongsTo(models.Bookings, {
        foreignKey: "bookingId",
        as: "booking",
      });
    }
  }
  Payment.init(
    {
      servicerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: DataTypes.INTEGER,
      currency: DataTypes.STRING,
      paymentStatus: {
        type: DataTypes.ENUM,
        values: ["pending", "completed", "failed", "paid"],
        defaultValue: "pending",
        allowNull: false,
      },
      paymentId: DataTypes.STRING,
      paymentMethod: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Payment",
    }
  );
  return Payment;
};
