const express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require("bcrypt");
const { check, validationResult} = require("express-validator");
var assessdb = require('../../assessdb.js');
const assignSubGroup = require('../../algorithms/groupMaintenance/assignToSubgroup');

router.use(bodyParser.urlencoded({extended : true}));
router.use(cookieParser());

router.get('/', function(req, res, next) {
  //Check if user is logged in
  if (!req.session.loggedin) {
    res.redirect('/');
  }

  // Show results to console (testing purposed only!)
  // console.log(req.session.secondaryAssessments);

  // Make array variable to hold secondary assessmentIDs
  var assessments = req.session.secondaryAssessments;

  // Show results to console (testing purposed only!)
  console.log(assessments);

  // Delete session variable holding assessments
  delete req.session.secondaryAssessments;
  
  // Use assessment array to grab secondary assessments
  // Be sure to put instructions, questions, and responses in res.render() function

  // If there are secondary assessments that need to be displayed
  if (assessments.length > 0) {
    // Get instructions for assessments
    var instructions = 'SELECT * from assessment';
    var where = ' WHERE';
    assessments.forEach(function(i, idx, array) {
      if (idx === array.length - 1) {
          where = where + ' assessmentID=' + i + ' ORDER BY assessmentID;';
        }
      else {
        where = where + ' assessmentID=' + i + ' OR';
      }
    });  
    instructions = instructions + where;

    // Get questions for assessments
    var questions = 'SELECT * FROM question'; 
    where = ' WHERE';
    assessments.forEach(function(i, idx, array) {
      if (idx === array.length - 1) {
          where = where + ' assessmentID=' + i + ' ORDER BY assessmentID, questionID;';
        }
      else {
        where = where + ' assessmentID=' + i + ' OR';
      }
    });  
    questions = questions + where; 
    
    // Get responses for assessments
    var responses = 'SELECT * FROM response';
    where = ' WHERE';
    assessments.forEach(function(i, idx, array) {
      if (idx === array.length - 1) {
          where = where + ' assessmentID=' + i + ' ORDER BY assessmentID, responseID;';
        }
      else {
        where = where + ' assessmentID=' + i + ' OR';
      }
    });  
    responses = responses + where;

    // Print queries to console to make sure it is correct (testing purposes!)
    console.log(instructions);
    console.log(questions);
    console.log(responses);
    
    // Query the assessment database for instructions of secondary assessments
    assessdb.query(instructions, function(error, instructionsResult) {
      if (error) {
        console.log(`Error querying assessment database: instructions for secondary assessments`);
      }
      else { 
        // Query the assessment database for questions of secondary assessments 
        assessdb.query(questions, function(error, questionsResult) {
          // If there is an error is querying the database for questions
          if (error) {
            console.log(`Error querying assessment database: questions for secondary assessments`);
          }
          else {
            // Query the assessment database for responses of secondary assessments
            assessdb.query(responses, function(error, responsesResult) {
              // If there is an error in querying the database for responses
              if (error) {
                console.log(`Error querying assessment database: responses for secondary assessments`);
              }
              else {
                // Render page with assessment information
                res.render('assessment/secondAssessment', {
                    title: 'Secondary Assessments',
                    loggedin: req.session.loggedin,
                    instruction: instructionsResult,
                    assessment: questionsResult,
                    response: responsesResult
                });
              }
            });                
          }
        });
      }
    });
  }
  else {
    // If there are no second assessments to take, render page without query data
    // May need to change this later
    res.render('assessment/secondAssessment', { title: 'Secondary Assessments', loggedin: req.session.loggedin });
  }
});

router.post('/', function(req, res) {
  // Make sure a POST request was received
  if (!req.body) 
    return res.sendStatus(400);

  // Make session variable for group placement
  req.session.placement = req.body.result;
  

  // Show results to console (testing purposed only!)
  console.log(req.session.placement);
  
  // jQuery in processSecondAssessment.js redirects to '/groupPlacement'
  res.end();
});

module.exports = router;
