"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Ratings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      serviceProvideId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      serviceUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Bookings", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      serviceDoneId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Services", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      ratings: {
        type: Sequelize.INTEGER,
      },
      reviews: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Ratings");
  },
};
