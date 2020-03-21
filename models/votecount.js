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