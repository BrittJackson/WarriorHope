var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  req.session.destroy(); // clear all session data
  // remove cookie
  res.clearCookie('token')
  res.clearCookie('usernameCookie'); 
  res.render('index', { title: 'Home' });
});

module.exports = router;
