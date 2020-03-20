// Importations des dépendances
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');


// Fonctions d'autentification
module.exports = {
  updateVote: function(req, res) {
    var headerAuth = req.headers['authorization'];
    var userID = 1;//jwtUtils.getUserId(headerAuth);
    var vote1 = req.body.vote1;
    var vote2 = req.body.vote2;
    var vote3 = req.body.vote3;

    if (vote1 == null || vote2== null || vote3 == null ) {
      return res.status(400).json({ 'error': 'Il manque des paramètres ' });
    }

    vote1 = vote1 | 0;
    vote2 = vote2 | 0;
    vote3 = vote3 | 0;

    if (vote1 > 1 || vote1 < 0 ) {
      vote1 = 0;
    }
    if (vote2 > 1 || vote2 < 0 ) {
      vote2 = 0;
    }
    if (vote3 > 1 || vote3 < 0 ) {
      vote3 = 0;
    }

    
    const newuserid = async () => {
      try {
        var newUser = models.Vote.create({ 
          userid : 1,
          vote1 : 1,
          vote2 : 2,
          vote3 : 3
        })
      } catch (error) {
        return res.status(400).json(error);
      }
    }
    //newuserid();



    const getuserid = async () => {
        try {
          const userbdid = await models.Vote.findOne({
            where: {userid: userID }});
            return userbdid[0];
        } catch (error) {
          return res.status(400).json(error);
        }
      }

      
    if(getuserid()[0] == null ){
      return res.status(400).json(getuserid());
    }
  
      return res.status(400).json("ok"+getuserid());
    
      
  },
}
