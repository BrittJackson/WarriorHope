const express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require("bcrypt");
const { check, validationResult} = require("express-validator");
var userdb = require('../../public/js/userDB');
var assessdb = require('../../assessdb.js');

// Not sure if I need session here or not...going to look into it
router.use(bodyParser.urlencoded({extended: true}));
router.use(cookieParser());

//TODO: has user taken within the last two weeks - check time
//User logs off after taking initial assessment. Where is the 
//list of concerns saved??
router.get('/', async function(req, res, next) {
    //Check if user is logged in
    if (!req.session.loggedin) {
      res.redirect('/');
    } 
    
    //Get the username from cookie
    var name = req.cookies.usernameCookie;
    //Check if the user asked to retake assessments
    var reAssess = req.session.retake;
    //Check user group
    var userSQL = 'SELECT groupID FROM user WHERE username = ?';
    try {
      const user = await userdb.getUser(name);
        for (i in user) {

            //Not in a group or has requested to retake assessments.
            if (user[i].groupID === null || reAssess) {
                req.session.retake = false;

                var instructionSQL = 'SELECT * FROM assessment WHERE assessmentID = 1';
                assessdb.query(instructionSQL, function(error, instructionResult) {
                    if (error) {
                        console.log(`Error querying instructions for initial assessment`);
                    }
                    else {
                    //Get initial assessment, id = 1
                          var assessmentSQL = 'SELECT * FROM question WHERE assessmentID = 1';
                          assessdb.query(assessmentSQL, function(error, assessResult) {
                            if (error) {  // If an error in query is encountered
                                console.log(`Error`)
                            }
                            else { 

                                //Get reponse type
                                var responseSQL = 'SELECT * FROM response WHERE assessmentID = 1';
                                assessdb.query(responseSQL, function(error, responseResult) {
                                    if (error) {  // If an error in query is encountered
                                        console.log(`Error`)
                                    }
                                    else { 

                                        //Display the assessment
                                        res.render('assessment/assessment', { 
                                            username: name, 
                                            title: 'Assessments', 
                                            loggedin: req.session.loggedin,
                                            instruction: instructionResult, 
                                            assessment: assessResult,
                                            response: responseResult
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }

            //In a group, check for more assessments?
            else { 
                res.render('assessment/assessment', { username: name, title: 'Assessments', loggedin: req.session.loggedin});
            }
        }
    } catch (err) {
      console.log(err);
    }
});

//If all number crunching is client side the only thing 
//needed here would be fetching the next assessment?
router.post('/', function(request, response) {
    //If a number from the assessments is concerning display the correct assessment. 
    //Possibly keep all next assessments in a list and display as they are completed
    
    // Make sure a POST request was received
    if (!request.body) 
      return response.sendStatus(400);

    // Make an array to hold secondary assessmentIDs
    request.session.secondaryAssessments = [];
    
    // Check POST request body for each domain and push assessmentID if true
    if (request.body.domain1 == 'true')
      request.session.secondaryAssessments.push(2);
    if (request.body.domain2 == 'true')
      request.session.secondaryAssessments.push(3);
    if (request.body.domain3 == 'true')
      request.session.secondaryAssessments.push(4);
    if (request.body.domain4 == 'true')
      request.session.secondaryAssessments.push(5);
    if (request.body.domain5 == 'true')
      request.session.secondaryAssessments.push(6);
    if (request.body.domain6 == 'true')
      request.session.secondaryAssessments.push(7);
    if (request.body.domain7 == 'true')
      request.session.secondaryAssessments.push(8);
    if (request.body.domain8 == 'true')
      request.session.secondaryAssessments.push(9);
    if (request.body.domain9 == 'true')
      request.session.secondaryAssessments.push(10);

    // Show results to console (testing purposed only!)
    // console.log(request.session.secondaryAssessments);    

    // End response
    // jQuery in processInitialAssessment.js redirects to '/secondAssessment'
    response.end();
});

module.exports = router;
