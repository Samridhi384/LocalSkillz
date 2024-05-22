"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.User, {
        foreignKey: "senderId",
        as: "sender",
      });
      Notification.belongsTo(models.User, {
        foreignKey: "recieverId",
        as: "reciever",
      });
    }
  }
  Notification.init(
    {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recieverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: DataTypes.STRING,
      read: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
