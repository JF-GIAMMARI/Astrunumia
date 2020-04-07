'use strict';
//Migration du modele de base de donnée sequelize DESTINATIONS
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Destinations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      destinationid: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      vues: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      aime: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      aimepas: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      nom: {
        allowNull: false,
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Destinations');
  }
};