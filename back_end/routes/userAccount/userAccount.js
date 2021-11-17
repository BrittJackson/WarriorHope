const express = require('express');
var router = express.Router();
const path = require('path');

router.get('/', function(req, res, next) {  
    if (!(req.session.loggedin)) {res.redirect('/signin');}
    else {
        res.render('userAccount/user_account',{
            username: req.cookies.usernameCookie, 
            loggedin: req.session.loggedin, 
            moderator: req.session.moderator
        });
    }
});

router.post('/', function(request, response) {
    var action = request.body.action;
    if (action == 'Change My Password') {
        response.redirect('/changePassword');
    }
    else if (action == 'Change My Email') {
        response.redirect('/changeEmail');
    }
    /*
    else if (action == 'My Post History') {
        response.redirect('/postHistory');
    }
    */
    else if (action == 'Retake Assessment') {
        request.session.retake = true;
        response.redirect('/assessment');
    }
    else if (action == 'Delete') {
        request.session.retake = true;
        response.redirect('/deleteAccount');
    }
    response.end();
});

module.exports = router;