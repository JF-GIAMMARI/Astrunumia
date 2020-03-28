// Importations des dépendances
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');


module.exports = {
  getDestination: function(req, res) {
    var alertcookie = req.cookies.alert;
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    var id = req.params.id;
    var commentairetab = [];
    var idtab = [];
    var nomutilisateurtab = [];
    var getaime = 0;
    var getaimepas = 0;
    var getvues = 0;
    var i = 0;

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
            callback(null);
          })
          .catch(function(err) {
            return res.status(400).cookie('alert', 'Erreur Serveur  : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
            .redirect(req.get('referer'));
          });
        },
        function(callback){ 
         models.Commentaire.findAll({
          attributes: ['userid', 'texte'],
              where: {
                destinationid : id
              }
            })
          .then(function(AvisCount) {// Récupération et listing des commentaires dans un tableau
            while(i != -1){
              if(AvisCount[i] != undefined){
                commentairetab.push(AvisCount[i]['texte']);
                idtab.push(AvisCount[i]['userid']);
                i++
              }else{
                
                i=-1;
              }
            }
            callback(null); 
          })
          .catch(function(err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
            .redirect(req.get('referer'));
          });
          
        },
        function(callback){ 
          if(idtab[0] == null){
            callback(null,'done');
          }else{
            for(let i = 0 ; i != idtab.length; i++){
              models.User.findOne({
                attributes: ['username'],
                where: {id : idtab[0]}
                }).then(function(GetUsername) {// Conversion ID par USERNAME
                  nomutilisateurtab.push(GetUsername['username']);
    
                  if(i == idtab.length-1){
                    callback(null,'done');
                  }
                }).catch(function(err) {
                return res.status(400).cookie('alert', 'Erreur Serveur 1 : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
                .redirect(req.get('referer'));
                });
              }
          }
          
        
           
           
         },
        ], function (err, result) {
          return res.render(file,{alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername,commentaire : commentairetab,utilisateurcom : nomutilisateurtab,id: id, aime : getaime, aimepas : getaimepas,vues : getvues});
        });    
    }
    else{
        return res.redirect('/');
    }
  },



 avis: function(req, res) {
  // Récupération des éléments de requêtes
  var valeur = req.body.valeur; // SI 1 J'aime, SI 2, j'aime pas
  var idDestination = req.body.idDestination;
  var headerAuth  = req.cookies.authorization;
  var userId = jwtUtils.getUserId(headerAuth);
  var globalaime = 0;
  var globalaimepas = 0;
  var recupval = 0;
  
  if (userId < 0) { // Vérification de sécurité
    return res.status(400).cookie('alert', 'Vous devez être connecter pour faire cela', {expires: new Date(Date.now() + 1000) })
    .redirect(req.get('referer'));
  }
  // Tests de validité de la saisie
  idDestination = idDestination | 0;
  if (valeur == null || idDestination == null || idDestination == 0) {
    return res.status(400).cookie('alert', 'Il manque des paramétres', {expires: new Date(Date.now() + 1000) })
    .redirect(req.get('referer'));
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
       userCheck.destroy();
       callback(null);

      } else {
       callback(null);
      }

     })
     .catch(function(err) {
      return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
      .redirect(req.get('referer'));
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
      return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
            .redirect(req.get('referer'));
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
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
      });
     })
     .catch(function(err) {
      return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la destination', {expires: new Date(Date.now() + 1000) })
            .redirect(req.get('referer'));
     });
   },

  ], function(err, result) {
    return res.redirect(req.get('referer'));
  });
 },

 commentaire: function(req, res) {

  // Récupération des éléments de requêtes
  var texte = req.body.texte;
  var iddestination = req.body.idDestination;
  var headerAuth  = req.cookies.authorization;
  var userid = jwtUtils.getUserId(headerAuth);

  if (userid < 0) { // Vérification de sécurité
    return res.status(400).cookie('alert', 'Vous devez être connecter pour faire cela', {expires: new Date(Date.now() + 1000) })
    .redirect(req.get('referer'));
  }
  iddestination = iddestination | 0;
  if (texte == null || iddestination == 0 || iddestination == null) {
    return res.status(400).cookie('alert', 'Vous n\'avez rien marquer', {expires: new Date(Date.now() + 1000) })
    .redirect(req.get('referer'));
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
        return res.status(400).cookie('alert', 'Vous devez avoir le grade suppérieur pour commenter', {expires: new Date(Date.now() + 1000) })
      .redirect(req.get('referer'));
       }

      })
      .catch(function(err) {
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
      });

    }, 

    function(callback) { ////// Traitement du texte
     if (texte.match(/<.*?>/)) {
      return res.status(400).cookie('alert', 'Vous ne pouvez par entrer de HTML dans les commentaires', {expires: new Date(Date.now() + 1000) })
      .redirect(req.get('referer'));
     } else {
      var motinterdit = ['astrologie', 'fake', 'fakenews', 'pute', 'enculé', 'encule', 'ntm', 'nique', 'enfoiré', 'pédé', 'pd', 'salot', 'mbdtc', 'fu', 'fuck', 'fucker', 'facka', 'maddafacka', 'bitch', 'biatch', 'motherfucker', 'fum', 'ass', 'asshole', 'fucking', 'fdp', 'bite', 'fuckoff', 'fuq', 'fuqa'];

      if (motinterdit.indexOf(texte.toLowerCase()) >= 0) {
        return res.status(400).cookie('alert', 'Vous ne pouvez pas utiliser ce lexique', {expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
      } else {
       callback(null);
      }
     }

    }, 

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
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
      });


    }
   ], ///////!

   function(err, result) {
    return res.redirect(req.get('referer'));
   });
 },
}