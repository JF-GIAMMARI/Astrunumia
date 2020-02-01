'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('Vote', {
    idUSER: DataTypes.INTEGER,
    date: DataTypes.DATE,
    choix1: DataTypes.STRING,
    choix2: DataTypes.STRING,
    choix3: DataTypes.STRING,
    vote1: DataTypes.INTEGER,
    vote2: DataTypes.INTEGER,
    vote3: DataTypes.INTEGER
  }, {});
  Vote.associate = function(models) {
    // associations can be defined here
  };
  return Vote;
};