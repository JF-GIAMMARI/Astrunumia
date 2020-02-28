//Importations des dépendances
var express = require('express'); 
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;

//Instanciation du serveur web
var server = express();

//EJS
server.set('views', './views')
server.set('view engine','ejs')

// Configuations de Body Parser
server.use(bodyParser.urlencoded({extended:true}));
server.use(bodyParser.json());

//Configuration des routes

//Route Principale
server.get('/', function (req,res){
    res.render('main');
});

//Lien vers les routes de l'API
server.use('/api/', apiRouter); 

// Lancement du serveur port 8080
server.listen(8080,function(){
console.log('Serveur en écoute lol');
});