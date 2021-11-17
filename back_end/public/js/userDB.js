
/**
 * This module is used to make queries and operations against the User Database.
 * In a test configuration, a different database container is used, therefore any modifications
 * or deletions during testing will not affect the main database.
 */

/** @module userDB*/

var testdb = require('../../tests/jestSetup/userDBtest')
var userdb = (process.env.NODE_ENV == 'test') ? testdb.pool : require('../../db');
var nodebb = require('../../nodebbAPI');
const { RequestHeaderFieldsTooLarge } = require('http-errors');

module.exports = {
    // Does it exist?
    emailInDB,
    nameInDB,
    // return stmnt
    getUser,
    getUserID,
    getEmail,
    getName,
    getGroup,
    getSubgroup,
    getSubgroupInfo,
    getModerator,
    getModeratorsSorted,
    getUsersInGroup,
    getLastLogin,
    getAllUsersLogin,
    getSubGroupsInGroup,
    getUsersInSubGroup,
    getTempUsersInSubGroup,
    getAllReports,
    getReport,
    // update stmnt
    setEmail,
    setGroup,
    setSubgroup,
    setTempSubgroup,
    setLastLogin,
    setInactive,
    setModerator,
    setPwd,
    switchModerator,
    // insert/delete
    addUser,
    addSubgroup,
    removeUser,
    deleteSubgroup,
    // Live chat functions
    addLiveChatMessage,
    getMessageID,
    hideMessage,
    unhideMessage,
    reportMessage,
    deleteMessage,
    get1message,
    get100messages,
    isReportedMessage,
    getAllReportedMessages,
    resolveMessage,
    updateReason,
    setMessasgeWarn,
    // Used to setup the database for tests
    setup,
    tearDown,
};

/**
 * This should be used
 *  during tests if what is going to be tested requires database manipulations.  
 * This function will create an empty user database with all the required tables.  
 * The database name will be your `username+jest_worker_id`. This detail is not needed to be known
 * for implementation.  This function should be used during setup of a Jest test.  For example:  
 * ```
 * beforeAll (async () => {
    try {
        await testDB.setup();
        await testDB.addUser('ausername',
         'person@gmail.com', 'mypassw0rd!');
    } catch (err) {
        console.log(`Before catch ${err}`);
    }
 });
 ```
 * The above `beforeAll()` function will create a database for the test, and add a user to the database that can be used during the test.
 * 
 * 
 * @returns setup conditions for a test database to use with Jest
 */
async function setup () {
    if (process.env.NODE_ENV == 'test') {
        return testdb.setup();
    } else {
        throw new Error ('Called a test function')
    }
} 
/**
 * This should be used
 *  during tests if what is going to be tested requires database manipulations.  
 * This function will remove the database created during `setup()`.  
 * ```
 afterAll(async () => {
    try {
        await testDB.tearDown();
    } catch (err) {
        console.log(`After catch ${err}`);
    }
});
 ```
 * The above `afterAll()` function will create a database for the test, and add a user to the database that can be used during the test.
 * Can also be used in `afterEach()`
 * 
 * @returns setup conditions for a test database to use with Jest
 */

async function tearDown() {
    if (process.env.NODE_ENV == 'test') {
        return testdb.tearDown();
    } else {
        throw new Error ('Called a test function')
    }
} 

// *****************************************************************************
// These are promises

/**
 * Returns a promise resolved of T/F if the given email is in the DB
 * @param {string} email
 * @param {*} resolve
 * @param {*} reject
 */
function emailInDB (email) {
    
    return new Promise((resolve,reject) => {
        var sql = 'SELECT userID FROM user WHERE email = ?';
        userdb.query(sql, [email], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('emailInDB: ' + error);
            }
            else  {
                if (result.length > 0) {
                    console.log('result in ID',result[0]);
                    resolve(1);
                }
                resolve(0);
            }
        });
    })
}

/**
 * Returns a promise resolved of T/F if the given name is in the DB
 * @param {string} username
 * @param {*} resolve
 * @param {*} reject
 */
