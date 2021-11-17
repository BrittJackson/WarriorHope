var express = require('express');
var router = express.Router();
const socketio = require('socket.io');
var database = require('../../public/js/userDB');

/* GET chat page. */
router.get('/', async function(req, res, next) {
  // If there is a logged in user load page
  if (req.session.loggedin) {

    var userID;
    var subgroupID;

    await database.getUserID(req.cookies.usernameCookie).then(meta => {
      userID = meta;
    });
    await database.getSubgroup(userID).then(meta => {
      subgroupID = meta;
    });

    res.render('chat/chat', { username: req.cookies.usernameCookie, 
                              roomName: subgroupID, 
                              title: 'Live Chat', 
                              loggedin: req.session.loggedin,
                              moderator: req.session.moderator });
  }
  // Not logged in, send to sign-in page
  else {
    return (
        res.render('login/signin', { title: 'Sign-In' })
    );
  }
});

module.exports = router;
