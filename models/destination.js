'use strict';
module.exports = (sequelize, DataTypes) => {
  const Destination = sequelize.define('Destination', {
    idUSER: DataTypes.INTEGER,
    like: DataTypes.INTEGER,
    dislike: DataTypes.INTEGER,
    titre: DataTypes.STRING,
    vues: DataTypes.INTEGER
  }, {});
  Destination.associate = function(models) {
    // associations can be defined here
  };
  return Destination;
};