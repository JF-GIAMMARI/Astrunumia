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