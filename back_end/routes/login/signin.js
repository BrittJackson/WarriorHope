const express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const { check, validationResult} = require("express-validator");
var database = require('../../public/js/userDB');
var jwt = require('jsonwebtoken');
const moment = require('moment');

var mongoUtil = require('../../mongodb');

const MIN_PASSWORD_LEN = 6;
let user = require('../../public/js/userDB.js');
let sanitize = require('../../public/js/sanitizeString.js');

// Not sure if I need session here or not...going to look into it
router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());
router.use(cookieParser());

router.get('/', function(req, res, next) {
    if (req.session.emptyFields) {
        delete req.session.emptyFields;
        res.render('login/signin', { emptyFields: true });
    }
    else if (req.session.notInDatabase) {
        delete req.session.notInDatabase;
        res.render('login/signin', { notInDatabase: true });
    }
    else {
        res.render('login/signin');
    }
});


router.post('/', async function(request, response) {
    var action = request.body.action;
    if (action == 'Submit') {
        // var mongodb
        // Sanitize username and password, then assign to variables 
        var username = sanitize(request.body.username);
        var password = sanitize(request.body.password);
        if (username && password) {
            try {
                const account = await user.getUser(username);
                const pwdCheck = await bcrypt.compare(password, account[0].password);
                if (pwdCheck) {
                    if (account[0].moderator) {
                        request.session.moderator = true;
                    }
                    request.session.loggedin = true;
                    request.session.save(function(err){
                        if (err) {console.log(err)}
                    })
                    // Update login time in the database;
                    user.setLastLogin(account[0].userID, moment().format('YYYY-MM-DD hh:mm:ss'));
                    //request.session.username = username;
                    response.cookie('usernameCookie', username, { httpOnly: true });
                    response.redirect('/');
                }
                else {
                    request.session.notInDatabase = true;
                    response.render('login/signin', { notInDatabase: true });
                }
                
            } catch (err) {
                console.log(err);
                request.session.notInDatabase = true;
                response.render('login/signin', { notInDatabase: true })
            }
            

            // var sql = 'SELECT * FROM user WHERE username = ?';
            // database.query(sql, [username], function(error, result) {
            //     if (error) {  // If an error in query is encountered
            //         response.send('error with query');
            //     } 
            //     else {  
            //         if (!result[0]) {
            //             // Username not found
            //            response.render('login/signin', { notInDatabase: true })
            //         } else {
            //             // compare the password with the stored hashed password
            //             bcrypt.compare(password, result[0].password, function(err, res) {
            //                 if (err){
            //                    response.render('login/signin', { notInDatabase: true });
            //                 }
            //                 else if (res) {
            //                     request.session.loggedin = true;
            //                     //request.session.username = username;
            //                     response.cookie('usernameCookie', username, { httpOnly: true });
            //                     response.redirect('/');
            //                 } 
            //                 else {
            //                    response.render('login/signin', { notInDatabase: true });
            //                 }
            //             });
            //         }
        
            //     }
            // //response.end();
    
            // });
        } 
        else { // If the user did not enter data into username/password fields
            request.session.emptyFields = true;
            response.redirect('/signin');
        }
    }
    else if (action == 'Forgot Password') {
        // console.log('reset');
        response.redirect('forgotPassword');
    }
    
});

module.exports = router;
