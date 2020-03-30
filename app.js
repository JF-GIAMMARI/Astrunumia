//Importations des dépendances
var express = require('express'); 
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var apiRouter = require('./apiRouter').router;
const noCache = require('nocache')


//Instanciation du serveur web
var server = express();

//EJS
server.set('views', './views')
server.set('view engine','ejs')

// Configuations de Body Parser
server.use(bodyParser.urlencoded({extended:true}));
server.use(bodyParser.json());
server.use(cookieParser());
server.use(express.static("public"));
server.use('/static', express.static(__dirname + '/public'));
server.use(noCache());

//Configuration des routes

//Route Principale
server.get('/', function (req,res){

    res.render('main');
});

server.get('/accueil', function (req,res){
    var alertcookie = req.cookies.alert;
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    
    res.render('accueil',{
        alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername});
});

server.get('/equipage', function (req,res){
    var alertcookie = req.cookies.alert;
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    
    res.render('equipage',{
        alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername});
});


//Lien vers les routes de l'API
server.use('/', apiRouter); 

server.use(function(req, res, next) {
    return res.status(404).redirect('/accueil');
});

// Lancement du serveur port 8080
server.listen(8080,function(){
console.log('Serveur Astrunumia en écoute (Port 8080)');
});