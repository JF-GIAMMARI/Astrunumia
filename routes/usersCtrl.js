// Controlleurs MVC
// Importations
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var models = require('..models');

//Routes
module.exports={
    // Fonction cible de l'inscription
    register: function(req, res){ 

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
    
        if (email == null || username == null || password == null){
            return res.status(400).json({'error':'missing parameters'});
        }





    },





// Fonction cible de la connexion
    login: function(req, res){
 
        
    }
}