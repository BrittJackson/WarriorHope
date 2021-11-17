const express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('policies/terms', { title: 'Terms of Service' });
});

module.exports = router;
