/**
 * This exports the connection pool for the assessment database
 * @module assessdb
 */
const mysql = require("mysql2");

// TODO: establish config file to keep credentials out of code
//const config = require("../config");

/* Create a connection to database. */
// Currently configured to the Assessment database.
// TODO: adjust this to connect to specific database
var database = mysql.createPool({
	host: process.env.WH_DATABASE || '411crystal.cpi.cs.odu.edu',
	port: process.env.WH_DATABASE ? '' : 3307,
	user: 'root',
	password: 'ODUcrystal411',
	database: 'Assessment'
});


// Test connection
database.query('SELECT 1', (error, results, fields) => {
    if (error) throw error;
    //console.log('Database is connected.');
  });

module.exports = database;