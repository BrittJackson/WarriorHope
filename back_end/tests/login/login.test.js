var app = require('../../app');
// For testing http responses
var supertest = require('supertest-session');
const testDB = require('../../public/js/userDB');
const testUser = require('../jestSetup/authenticatedSession');
const phash = require('../../routes/login/common/passwordHash');


// Username to use and verify in cookies
const username = 'logintestuser';
jest.setTimeout(10000);

// Actual sign in is covered by other tests.  These tests will check the branches for invalid entries
describe("POST / with invalid credentials", () => {
   

    test("it should resend signing with message for invalid credentials",  async (done) => {
        
        await testDB.setup();
        var testSession = supertest(app);
        await testDB.addUser('testuser', 'email@something.com', await phash('12345678'));

        testSession.post("/signin")
        .send({action: 'Submit', username: 'testuser', password:'incorrect'}).expect(200).then(async (res) => {
            expect(res.text).toContain('Incorrect information');
            testSession.post('/signin')
            .send({action: 'Submit', username:'incorrect', password:'dontmatter'}).expect(200).then(async() => {
                await testDB.tearDown();
                done();
            })
            
            
        });
    });

    test("it should resend signing with message for missing parameters",  async (done) => {
        
        var testSession = supertest(app);

        testSession.post("/signin")
        .send({action: 'Submit', username: '', password:'incorrect'}).expect(302).then((res) => {
            done();
            
        });
    });

});

describe("POST / with invalid credentials", () => {
    it('should redirect to change password', async () => {
        var testSession = supertest(app);

        testSession.post("/signin")
        .send({action: 'Forgot Password'}).expect(302).then((res) => {
            done();
            
        });
    })
});