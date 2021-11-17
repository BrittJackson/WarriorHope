const express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
router.use(cookieParser());

let user = require('../../public/js/userDB.js');
let sanitize = require('../../public/js/sanitizeString.js');

router.get('/', function(req, res, next) {   
    res.render('userAccount/request_pwdReset');
});

router.post('/', async function(request, response) {
    try {
        var emailCheck = request.body.email;
        emailCheck = sanitize(emailCheck);
        const email = await user.emailInDB(emailCheck);
        if (email > 0) {
            console.log(`email sent`);
            response.cookie('emailCookie', emailCheck, { httpOnly: true, maxAge: 360000});
            response.redirect('/resetPassword');
        }
        // Email was not found
        else {
            console.log('email not found');
            response.clearCookie('emailCookie');
            response.redirect('/');
        }
    } catch (err) {
        console.log(err.message);
        response.status(500).send("Error");
    }
});

module.exports = router;