function nameInDB (username) {
    console.log(username);
    return new Promise((resolve,reject) => {
        var sql = 'SELECT userID FROM user WHERE username = ?';
        userdb.query(sql, [username], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('nameInDB: ' + error);
            }
            else  {
                if (result.length > 0) {
                    console.log('result in ID',result[0]);
                    resolve(1);
                }
                resolve(0);
            }
        });
    })
}

/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * @param {string} input use either email or username
 * @return Resolves all data from the user.
 */
function getUser (input) {
    //console.log(input);
    return new Promise((resolve,reject) => {
        const sql = (typeof(input) == 'number') ?
            `SELECT * FROM user WHERE userID = ${input}` :
            `SELECT * FROM user WHERE email = "${input}" OR username = "${input}"`;
        userdb.query(sql, [input,input], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getUser: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result);
                }
                reject('getUser: Could not find user' + input + '\nresult' + result);
            }
        });
    })
}

/**
 * Returns a promise resolved to userID of the given email or username
 * @param {string} input will accept either email or username
 * @param {*} resolve
 * @param {*} reject
 */
function getUserID (input) {
    return new Promise((resolve,reject) => {
        var sql = 'SELECT userID FROM user WHERE email = ? OR username = ?';
        userdb.query(sql, [input,input], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getUserID: ' + error);
            }
            else  {
                if (result.length > 0) {
                   // console.log('result in ID',result[0].userID);
                    resolve(result[0].userID);
                }
                reject('getUserID: Could not find userID: ' + input)
            }
        });
    })
}

/**
 * Returns the email of the given userID
 * @param {string} userID 
 * @param {*} resolve
 * @param {*} reject
 */
function getEmail (userID) {
    console.log(userID);
    // Use the userID to find the users email.
    return new Promise((resolve,reject) => {
        var sql = 'SELECT email FROM user WHERE userID = ?';
        userdb.query(sql, [userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getEmail: ' + error);
            }
            else  {
                if (result.length > 0) {
                    console.log('result ',result[0]);
                    resolve(result[0].email);
                }
                reject('Could not find email');
            }
        });
    })
}

/**
 * Returns the name of the given userID
 * @param {string} userID
 * @param {*} resolve
 * @param {*} reject
 */
function getName (userID) {
    console.log(userID);
   // Use the userID to find the users username.
   return new Promise((resolve,reject) => {
       var sql = 'SELECT username FROM user WHERE userID = ?';
       userdb.query(sql, [userID], function(error, result) {
           if (error) {  // If an error in query is encountered
               reject('getName: ' + error);
           }
           else  {
               if (result.length > 0) {
                   console.log('result ',result[0]);
                   resolve(result[0].username);
               }
               reject('getName: Could not find user');
           }
       });
   })
}

/**
 * Update email, returns the number of affected rows
 * @param {string} userID
 * @param {string} email
 * @param {*} resolve
 * @param {*} reject
 */
function setEmail (userID, email) {
    console.log(userID);
    return new Promise((resolve,reject) => {
        var sql = 'UPDATE user SET email = ? WHERE userID = ?';
        userdb.query(sql, [email, userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('setEmail: ' + error);
            }
            else  {
                resolve(result.affectedRows);
            }
        });
    })
}

/**
 * Update the password, returns the number of affected rows
 * @param {string} userID
 * @param {string} pwd
 * @param {*} resolve
 * @param {*} reject
 */
function setPwd (userID, pwd) {
    console.log(userID);
    return new Promise((resolve,reject) => {
        var sql = 'UPDATE user SET password = ? WHERE userID = ?';
        userdb.query(sql, [pwd, userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('setPwd: ' + error);
            }
            else  {
                resolve(result.affectedRows);
            }
        });
    })
}

/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * @param {string} input 
 * @param {*} callback 
 */
function addUser(username, email, pwd) {
    //console.log(`${username} ${email} ${pwd}`);
    return new Promise((resolve,reject) => {
        var sql = 'INSERT INTO user (moderator, warnings, banned, username, email, password) VALUES (0,0,0,?,?,?)'
        userdb.query(sql, [username,email,pwd], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('addUser: ' + error);
            }
            else  {
                resolve(result.insertId);
            }
        });
    })
}

