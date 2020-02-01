'use strict';
module.exports = (sequelize, DataTypes) => {
  const Destination = sequelize.define('Destination', {
    idUSER: DataTypes.INTEGER,
    titre: DataTypes.STRING,
  }, {});
  Destination.associate = function(models) {
    // associations can be defined here
  };
  return Destination;
};