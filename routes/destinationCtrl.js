// Importations des dépendances
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');


module.exports = {
  getDestination: function(req, res) {
    var alertcookie = req.cookies.alert;
    var id = req.params.id;

    var getaime = 0;
    var getaimepas = 0;
    var getvues = 0;

    var file = "destination"+id;
    var path = "views/"+file+".ejs";
    const fs = require("fs"); 
    if (fs.existsSync(path)) {
      asyncLib.waterfall([
        function(callback){
          models.Destination.findOne({
            where: { destinationid : id} // Verification des doublons
          })
          .then(function(AvisCount) {
            getaime = AvisCount["aime"];
            getaimepas = AvisCount["aimepas"];
            getvues = AvisCount["vues"];
            callback(null, 'done');
          })
          .catch(function(err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
            .redirect(301, '/passager/vote');
          });
        },
        ], function (err, result) {
          return res.render(file,{alert : alertcookie,id: id, aime : getaime, aimepas : getaimepas,vues : getvues});
        });    
    }
    else{
        return res.redirect('/');
    }
  },



 avis: function(req, res) {

  // Récupération des éléments de requêtes
  var valeur = req.body.valeur; // SI 1 J'aime, SI 2, j'aime pas
  var idDestination = req.body.iddestination;
  var headerAuth  = req.cookies.authorization;
  var userId = jwtUtils.getUserId(headerAuth);
  var globalaime = 0;
  var globalaimepas = 0;
  var recupval = 0;
  
  if (userId < 0) { // Vérification de sécurité
    return res.status(400).redirect(301, '/passager/authentification');
  }
  // Tests de validité de la saisie
  idDestination = idDestination | 0;
  if (valeur == null || idDestination == null || idDestination == 0) {
   return res.status(400).json({
    'error': 'Il manque des paramètres '
   });
  }



  if (valeur < 1 || valeur > 2) {
   valeur = 1;
  }

  asyncLib.waterfall([
   function(callback) { // Check si l'utilisateur a deja emis un avis sur cette destination
    var userCheck = models.DestinationAvisUserList.findOne({
      where: {
       userid: userId,
       destinationid: idDestination
      }
     })
     .then(function(userCheck) { // Si oui, on récupérer son ancien avis et on le supprime dans la BDD
      if (userCheck != null) {
       recupval = userCheck['valeur'];
       console.log(recupval);
       userCheck.destroy();
       callback(null);

      } else {
       callback(null);
      }

     })
     .catch(function(err) {
      return res.status(400).json({
       'error': 'Impossible de vérifier'
      });
     });
   },
   function(callback) { // On creer un nouvelle avis

    var CreateAvis = models.DestinationAvisUserList.create({
      userid: userId,
      destinationid: idDestination,
      valeur: valeur,
     })
     .then(function(AvisCheck) {
      callback(null);
     })
     .catch(function(err) {
      return res.status(400).json({
       'error': 'Impossible de créer l\'avis'
      });
     });
   },
   function(callback) { //On ajoute au compteur de la destination le nouvelle avis
    var avisCount = models.Destination.findOne({
      attributes: ['id', 'destinationid', 'aime', 'aimepas'],
      where: {
       destinationid: idDestination
      },
     })
     .then(function(avisCount) {

      globalaime = avisCount["aime"];
      globalaimepas = avisCount["aimepas"];
      if (recupval == 0) { // Si la valeur récuperer de l'ancien avis est toujours 0, on ajoute au compteur
       if (valeur == 1) {
        globalaime += 1;
       } else {
        globalaimepas += 1;
       }
      } else { // Si non la valeur récuperer de l'ancien avis est comparer au nouveau, et un balance est effectuer
       if (recupval == 2 && valeur == 1) {
        globalaime += 1;
        globalaimepas -= 1;
       } else if (recupval == 1 && valeur == 2) {
        globalaime -= 1;
        globalaimepas += 1;
       } else {
        recupval = 0;
       }

      }

      avisCount.update({ // On insère les nouvelles valeurs
       aime: globalaime,
       aimepas: globalaimepas,

      }).then(function() {
       callback(null, 'done');
      }).catch(function(err) {
       res.status(500).json({
        'error': 'Impossible de mettre a jour les avis'
       });
      });
     })
     .catch(function(err) {
      return res.status(400).json({
       'error': 'Destination inexistante'
      });
     });
   },

  ], function(err, result) {
   return res.status(201).json("A donner sont avis");
  });
 },

 commentaire: function(req, res) {

  // Récupération des éléments de requêtes
  var texte = req.body.texte;
  var iddestination = req.body.iddestination;
  var headerAuth  = req.cookies.authorization;
  var userid = jwtUtils.getUserId(headerAuth);

  if (userid < 0) { // Vérification de sécurité
    return res.status(400).redirect(301, '/passager/authentification');
  }
  iddestination = iddestination | 0;
  if (texte == null || iddestination == 0 || iddestination == null) {
   return res.status(400).json({
    'error': 'Il manque des paramètres '
   });
  }

  asyncLib.waterfall([
    function(callback) { ////// Vérification du type d'utilisateur
     models.User.findOne({
       attributes: ['isDonateur'],
       where: {
        id: userid
       }
      })
      .then(function(userlevel) {
       if (userlevel['isDonateur'] == 1) {
        callback(null);
       } else {
        return res.status(500).json({
         'error': 'Vous n\'avez pas le grade pour commenter'
        });
       }

      })
      .catch(function(err) {
       return res.status(500).json({
        'error': 'Impossible de vérifier'
       });
      });

    }, /////!

    function(callback) { ////// Traitement du texte
     if (texte.match(/<.*?>/)) {

      return res.status(500).json({
       'error': 'Tu essaie de faire quelque chose en particulier ?'
      });
     } else {
      var motinterdit = ['astrologie', 'fake', 'fakenews', 'pute', 'enculé', 'encule', 'ntm', 'nique', 'enfoiré', 'pédé', 'pd', 'salot', 'mbdtc', 'fu', 'fuck', 'fucker', 'facka', 'maddafacka', 'bitch', 'biatch', 'motherfucker', 'fum', 'ass', 'asshole', 'fucking', 'fdp', 'bite', 'fuckoff', 'fuq', 'fuqa'];

      if (motinterdit.indexOf(texte.toLowerCase()) >= 0) {
       return res.status(500).json({
        'error': 'Texte inaproprier'
       });
      } else {
       callback(null);
      }
     }

    }, ///////!

    function(callback) { /////// Création dans la base de donner

     models.Commentaire.create({ //Archivage du vote par utilisateur
       userid: userid,
       destinationid: iddestination,
       texte: texte,
      })
      .then(function(VoteCheck) {
       callback(null, 'done');
      })
      .catch(function(err) {
       return res.status(400).json({
        'error': 'Impossible de créer'
       });
      });


    }
   ], ///////!

   function(err, result) {
    return res.status(201).json("A Commenté");
   });
 },
}