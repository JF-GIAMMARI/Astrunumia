// Importations des dépendances
var jwt = require('jsonwebtoken');
const JWT_SIGN_SECRET = 'xtyugihzdfenjuidazoflekjbcxnazifepvojhjcs';

// Fonction pour les Json Web Token 
module.exports = {
  generateTokenForUser: function(userData) {
    return jwt.sign({
      userId: userData.id,
      isAdmin: userData.isAdmin
    },

    JWT_SIGN_SECRET,
    {
      expiresIn: '2h'
    })
  },
  parseAuthorization: function(authorization) {
    return (authorization != null) ? authorization.replace('Bearer ', '') : null;
  },
  getUserId: function(authorization) {
    var userId = -1;
    var token = module.exports.parseAuthorization(authorization);
    if(token != null) {
      try {
        var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
        if(jwtToken != null)
          userId = jwtToken.userId;
      } catch(err) { }
    }
    return userId;
  }
}