/**
 * Makes a user a moderator.  Does not assign the user to be a moderator of a group, just makes them available.
 * 
 * @param {int} userID
 * @param {boolean} value Truthy value if moderator, else is not a moderator
 * @return Resolves affected row, should be 1 for correct operation.
 */
function setModerator (userID, value) {
    // convert truthy value into a 1 for sql, 0 elsewise.
    const sqlVal = value ? 1 : 0;
    //console.log(`${userID} ${sqlVal}`);
    return new Promise((resolve,reject) => {
        var sql = 'UPDATE user SET moderator = ? WHERE userID = ?';
        userdb.query(sql, [sqlVal, userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('setModerator: ' + error);
            }
            else  {
                resolve(result.affectedRows);
            }
        });
    })
}

/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * @param {string} input 
 * @param {*} callback 
 */
function getModerator (userID) {
    //console.log(userID);
    return new Promise((resolve,reject) => {
        var sql = 'SELECT moderator FROM user WHERE userID = ?';
        userdb.query(sql, [userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getModerator: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result[0].moderator);
                }
                reject('getModerator: Could not find user');
            }
        });
    })
}

/**
 * Gets a array of moderators sorted from minimum amount of groups most amount of assigned groups.
 * @param {int} groupID Optional parameter.  Will return all moderators if left out. 
 * @returns {Promise} Array of data from user table of moderators sorted by number of assigned groups.
 */
function getModeratorsSorted (groupID = null) {
    console.log('Getting all moderators for groupID: ', groupID || 'all groups');
    return new Promise ((resolve, reject) => {
        // add where clause if groupID specified.
        const extraWhereClause = groupID ? ` AND groupID=${groupID}` : '';
        const orderBy = ' ORDER BY modCount ASC';
        const sql = 'SELECT userID, modCount FROM user WHERE moderator=1' + extraWhereClause  + orderBy;
        userdb.query(sql, (err, res) => {
            (err) ? reject(err) : (res.length > 0) ? resolve(res) : reject (res);
            
        });
    })
}

/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * 
 * @param {string} input 
 * @param {*} callback 
 */
function setGroup (userID, groupID) {
    //console.log(`${userID} ${groupID}`);
    return new Promise((resolve,reject) => {
        var sql = 'UPDATE user SET groupID = ? WHERE userID = ?';
        userdb.query(sql, [groupID,userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('setGroup: ' + error);
            }
            else  {
                resolve(result.affectedRows);
            }
        });
    })
}

/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * @param {string} userID 
 * @param {*} callback 
 */
function getGroup (userID) {
    //console.log(userID)
    return new Promise((resolve,reject) => {
        var sql = 'SELECT groupID FROM user WHERE userID = ?';
        userdb.query(sql, [userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getGroup: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result[0].groupID);
                }
                reject('getGroup: Could not find user');
            }
        });
    });
}

/**
 * Sets the subgroup of the user to the subgroup parameter. Used for final groups, as it marks
 * `subgroupTemporary` as false.
 * INCREMENTS OR DECREMENTS GROUP COUNTS
 * @param {int} userID 
 * @param {int} subgroupID 
 * @returns {Promise} Resolves the number of affected rows, expect 1 for correct operation
 */
function setSubgroup (userID, subgroupID) {
    
    return new Promise(async(resolve,reject) => {
        const current = await getSubgroup(userID);
        if (current) {
            // User is currently in a subgroup. Remove the usercount from this group
            await decUserCount(current);
        }
        var sql = 'UPDATE user SET subgroupID = ?, subgroupTemporary = 0 WHERE userID = ?';
        userdb.query(sql, [subgroupID,userID], async function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('setSubgroup: ' + error);
            }
            else  {
                if (subgroupID == null) {
                    resolve(result.affectedRows);
                } else {

                    resolve( await incUserCount(subgroupID));
                }
                //resolve(result.affectedRows);
            }
        });
    })
}

/**
 * Sets the subgroup of the user to the subgroup parameter. Used for temporary groups, as it marks
 * `subgroupTemporary` as true.
 * INCREMENTS OR DECREMENTS GROUP COUNTS
 * @param {int} userID 
 * @param {int} subgroupID 
 * @returns {Promise} Resolves the number of affected rows, expect 1 for correct operation
 */
