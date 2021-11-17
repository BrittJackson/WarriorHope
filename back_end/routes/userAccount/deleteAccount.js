const express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcrypt");

// Common items to use between registration and login
var hash = require('../login/common/passwordHash');
const lengths = require('../login/common/acceptableLengths');
let user = require('../../public/js/userDB');
let sanitize = require('../../public/js/sanitizeString.js');
router.use(cookieParser());

router.get('/', function(req, res, next) {  
    if (!(req.session.loggedin)) {res.redirect('/signin');}
    // Is the user logged in
    else if (req.session.loggedin) {
        res.render('userAccount/delete_user', {
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
                // Hash user's password
                // const hashedpwd = await hash(password);
                var name = request.cookies.usernameCookie;
                console.log(name);
                const account = await user.getUser(name);
                console.log(account);
                const checkPwd = await bcrypt.compare(password, account[0].password);
                console.log(checkPwd);
                if (checkPwd) {
                    const rem = await user.removeUser(account[0].userID);
                    if (rem > 0 ) { // success
                        console.log(`success`);
                        request.session.loggedin = false;
                        response.redirect('/');
                    }
                    else { // error
                        const message = 'Delete Failed!';
                        response.status(400).render('userAccount/delete_user', { 
                            username: request.cookies.usernameCookie,
                            loggedin: request.session.loggedin,
                            msg: message,
                            success: 0
                        });
                    }
                }
                else {
                    const message = 'Wrong Information';
                    response.status(400).render('userAccount/delete_user', { 
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
