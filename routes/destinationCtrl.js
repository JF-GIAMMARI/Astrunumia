/*
=================================================================
Modules regroupant les fonctions relative aux destinations
=================================================================
*/

// Importations des dépendances
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');


module.exports = { // Instanciation du module
  getDestination: function (req, res) { // FONCTION de rendu de la page destination/ID

    //Récupération des données
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
    var vuesup = 0;
    var i = 0;

    // Traitement de l'id pour la sélection de la page EJS
    var file = "destination" + id;
    var path = "views/" + file + ".ejs";
    const fs = require("fs");

    if (fs.existsSync(path)) {
      asyncLib.waterfall([ // Suite de fonction asynchrone (Waterfall)

        function (callback) { // Récupération des données liers a l'ID de la destination
          models.Destination.findOne({
            where: { destinationid: id }
          })
            .then(function (AvisCount) {
              getaime = AvisCount["aime"];
              getaimepas = AvisCount["aimepas"];
              getvues = AvisCount["vues"];
              callback(null);
            })
            .catch(function (err) {
              return res.status(400).cookie('alert', 'Erreur Serveur  : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
                .redirect(req.get('referer'));
            });
        },

        function (callback) { // Récupération des commentaires 
          models.Commentaire.findAll({
            attributes: ['userid', 'texte'],
            where: {
              destinationid: id
            }
          })
            .then(function (AvisCount) {// Listing des commentaires  et leurs ID de posteur dans deux tableaux
              while (i != -1) {
                if (AvisCount[i] != undefined) {
                  commentairetab.push(AvisCount[i]['texte']);
                  idtab.push(AvisCount[i]['userid']);
                  i++
                } else {

                  i = -1;
                }
              }
              callback(null);
            })
            .catch(function (err) {
              return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
                .redirect(req.get('referer'));
            });

        },

        function (callback) { // Récupération du nom d'utilisateur liers aux ID du tableau d'ID
          if (idtab[0] == null) {
            callback(null);
          } else {
            for (let i = 0; i != idtab.length; i++) {
              models.User.findOne({
                attributes: ['username'],
                where: { id: idtab[0] }
              }).then(function (GetUsername) {// Conversion ID par Nom d'utilisateur
                nomutilisateurtab.push(GetUsername['username']);

                if (i == idtab.length - 1) {
                  callback(null);
                }
              }).catch(function (err) {
                return res.status(400).cookie('alert', 'Erreur Serveur 1 : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
                  .redirect(req.get('referer'));
              });
            }
          }

        },
        function (callback) { // Ajout d'une vues a la destination
          models.Destination.findOne({
            attributes: ['id', 'destinationid', 'vues'],
            where: { destinationid: id }
          }).then(function (vuesGet) {
            vuesup = vuesGet.vues;
            vuesup++;
            callback(null, vuesGet);
          })
            .catch(function (err) {
              return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
                .redirect(req.get('referer'));
            });
        },

        function (vuesGet, callback) { //  Mise a jour des vues dans la base de donnée
          vuesGet.update({
            vues: vuesup,
          }).then(function () {
            callback(null, 'done');
          }).catch(function (err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
              .redirect(req.get('referer'));
          });

        },

      ], function (err, result) { // Rendu de la page avec l'ensemble des variables EJS
        return res.render(file, { alert: alertcookie, headerico: HeaderIco, headerusername: HeaderUsername, commentaire: commentairetab, utilisateurcom: nomutilisateurtab, id: id, aime: getaime, aimepas: getaimepas, vues: vuesup });
      });
    }
    else {
      return res.redirect('/accueil'); // Si l'ID n'existe pas, redirection vers l'accueil
    }
  },



  avis: function (req, res) { // FONCTION d'ajout d'un avis (J'aime, J'aime Pas)

    // Récupération des éléments de requêtes
    var valeur = req.body.valeur; // SI 1 J'aime, SI 2, j'aime pas
    var idDestination = req.body.idDestination;
    var headerAuth = req.cookies.authorization;
    var userId = jwtUtils.getUserId(headerAuth);
    var globalaime = 0;
    var globalaimepas = 0;
    var recupval = 0;

    if (userId < 0) { // Vérification de sécurité
      return res.status(400).cookie('alert', 'Vous devez être connecté pour faire cela', { expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
    }
    // Tests de validité de la saisie
    idDestination = idDestination | 0;
    if (valeur == null || idDestination == null || idDestination == 0) {
      return res.status(400).cookie('alert', 'Il manque des paramétres', { expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
    }
    if (valeur < 1 || valeur > 2) {
      valeur = 1;
    }
    asyncLib.waterfall([ // Suite de fonction asynchrone (Waterfall)
      function (callback) { // Vérification de l'existance d'un avis deja donner par l'utilisateur
        var userCheck = models.DestinationAvisUserList.findOne({
          where: {
            userid: userId,
            destinationid: idDestination
          }
        })
          .then(function (userCheck) { // Si oui, on le supprime de la base de donnée
            if (userCheck != null) {
              recupval = userCheck['valeur'];
              userCheck.destroy();
              callback(null);

            } else {
              callback(null);
            }

          })
          .catch(function (err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
              .redirect(req.get('referer'));
          });
      },
      function (callback) { // Création du nouvel avis

        var CreateAvis = models.DestinationAvisUserList.create({
          userid: userId,
          destinationid: idDestination,
          valeur: valeur,
        })
          .then(function (AvisCheck) {
            callback(null);
          })
          .catch(function (err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
              .redirect(req.get('referer'));
          });
      },
      function (callback) { // Ajout au compteur de la destination le nouvelle avis
        var avisCount = models.Destination.findOne({
          attributes: ['id', 'destinationid', 'aime', 'aimepas'],
          where: {
            destinationid: idDestination
          },
        })
          .then(function (avisCount) {
            globalaime = avisCount["aime"];
            globalaimepas = avisCount["aimepas"];
            if (recupval == 0) { // Si la valeur récuperer de l'ancien avis est toujours 0, on ajoute au compteur
              if (valeur == 1) {
                globalaime += 1;
              } else {
                globalaimepas += 1;
              }
            } else { // Si non la valeur récuperer de l'ancien avis est comparer au nouveau, et une balance est effectué
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

            }).then(function () {
              callback(null, 'done');
            }).catch(function (err) {
              return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
                .redirect(req.get('referer'));
            });
          })
          .catch(function (err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la destination', { expires: new Date(Date.now() + 1000) })
              .redirect(req.get('referer'));
          });
      },

    ], function (err, result) { // Refresh de la page
      return res.redirect(req.get('referer'));
    });
  },

  commentaire: function (req, res) {  // FONCTION des commentaires

    // Récupération des éléments de requêtes
    var texte = req.body.texte;
    var iddestination = req.body.idDestination;
    var headerAuth = req.cookies.authorization;
    var userid = jwtUtils.getUserId(headerAuth);

    if (userid < 0) { // Vérification de sécurité
      return res.status(400).cookie('alert', 'Vous devez être connecté pour faire cela', { expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
    }
    iddestination = iddestination | 0;
    if (texte == null || iddestination == 0 || iddestination == null) {
      return res.status(400).cookie('alert', 'Vous n\'avez rien marquer', { expires: new Date(Date.now() + 1000) })
        .redirect(req.get('referer'));
    }

    asyncLib.waterfall([ // Suite de fonction asynchrone (Waterfall)
      function (callback) { //  Vérification du type d'utilisateur
        models.User.findOne({
          attributes: ['isDonateur'],
          where: { id: userid }
        })
          .then(function (userlevel) {
            if (userlevel['isDonateur'] == 1) {
              callback(null);
            } else {
              return res.status(400).cookie('alert', 'Vous devez avoir le grade suppérieur pour commenter', { expires: new Date(Date.now() + 1000) })
                .redirect(req.get('referer'));
            }
          })
          .catch(function (err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
              .redirect(req.get('referer'));
          });

      },

      function (callback) { //Traitement du texte entrer

        if (texte.match(/<.*?>/)) { // Vérification de l'existance de balise HTML
          return res.status(400).cookie('alert', 'Vous ne pouvez par entrer de HTML dans les commentaires', { expires: new Date(Date.now() + 1000) })
            .redirect(req.get('referer'));
        } else {// Vérification de l'existance de mots interdits
          var motinterdit = ['astrologie', 'fake', 'fakenews', 'pute', 'enculé', 'encule', 'ntm', 'nique', 'enfoiré', 'pédé', 'pd', 'salot', 'mbdtc', 'fu', 'fuck', 'fucker', 'facka', 'maddafacka', 'bitch', 'biatch', 'motherfucker', 'fum', 'ass', 'asshole', 'fucking', 'fdp', 'bite', 'fuckoff', 'fuq', 'fuqa'];

          if (motinterdit.indexOf(texte.toLowerCase()) >= 0) {
            return res.status(400).cookie('alert', 'Vous ne pouvez pas utiliser ce lexique', { expires: new Date(Date.now() + 1000) })
              .redirect(req.get('referer'));

          } else {
            callback(null);
          }
        }
      },

      function (callback) { // Création du commentaire dans la base de donnée
        models.Commentaire.create({
          userid: userid,
          destinationid: iddestination,
          texte: texte,
        })
          .then(function (VoteCheck) {
            callback(null, 'done');
          })
          .catch(function (err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', { expires: new Date(Date.now() + 1000) })
              .redirect(req.get('referer'));
          });
      }
    ],

      function (err, result) { // Refresh de la page
        return res.redirect(req.get('referer'));
      });
  },
}