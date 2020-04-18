/*
=================================================================
Fichier principal du serveur NodeJS
=================================================================
*/


//Importations des dépendances (Librairies/Modules)
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var apiRouter = require('./apiRouter').router;
const noCache = require('nocache');
var models = require('./models')
var asyncLib = require('async');



//Instanciation du serveur web
var app = express();

//Définitions de la route principale du Moteur EJS
app.set('views', './views')
app.set('view engine', 'ejs')

// Configuations des dépendances et des modules
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(express.static("public"));
app.use('/static', express.static(__dirname + '/public'));
app.use(noCache());

//*******************Configuration des routes**********************//


app.get('/', function (req, res) { // Route Initial -> Initialisation des cookies de vote (Barre Latérale)

  var cookiestatus = req.cookies.cookiestatus;
  var vote = 0;
  var VoteActif = true;
  var idvoteencour = 0;
  var getvote1 = 0;
  var getvote2 = 0;
  var getvote3 = 0;

  asyncLib.waterfall([  // Suite de fonction asynchrone (Waterfall)

    function (callback) { // Récupération de la dernière session de vote (LastID)
      models.VoteCount.findAll({
        limit: 1,
        order: [['createdAt', 'DESC']]
      }).then(function (LastId) {

        if (LastId[0] == undefined) {
          VoteActif = false;
        }
        else {
          idvoteencour = LastId[0].id;
        }
        callback(null);
      });

    },
    function (callback) { // Récupération des valeurs de la session de vote
      if (VoteActif == true) {
        models.VoteCount.findOne({
          where: { id: idvoteencour } 
        })
          .then(function (VoteCount) {
            getvote1 = VoteCount["vote1"];
            getvote2 = VoteCount["vote2"];
            getvote3 = VoteCount["vote3"];
            callback(null, 'done');
          })
          .catch(function (err) {
            console.log(err);
            return;
          });
      }
      else {
        callback(null, 'done');
      }
    },

  ], function (err, result) { // Créations des cookies regroupant les valeurs respectif des votes

    vote = [getvote1, getvote2, getvote3];
    var votesomme = vote[0] + vote[1] + vote[2];
    vote[0] = (100 * getvote1) / votesomme;
    vote[1] = (100 * getvote2) / votesomme;
    vote[2] = (100 * getvote3) / votesomme;
    res.clearCookie('vote1nbr');
    res.cookie('vote1nbr', vote[0], { expires: new Date(Date.now() + 1 * 3600000) });
    res.clearCookie('vote2nbr');
    res.cookie('vote2nbr', vote[1], { expires: new Date(Date.now() + 1 * 3600000) });
    res.clearCookie('vote3nbr');
    res.cookie('vote3nbr', vote[2], { expires: new Date(Date.now() + 1 * 3600000) });

    return res.render('main', { cookie: cookiestatus }); // Rendu de la page MAIN
  });
});

app.get('/accueil', function (req, res) { // Route de l'accueil

  var alertcookie = req.cookies.alert; // Récupérations de l'ensemble des cookies nécéssaire
  var HeaderIco = req.cookies.HeaderIco;
  var HeaderUsername = req.cookies.HeaderUsername;
  var cookiestatus = req.cookies.cookiestatus;
  var votecookie1 = req.cookies.vote1nbr;
  var votecookie2 = req.cookies.vote2nbr;
  var votecookie3 = req.cookies.vote3nbr;

  // Rendu de la page Accueil avec les variables EJS
  res.render('accueil', {alert: alertcookie, headerico: HeaderIco, headerusername: HeaderUsername, cookie: cookiestatus,vote1: votecookie1, vote2: votecookie2, vote3: votecookie3});
});

app.get('/equipage', function (req, res) { // Route de la page équipage

  var alertcookie = req.cookies.alert; // Récupérations de l'ensemble des cookies nécéssaire
  var HeaderIco = req.cookies.HeaderIco;
  var HeaderUsername = req.cookies.HeaderUsername;
  var votecookie1 = req.cookies.vote1nbr;
  var votecookie2 = req.cookies.vote2nbr;
  var votecookie3 = req.cookies.vote3nbr;

  // Rendu de la page Accueil avec les variables EJS
  res.render('equipage', {alert: alertcookie, headerico: HeaderIco, headerusername: HeaderUsername,vote1: votecookie1, vote2: votecookie2, vote3: votecookie3});
});

app.get('/credits', function (req, res) { // Route de la page crédits
// Récupérations de l'ensemble des cookies nécéssaire
  var HeaderIco = req.cookies.HeaderIco;
  var HeaderUsername = req.cookies.HeaderUsername;
  // Rendu de la page  avec les variables EJS
  res.render('credits', {headerico: HeaderIco, headerusername: HeaderUsername});
});

app.use('/', apiRouter); // Appelle du routeur regroupant l'ensemble des routes de l'API


app.use(function (req, res, next) {   // Route par défaut en cas d'erreur 404
  return res.status(404).redirect('/accueil');
});

/* MAINTENACE
app.get('/', function (req, res) { // Route de la page crédits
  // Récupérations de l'ensemble des cookies nécéssaire
    res.render('build');
  });
  app.use(function (req, res, next) {   // Route par défaut en cas d'erreur 404
  return res.status(404).redirect('/');
});*/ 

// Lancement du serveur [Port 8080]
app.listen(8080, function () {
  console.log('Serveur Astrunumia en écoute');
});