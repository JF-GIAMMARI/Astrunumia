/*
=================================================================
Modéle généré par sequelize après la commande de création suivante :
sequelize model:create --attributes "vote1:integer vote2:integer vote3:integer" --name VoteCount 
=================================================================
*/
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VoteCount = sequelize.define('VoteCount', {
    vote1: DataTypes.INTEGER,
    vote2: DataTypes.INTEGER,
    vote3: DataTypes.INTEGER
  }, {});
  VoteCount.associate = function(models) {
    // associations can be defined here
  };
  return VoteCount;
};