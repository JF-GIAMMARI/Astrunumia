// Importations des dépendances
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');


// Fonctions d'autentification
module.exports = {
  updateVote: function(req, res) {
    var headerAuth = req.headers['authorization'];
    var userID = req.body.id;//jwtUtils.getUserId(headerAuth);
    var vote1 = req.body.vote1;
    var vote2 = req.body.vote2;
    var vote3 = req.body.vote3;
    var globalvote1 = 0;
    var globalvote2 = 0;
    var globalvote3 = 0;

    if (userID < 0) // Vérification de sécurité
      return res.status(400).json({ 'error': 'wrong token' });

    if (vote1 == null || vote2== null || vote3 == null ) {
      return res.status(400).json({ 'error': 'Il manque des paramètres ' });
    }


asyncLib.waterfall([
  function(callback){
    models.Vote.findOne({
      where: { userid: userID } // Verification de l'existance
    })
    .then(function(userCheck) {
      callback(null, userCheck);
    })
    .catch(function(err) {
      return res.status(400).json({ 'error': 'Impossible de vérifier' });
    });
  },
  function(userCheck, callback){
    if(userCheck != null){
      return res.status(400).json({ 'error': 'Vous avez deja voter' });
    }
    else
    {
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

      // Pour qu'il n'en reste plus q'un :

      if(vote1 == 1){
        vote2 =0;
        vote3 = 0;
        console.log(vote1+""+vote2+""+vote3);
      }
      if(vote2== 1){
        vote1 =0;
        vote3 = 0;
        console.log(vote1+""+vote2+""+vote3);
      }
      if(vote3== 1){
        vote1 =0;
        vote2 = 0;
        console.log(vote1+""+vote2+""+vote3);
      }

      callback(null, callback);
    }},
    function(newVote,callback){

      var CreateVote = models.Vote.create({ 
        userid: userID,
        vote1 : vote1,
        vote2 : vote2,
        vote3 : vote3
      })
      .then(function(VoteCheck) {
        callback(null);
      })
      .catch(function(err) {
        return res.status(400).json({ 'error': 'Impossible de créer' });
      });
    },
    function(callback){
      var VoteCount = models.VoteCount.findOne({
        where: { id: 1 } // Appel des donners déja existante
      })
      .then(function(VoteCount) {
        callback(VoteCount);
      })
      .catch(function(err) {
        return res.status(400).json({ 'error': 'Impossible de récupérer' });
      });
    },
    function(Votecount,callback){
      globalvote1 = 50;
      callback(Votecount);
    },
    function(Votecountval, callback){
      Console.log(globalvote1);
      Votecountval.update({
        vote1: 50,
        vote2: globalvote2,
        vote3: globalvote3
      }).then(function() {
        callback(null,'done');
      }).catch(function(err) {
        res.status(500).json({ 'error': 'Impossible de mettre a jour le compteur ' });
      });
    
    },

    
  ], function (err, result) {
    return res.status(201).json("A voté ! + Ajouter au compteur"+globalvote1);
  });

      
  },
}
