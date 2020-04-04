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

  getUserProfile: function(req, res) {
    var headerAuth  = req.cookies.authorization;
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    var alertcookie = req.cookies.alert;
    var userId      = jwtUtils.getUserId(headerAuth);
    
    if (userId < 0) // Vérification de sécurité
    return res.status(400).redirect(301, '/accueil');

    models.User.findOne({ //Récupération en fonction de l'id présent dans le token
      attributes: [ 'id', 'email', 'username', 'isAdmin','isDonateur','isSub','iconNumber' ],
      where: { id: userId }
    }).then(function(user) {
      if (user) {
        return res.render('profile',{alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername,username : user.username,email : user.email,isSub : user.isSub,isDonateur : user.isDonateur});
      } else {
        return res.status(400).redirect(301, '/passager/authentification');
      }
    }).catch(function(err) {
      return res.status(400).cookie('alert', 'Erreur Serveur : Impossible de trouver votre profile', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/profile');
    });
  },

  register: function(req, res) {
    
    // Récupération des éléments de requêtes
    var email    = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    // Tests de validité de la saisie
    // Vérification de l'existance de la saisie
    if (email == null || username == null || password == null) {
      return res.status(400).cookie('alert', 'Il manque des paramétres', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/enregistrement');
    }

    // Vérification de la taille du nom d'utilisateur ( 4-13 )
    if (username.length >= 13 || username.length <= 4) {
      return res.status(400).cookie('alert', 'Le nom d\'utilisateur est invalide ( Entre 4 et 13 charactéres)', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/enregistrement');
    }

    //Comparaison aux contraintes REGEX des saisies importantes
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).cookie('alert', 'L\'email est invalide', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/enregistrement');
    }
    
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).cookie('alert', 'Le mot de passe est invalide (1 Minuscule, 1 Majuscule, 1 Chiffre, 1 Caractére spécial)', {expires: new Date(Date.now() + 1000) })
      .redirect(301, '/passager/enregistrement');
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
          return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/enregistrement');
        });
      },

      // Hashage du mot de passe saisie
      function(userFound, done) {
        if (!userFound) { 
          bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
            done(null, userFound, bcryptedPassword); 
          });
        } else {
          return res.status(400).cookie('alert', 'Vous êtes deja enregistrer sur ce vaisseau', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/authentification');
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
          return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/enregistrement');
        });
      }


    ], 
    
    //Fonction retour et validation de la création
    function(newUser) {
      if (newUser) {
        return res.redirect(301, 'authentification');
      } else {
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible de creer votre profile', {expires: new Date(Date.now() + 1000) })
        .redirect(301, '/passager/enregistrement');
      }
    });
  },


