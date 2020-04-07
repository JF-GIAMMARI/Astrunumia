/*
=================================================================
Modéle généré par sequelize après la commande de création suivante :
sequelize model:create --attributes "destinationid:integer userid:integer texte:text" --name Commentaire 
=================================================================
*/

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