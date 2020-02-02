
// Importations des dépendances
var express      = require('express');
// Lien avec le controlleur d'authentification
var usersCtrl    = require('./routes/usersCtrl');

// Routes de l'API
exports.router = (function() {
  var apiRouter = express.Router();

  // Routes vers les fonctions du controlleur d'authentification
  apiRouter.route('/users/register/').post(usersCtrl.register);
  apiRouter.route('/users/login/').post(usersCtrl.login);
 

  return apiRouter;
})();