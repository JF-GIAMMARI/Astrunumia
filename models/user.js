'use strict';
// Définition du modèle de la table user
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    isDonateur: DataTypes.BOOLEAN,
    isAdmin: DataTypes.BOOLEAN,
    isSub: DataTypes.BOOLEAN,
    iconNumber: DataTypes.INTEGER
  }, {});

  User.associate = function(models) {};
  return User;
};