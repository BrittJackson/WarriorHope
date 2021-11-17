#!/usr/bin/env node
const db = require('../public/js/userDB');
const mergeGroups = require('../algorithms/groupMaintenance/mergeGroups');
/**
 * This file is an executable JS file that can be ran using a cron job to make
 * any user that has been inactive for a period of time
 * @module MakeUsersInactive
 */

// Period of member inactivity in days.
const INACTIVE_PERIOD = 30;

function inactivate(callback)  {
    console.log('inactivating');
    return new Promise (async (resolve, reject) => {
        let subgroups = new Set();
        try {
            let users = await db.getAllUsersLogin();
      
            var promises = users.map(async (user, i) => {
                const rowResult = await JSON.parse(JSON.stringify(user));
                
                const nowTime = Date.now();
                const inactive_date = nowTime - (INACTIVE_PERIOD * 24 * 60 * 60 * 1000);
                const lastLogin = rowResult.lastLogin ?  
                        new Date(rowResult.lastLogin).getTime() :
                        null;
                //console.log( nowTime, inactive_date, lastLogin);

                /* If the inactivity period is more recent than the last login,
                * inactivate the user and merge groups if needed
                */
                if (lastLogin && (inactive_date > lastLogin)) {
                    const inactivated = await db.setInactive(rowResult.userID);
                    console.log(i, rowResult)
                    if (rowResult.subgroupID) {
                        // await mergeGroups(rowResult.subgroupID);
                        return Promise.resolve(subgroups.add(rowResult.subgroupID));
                    } else {
                        return Promise.resolve(1);
                    }
                }
            });
            Promise.all(promises).then(() => {
                var prom2 = subgroups.values(async (subgroup) => {
                    return mergeGroups(subgroup);
                });
                Promise.all(prom2).then(() => {
                    resolve(callback());
                });
            }).catch((e) => reject(e));
            
           
        } catch (err) {
            console.error(err);
            reject(err);
        }
        return 0;
    });
}
if (process.env.NODE_ENV != 'test') {
    inactivate(() => {
        return console.log('Inactive users have been updated')
    });

}


// // for testing
 module.exports = inactivate;