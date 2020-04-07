'use strict';
//Migration du modele de base de donnée sequelize VOTECOUNT
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('VoteCounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vote1: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      vote2: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      vote3: {
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
    return queryInterface.dropTable('VoteCounts');
  }
};