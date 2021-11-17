// below I commented how I got around that
const mysql = require('mysql2');
// Used in jest testing
//require('mysql2/node_modules/iconv-lite').encodingExists('foo');

// Took this out of the setup function
const username = process.env.USERNAME || process.env.USER || 'unknown';
const dbname = username + (process.env.JEST_WORKER_ID || 'no_number');

// Establish connection
pool = mysql.createPool({
    host: '411crystal.cpi.cs.odu.edu',
    port: 6603,
    user: 'root',
    password: 'ODUcrystal411',
    database: 'User'
});


// This could go in userDB i think, may need to send jetworkerId as a parameter.
function setup() {
    return new Promise ((resolve, reject) => {
        // Get a normal connection to the db
        pool.getConnection(function(err, conn) {
            if (err) {
                reject (err)
            }
            // all the stuff you had before
            conn.query(`CREATE DATABASE ${dbname}`,function (err, res) {
                if (err) reject(err);
                conn.query(`SHOW tables`,function (err, tables) {
                    if (err) reject (err);
                    conn.query(`USE ${dbname}`, (err,res) => {
                        if (err) reject (err);
                            
                            var promises = Array(tables.length).fill(0).map((_, i) => {
                                const tablename = tables[i].Tables_in_User;
                                return new Promise ((resolve, reject) => {
                                    conn.query(`CREATE TABLE ${dbname}.${tablename} LIKE User.${tablename}`, (err, res) => {
                                        resolve(res);
                                    });
                                });
                            });
                            Promise.all(promises).then(() => {
                                console.log(`${dbname} created`);
                                // This actually changes the connection to test# db
                                conn.changeUser({database : dbname}, function(err) {
                                    if (err) return reject (err);
                                    conn.changeUser({
                                        database: dbname
                                    }, function (err) {
                                        if (err) {
                                            return reject (err)
                                        }
                                        conn.release();
                                        // resolve with the connection not the pool
                                        return resolve(conn);
                                    });
                                });
                            }).catch((err) => {console.error('Cannot create test database:', dbname, err)});           
                           
                        });
                    });
                });
            });
        });
}

// Makes calling async easier if its a function, can also be sent to userDB as a call
function tearDown() {
    return new Promise ((resolve,reject) => {
        pool.query(`DROP DATABASE ${dbname}`, function (err, res) {
            if (err) reject(err);
            resolve(`Dropped DB ${res}`);
        })
    });
}

module.exports = {
    pool: pool,
    setup: setup,
    tearDown: tearDown,
};