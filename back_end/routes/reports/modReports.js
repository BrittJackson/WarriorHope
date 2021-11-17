const express = require('express');
var router = express.Router();
const path = require('path');

let db = require('../../public/js/userDB.js');

router.get('/', async function(req, res, next) {  
    if (!(req.session.loggedin)) {res.redirect('/signin');}
    else {
        // Grab all of the reports and send them to the front end.
        try {
            const reports = await db.getAllReports();
            res.render('reports/modReports',{
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

router.post('/', async function(request, response) {
    try {
        var action = request.body.action;
        var reason = request.body.reason;
        //const str = reason.toString();
        console.log(reason);
        if (action.includes('delete')) {
            try {
                console.log('delete')
                const id = action.replace('delete ','');
                await db.updateReason(id, reason);
                await db.setMessasgeWarn(id,true);
                // Also set warning to user table
                const hide = await db.hideMessage(id);
                const resolve = await db.resolveMessage(id);
                response.redirect('/modReports');
            } catch (err) {
                console.log(err)
            }
        }
        else if (action.includes('ban')) {
            console.log('ban')
            // TODO
            response.redirect('/modReports');
        }
        else if (action.includes('clear')) {
            try {
                console.log('clear')
                const id = action.replace('clear ','');
                await db.updateReason(id, reason)
                const result = await db.resolveMessage(id);
                response.redirect('/modReports');
            } catch (err) {
                console.log(err)
            }
        }
    } catch(err) {
        console.log(err)
    }
    response.end();
});

module.exports = router;