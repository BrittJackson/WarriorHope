const express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require("bcrypt");
const { check, validationResult} = require("express-validator");
var userdb = require('../../public/js/userDB');
const assignToSubgroup = require('../../algorithms/groupMaintenance/assignToSubgroup');
const { equal } = require('assert');

router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());
router.use(cookieParser());

router.get('/', function(req, res, next) {
  // Check if user is logged in
  //Check if user is logged in
  if (!req.session.loggedin) {
    res.redirect('/');
  }

  // Check that session variable is active
  console.log(req.session.placement);

  // Make local variable to hold session data
  var group = req.session.placement;

  // Delete session variable
  delete req.session.placement;

  // Make SQL query to update user table with groupID
  var SQL = 'UPDATE user SET groupID=';
  SQL = SQL + group + ' WHERE username=\'' + req.cookies.usernameCookie + '\';';

  // Print query to console (FOR TESTING ONLY!!! - GET RID OF THIS WHEN DELIVERING PROTOTYPE)
  console.log(SQL);
  
  // Make a async function
  (async () => {
    console.log(req.cookies, req.session);
    const userID = await userdb.getUserID(req.cookies.usernameCookie);
    userdb.setGroup(userID, group);
    assignToSubgroup(userID, group, (subgroup) => {
      res.cookie('subgroupIDCookie', subgroup, { httpOnly: false });
      res.render('assessment/groupPlacement', { title: 'Group Placement', loggedin: req.session.loggedin, group: group, subgroup: subgroup });
    })
    
  })();
});

module.exports = router;
