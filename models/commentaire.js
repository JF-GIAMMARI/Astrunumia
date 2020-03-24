'use strict';
module.exports = (sequelize, DataTypes) => {
  const Commentaire = sequelize.define('Commentaire', {
    destinationid: DataTypes.INTEGER,
    userid: DataTypes.INTEGER,
    texte: DataTypes.TEXT
  }, {});
  Commentaire.associate = function(models) {
    // associations can be defined here
  };
  return Commentaire;
};