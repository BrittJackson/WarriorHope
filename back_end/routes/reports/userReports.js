const express = require('express');
var router = express.Router();
const path = require('path');

let db = require('../../public/js/userDB.js');

router.get('/', async function(req, res, next) {  
    if (!(req.session.loggedin)) {res.redirect('/signin');}
    else {
        // Grab all of the reports and send them to the front end.
        try {
            const name = req.cookies.usernameCookie;
            console.log(name)
            const id = await db.getUserID(name)
            const reports = await db.getReport(id);
            res.render('reports/userReports',{
                username: req.cookies.usernameCookie, 
                loggedin: req.session.loggedin, 
                moderator: req.session.moderator,
                reports: reports
            });
        }catch (err) {
            console.log(err)
        }

    }
});

module.exports = router;