function setTempSubgroup (userID, subgroupID) {
    //console.log(`${userID} ${subgroupID}`);
    return new Promise(async (resolve,reject) => {
        const current = await getSubgroup(userID);
        if (current) {
            // User is currently in a subgroup. Remove the usercount from this group
            await decUserCount(current);
        }
        var sql = 'UPDATE user SET subgroupID = ?, subgroupTemporary = 1 WHERE userID = ?';
        userdb.query(sql, [subgroupID,userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('setSubgroup: ' + error);
            }
            else  {
                resolve(incUserCount(subgroupID));
                //resolve(result.affectedRows);
            }
        });
    })
}
/**
 * Gets subgroup or tempsubgroup of user using userID
 * @param {int} userID 
 * @return {Promise} Resolves the subgroupID
 */
function getSubgroup (userID) {
    //console.log(userID)
    return new Promise((resolve,reject) => {
        var sql = 'SELECT subgroupID FROM user WHERE userID = ?';
        userdb.query(sql, [userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getSubgroup: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result[0].subgroupID);
                }
                reject('getSubGroup: Could not find user: ' + userID + '\n' + result);
            }
        });
    });
}

function getSubgroupInfo (subgroup)  {
    return new Promise ((resolve, reject) => {
        const sql = `SELECT * FROM discussion_group WHERE subgroupID=${subgroup}`;
        userdb.query(sql, (err, result) => {
            if (err) {
                reject('getGroupInfo: ' + err);
            }
            if (result && result.length > 0) {
                resolve(result[0]);
            } else {
                reject ('getSubgroupInfo: Could not find subgroup: ' + subgroup  + result + sql);
            }
        })
    })
}

/**
 * Creates a new subgroup with a moderator but no members assigned.
 * @param {int} groupID 
 * @param {int} modID 
 * @returns Resolves new subgroupID number
 */
function addSubgroup (groupID, modID) {
    //console.log('Add subgroup for groupID: ', groupID, ' moderatorID: ', modID);
    return new Promise ((resolve, reject) => {
        const sql = `INSERT INTO discussion_group (groupID, modID) VALUES (${groupID}, ${modID})`;
        userdb.query(sql, (err, res) => {
            if (err) {
                reject ('addSubgroup: ', err);
            }
            else {
                if (res.insertId) {
                    const subgroup = res.insertId; 
                    console.log('Create subgroup: ', subgroup);
                    const sql2 = `UPDATE user SET modCount = modCount + 1 WHERE userID = ${modID}`;
                    userdb.query(sql2, () => {
                        resolve(subgroup);
                    })
                }
                else {
                    reject('Could not add subgroup');
                }
            }
        })
    })
}
/**
 * Deletes the subgroup.  The subgroup must be empty for this to happen
 * @param {int} subgroup 
 * @returns affectedRows, should be 1
 */
function deleteSubgroup (subgroup) {
    return new Promise (async (resolve, reject) => {
        const info = await getSubgroupInfo(subgroup);
        if (info.userCount > 0) {
            const g = await getUsersInSubGroup(subgroup);
            reject ('deleteSubgroup: not an empty group: '+ JSON.stringify(info) + '\n' + g);
        } else {
            const sql = `DELETE FROM discussion_group WHERE subgroupID = ${subgroup}`;
            userdb.query(sql, (err, res) => {
                if (err) {
                    reject('deleteSubgroup: ' + err);
                }
                const sql2 = `UPDATE user SET modCount = modCount - 1 WHERE userID=${info.modID}`;
                userdb.query(sql2, (err2, res2) => {
                    if (err) {
                        reject('deleteSubgroup2ndLoop: ' + err);
                    }
                    resolve(res2.affectedRows);
                })
            })
        }
    })
}

/**
 * Assigns a new moderator to an existing subgroup. Increements the modCount for the new moderator
 * and decrements the modCount for the old moderator
 * @param {int} newMod 
 * @param {int} oldMod 
 * @param {int} subgroup 
 * @returns The affectedRows.  Should be 2 as two moderators were affected.
 */
