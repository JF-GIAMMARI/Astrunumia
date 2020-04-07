/*
=================================================================
Modéle généré par sequelize après la commande de création suivante :
sequelize model:create --attributes "userid:integer vote1:integer vote2:integer vote3:integer" --name Vote 
=================================================================
*/
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('Vote', {
    userid: DataTypes.INTEGER,
    vote1: DataTypes.INTEGER,
    vote2: DataTypes.INTEGER,
    vote3: DataTypes.INTEGER
  }, {});
  Vote.associate = function(models) {
    // associations can be defined here
  };
  return Vote;
};