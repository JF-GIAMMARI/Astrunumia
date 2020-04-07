/*
=================================================================
Modéle généré par sequelize après la commande de création suivante :
sequelize model:create --attributes "destinationid:integer userid:integer valeur:integer" --name DestinationAvisUserList
=================================================================
*/
'use strict';
module.exports = (sequelize, DataTypes) => {
  const DestinationAvisUserList = sequelize.define('DestinationAvisUserList', {
    destinationid: DataTypes.INTEGER,
    userid: DataTypes.INTEGER,
    valeur: DataTypes.INTEGER
  }, {});
  DestinationAvisUserList.associate = function(models) {
    // associations can be defined here
  };
  return DestinationAvisUserList;
};