function switchModerator(newMod, oldMod, subgroup) {
    return new Promise ((resolve, reject) => {
        
        const sql = `UPDATE user SET modCount = (CASE WHEN userID= ${newMod} THEN modCount + 1 \
            WHEN userID = ${oldMod} THEN modCount - 1) WHERE userID in (${newMod}, ${oldMod})`;
        
        userdb.query(sql, (err, result) => {
            if (err) {
                reject ('assignModerator: ' + err);
            }
            if (subgroup){
                const gsql = `UPDATE discussion_group SET modID = ${newMod} WHERE subgroupID = ${subgroup}`;
                userdb.query(sql, (err2, resul2) => {
                    if (err2 || result.length == 0) {
                        reject('assignModerator:' + err);
                    }
                    resolve(result.affectedRows);
                });
            }
            if (result.length > 0) {
                resolve(result.affectedRows);
            }
            reject ('assignModerator: User not found');
        });
    })
}


/**
 * This function gets all subgroupID numbers that belong to the groupID input.
 * @param {int} groupID 
 * @returns {Promise} Array of subgroupIDs that belong to the groupID ordered in acsending
 * order by user count.
 */
function getSubGroupsInGroup(groupID) {
    //console.log('Getting subgroups for group: ', groupID);
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM discussion_group WHERE groupID = ? ORDER BY userCount ASC';
        userdb.query(sql, [groupID], (err, result) => {
            if (err) {
                reject('getSubGroupsInGroup: ' + err);
            } else {
                result[0] ? resolve(result) : reject (false);
            }
        });
    });
}
/**
 * Gets all users in a subgroup(discussion group)
 * @param {int} subgroup 
 * @returns userIDs of users in a subgroup.
 */
function getUsersInSubGroup (subgroup) {
    return new Promise ((resolve, reject) => {
        const sql = `SELECT userID FROM user WHERE subgroupID = ${subgroup}`;
        userdb.query(sql, async (err, result) => {
            if (err) {
                console.trace();
                reject('getUsersInSubGroup: ' + err);
            } else {
                if (result.length > 0) {
                    resolve(result);
                } else {
                    userdb.query('SELECT subgroupID FROM discussion_group', (err,res) => {
                        console.log(res);
                    });
                    reject ('There are no users in the subgroup' + result + subgroup);
                }
            }
        })
    })
}

/**
 * Gets all users in a subgroup that are temporary
 * @param {int} subgroup 
 * @returns userIDs of the users in the subgroup that are temporary
 */
function getTempUsersInSubGroup (subgroup) {
    return new Promise ((resolve, reject) => {
        const sql = `SELECT userID FROM user WHERE subgroupID = ${subgroup} AND subgroupTemporary = 1`;
        userdb.query(sql, (err, result) => {
            if (err) {
                reject('getTempUsersInSubGroup: ' + err.stack);
            } else {
                if (result.length > 0) {
                    resolve(result);
                } else {
                    reject ('There are no temp users in the subgroup');
                }
            }
        })
    })
}


/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * @param {string} userID 
 * @param {*} callback 
 */
function setLastLogin (userID, date) {
    //console.log(`${userID} ${date}`);
    return new Promise((resolve,reject) => {
        var sql = 'UPDATE user SET lastLogin = ? WHERE userID = ?';
        userdb.query(sql, [date,userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('setLastLogin: ' + error);
            }
            else  {
                resolve(result.affectedRows);
            }
        });
    });
}
/**
 * 
 * @returns userID and lastLogin of all users
 */
