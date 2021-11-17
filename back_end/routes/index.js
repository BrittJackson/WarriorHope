var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
let user = require('../public/js/userDB.js');

/* GET home page. */
router.get('/', async function(req, res, next) {
  if (req.session.loggedin) {
    //console.log(req.session.loggedin);
    const account = await user.getUser(req.cookies.usernameCookie);
    console.log(account[0].subgroupID)
    if(account[0].subgroupID) {
      res.render('userAccount/user_landing', { 
        username: req.cookies.usernameCookie, 
        title: 'Home', 
        loggedin: req.session.loggedin, 
        inGroup: true,
        moderator: req.session.moderator
      });
    }
    else {
      res.render('userAccount/user_landing', { 
        username: req.cookies.usernameCookie, 
        title: 'Home', 
        loggedin: req.session.loggedin , 
        inGroup: false,
        moderator: req.session.moderator});
    }
  }
  else {
    res.render('index', { title: 'Welcome' });
  }
});

router.post('/', async function(request, response, next) {
  try {
    var username = request.cookies.usernameCookie;
    var action = request.body.action;
    // console.log(action);
    if (action == 'Groups') {
      // TODO: Change to group page when created.
          const account = await user.getUser(username);

          var group = [`Group${account[0].subgroupID}`]; // Uses group
          
          console.log(account[0].moderator);
          if (account[0].moderator == 1) {
            group.push('Global Moderators')
          }
          var token = jwt.sign({
              id: account[0].userID,
              username: account[0].username,
              groups: group
          },'mqQKqBZmd57xS6B', {expiresIn:86400});
          response.cookie('token', token, {httpOnly:true});
          response.redirect('http://411crystal.cpi.cs.odu.edu:4567');  
    }   
    else if (action == 'Resources') {
      response.redirect('/resources');
    }
    else if (action == 'Assessment') {
      response.redirect('/assessment')
    }
  } catch(err) {
    console.log(err);
    response.redirect('/');
  }
});

module.exports = router;
