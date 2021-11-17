var express = require('express');
var router = express.Router();
var model = require('./model');


router.post('/', function(req, res, next) {

  const code = req.body.code;
  // If code was not included, return 404
  if (!code) {
      res.sendStatus(404);
      
  } else {
    model.getAccessToken(code, function (token) {
      // If token is valid, send token  
      if (token) {
        // This is the simulated payload from IDme.
        const response = {
          access_token: token,
          token_type: 'bearer',
          expires_in: '300',
          refresh_token: 'not applicable',
          refresh_expires_in: '300123321',
          scope: 'military',
        };
        res.json(response);
      }
        // else send 404 error message as the code was not valid
      else {
        res.sendStatus(400);
      }
    }) 

  }
});
    

module.exports = router;
