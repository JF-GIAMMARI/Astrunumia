'use strict';
module.exports = (sequelize, DataTypes) => {
  const Commentaire = sequelize.define('Commentaire', {
    idUSER: DataTypes.INTEGER,
    idDESTINATION: DataTypes.INTEGER,
    content: DataTypes.STRING,
    date: DataTypes.DATE
  }, {});
  Commentaire.associate = function(models) {
    // associations can be defined here
  };
  return Commentaire;
};