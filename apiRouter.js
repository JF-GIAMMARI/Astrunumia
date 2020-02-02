
//Imports 
var express = require('express');
var usersCtrl = require('./routes/usersCtrl');

//Définitions du Routeur
exports.router = (function(){
    var apiRouter = express.Router();


// Systéme d'authentification avec assignation des routes
    apiRouter.route('users/register/').post(usersCtrl.register);
    apiRouter.route('users/login/').post(usersCtrl.login);

    return apiRouter;

})();