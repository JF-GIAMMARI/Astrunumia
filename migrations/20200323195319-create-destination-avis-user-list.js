'use strict';
//Migration du modele de base de donnée sequelize AVIS
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DestinationAvisUserLists', {
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
      userid: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      valeur: {
        allowNull: false,
        defaultValue: 0,
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
    return queryInterface.dropTable('DestinationAvisUserLists');
  }
};