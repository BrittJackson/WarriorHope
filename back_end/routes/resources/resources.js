const express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  if(req.session.loggedin) {
    res.render('resources/user_resources', {
      username: req.cookies.usernameCookie, 
      loggedin: req.session.loggedin, 
      moderator: req.session.moderator
    });
  }
  else {
    res.render('resources/user_resources');
  }
  
});

module.exports = router;
