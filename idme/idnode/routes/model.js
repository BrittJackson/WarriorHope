var mysql = require('mysql2');
var bcrypt = require('bcrypt');
var connection = mysql.createPool({
	host: (process.env.IDmeDatabase || '411crystal.cpi.cs.odu.edu'),
    port: (process.env.IDmeDatabase ? 3306 : 3334),
    user: 'root',   
	password: 'IDroot',
	database: 'IDme'
});

// Bearer token is what is sent to Warrior Hope after user logs into IDme
function getBearerTokenFun(username, callback) {
    // For simplicity's sake, the bearer token is just the hash of the uername
    bcrypt.hash(username, 5, function(err, hash) {
        if (err) throw err
        // Shorted the code for brevity
        const access_code = hash.substring(5,15);
        // Add code to the database so that when WH request access token, this can be checked
        connection.query(`UPDATE user SET access_code='${access_code}' WHERE username='${username}'`);
        callback(access_code);
    });
}

// Access Token is what is returned to warrior hope after warrior hope returns bearer token
function getAccessTokenFun(bearerToken, callback) {

    connection.query(`SELECT access_code FROM user WHERE access_code='${bearerToken}'`,
        function (err, result) {
        if (result[0]) {
            // For simplicity's sake, the access token is just the hash of the bearer code
            bcrypt.hash(bearerToken, 10, function(err, hash) {
                if (err) throw err
                callback( hash.substring(5, 20));
            });
        }
        else {
            // Not a valid access token
            callback(false);
        }
        
    });
};

// Find the user in the database
function getUserFun (username, password, callback) {
     connection.query(
        `SELECT * FROM user WHERE username = "${username}" AND password = "${password}"`
        , function (err, result) {
            if (err) throw err;
            if (result[0]) {
                callback(result[0]);
            } else {
                
                console.log(`Did not find user ${username} with password ${password}`);
                callback(false);
            }
            });
};

function getUser (val1, val2, callback) {
    return new getUserFun(val1, val2, callback);
  };

function getBearerToken(val, callback) {
    return new getBearerTokenFun(val, callback);
};

function getAccessToken(val, callback) {
    return new getAccessTokenFun(val, callback);
};

module.exports = {
    getBearerToken,
    getAccessToken,
    getUser
}
