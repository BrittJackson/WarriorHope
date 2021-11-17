var app = require('../../app');
// For testing http responses
var supertest = require('supertest-session');
const testDB = require('../../public/js/userDB');
const testUser = require('../jestSetup/authenticatedSession');

var jwt = require('jsonwebtoken');
// Username to use and verify in cookies
const username = 'logintestuser';
jest.setTimeout(10000);

describe("GET /chat without an authorized session", () => {
   

    test("It should respond with signin.jade",  (done) => {
        
        var testSession = supertest(app);

        testSession.get("/chat").expect(200).then((res) => {
            expect(res.text).toContain('Sign-In');
            done();
        });
    });

    describe("GET /chat with an authorized session", () => {

        var testSession = supertest(app);

        // Nested beforeAll and afterAll as the first test does not need session vairables.
        beforeAll (async () => {
            try {
    
                await testDB.setup();
                testSession = await testUser.authenticateSession(testDB, testSession, username);
        
            } catch (err) {
                console.log(`Before catch ${err}`);
            }
        });
        
         afterAll(async () => {
            try {
                await testDB.tearDown();
            } catch (err) {
                console.log(`After catch ${err}`);
            }
        });

        test("It should respond with user_resources.jade, which contains the username",  (done) => {
            
            testSession.get("/chat")
            .expect(200).then((res) => {
                const cookies = testSession.cookies.find(function (cookie) {
                    return cookie.name === 'usernameCookie';
                });
                expect(cookies.value).toBe(username);
                done()});
        });
    });
});