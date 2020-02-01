'use strict';
module.exports = (sequelize, DataTypes) => {
  const Destination = sequelize.define('Destination', {
    titre: DataTypes.STRING,
  }, {});
  Destination.associate = function(models) {
    // associations can be defined here
    models.Destination.hasMany(models.Commentaire);
  };
  return Destination;
};