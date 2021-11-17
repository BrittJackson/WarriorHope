
const testDB = require('../public/js/userDB');

var theBase;
// theBase is the connection
beforeAll (async (/*done*/) => {
    try {
        await testDB.setup();
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

describe ('Testing the db connection', () => {
    
    it('test connection to test database', async (done) => {
        console.log('starting test')
        // This one is prefferred to allow auto increment
       // database.query("INSERT INTO user (moderator, warnings, banned, username, email, password) VALUES (0,0,0,?,?,?)"), 
        
        // Once we get the userDB in this we should make this a call to addUser
        //theBase.query("INSERT INTO user (userID, moderator, warnings, banned, username, email, password) VALUES (21,0,0,0,'tester','something@gmail.com','abc123')"), 
        try{
            const res = await testDB.addUser('tester', 'something@gmail.com', 'mypassword');
                //expect (err).toBeFalsy();
                expect (res).toBeTruthy();
                done();
        } catch (err){
            console.log(err)
            // fail the test
            expect(err).toBeFalsy()
        }
        });
});