function getAllUsersLogin() {
    return new Promise ((resolve, reject) => {
        const sql = `SELECT userID, subgroupID, lastLogin FROM user`;
        userdb.query(sql, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    })
}

/**
 * The function sets a user as inactive by setting the subgroupID and 
 * groupID to null.
 * @param {int} userID  
 * @returns Resolves the number of affected rows, which should be 1 for proper operation.
 */
function setInactive (userID) {
    return new Promise(async (resolve,reject) => {
        try {
            await setSubgroup(userID, null);
            const res = await setGroup(userID, null);
            resolve(res);
        } catch (err) {
            reject(err);
        }
        // const sql = `UPDATE user SET subgroupID = NULL, groupID = NULL WHERE userID = ${userID}`;
        // userdb.query(sql, function(error, result) {
        //     if (error) {  // If an error in query is encountered
        //         reject('setInactive: ' + error);
        //     }
        //     else  {
        //         if (result.affectedRows > 0) {
        //             resolve(result.affectedRows);
        //         }
        //         reject('setInactive: Could not find userID' + userID);
        //     }
        // });
    });
}

/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * @param {string} userID 
 * @param {*} callback 
 */
function getLastLogin (userID) {
    //console.log(userID);
    return new Promise((resolve,reject) => {
        var sql = 'SELECT lastLogin FROM user WHERE userID = ?';
        userdb.query(sql, [userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getLastLogin: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result[0].lastLogin);
                }
                reject('Could not find user');
            }
        });
    });
}

/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * @param {string} userID 
 * @param {*} callback 
 */
function removeUser(userID) {
    console.log(userID);
    return new Promise((resolve,reject) => {
        var sql = 'DELETE FROM user WHERE userID = ?';
        userdb.query(sql, [userID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('removeUser: ' + error);
            }
            else  {
                resolve(result.affectedRows);
            }
        });
    });
}

/**
 * Gets all information about the user using SELECT *.
 * Input can be either username or email.
 * @param {int} groupID 
 * @param {*} callback 
 */
function getUsersInGroup(groupID) {
    console.log(groupID);
    return new Promise((resolve,reject) => {
        var sql = 'SELECT userID FROM user WHERE groupID = ?';
        userdb.query(sql, [groupID], function(error, result) {
            if (err) {  // If an error in query is encountered
                reject('getUsersInGroup: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result);
                }
                else {
                    reject('could not find group');
                }
            }
        });
    });
}

/**
 * Stores live chat message.
 * @param {int} userID 
 * @param {int} roomID
 * @param {datetime} timestamp
 * @param {string} msg
 */
 function addLiveChatMessage(userID, roomID, timestamp, msg) {
    return new Promise((resolve,reject) => {
        var sql = `INSERT INTO live_chat_messages VALUES (NULL, ${userID}, ${roomID}, '${timestamp}', 1, '${msg}')`;
        userdb.query(sql, function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('addLiveChatMessage: ' + error);
            }
            else {
                resolve(result.insertId);
            }
        });
    });
}

/**
 * Returns the messageID with the corresponding information.
 * Input must be roomID.
 * @param {int} userID
 * @param {datetime} timestamp
 * @param {string} message
 * @return {int} messageID
 */
 function getMessageID (userID, timestamp, message) {
    return new Promise((resolve,reject) => {
        var sql = `select messageID from live_chat_messages where userID = ${userID} and timestamp = '${timestamp}' and message = '${message}' limit 1`;
        userdb.query(sql, function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getMessageID: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result[0].messageID);
                } else {
                    resolve(0);
                }
            }
        });
    })
}

/**
 * Hides a message.
 * Input must be messageID.
 * @param {int} messageID 
 * @param {*} callback 
 */
 function hideMessage(messageID) {
    return new Promise((resolve,reject) => {
        var sql = 'UPDATE live_chat_messages SET visible = 0 WHERE messageID = ?';

        userdb.query(sql, [messageID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('hideMessage: ' + error);
            }
            else {
                resolve(result.insertId);
            }
        });
    });
}

/**
 * Unhides a message.
 * Input must be messageID.
 * @param {int} messageID 
 * @param {*} callback 
 */
 function unhideMessage(messageID) {
    return new Promise((resolve,reject) => {
        var sql = 'UPDATE live_chat_messages SET visible = 1 WHERE messageID = ?';

        userdb.query(sql, [messageID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('unhideMessage: ' + error);
            }
            else {
                resolve(result.insertId);
            }
        });
    });
}

/**
 * Reports a message.
 * Input must be messageID, userID, and a reason.
 * @param {int} messageID 
 * @param {int} userID
 * @param {string} reason
 * @param {*} callback 
 */
 function reportMessage(messageID, userID, reason) {
    return new Promise((resolve,reject) => {
        // The zero value is the 'resolved' column which should be false on any new report
        var sql = `INSERT INTO live_chat_reports VALUES (${messageID}, ${userID}, '${reason}', 0, 0)`;

        userdb.query(sql, function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('reportMessage: ' + error);
            }
            else {
                resolve(result.affectedRows);
            }
        });
    });
}

