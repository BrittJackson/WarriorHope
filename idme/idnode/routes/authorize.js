var express = require('express');
var router = express.Router();
var model = require('./model');
var url = require('url');


router.get('/', function(req, res, next) {

  let params = req.query;
  res.render('authorize', { local : params });
    
});

router.post('/', function(req, res, next) {

  const username = req.body.username;
  const pwd = req.body.password;
  var params = req.query;
  

  // If user login correct, send bearer token back to redirect
  model.getUser(username, pwd, function (result) {
    if (result.username && result.veteran) {
      // If a username was found and person is a veteran, get the bearer token and redirect back to Warrior Hope
      model.getBearerToken(username, function (bearer) {
        url.host = (params.redirect_uri || 'localhost:3000/registration');
        url.query = { code: bearer };
        
        res.redirect('http://' + url.format(url));
      });
      
    } else if (result.username){
      
      // User found, but not a veteran
      res.render('authorize', { local: params, msg: 'User is not a military service member' });
    } else {
      // Else render the login with an error message
      res.render('authorize', { local : params, msg: 'Incorrect username or password' });
    }
  });
});
    

module.exports = router;
