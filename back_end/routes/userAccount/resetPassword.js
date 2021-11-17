const express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
const { check, validationResult} = require("express-validator");

// Common items to use between registration and login
var hash = require('../login/common/passwordHash');
const lengths = require('../login/common/acceptableLengths');
let user = require('../../public/js/userDB');
let sanitize = require('../../public/js/sanitizeString.js');
router.use(cookieParser());

router.get('/', function(req, res, next) {  
    var email = req.cookies.emailCookie;
    if (!(email)) {res.redirect('/signin');}
    // Has the user requested a password reset
    else if (email){
        res.render('userAccount/reset_password');
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
    async (request, response) => {
    
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
                //console.log('try')
                // Hash user's password
                const hashedpwd = await hash(password);
                //console.log('hashedpwd')
                var email = request.cookies.emailCookie;
                const id = await user.getUserID(email);
                //console.log('id');
                const pwdChanged = await user.setPwd(id,hashedpwd);
                if (pwdChanged > 0 ) { // success
                    console.log(`success`);
                    response.clearCookie('emailCookie');
                    const message = 'Password Successfully changed!';
                    response.status(200).render('userAccount/reset_password', { 
                        username: request.cookies.usernameCookie,
                        loggedin: request.session.loggedin,
                        msg: message
                    });
                }
                else { // error
                    const message = 'Change Failed!';
                    response.status(400).render('userAccount/reset_password', { 
                        username: request.cookies.usernameCookie,
                        loggedin: request.session.loggedin,
                        msg: message
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
