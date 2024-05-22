"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Service);

      User.hasMany(models.Bookings, {
        foreignKey: "serviceProviderId",
        as: "serviceProviders",
      });

      User.hasMany(models.Bookings, {
        foreignKey: "customerId",
        as: "customers",
      });

      User.hasMany(models.Payment, {
        foreignKey: "userId",
        as: "user",
      });

      User.hasMany(models.Payment, {
        foreignKey: "servicerId",
        as: "servicer",
      });

      User.hasMany(models.Rating, {
        foreignKey: "serviceUserId",
        as: "serviceUser",
      });

      User.hasMany(models.Rating, {
        foreignKey: "serviceProvideId",
        as: "serviceProvide",
      });

      User.hasMany(models.Notification, {
        foreignKey: "recieverId",
        as: "reciever",
      });

      User.hasMany(models.Notification, {
        foreignKey: "senderId",
        as: "sender",
      });
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [4, 20],
            msg: "Name should be between 4 to 20 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: "Invalid Email",
          },
        },
      },
      password: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM,
        values: ["user", "service_provider"],
        defaultValue: "user",
      },
      tokens: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "[]",
        get() {
          return JSON.parse(this.getDataValue("tokens"));
        },
        set(value) {
          this.setDataValue("tokens", JSON.stringify(value));
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
