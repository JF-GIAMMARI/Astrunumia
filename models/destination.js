'use strict';
module.exports = (sequelize, DataTypes) => {
  const Destination = sequelize.define('Destination', {
    destinationid: DataTypes.INTEGER,
    vues: DataTypes.INTEGER,
    aime: DataTypes.INTEGER,
    aimepas: DataTypes.INTEGER,
    nom: DataTypes.STRING
  }, {});
  Destination.associate = function(models) {
    // associations can be defined here
  };
  return Destination;
};