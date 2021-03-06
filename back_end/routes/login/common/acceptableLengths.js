/**
 * This JS file contains the constants that are used to define
 * what are acceptable parameters of user credentials such as
 * username length, password length, etc. This allows getting rid of 
 * 'magic numbers' in code
 * @module acceptableLengths
 */


const length = {
    username: {
        min: 6,
        max: 30
    },
    password: {
        min: 8,
        max: 30,
    }
}


module.exports = length;
