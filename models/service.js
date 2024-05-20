"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Service.belongsTo(
        models.User
        // , {
        // foreignKey: "service_providerId",
        // as: "ServiceProvider",
        // }
      );

      Service.hasMany(models.Bookings, {
        foreignKey: "serviceId",
        as: "services",
      });

      Service.hasMany(models.Rating, {
        foreignKey: "serviceDoneId",
        as: "serviceDone",
      });
    }
  }
  Service.init(
    {
      service_category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      service: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      description: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
      image_url: DataTypes.STRING,
      availability: DataTypes.BOOLEAN,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Service",
    }
  );
  return Service;
};
