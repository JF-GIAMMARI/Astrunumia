
// Importations des dépendances
var express = require('express');
// Lien avec le controlleur d'authentification
var usersCtrl = require('./routes/usersCtrl');
var voteCtrl = require('./routes/voteCtrl');
var destCtrl = require('./routes/destinationCtrl');

// Routes de l'API
exports.router = (function() {
  var apiRouter = express.Router();

  // Routes des authentification
  apiRouter.route('/passager/enregistrement').post(usersCtrl.register);
  apiRouter.route('/passager/authentification').post(usersCtrl.login);
  apiRouter.route('/passager/enregistrement').get(usersCtrl.autoconnectregister);
  apiRouter.route('/passager/authentification').get(usersCtrl.autoconnectlogin);
  
  // Routes des profiles utilisateur
  apiRouter.route('/passager/profile').get(usersCtrl.getUserProfile);
  apiRouter.route('/passager/profile/update').post(usersCtrl.updateUserProfile);
  apiRouter.route('/passager/deconnexion').post(usersCtrl.leaveUser);
  apiRouter.route('/passager/gradeup').post(usersCtrl.gradeup);
  
// Routes des votes
  apiRouter.route('/passager/vote').post(voteCtrl.updateVote);
  apiRouter.route('/passager/vote').get(voteCtrl.getVote);

// Routes des destination
  apiRouter.route('/destinations/avis').post(destCtrl.avis);
  apiRouter.route('/destinations/commentaire').post(destCtrl.commentaire);
  apiRouter.route('/destinations/:id').get(destCtrl.getDestination);
  
// Demande Cookie 
  apiRouter.route('/cookie').get(usersCtrl.okcookie);

  return apiRouter;
})();

