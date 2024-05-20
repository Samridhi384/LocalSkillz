"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Rating.belongsTo(models.User, {
        foreignKey: "serviceProvideId",
        as: "serviceProvide",
      });
      Rating.belongsTo(models.User, {
        foreignKey: "serviceUserId",
        as: "serviceUser",
      });
      Rating.belongsTo(models.Bookings, {
        foreignKey: "bookId",
        as: "book",
      });
      Rating.belongsTo(models.Service, {
        foreignKey: "serviceDoneId",
        as: "serviceDone",
      });
    }
  }
  Rating.init(
    {
      serviceProvideId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      serviceUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      serviceDoneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ratings: DataTypes.INTEGER,
      reviews: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Rating",
    }
  );
  return Rating;
};
