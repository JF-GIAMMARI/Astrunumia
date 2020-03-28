// Importations des dépendances
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');
const idvoteencour = 1; ////////// A MODIFIER PAR SESSION DE VOTE

module.exports = {
  getVote: function(req, res) {
    var alertcookie = req.cookies.alert;
    var getvote1 = 0;
    var getvote2 = 0;
    var getvote3 = 0;
    asyncLib.waterfall([
      function(callback){
        models.VoteCount.findOne({
          where: { id : idvoteencour} // Verification des doublons
        })
        .then(function(VoteCount) {
          getvote1 = VoteCount["vote1"];
          getvote2 = VoteCount["vote2"];
          getvote3 = VoteCount["vote3"];
          callback(null, 'done');
        })
        .catch(function(err) {
          return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/vote');
        });
      },
    
      ], function (err, result) {
        return res.render('vote',{alert : alertcookie, vote1 : getvote1, vote2 : getvote2, vote3 : getvote3});
      });
    
  },
  updateVote: function(req, res) {
    var headerAuth  = req.cookies.authorization;
    var userID = jwtUtils.getUserId(headerAuth);
    var vote1 = req.body.vote1;
    var vote2 = req.body.vote2;
    var vote3 = req.body.vote3;
    var globalvote1 = 0;
    var globalvote2 = 0;
    var globalvote3 = 0;
    var supp = false;

    if (userID < 0){ // Vérification de la connection
      return res.status(400).cookie('alert', 'Vous devez être connecter pour voter', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/vote');
   }

    if (vote1 == null || vote2== null || vote3 == null ) { // Vérification des paramétres
      return res.status(400).cookie('alert', 'Il manque des paramétres', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/vote');
    }


asyncLib.waterfall([
  function(callback) { ////// Vérification du type d'utilisateur
     models.User.findOne({
       attributes: ['isDonateur'],
       where: {
        id: userID
       }
      })
      .then(function(userlevel) {
       if (userlevel['isDonateur'] == 1) {
        supp == true;
       } else {
        supp == false
       }
       callback(null);
      })
      .catch(function(err) {
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
      });

    }, 
  function(callback){
    models.Vote.findOne({
      where: { userid: userID } // Verification des doublons
    })
    .then(function(userCheck) {
      callback(null, userCheck);
    })
    .catch(function(err) {
      return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/vote');
    });
  },
  function(userCheck, callback){
    if(userCheck != null){
      return res.status(400).cookie('alert', 'Vous avez deja voter pour cette session de vote', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/vote');
    }
    else
    {
      
      vote1 = vote1 | 0; // Traitement de type
      vote2 = vote2 | 0;
      vote3 = vote3 | 0;
      if (vote1 > 1 || vote1 < 0 ) { //T raitement de Valeur
        vote1 = 0;
      }
      if (vote2 > 1 || vote2 < 0 ) {
        vote2 = 0;
      }
      if (vote3 > 1 || vote3 < 0 ) {
        vote3 = 0;
      }

      if(vote1 == 1){   // Traitement des doublons
        vote2 =0;
        vote3 = 0;
      }
      if(vote2== 1){
        vote1 =0;
        vote3 = 0;
      }
      if(vote3== 1){
        vote1 =0;
        vote2 = 0;
      }

      callback(null, callback);
    }},
    function(newVote,callback){

      var CreateVote = models.Vote.create({  //Archivage du vote par utilisateur
        userid: userID,
        vote1 : vote1,
        vote2 : vote2,
        vote3 : vote3
      })
      .then(function(VoteCheck) {
        callback(null);
      })
      .catch(function(err) {
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
        .redirect(301, '/passager/vote');
      });
    },
    function(callback){    // Ajout des votes dans les compteur
      var VoteCount = models.VoteCount.findOne({
        where: { id: 1 } 
      })
      .then(function(VoteCount) {
        
        globalvote1 = VoteCount["vote1"];
        globalvote2 = VoteCount["vote2"];
        globalvote3 = VoteCount["vote3"];

        /// Traitement du x2 donateur
        if(vote1 == 1){
          vote1++;
        }
        if(vote2 == 1){
          vote2++;
        }
        if(vote3 == 1){
          vote3++;
        }


        globalvote1 += vote1;
        globalvote2 += vote2;
        globalvote3 += vote3;
        
        VoteCount.update({
          vote1: globalvote1,
          vote2: globalvote2,
          vote3: globalvote3
        }).then(function() {
          callback(null,'done');
        }).catch(function(err) {
          return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/vote');
        });
      })
      .catch(function(err) {
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
        .redirect(301, '/passager/vote');
      });
    },

  ], function (err, result) {
    return res.status(400).redirect(301, '/passager/vote');
  });

      
  },

}
