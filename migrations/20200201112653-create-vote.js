'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Votes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idUSER: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      choix1: {
        type: Sequelize.STRING
      },
      choix2: {
        type: Sequelize.STRING
      },
      choix3: {
        type: Sequelize.STRING
      },
      vote1: {
        type: Sequelize.INTEGER
      },
      vote2: {
        type: Sequelize.INTEGER
      },
      vote3: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Votes');
  }
};