//Importations des dépendances
var express = require('express'); 
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var apiRouter = require('./apiRouter').router;
const noCache = require('nocache')


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

//Configuration des routes

//Route Principale
app.get('/', function (req,res){
    var cookiestatus = req.cookies.cookiestatus;
    console.log(cookiestatus);
    res.render('main',{
        cookie : cookiestatus});

});

app.get('/accueil', function (req,res){
    var alertcookie = req.cookies.alert;
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    var cookiestatus = req.cookies.cookiestatus;
    
    res.render('accueil',{
        alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername, cookie : cookiestatus});
});

app.get('/equipage', function (req,res){
    var alertcookie = req.cookies.alert;
    var HeaderIco = req.cookies.HeaderIco;
    var HeaderUsername = req.cookies.HeaderUsername;
    
    res.render('equipage',{
        alert : alertcookie,headerico : HeaderIco,headerusername:HeaderUsername});
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