// Base items
const express = require('express');
var router = express.Router();
const database = require('../../public/js/userDB');

// Input validation
const { check, validationResult} = require("express-validator");

// IDme configurations
const IDme = require('./IDmeConfig');
var url = require('url');
const querystring = require('querystring');
var request = require('request');

// Common items to use between registration and login
var hash = require('./common/passwordHash');
const lengths = require('./common/acceptableLengths');
let sanitize = require('../../public/js/sanitizeString.js');

/* GET will either have a code (haven't signed into IDme yet) or has a code as a URL query (after signing into IDME).
* This code will be resent with the registraion form.  Once the registration form is filled out, it will send a POST to
* enter the new user into the database.  The code will be included in the POST, to allow verification with IDme on the server-sise
* and prevent someone from manually entering a code in the url
 */
router.get('/', function(req, res, next) {
    
    /* If the get contains a response code form IDme, then render the registration form
    * if not, then render the page to sign in with IDme.  ID will redirect to this same route with the code.
    * IDme sends a code as a URL query. Example: 'http://example.com/callback?code=488e864b'
    * // See https://developers.id.me/documentation/explicit/groups for details.
    */
    if (req.query.code) {

        url.host = IDme.token_endpoint;

        res.render('login/register', { 
            code: req.query.code, 
            usernameMin: lengths.username.min,
            passwordMin: lengths.password.min, 
        } );

    } else {

        url.host = IDme.authorizing_endpoint;
        url.search = querystring.encode(IDme.query);

        res.render('login/verifyIDme', { redirect : url.format(url) } );
    }

});


// Many aspects of the following code for POST function derived from the example provided at:
// https://dev.to/dipakkr/implementing-authentication-in-nodejs-with-express-and-jwt-codelab-1-j5i#6-configure-user-model
// Changes include site specific items and use of mysql

 
router.post(
    "/",
    [
        // Backend validation checks
        check("username", "Please Enter a Valid Username")
        .isLength({
            min: lengths.username.min,
            max: lengths.username.max,
        }),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: lengths.password.min,
            max: lengths.password.max,
        }),
        check("confirm").custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Password confirmation does not match password');
            }
            return true;
        }),
        check("eula", "Please agree to the EULA").equals("1")
    ],
    async (req, res) => {
    
        //Get values from POST.
        var {
            username,
            email,
            password,
            confirm,
            //eula,
            code
        } = req.body;

        // Sanitize username, password, and email
        username = sanitize(username);
        email = sanitize(email);
        password = sanitize(password);
        confirm = sanitize(confirm);

        // Make sure entered parameters are valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Resend the user the registration page if invalid.
            return res.status(400).render('login/register', { 
                code: code, 
                msg: errors.errors[0].msg,
                usernameMin: lengths.username.min,
                passwordMin: lengths.password.min,
                });
            }
        
        try {
            // Get access token from IDme.  Proves that the code recieved is valid
            // See https://developers.id.me/documentation/explicit/groups
            
            function getToken (theCode, callback) {

                const ourParams = {
                    code: theCode,
                    client_id: IDme.client_id,
                    client_secret: IDme.client_secret,
                    redirect_uri: IDme.redirect_uri,
                    grant_type: 'authorization_code'
                }
                const options = {
                    uri: IDme.token_endpoint,
                    body: JSON.stringify(ourParams),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                request.post(options, function (error, response) {
                    
                    const token = (response.statusCode === 400) ? null :
                        JSON.parse(response.body).access_token;
                    callback(token);
                });
            }
             
            // Determine if the username already exists. Should return reject() if not taken
            if (await database.nameInDB(username)) {
                res.status(400).render('login/register', { 
                    code: code, 
                    msg: 'Username already used by another user',
                    usernameMin: lengths.username.min,
                    passwordMin: lengths.password.min,
                });
            } else if (await database.emailInDB(email)) {
                    res.status(400).render('login/register', { 
                     code: code, 
                     msg: 'Email account already registered',
                     usernameMin: lengths.username.min,
                     passwordMin: lengths.password.min,
                 });
            } else {
                // Hash user's password
                const hashedpwd = await hash(password);
                // Get access Token from IDme
                getToken(code, async function (token) {
                    if (token) {
                    
                        await database.addUser(username, email, hashedpwd);
                        console.log(`${username} has been added`);
                        res.cookie('usernameCookie', username, { httpOnly: true });
                        res.status(302).redirect('/');
                            
                    } else {
                        console.log('Invalid Token');
                        res.status(400).render('login/register', { msg: 'Invalid credentials from IDme'});
                    }
                });      
            }
        }     
        catch (err) {
            console.log('Error: ', err);
            res.status(500).send("Error in Saving");
        }
    }
);
module.exports = router;
