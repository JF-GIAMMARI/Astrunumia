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