/**
 * Deletes a message.
 * Input must be messageID.
 * @param {int} messageID 
 * @param {*} callback 
 */
 function deleteMessage(messageID) {
    return new Promise((resolve,reject) => {
        var sql = 'DELETE FROM live_chat_messages WHERE messageID = ?';

        userdb.query(sql, [messageID], function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('deleteMessage: ' + error);
            }
            else  {
                resolve(result.affectedRows);
            }
        });
    });
}

/**
 * Returns the most recent 100 messages with the corresponding roomID.
 * Input must be roomID.
 * @param {int} msgID
 * @returns username, moderator status, messageID, userID, roomID, timestamp, visibility, and message.
 */
 function get1message (msgID) {
    return new Promise((resolve,reject) => {
        var sql = `SELECT u.username, u.moderator, lcm.* FROM user as u, live_chat_messages as lcm WHERE u.userID = lcm.userID and lcm.messageID = ${msgID}`;
        userdb.query(sql, function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('get1message: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result);
                } else {
                    resolve(0);
                }
            }
        });
    })
}

/**
 * Returns the most recent 100 messages with the corresponding roomID.
 * Input must be roomID.
 * @param {int} roomID
 * @returns username, moderator status, messageID, userID, roomID, timestamp, visibility, and message.
 */
 function get100messages (roomID) {
    return new Promise((resolve,reject) => {
        var sql = `SELECT u.username, u.moderator, lcm.* FROM user as u, live_chat_messages as lcm WHERE u.userID = lcm.userID and roomID = ${roomID} ORDER BY timestamp DESC LIMIT 100`;
        userdb.query(sql, function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('get100messages: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result);
                } else {
                    resolve(0);
                }
            }
        });
    })
}

/**
 * Returns one message that a user has reported.
 * Input must be userID.
 * @param {int} userID
 * @param {int} msgID
 * @returns 1 for true, 0 for false
 */
 function isReportedMessage (userID, msgID) {
    return new Promise((resolve,reject) => {
        var sql = `SELECT messageID from live_chat_reports where userID = ${userID} AND messageID = ${msgID}`;
        userdb.query(sql, function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getReportedMessage: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(1);
                } else {
                    resolve(0);
                }
            }
        });
    })
}

/**
 * Returns all of the messages that a user has reported.
 * Input must be userID.
 * @param {int} userID
 * @returns messageID
 */
 function getAllReportedMessages (userID) {
    return new Promise((resolve,reject) => {
        var sql = `SELECT messageID from live_chat_reports where userID = ${userID}`;
        userdb.query(sql, function(error, result) {
            if (error) {  // If an error in query is encountered
                reject('getAllReportedMessages: ' + error);
            }
            else  {
                if (result.length > 0) {
                    resolve(result);
                } else {
                    resolve(0);
                }
            }
        });
    })
}



/**
 * Increments the usercount of a subgroup by 1.
 * This is a private function to this module.  It is not exported.
 * @param {int} subgroupID subgroup to increment
 * @returns number of rows affected.  Should be 1 for intended operation
 */
function incUserCount(subgroupID) {
    return new Promise ((resolve, reject) => {
        
        const sql = `UPDATE discussion_group SET userCount=userCount + 1 WHERE subgroupID=${subgroupID}`
        userdb.query(sql, (error, result) => {
            if (error) {  // If an error in query is encountered
                reject('incUserCount: ' + error);
            }
            else  {
                if (result.affectedRows > 0) {
                    resolve(result.affectedRows);
                }
                else {
                    console.error(result)
                    reject('could not increment group' + subgroupID);
                }
            }
            })
    });
}
        
        
    


/**
 * Decreases the usercount of a subgroup by 1.
 * This is a private function to this module.  It is not exported.
 * @param {int} subgroupID subgroup to decrement
 * @returns number of rows affected.  Should be 1 for intended operation
 */
