const testDB = require('../../public/js/userDB');
const  assignToSubgroup  = require('../../algorithms/groupMaintenance/assignToSubgroup');

// All users for this test will have the same main `groupID` value
const GROUPID = 2;
// Number of test users to generate
const NUM_TESTUSERS = 30;

// Makes a lot of database queries to setup test database, and it currently has many console.logs
// which take time.  This timeout is set to ensure the test has enough time to run.
jest.setTimeout(30000);

beforeAll (async () => {
    try {
        await testDB.setup();
        // Make 30 tests users, 3 moderators, all of the same GroupID
        for (i = 0 ; i < NUM_TESTUSERS; ++i) {
            const username = 'testuser' + i;
            const email = 'testemail' + i;
            const password = 'password' + i;
            const userID = await testDB.addUser(username, email, password);
            // Make every user part of 'groupID 2'
            await testDB.setGroup(userID, GROUPID);
            // Make every tenth user a moderator
            if (i % 10 == 0){
                await testDB.setModerator(userID, true);
            } 
        }

    } catch (err) {
        console.log(`Before catch ${err}`);
    }
 });

 // simple call to promise function that drops the database.
afterAll(async () => {
    try {
        await testDB.tearDown();
    } catch (err) {
        console.log(`After catch ${err}`);
    }
});

describe('Tests add to subgroup and group creation. \
    Satisfies Test Case 1.3.2', () => {

        it('Checks the operation of addToSubGroup', async(done) => {
            // Array to store the created subgroups
            let subgroups = [];
            // Sequentially add 5 users for the initial group. Sequentially add 7 users to the active discussion group.
            
            try {
                for (i = 0; i < 12; ++i) {
                // These userIDs should just start at 1 and autoincrement.
                    await assignToSubgroup(i+1, GROUPID, (subGroup) => {
                        subgroups.push(subGroup);
                    });
                }
            } catch (err){
                console.error(err);
            }
            try {
                const groups = await testDB.getSubGroupsInGroup(GROUPID);
                expect(groups.length).toBe(1);
                expect(groups[0].subgroupID).toBe(1);
                var promises = Array(12).fill(0).map(async (_, i) =>  {
                    /*All 7 users are added into the group and no additional groups are created. 
                    Current member count should be 12, not including the moderator.
                    */
                   const sub = await testDB.getSubgroup(i+1);
                   await expect(sub).toBe(1);
                   return sub;
                });
                await Promise.all(promises);
            } catch (err){
                console.error(err);
                fail()
            }
            try {
                /* Sequentially add 4 more users to the active discussion group.*/
                for (i = 12; i < 16; ++i) {
                // These userIDs should just start at 1 and autoincrement.
                    await assignToSubgroup(i+1, GROUPID, (subGroup) => {
                        subgroups.push(subGroup);
                    });
                }
            } catch {
                console.error(err);
                fail()
            }
            try {
                const groups = await testDB.getSubGroupsInGroup(GROUPID);
                expect(groups.length).toBe(1);
                var promises = Array(16).fill(0).map(async (_, i) =>  {
                    /*All 4 users added with no additional group created.  
                    Each of these 4 users are notified that this group is temporary until more users sign on.
                    */
                   const sub = await testDB.getSubgroup(i+1);
                   await expect(sub).toBe(1);
                   return sub;
                });
                await Promise.all(promises);
                
            } catch (err) {
                console.error(err);
                fail()
            }
            try {
                
                /* Sequentially add 1 more user to the active discussion group.*/
                for (i = 16; i < 17; ++i) {
                // These userIDs should just start at 1 and autoincrement.
                    await assignToSubgroup(i+1, GROUPID, (subGroup) => {
                        subgroups.push(subGroup);
                    });
                }
            } catch (err){
                console.error(err);
                fail()
            }
            try {
                const groups = await testDB.getSubGroupsInGroup(GROUPID);
                expect(groups.length).toBe(2);
                var promises = Array(17).fill(0).map(async (_, i) =>  {
                   /*  A new group is created.  
                    The user added in this step, plus the 4 users from the previous step are moved to the new group. 
                    An available moderator is assigned to the new group.  
                    The moderator is informed of the new group at the next login. 
                    The new group size should be 5, the original group 12, not including the moderators.
                    */
                   const sub = await testDB.getSubgroup(i+1);
                   const expected = (i < 12) ? 1 : 2;
                   expect(sub).toBe(expected);
                   return sub;
                });
                await Promise.all(promises);
                
            } catch (err){
                console.error(err);
                fail()
            }
            try {
                /* Sequentially add the remaining 13 users..*/
                for (i = 17; i < NUM_TESTUSERS; ++i) {
                // These userIDs should just start at 1 and autoincrement.
                    await assignToSubgroup(i+1, GROUPID, (subGroup) => {
                        subgroups.push(subGroup);
                    });
                }
            } catch (err){
                console.error(err);
                fail()
            }
            try {
                const groups = await testDB.getSubGroupsInGroup(GROUPID);
                expect(groups.length).toBe(3);
                var promises = Array(30).fill(0).map(async (_, i) =>  {
                /*  A total of 3 groups exist. The first group contains 12 members. 
                The second group contains 12 members. 
                The third group contains 6 members. These member counts do not include the moderator.
                    All groups have a moderator assigned.
                */
                    const sub = await testDB.getSubgroup(i+1);
                    const expected = (i < 12) ? 1 : (i >= 24) ? 3 : 2;
                    expect(sub).toBe(expected);
                    return sub;
                });
                await Promise.all(promises);
                    
                
            } catch (err){
                console.error(err);
                fail()
            }
            done();
        });

    })

