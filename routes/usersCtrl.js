// Importations des dépendances
var bcrypt    = require('bcryptjs');
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');

// Constantes REGEX
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{5,20}$/;

// Fonctions d'autentification
module.exports = {
  register: function(req, res) {
    
    // Récupération des éléments de requêtes
    var email    = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    // Tests de validité de la saisie
    // Vérification de l'existance de la saisie
    if (email == null || username == null || password == null) {
      return res.status(400).json({ 'error': 'Il manque des paramètres ' });
    }

    // Vérification de la taille du nom d'utilisateur ( 4-13 )
    if (username.length >= 13 || username.length <= 4) {
      return res.status(400).json({ 'error': 'Nom utilisateur invalide' });
    }

    //Comparaison aux contraintes REGEX des saisies importantes
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ 'error': 'Email invalide' });
    }
    
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ 'error': 'Mot de passe invalide (1 Minuscule, 1 Majuscule, 1 Chiffre, 1 Caractére spécial, > 5 caractère' });
    }

    // Waterfall de promesse pour vérification des éléments avec le model (BDD)
    asyncLib.waterfall([

      function(done) {
        models.User.findOne({ // Test de l'existance de l'email dans la base de donnée
          attributes: ['email'],
          where: { email: email }
        })

        .then(function(userFound) {
          done(null, userFound); // Fonction de callback du waterfall et transmission de la variable
        })

        .catch(function(err) {
          return res.status(500).json({ 'error': 'Impossible de vérifier'});
        });
      },

      // Hashage du mot de passe saisie
      function(userFound, done) {
        if (!userFound) {
          bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
            done(null, userFound, bcryptedPassword); 
          });
        } else {
          return res.status(409).json({ 'error': 'Utilisateur deja existant' });
        }
      },

      // Création de l'utilisateur avec valeurs par défault et saise
      function(userFound, bcryptedPassword, done) {
        var newUser = models.User.create({ 
          email: email,
          username: username,
          password: bcryptedPassword,
          isDonateur: 0,
          isAdmin: 0,
          isSub: 0,
          iconNumber: 1
        })
        .then(function(newUser) {
          done(newUser); // Call Back final du Waterfall
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'Impossible de creer' });
        });
      }


    ], 
    
    //Fonction retour et validation de la création
    function(newUser) {
      if (newUser) {
        return res.status(201).json({
          'userId': newUser.id
        });
      } else {
        return res.status(500).json({ 'error': 'Impossible de creer' });
      }
    });
  },


// Fonction cible de la connexion
 login: function(req, res) {
    
    // Récupération des éléments de requêtes
    var email    = req.body.email;
    var password = req.body.password;

    // Tests de validité de la saisie
    // Vérification de l'existance de la saisie
    if (email == null ||  password == null) {
      return res.status(400).json({ 'error': 'Il manque des paramètres' });
    }

    // Waterfall de promesse pour vérification des éléments avec le model (BDD)
    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          where: { email: email } // Verification de l'existance de l'email
        })
        .then(function(userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        });
      },

      function(userFound, done) {
        if (userFound) {
          bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
            done(null, userFound, resBycrypt); // Verification du mot de passe
          });

        } else {
          return res.status(404).json({ 'error': 'user not exist in DB' });
        }
      },

      function(userFound, resBycrypt, done) {
        if(resBycrypt) {
          done(userFound);
        } else {
          return res.status(403).json({ 'error': 'invalid password' });
        }
      }


      //Fonction retour et validation de la connexion
    ], function(userFound) {
      if (userFound) {
        return res.render('main',{username : userFound.id,email :jwtUtils.generateTokenForUser(userFound) });
        /*
        return res.status(201).json({
          'userId': userFound.id,
          'token': jwtUtils.generateTokenForUser(userFound)
        });

        */
      } else {
        return res.status(500).json({ 'error': 'Impossible de ce connecter' });
      }
    });
  },
  getUserProfile: function(req, res) {
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0) // Vérification de sécurité
      return res.status(400).json({ 'error': 'wrong token' });

    models.User.findOne({ //Récupération en fonction de l'id présent dans le token
      attributes: [ 'id', 'email', 'username', 'isAdmin','isDonateur','isSub' ],
      where: { id: userId }
    }).then(function(user) {
      if (user) {
        res.status(201).json(user);
      } else {
        res.status(404).json({ 'error': 'Utilisateur inexistant' });
      }
    }).catch(function(err) {
      res.status(500).json({ 'error': 'Acces impossible  '});
    });
  },
  updateUserProfile: function(req, res) {
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var isSub = req.body.isSub;
    var isDonateur = req.body.isDonateur;

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id', 'username', 'email', 'password','isSub', 'isDonateur'],
          where: { id: userId }
        }).then(function (userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'Impossible de vérifier l\'utilisateur' });
        });
      },
      function(userFound, done) {
        if(userFound) {

          if(username){
            if (username.length >= 13 || username.length <= 4) {
              return res.status(400).json({ 'error': 'Nom utilisateur invalide' });
            }
          }
          
          if(password){
            if (!PASSWORD_REGEX.test(password)) {
              return res.status(400).json({ 'error': 'Mot de passe invalide (1 Minuscule, 1 Majuscule, 1 Chiffre, 1 Caractére spécial, > 5 caractère' });
            }
            var salt = bcrypt.genSaltSync(5); // Salage MDP
            password = bcrypt.hashSync(password, salt);
          }

          if(email){
            if (!EMAIL_REGEX.test(email)) {
              return res.status(400).json({ 'error': 'Email invalide' });
            }
            
          }

          if(isDonateur){
            if (isDonateur != "true" || isDonateur != "false") {
              isDonateur = userFound.isDonateur;
            }
          }

          if(isSub){
            if (isSub != "true" || isSub != "false") {
              isSub = userFound.isSub;
            }
          }

          
          
          userFound.update({
            username: (username ? username : userFound.username),
            email: (email ? email: userFound.email),
            password: ( password ?  password : userFound.password),
            isDonateur: ( isDonateur ? isDonateur : userFound.isDonateur),
            isSub: ( isSub ? isSub : userFound.isSub)
          }).then(function() {
            done(userFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'Impossible de mettre a jour le nom d\'utilisateur' });
          });

        } else {
          res.status(404).json({ 'error': 'Utilisateur inexistant' });
        }
      },
    ], function(userFound) {
      if (userFound) {
        return res.status(201).json(userFound);
      } else {
        return res.status(500).json({ 'error': 'Impossible de mettre a jour le nom d\'utilisateur' });
      }
    });
  }
}
