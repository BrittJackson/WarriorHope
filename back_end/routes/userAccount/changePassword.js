const express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
const { check, validationResult} = require("express-validator");

// Common items to use between registration and login
var hash = require('../login/common/passwordHash');
const lengths = require('../login/common/acceptableLengths');
let user = require('../../public/js/userDB');
let sanitize = require('../../public/js/sanitizeString.js');
const { set } = require('../../app');
router.use(cookieParser());

router.get('/', function(req, res, next) {  
    if (!(req.session.loggedin)) {res.redirect('/signin');}
    // Is the user logged in
    else if (req.session.loggedin) {
        res.render('userAccount/change_password', {
            username: req.cookies.usernameCookie, 
            loggedin: req.session.loggedin, 
            moderator: req.session.moderator
        });
    }
});

router.post(
    "/",
    [
        // Backend validation checks
        check("password", "Please enter a valid password").isLength({
            min: lengths.password.min,
            max: lengths.password.max,
        }),
        check("passwconfirm").custom((value, { req }) => {
            if (value !== request.body.password) {
              throw new Error('Password confirmation does not match password');
            }
            return true;
        }),
    ],
    async function(request, response){
    
        //Get values from POST.
        var {
            password,
            passwconfirm
        } = request.body;

        // Sanitize passwords
        password = sanitize(password);
        passwconfirm = sanitize(passwconfirm);
        
        if (password == passwconfirm) {
            try {             
                // Hash user's password
                const hashedpwd = await hash(password);
                var name = request.cookies.usernameCookie;
                console.log(name);
                const id = await user.getUserID(name);
                const pwdChanged = await user.setPwd(id,hashedpwd);
                if (pwdChanged > 0 ) { // success
                    console.log(`success`);
                    const message = 'Password Successfully changed!';
                    response.status(200).render('userAccount/change_password', { 
                        username: request.cookies.usernameCookie,
                        loggedin: request.session.loggedin,
                        msg: message,
                        success: 1
                    });
                }
                else { // error
                    const message = 'Change Failed!';
                    response.status(400).render('userAccount/change_password', { 
                        username: request.cookies.usernameCookie,
                        loggedin: request.session.loggedin,
                        msg: message,
                        success: 0
                    });
                }  
            } catch (err) {
                console.log(err.message);
                response.status(500).send("Error in Saving");
            }
        }
    }
);

module.exports = router;
