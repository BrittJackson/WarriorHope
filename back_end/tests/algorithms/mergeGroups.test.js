const testDB = require('../../public/js/userDB');
//const  assignToSubgroup  = require('../../algorithms/groupMaintenance/assignToSubgroup');
const mergeGroup = require('../../algorithms/groupMaintenance/mergeGroups');
const assignToSubgroup = require('../../algorithms/groupMaintenance/assignToSubgroup');

// All users for this test will have the same main `groupID` value
const GROUPID = 2;
// Number of test users to generate
const NUM_TESTUSERS = 30;

// Allow sufficient time for database calls
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
            await assignToSubgroup(userID, GROUPID, (sg) => Promise.resolve(sg)); 
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

describe('Tests merging small groups \
    Satisfies Test Case 1.3.2', () => {

        it('Checks the operation of mergeGroup', async(done) => {
                // Make small group
                /***
                 * Should have three subgroups, with 12, 12, and 5.
                 * First Remove one person from the group of 5.  No merge should occur since no available group
                 * Then remove one from group of 12.  Merge should occur with the group less than 12.
                 * There is a forth subgroup that does not belong to the same medical condition above.
                 */
                // Create a new subgroup with a new GroupID with one user, make sure unable to merge
                const userID = await testDB.addUser('differentuser', 'doesntmatter', 'password');
                // Make every user part of 'groupID 2'
                await testDB.setGroup(userID, GROUPID + 1);
                let otherSG = 0;
                await assignToSubgroup(userID, GROUPID + 1, (sg) => otherSG = sg); 
                expect(otherSG).toBe(4);
                
                // Get the users in the small subgroup and inactivate one.
                const smallUsers = await testDB.getUsersInSubGroup(3);
                await testDB.setInactive(smallUsers[0].userID);
                await mergeGroup (3).then((res_string) => {
                    expect(res_string).toBe('No merge needed');
                });
                // Inactivate another, drop below min.
                await testDB.setInactive(smallUsers[1].userID);
                await mergeGroup (3).then((res_string) => {
                    expect(res_string).toBe('No available group within admin limit');
                });
                // Inactivate users of the middle subgroup until it gets to merge values.
                const medUsers = await testDB.getUsersInSubGroup(2);
                await testDB.setInactive(medUsers[0].userID);
                await testDB.setInactive(medUsers[1].userID);
                await testDB.setInactive(medUsers[2].userID);
                await mergeGroup (2).then((res_string) => {
                    expect(res_string).toBe('No available group within admin limit');
                });
                await testDB.setInactive(medUsers[3].userID);
                await mergeGroup(2).then((res_string) => {
                    expect(res_string).toBe('Subgroup 2 merged with 3');
                });
                const groups =await testDB.getSubGroupsInGroup(2);
                expect(groups.length).toBe(2);

                // Try merging subgroup of 1.  No other group available
                await mergeGroup (4).then((res_string) => {
                    expect(res_string).toBe('No other group to merge with');
                });
                
                done();

        });
    });