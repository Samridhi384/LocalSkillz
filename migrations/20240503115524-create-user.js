"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(150),
      },
      email: {
        type: Sequelize.STRING(150),
      },
      password: {
        type: Sequelize.STRING(150),
      },
      role: {
        type: Sequelize.ENUM("user", "service_provider"),
        defaultValue: "user",
      },
      tokens: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: [],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
