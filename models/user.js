/*
=================================================================
Modéle généré par sequelize après la commande de création suivante :
sequelize model:create --attributes "email:string username:string password:string isDonateur:boolean isAdmin:boolean 					isSub:boolean iconNumber:integer" --name User 
=================================================================
*/
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