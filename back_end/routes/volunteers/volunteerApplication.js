const express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    if (req.session.loggedin)
        res.render('volunteers/volunteerApplication', {        
            username: req.cookies.usernameCookie, 
            loggedin: req.session.loggedin, 
            moderator: req.session.moderator
        });
    else
        res.render('volunteers/volunteerApplication');
});

router.post('/', function(req, res) {
    if (req.session.loggedin)
        res.render('volunteers/volunteerSubmission', {
            username: req.cookies.usernameCookie, 
            loggedin: req.session.loggedin, 
            moderator: req.session.moderator
        });
    else
        res.render('volunteers/volunteerSubmission');
});

module.exports = router;
