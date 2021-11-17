const testDB = require('../../public/js/userDB');
const moment = require('moment');
const { fail } = require('assert');

jest.setTimeout(7500);

// NUM_TESTERS ideally should be a multiple of 4 since using 4 different ast login dates.       
const NUM_TESTUSERS = 28;
const INACTIVE_PERIOD = 30;
const GROUPID = 2;

var INACTIVE_DATE;
var ACTIVE;
var ALMOST_INACTIVE;
var INACTIVE;

beforeAll (async (done) => {
    try {
        var promises = [
            Promise.resolve(moment().subtract(INACTIVE_PERIOD / 4, 'days', 'YYYY-MM-DD hh:mm:ss')),
            Promise.resolve( moment().subtract(INACTIVE_PERIOD  + 1, 'days', 'YYYY-MM-DD hh:mm:ss')),
            Promise.resolve(moment().subtract(INACTIVE_PERIOD - 1, 'days', 'YYYY-MM-DD hh:mm:ss')),
            Promise.resolve( moment().subtract(INACTIVE_PERIOD, 'days', 'YYYY-MM-DD hh:mm:ss')),
        ];
      
        Promise.all(promises).then(async (promises) => {
            
            ACTIVE = promises[0];
            INACTIVE = promises[1];
            ALMOST_INACTIVE = promises[2];
            INACTIVE_DATE = promises[3];

            await testDB.setup();
            // Make test users
            var upromises = Array(NUM_TESTUSERS).fill(0).map(async (_, i) => {
                const username = 'testuser' + i;
                const email = 'testemail' + i;
                const password = 'password' + i;
                const userID = await testDB.addUser(username, email, password);
                // Make every non-null login user part of 'groupID 2'
                if (i % 4 != 3) {
                    await testDB.setGroup(userID, GROUPID);
                }
                // Make every tenth user a moderator
                if (i % 10 == 0){
                    await testDB.setModerator(userID, true);
                }
               
                // Set login values.
                switch (i % 4) {
                    case 0:
                        // Logged in recently
                        return  testDB.setLastLogin(userID, ACTIVE.format());
                    case 1:
                        // Logged in one day before period
                        return testDB.setLastLogin(userID, ALMOST_INACTIVE.format());

                    case 2:
                        // Logged in day after
                        return testDB.setLastLogin(userID, INACTIVE.format()); 
                    default:
                    // Null value. 
                    return testDB.setLastLogin(userID, null);
                      
                } 
               
                });
                Promise.all(upromises).then( () => {
                    console.log('Before all is complete');
                    done();
                });
            }).catch(() => {fail()});
        
        
    } catch (err) {
        console.log(`Before catch ${err}`);
    }
 });

 // simple call to promise function that drops the database.
afterAll(async () => {
    console.log('Running after all');
    try {
        await testDB.tearDown();
    } catch (err) {
        console.log(`After catch ${err}`);
    }
});

describe ('makes a user inactive and calls merge group', () => {
    it('runs the test', async (done) => {
        console.log('Running test');
         require('../../bin/makeUsersInactive')(async () => {
        //inactivate(async () => {
        //await require ('../../bin/makeUsersInactive',async () => {
            console.log('in callback');
            var users;
            try{
                users = await testDB.getAllUsersLogin();
            }
            catch (err) {
                console.error('Error in getUser: ', err);
            }
            
            //Recent users should have no change.  Count should be NUM_TESTUSERS / 4;
            var active = 0;
            //Inactive should have been change to null and count should be 0.
            var inactive = 0;
            // Almost inactie should have no change.
            var almmost = 0;
            // Original null users should have no change, but gain the inactive members.
            var promises = users.map( async (user) => {
                const data = await testDB.getUser(user.userID);
                const login = await testDB.getLastLogin(user.userID);
                const group = await testDB.getGroup(user.userID);
                if (login) {
                    // Still active
                    if (login > INACTIVE_DATE) {
                        ++active;
                        // Active users should have a group.
                        expect(group).toBeTruthy();
        
                    } else {
                        ++inactive;
                        // Inactive members should be NULL.
                        expect(group).toBeFalsy();
                
                    }
                } else {
                    ++inactive;
                    expect(group).toBeFalsy();
                }
                
                return Promise.resolve(true);
            });
            
            Promise.all(promises).then(async () => {
                
                // active should be recent and almost, half the users.
                expect(active).toBe(NUM_TESTUSERS / 2);
                expect(inactive).toBe(NUM_TESTUSERS - NUM_TESTUSERS / 2);
                done();
            });
        });
        
    });
});