function decUserCount(subgroupID) {
    return new Promise ((resolve, reject) => {
       
        const sql = `UPDATE discussion_group SET userCount=userCount - 1 WHERE subgroupID=${subgroupID}`;
        userdb.query(sql, (error, result) => {
            if (error) {  // If an error in query is encountered
                reject('decUserCount: ' + error);
            }
            else  {
                if (result.affectedRows > 0) {
                    resolve(result.affectedRows);
                }
                else {
                    reject('could not decrimcrement group');
                }
            }
            })

        
        
    });
}


/**
 * This function may need to be limited to the moderators group number.  
 * For now it returns all reports.  
 * @returns all reports
 */
function getAllReports() {
    return new Promise ((resolve, reject) => {
       
        const sql = `SELECT reported.messageID AS id, reportee.resolved AS resolved, reported.message AS message, A.username AS reported, B.username AS reportee 
                     FROM live_chat_messages AS reported, live_chat_reports AS reportee, user AS A, user AS B
                     WHERE reported.messageID = reportee.messageID
                     AND reported.userID = A.userID
                     AND reportee.userID = B.userID`;
        userdb.query(sql, (error, result) => {
            if (error) {  // If an error in query is encountered
                reject('getAllReports: ' + error);
            }
            else  {
                resolve(result);
            }
        })
    });
}

/**
 * This function may need to be limited to the moderators group number.  
 * For now it returns all reports.  
 * @param {int} id the messageID
 * @returns all reports
 */
function getReport(id) {
    return new Promise ((resolve, reject) => {
       
        const sql = `SELECT reported.messageID AS id, reported.message AS message, reportee.resolved AS resolved, reportee.reason, reportee.warn
                     FROM live_chat_messages AS reported, live_chat_reports AS reportee
                     WHERE reported.userID = ${id}
                     AND reported.messageID = reportee.messageID`;
        userdb.query(sql, (error, result) => {
            if (error) {  // If an error in query is encountered
                reject('getReport: ' + error);
            }
            else  {
                resolve(result);
            }
        })
    });
}

/**
 * Sets a reported message to resolved.
 * @param {int} messageID the message ID
 * @returns affected rows if successful
 */
function resolveMessage(messageID) {
    return new Promise ((resolve, reject) => {
       
        const sql = `UPDATE live_chat_reports SET resolved = true WHERE messageID = ${messageID}`;
        userdb.query(sql, (error, result) => {
            if (error) {  // If an error in query is encountered
                reject('resolveMessage: ' + error);
            }
            else  {
                if (result.affectedRows > 0) {
                    resolve(result.affectedRows);
                }
                else {
                    reject('could not resolve message');
                }
            }
        })
    });
}

/**
 * Adds a comment to a reported message describing the reasoning for the action taken.
 * @param {int} messageID the messageID
 * @param {string} reason a comment 
 * @returns affected rows if successful
 */
function updateReason(messageID,reason) {
    return new Promise ((resolve, reject) => {
       
        const sql = `UPDATE live_chat_reports SET reason = '${reason}' WHERE messageID = ${messageID}`;
        userdb.query(sql, (error, result) => {
            if (error) {  // If an error in query is encountered
                reject('resolveMessage: ' + error);
            }
            else  {
                if (result.affectedRows > 0) {
                    resolve(result.affectedRows);
                }
                else {
                    reject('could not resolve message reason');
                }
            }
        })
    });
}

/**
 * If a message was removed for inappropriate content, set the message to warn, allowing the reported user to see their deleted comment.
 * @param {int} messageID the messageID
 * @param {boolean} value set to true or false
 * @returns affected rows if successful
 */
function setMessasgeWarn(messageID,value) {
    return new Promise ((resolve, reject) => {
       
        const sql = `UPDATE live_chat_reports SET warn = ${value} WHERE messageID = ${messageID}`;
        userdb.query(sql, (error, result) => {
            if (error) {  // If an error in query is encountered
                reject('resolveMessage: ' + error);
            }
            else  {
                if (result.affectedRows > 0) {
                    resolve(result.affectedRows);
                }
                else {
                    reject('could not resolve message warning');
                }
            }
        })
    });
}