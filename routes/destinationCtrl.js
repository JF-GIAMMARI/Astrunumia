// Importations des dépendances
var bcrypt    = require('bcryptjs');
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');


module.exports = {
  avis: function(req, res) {
    
    // Récupération des éléments de requêtes
    var valeur    = req.body.valeur; // SI 1 J'aime, SI 2, j'aime pas
    var idDestination = req.body.iddestination;
    var headerAuth  = req.headers['authorization'];
    var userId = jwtUtils.getUserId(headerAuth);
    var globalaime = 0;
    var globalaimepas =0;
    var recupval =0;

    if(userId < 0){ // Vérification de sécurité
      return res.status(400).json({ 'error': 'Vous devez être connecter pour donner votre avis' });
    }
    // Tests de validité de la saisie
    if (valeur == null || idDestination == null ){
      return res.status(400).json({ 'error': 'Il manque des paramètres ' });
    }

    if (valeur <1 || valeur > 2) {
      valeur = 1;
    }

    asyncLib.waterfall([
        function(callback){ // Check si l'utilisateur a deja emis un avis sur cette destination
            var userCheck = models.DestinationAvisUserList.findOne({
              where: { userid: userId, destinationid : idDestination } 
            })
            .then(function(userCheck) { // Si oui, on récupérer son ancien avis et on le supprime dans la BDD
              if(userCheck != null){
                recupval = userCheck['valeur'];
                console.log(recupval);
                userCheck.destroy(); 
                callback(null);
                
                }else{
                callback(null);
                }
              
            })
            .catch(function(err) {
              return res.status(400).json({ 'error': 'Impossible de vérifier' });
            });
          },
            function(callback){  // On creer un nouvelle avis
        
              var CreateAvis = models.DestinationAvisUserList.create({  
                userid: userId,
                destinationid : idDestination, 
                valeur: valeur,
              })
              .then(function(AvisCheck) {
                callback(null);
              })
              .catch(function(err) {
                return res.status(400).json({ 'error': 'Impossible de créer l\'avis' });
              });
            },
        function(callback){   //On ajoute au compteur de la destination le nouvelle avis
            var avisCount = models.Destination.findOne({
              attributes: ['id','destinationid','aime','aimepas'],
              where: { destinationid : idDestination },
            })
            .then(function(avisCount) {
              
              globalaime = avisCount["aime"];
              globalaimepas = avisCount["aimepas"];
              if(recupval == 0){ // Si la valeur récuperer de l'ancien avis est toujours 0, on ajoute au compteur
              if(valeur == 1){ 
                globalaime += 1 ;
              }else{
                globalaimepas +=1;
              }
              }else{ // Si non la valeur récuperer de l'ancien avis est comparer au nouveau, et un balance est effectuer
                if(recupval == 2 && valeur == 1){
                  globalaime += 1 ;
                  globalaimepas -= 1 ;
                }
                else if(recupval == 1 && valeur == 2){
                  globalaime -= 1 ;
                  globalaimepas += 1 ;
                }else{
                  recupval=0;
                }
                
              }
 
              avisCount.update({ // On insère les nouvelles valeurs
                aime: globalaime,
                aimepas: globalaimepas,
                
              }).then(function() {
                callback(null,'done');
              }).catch(function(err) {
                res.status(500).json({ 'error': 'Impossible de mettre a jour les avis' });
              });
            })
            .catch(function(err) {
              return res.status(400).json({ 'error': 'Destination inexistante' });
            });
          },
      
        ], function (err, result) {
          return res.status(201).json("A donner sont avis");
        });
  },

  commentaire: function(req, res) {
    
    // Récupération des éléments de requêtes
    var valeur    = req.body.valeur; // SI 1 J'aime, SI 2, j'aime pas
    var headerAuth  = req.headers['authorization'];
    var userId = jwtUtils.getUserId(headerAuth);
   
    if(userId < 0){ // Vérification de sécurité
      return res.status(400).json({ 'error': 'Vous devez être connecter pour donner votre avis' });
    }
    // Tests de validité de la saisie
    if (valeur == nul ){
      return res.status(400).json({ 'error': 'Il manque des paramètres ' });
    }


    asyncLib.waterfall([
        function(callback){ //////
        callback(null);
        },/////!

        function(callback){  //////
              callback(null);
        },///////!

        function(callback){  ///////
          callback(null,'done');
        }], ///////!
        
        function (err, result) {
          return res.status(201).json("A commenter");
        });
  },
  }

