//Importations
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;


//Instanciation du serveur
var server = express();

// Configuations Body Parser
server.use(bodyParser.urlencoded({extended:true}));
server.use(bodyParser.json());

//Configuration des routes
server.get('/', function (req,res){
    res.setHeader('Content-Type','text/html');
    res.status(200).send('<h1>Bienvenue sur Astrunumia</h1>');
});


//Lien avec le routeur de l'API
server.use('/api/', apiRouter); 

// Lancement du serveur 
server.listen(8080,function(){
console.log('Serveur en écoute :)');
});