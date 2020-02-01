'use strict';
module.exports = (sequelize, DataTypes) => {
  const Commentaire = sequelize.define('Commentaire', {
    idUSER: DataTypes.INTEGER,
    idDESTINATION: DataTypes.INTEGER,
    content: DataTypes.STRING,
  }, {});
  Commentaire.associate = function(models) {
    // associations can be defined here
    models.Commentaire.belongsTo.User,{
      foreignKey:{
        allowNull:false
      }
    }

    models.Commentaire.belongsTo.Destination,{
      foreignKey:{
        allowNull:false
      }
    }
  };
  return Commentaire;
};