/**
 * This module is used when members are added to a group and there is a need to create a new group based off of size
 * @module addToSubGroup
 */
const db = require('../../public/js/userDB');
const { ADMIN, MAX } = require('./groupLimits');
const nodeBBAPI = require('../../nodebbAPI');


/**
 * Assigns a subgroup to a member bases off the GroupID assigned by the secondary assessment.  
 * Example:
 * ```
 * const userID = 32123;
 * const groupID = 4;
 * assignToSubgroup (userID, groupID, (the_assigned_subgroup) ={
 *      // Do stuff
 * });
 * ```
 * 
 * @param {int} userID UserID of user to be assigned a subgroup 
 * @param {int} groupID GroupID determined from secondary assessment
 * @param {*} callback Function that takes the new subgroup as a paramter
 */
async function assignToSubgroup (userID, groupID, callback) {
    /***
     * The goal is to keep all groups below the admin limit, but with the most users in it.  To do this:
     * 1) If a group is above the admin limit, add to it until it splits. If not:
     * 2) Add users to the smallest group until all subgroups within the group are at the admin limit.
     * 3) Randomly select a subgroup, add new users to it.
     * 4) Keep adding users to this subgroup until it hits the max.
     * 5) Split this group.  Keep the original at the admin limit, new group should be at the min.
     * 6) Since the new group is below admin and is the smallest, it will recieve new users.
     */
    try {
        const groups = await db.getSubGroupsInGroup(groupID);
        // Get the largest group to see if it is above the admin limit
        const upper = groups[groups.length - 1];
        // Group with the fewest members.
        const lower = groups[0];

        /***
         * Group is at max
         */
        if (upper.userCount >= MAX) {
            // Split group, get new subgroup ID
            const newgroup = await db.addSubgroup(groupID, await getAvailableMod());
            
            // Add user to new group
            await db.setSubgroup(userID, newgroup);
            // Find users that were temporary
            const users = await db.getTempUsersInSubGroup(upper.subgroupID);
            
            // This method replaces a for loop and ensures all iterations are complete prior to moving on
            var promises = users.map(async (user) => {
                const id = user.userID;
                // Notify them of the move
                notifyOfMove(id, 'move');
                // Move them to the new group.
                await db.setSubgroup(id,newgroup);

                
            });
            // Wait until the above mapping is complete
            await Promise.all(promises).then(function () {
                callback(newgroup);
            });
            
        }
        /***
         * Group is above admin limit. Add until it splits
         */
        else if (upper.userCount > ADMIN) {
            // Add to the group until it is going to split
            await db.setTempSubgroup(userID, upper.subgroupID);
            // Notify them that this is a temporary group
            notifyOfMove(userID, 'temp');
            callback(upper.subgroupID);
        }
        /***
         * Group is below or at admin limit
         */
        else {
            // No subgroup is above the admin limit.  If the smallest is less than admin, add to it.
            if (lower.userCount < ADMIN) {
                // Add user to lowest subgroup
                await db.setSubgroup(userID, lower.subgroupID);
                callback(lower.subgroupID);
            } else {
                /* This condition is met when all subgroups are at the admin limit.
                *  Select at random a subgroup to get added to.  This prevents the same group
                *  being repetatively used as the 'temporary group'. */
               const randomIndex = Math.floor(Math.random() * groups.length);
               const subgroup = groups[randomIndex].subgroupID;
               // Add user to this group
               await db.setTempSubgroup(userID, subgroup);
               callback(subgroup);
            }
        }
    }
    catch (err){
        // The database call returns a reject(false) if no subgroups are found for the group ID.
        if  (err == false) {
            // No subgroups exist. Should only occur during first setup of project
            const subgroup = await db.addSubgroup(groupID, await getAvailableMod());
            // create subgroup in nodebb
            nodeBBAPI.setup('Group' + subgroup);
            await db.setSubgroup(userID, subgroup);
            callback(subgroup);
        } else {
            console.error(err);
        }
    }
}


function getAvailableMod () {
    return new Promise (async (resolve, reject) => {
        try {
            const results = await db.getModeratorsSorted();
            // Assign moderator with the least amount of groups.
            results[0].userID ? resolve(results[0].userID) : reject('No available moderators');
        }
        catch (err){
            reject('Unable to execute moderator search in database', err);
        }
    })
}

/**
 * @todo implement this function
 * @param {int} userid 
 * @param {string} message 
 */
function notifyOfMove (userid, message) {
/***
 * @TODO fill out this function
 */
    return;
}
module.exports = assignToSubgroup;