// Fonction cible de la connexion
 login: function(req, res) {
    
    // Récupération des éléments de requêtes
    var alertcookie = req.cookies.alert;
    var email    = req.body.email;
    var password = req.body.password;

    // Tests de validité de la saisie
    // Vérification de l'existance de la saisie
    if (email == null ||  password == null) {
      return res.status(400).cookie('alert', 'Il manque des paramétres', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/authentification');
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
          return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/authentification');
        });
      },

      function(userFound, done) {
        if (userFound) {
          bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
            done(null, userFound, resBycrypt); // Verification du mot de passe
          });

        } else {
          return res.status(400).cookie('alert', 'Vous ne faite pas parti du vaisseau, enregistrer vous si vous le shouaitez', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/enregistrement');
        }
      },

      function(userFound, resBycrypt, done) {
        if(resBycrypt) {
          done(userFound);
        } else {
          return res.status(400).cookie('alert', 'Mauvais mot de passe', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/authentification');
        }
      }


      //Fonction retour et validation de la connexion
    ], function(userFound) {
      if (userFound) {
        
        var img = "";
        if(userFound.isDonateur == false){
          img = "<img class='nonIcoDonateur' src='/img/profileico/"+userFound.iconNumber+".png' alt='Icone' > ";
        }
        if(userFound.isDonateur == true){
          img = "<img class='ouiIcoDonateur' src='/img/profileico/"+userFound.iconNumber+".png' alt='Icone' > ";
        }
        console.log(img);
        
        res.cookie('HeaderIco', img, {expires: new Date(Date.now() + 1 * 3600000) });
        res.cookie('HeaderUsername', userFound.username, {expires: new Date(Date.now() + 1 * 3600000) });

        return res
        .status(201)
        .cookie('authorization', 'Bearer ' + jwtUtils.generateTokenForUser(userFound), {expires: new Date(Date.now() + 1 * 3600000) })
        .redirect(301, 'profile');
        
       } else {
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible de creer votre session', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/authentification');
      }
    });
  },


  


  /////////// MISE A JOUR DU PROFILE
  updateUserProfile: function(req, res) {
    var headerAuth  = req.cookies.authorization;
    var userId      = jwtUtils.getUserId(headerAuth);
    var username = req.body.username;
    var iconNumber = req.body.iconeNumber;
    var email = req.body.email;
    var password = req.body.password;
    var isSub = req.body.isSub;
    var isDonateur = req.body.isDonateur;
    if (userId < 0) // Vérification de sécurité
       return res.status(400).redirect(301, '/accueil');
      
    


    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id', 'username', 'email', 'password','isSub', 'isDonateur','iconNumber'],
          where: { id: userId }
        }).then(function (userFound) {
         
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
        });
      },
      function(userFound, done) {
        if(userFound) {

          if(username){
            if (username.length >= 13 || username.length <= 4) {
              return res.status(400).cookie('alert', 'Nom utilisateur invalide', {expires: new Date(Date.now() + 1000) })
              .redirect(301, '/passager/profile');
            }
          }
          
          if(password){
            if (!PASSWORD_REGEX.test(password)) {
              return res.status(400).cookie('alert', 'Le mot de passe est invalide (1 Minuscule, 1 Majuscule, 1 Chiffre, 1 Caractére spécial)', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
 }
            var salt = bcrypt.genSaltSync(5); // Salage MDP
            password = bcrypt.hashSync(password, salt);
          }

          if(email){
            if (!EMAIL_REGEX.test(email)) {
              return res.status(400).cookie('alert', 'L\'email est invalide', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
            }
            
          }

          if(!iconNumber){
            iconNumber = userFound.iconNumber;
          }
          if(iconNumber == 0){
            iconNumber = userFound.iconNumber;
          }
          console.log("ICONNNE"+iconNumber);
          if(isSub == 'on'){
            isSub = true;
          }
          else if(isSub == undefined){
            isSub = false;
          }

          

          userFound.update({
            username: (username ? username : userFound.username),
            email: (email ? email: userFound.email),
            password: ( password ?  password : userFound.password),
            isSub: isSub,
            iconNumber : iconNumber
            
          }).then(function() {
            done(userFound);
          }).catch(function(err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
          });

        } else {
          return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
        }
      },
    ], function(userFound) {
      if (userFound) {
        var img = "";
        if(userFound.isDonateur == false){
          img = "<img class='nonIcoDonateur' src='/img/profileico/"+iconNumber+".png' alt='Icone' > ";
        }
        if(userFound.isDonateur == true){
          img = "<img class='ouiIcoDonateur' src='/img/profileico/"+iconNumber+".png' alt='Icone' > ";
        }
        console.log(img);
        res.clearCookie('HeaderIco');
        res.clearCookie('HeaderUsername');
        res.cookie('HeaderIco', img, {expires: new Date(Date.now() + 1 * 3600000) });
        res.cookie('HeaderUsername', userFound.username, {expires: new Date(Date.now() + 1 * 3600000) });
        return res.redirect(301, '/passager/profile');
      } else {
        
        return res.status(400).cookie('alert', 'Erreur Serveur : Impossible de mettre a jour l\'utilisateur', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
      }
    });
  },

  gradeup: function(req, res) {
    var headerAuth  = req.cookies.authorization;
    var userId      = jwtUtils.getUserId(headerAuth);
    var valeur = true;
    if (userId < 0) // Vérification de sécurité
       return res.status(400).redirect(301, '/accueil');

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id','isDonateur'],
          where: { id: userId }
        }).then(function (userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(400).cookie('alert', 'Erreur Serveur 1 : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
        });
      },
      function(userFound, done) {
        if(userFound) {
          if(userFound.isDonateur == true){
            valeur = false;
          }else{
            valeur = true;
          }
          userFound.update({
            isDonateur : valeur
          }).then(function() {
            done(null, 'done');
          }).catch(function(err) {
            return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
          });

        } else {
          return res.status(400).cookie('alert', 'Erreur Serveur : Impossible d\'accéder à la base de donnée', {expires: new Date(Date.now() + 1000) })
          .redirect(301, '/passager/profile');
        }
      },
    ], function (err, result) {
      return res.status(400).redirect(301, '/passager/profile');
    });
  },

  leaveUser: function(req, res) {
    res.clearCookie('authorization');
    res.clearCookie('HeaderIco');
    res.clearCookie('HeaderUsername');
    return res.redirect(301, '/accueil');
  },

  autoconnectlogin: function(req, res) {
    var headerAuth  = req.cookies.authorization;
    var userId      = jwtUtils.getUserId(headerAuth);
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;

    var alertcookie = req.cookies.alert;
    if (userId > 0){ // Vérification de sécurité
      return res.status(301).redirect(301, '/passager/profile');
    }else{
      return res.render('connexion',{alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername});
    }
  },
  autoconnectregister: function(req, res) {
    var headerAuth  = req.cookies.authorization;
    var userId      = jwtUtils.getUserId(headerAuth);
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    var alertcookie = req.cookies.alert;
    if (userId > 0){ // Vérification de sécurité
      return res.status(301).redirect(301, '/passager/profile');
    }else{
      return res.render('inscription',{alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername});
    }
  },
  okcookie: function(req, res) {
    res.clearCookie('cookiestatus');
    res.cookie('cookiestatus', 'oui', {expires: new Date(Date.now() + 2 * 3600000) });
    return res.status(301).redirect(req.get('referer'));
  },
}
