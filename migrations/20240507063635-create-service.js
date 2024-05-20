"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Services", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      service_category: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      service: {
        type: Sequelize.STRING(150),
        unique: true,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(150),
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      image_url: Sequelize.STRING,
      availability: {
        type: Sequelize.BOOLEAN,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "Users",
          },
          key: "id",
        },
        allowNull: false,
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
    await queryInterface.dropTable("Services");
  },
};
