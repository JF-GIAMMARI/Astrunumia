//Importations des dépendances
var express = require('express'); 
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var apiRouter = require('./apiRouter').router;
const noCache = require('nocache');
var models    = require('./models')
var asyncLib  = require('async');


//Instanciation du serveur web
var app = express();

//EJS
app.set('views', './views')
app.set('view engine','ejs')

// Configuations de Body Parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use('/static', express.static(__dirname + '/public'));
app.use(noCache());
var asyncLib  = require('async');

//Configuration des routes

//Route Principale
app.get('/', function (req,res){
    var cookiestatus = req.cookies.cookiestatus;
    var vote = 0;
    var VoteActif = true;
    var idvoteencour = 0;
    var getvote1 = 0;
    var getvote2 = 0;
    var getvote3 = 0;

    asyncLib.waterfall([
        function(callback){
         models.VoteCount.findAll({
              limit: 1,
              order: [ [ 'createdAt', 'DESC' ]]
            }).then(function(LastId){
              
              if(LastId[0] == undefined)
              {
                VoteActif = false;
              }
              else{
                idvoteencour = LastId[0].id;
              }
              callback(null);
            });
            
          },
          function(callback){
            if(VoteActif == true){
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
                console.log(err);
              return;
            });}
            else{
              callback(null, 'done');
            }
          },
        
          ], function (err, result) { //Créations des cookie pour affichage des vote

            vote = [getvote1, getvote2,getvote3];
            var votesomme = vote[0]+vote[1]+vote[2];
            vote[0] = (100*getvote1)/votesomme;
            vote[1] = (100*getvote2)/votesomme;
            vote[2] = (100*getvote3)/votesomme;
            res.clearCookie('vote1nbr');
            res.cookie('vote1nbr', vote[0], {expires: new Date(Date.now() + 1 * 3600000) });
            res.clearCookie('vote2nbr');
            res.cookie('vote2nbr', vote[1], {expires: new Date(Date.now() + 1 * 3600000) });
            res.clearCookie('vote3nbr');
            res.cookie('vote3nbr', vote[2], {expires: new Date(Date.now() + 1 * 3600000) });
            return res.render('main',{cookie : cookiestatus});
    });
});

app.get('/accueil', function (req,res){
    var alertcookie = req.cookies.alert;
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    var cookiestatus = req.cookies.cookiestatus;
    var votecookie1 = req.cookies.vote1nbr;
    var votecookie2 = req.cookies.vote2nbr;
    var votecookie3 = req.cookies.vote3nbr;
    
    res.render('accueil',{
        alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername, cookie : cookiestatus,
        vote1 : votecookie1,vote2 : votecookie2,vote3 : votecookie3});
});

app.get('/equipage', function (req,res){
    var alertcookie = req.cookies.alert;
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    var votecookie1 = req.cookies.vote1nbr;
    var votecookie2 = req.cookies.vote2nbr;
    var votecookie3 = req.cookies.vote3nbr;
    
    res.render('equipage',{
        alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername,
        vote1 : votecookie1,vote2 : votecookie2,vote3 : votecookie3});
});


//Lien vers les routes de l'API
app.use('/', apiRouter); 

app.use(function(req, res, next) {
    return res.status(404).redirect('/accueil');
});

// Lancement du serveur port 8080
app.listen(8080,function(){
console.log('Serveur Astrunumia en écoute (Port 8080)');
});