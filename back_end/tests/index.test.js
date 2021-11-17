
var app = require('../app');
// For testing http responses
var supertest = require('supertest-session');
const testDB = require('../public/js/userDB');
const testUser = require('./jestSetup/authenticatedSession');

var jwt = require('jsonwebtoken');
// Username to use and verify in cookies
const username = 'logintestuser';
jest.setTimeout(10000);

describe("GET / without an authorized session", () => {
   

    test("It should respond with an index.jade, which does not contain the username",  (done) => {
        
        var testSession = supertest(app);

        testSession.get("/").expect(200).then((res) => {
            expect(res.text).not.toContain(username);
            done();
        });
    });

    describe("GET / with an authorized session", () => {

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

        test("It should redirect to landing page and welcome user by name",  (done) => {
            
            testSession.get("/")
            .expect(200).then((res) => {
                const cookies = testSession.cookies.find(function (cookie) {
                    return cookie.name === 'usernameCookie';
                });
                expect(cookies.value).toBe(username);
                expect(res.text).toContain(username)
                done()});
        });

        test("It should redirect to resources",  (done) => {
            
            testSession.post("/")
            .send({action: 'Resources'})
            .expect(302).then((res) => {
                done()});
        });

        test("It should redirect to groups",  (done) => {
            
            testSession.post("/")
            .send({action: 'Groups'})
            .expect(302).then((res) => {
                const cookies = testSession.cookies.find(function (cookie) {
                    return cookie.name === 'token';
                });
                const token = jwt.verify(cookies.value, 'mqQKqBZmd57xS6B', function(err, decoded) {
                    if(err) {console.log(err)}
                    return decoded
                })
                expect(token.username).toContain(username);
                done()});
        });
    });

});
