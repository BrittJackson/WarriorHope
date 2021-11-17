
/**
 * Exports the real database connection pool
 * @module db */

const mysql = require("mysql2");

// TODO: establish config file to keep credentials out of code
//const config = require("../config");

/* Create a connection to database. */
var database = mysql.createPool({
		host: process.env.WH_DATABASE || '411crystal.cpi.cs.odu.edu',
		port: process.env.WH_DATABASE ? '' : 3307,
		user: 'root',
		password: 'ODUcrystal411',
		database: 'User'
});

/** Database connection */
module.exports = database;

