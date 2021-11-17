/**
 * This module will merge groups after members are marked as inactive
 * @module mergeGroups
 */
const db = require('../../public/js/userDB');
const { MIN, ADMIN, MAX } = require('./groupLimits');


 /**
  * The function determines if a subgroup should be merged, and, if it is possible, merges with another subgroup.
  * @param {int} subgroup The subgroup that initiates the merge process.  Typically when a user has been made inactive
  * @returns Promise rejects only if issue with database queries.
  */
 async function merge (subgroup) {
    return new Promise (async (resolve, reject) => {
        console.log('Starting to merge groups');
        try {

            const users = await db.getUsersInSubGroup(subgroup);
            const groupID = await db.getGroup(users[0].userID);
            // `groups` is ordered by ascending userCount based off of the sql query
            const groups = await db.getSubGroupsInGroup(groupID);
            
            // If this is the only group, do nothing
            if (groups.length == 1) {
                resolve('No other group to merge with');
            } else {

                // Get the next smallest group
                const source = await db.getSubgroupInfo(subgroup);
                const target = (subgroup == groups[0].subgroupID) ? groups[1] : groups[0];
                if (target.userCount >= MIN && source.userCount >= MIN) {
                    resolve('No merge needed');
                }
                // If the merge will be bigger than admin limit, do not add
                if (source.userCount + target.userCount > ADMIN) {
                    // Do not merge
                    resolve('No available group within admin limit');
                } else {

                    // Change the subgroup in question to the target subgroup ID
                    var change_users = users.map(async (user) => {
                        console.log('change_users', user);
                        const query = await db.setSubgroup(user.userID, target.subgroupID);
                        notifyUser(user.userID, 'move');
                        return query;
                    });
                    var mod_count = [
                        await db.getUser(source.modID),
                        await db.getUser(target.modID),
                    ];
                    Promise.all(change_users).then(async () => {
        
                        // If the source moderator has fewer groups to moderate than the target, switch them.
                        if (mod_count[0].modCount < mod_count[1].modCount) {
                            await db.switchModerator(mod_count[0].userID, mod_count[1].userID, target.subgroupID);
                            notifyUser(mod_count[0].userID, 'AddedModerator');
                            notifyUser(mod_count[1].userID), 'RemovedModerator';
                        }
                        // Members have been moved and group should be empty
                        await db.deleteSubgroup(subgroup);
                        resolve(`Subgroup ${subgroup} merged with ${target.subgroupID}`);
                    })
                }
            }

        } catch (err) {
            console.trace();
            reject(err);
        }

    });
 }

 function notifyUser(userID, msg) {
     /**
      * @TODO add function
      */
     return;
 }

 module.exports = merge;