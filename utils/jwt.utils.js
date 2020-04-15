/*
=================================================================
Modules regroupant les fonctions concernant le TOKEN crypté
=================================================================
*/

// Importations des dépendances
var jwt = require('jsonwebtoken');
const JWT_SIGN_SECRET = 'amodifier';

// Fonction pour les Json Web Token 
module.exports = {
  generateTokenForUser: function (userData) {
    return jwt.sign({
      userId: userData.id,
      isAdmin: userData.isAdmin
    },

      JWT_SIGN_SECRET,
      {
        expiresIn: '2h'
      })
  },
  parseAuthorization: function (authorization) {
    return (authorization != null) ? authorization.replace('Bearer ', '') : null;
  },
  getUserId: function (authorization) {
    var userId = -1;
    var token = module.exports.parseAuthorization(authorization); //Importation du module
    if (token != null) {
      try {
        var jwtToken = jwt.verify(token, JWT_SIGN_SECRET); //Vérification du Token
        if (jwtToken != null)
          userId = jwtToken.userId; //Récupération de l'ID pour traitement
      } catch (err) { }
    }
    return userId;
  }
}