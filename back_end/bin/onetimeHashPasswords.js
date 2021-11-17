#!/usr/bin/env node

/***
 * This is a one-time only js file to encrypt already stored plaintext passwords.  
 * It is assumed if a password is 60 characters, that it is already hashed and will not be rehashed.
 * ***/

var db = require('../db');
var hash = require('../routes/login/common/passwordHash');

db.execute('SELECT username, password FROM user', async function (err, result) {
    for (i in result) {
        if (result[i].password.length < 60){
            const hashed = await hash(result[i].password);
            await db.execute(`UPDATE user SET password="${hashed}" WHERE username="${result[i].username}"`);
        }
    }

});
