const express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
router.use(cookieParser());

let user = require('../../public/js/userDB.js');
let sanitize = require('../../public/js/sanitizeString.js');

router.get('/', function(req, res, next) {  
    if (!(req.session.loggedin)) {res.redirect('/signin');}
    else {
        res.render('userAccount/change_email', {
            username: req.cookies.usernameCookie, 
            loggedin: req.session.loggedin, 
            moderator: req.session.moderator
        });
    }
});

// I made this   async --------
router.post('/', async function(request, response) {
    //Get values from POST.
    var {
        email,
        emailconfirm
    } = request.body;

    // Sanitize emails
    email = sanitize(email);
    console.log(email)
    emailconfirm = sanitize(emailconfirm);
    console.log(emailconfirm)
    
    if (email == emailconfirm) {
        try {
            var name = request.cookies.usernameCookie;

            // testing
            // var name = request.body.name;
            // name
    
            var newEmail = email;
            console.log(`name ${name}`)
            console.log(`email ${newEmail}`)
            const mail = await user.emailInDB(newEmail)
            if (mail) {
                console.log(`email in use`);
                const message = 'Email account already registered';
                response.status(400).render('userAccount/change_email', { 
                    username: request.cookies.usernameCookie,
                    loggedin: request.session.loggedin,
                    msg: message,
                    success: 0
                });
            }
            else {
                const id = await user.getUserID(name)
                const emailSet = await user.setEmail(id,newEmail)
                if (emailSet) {
                    console.log('success!');
                    const message = 'Email Successfully changed!';
                    response.status(200).render('userAccount/change_email', { 
                        username: request.cookies.usernameCookie,
                        loggedin: request.session.loggedin,
                        msg: message,
                        success: 1
                    });
                }
                else {
                    response.status(500).send("Error in Query");
                }
            }
        } catch (err) {
            response.status(500).send(err);
        }
    }
});

module.exports = router;
