//Importations
var express = require('express');

//Instanciation du serveur

var server = express(); // La variable serveur est de type Express();

//Configuration des routes

server.get('/', function (req,res){
    res.setHeader('Content-Type','text/html');
    res.status(200).send('<h1>Bienvenue sur Astrunumia</h1>');

});


// Lancement du serveur 
server.listen(8080,function(){
console.log('Serveur en écoute :)');
});