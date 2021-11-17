var app = require('../../app');
// For testing http responses
var supertest = require('supertest-session');
const testDB = require('../../public/js/userDB');
const testUser = require('../jestSetup/authenticatedSession');


// Username to use and verify in cookies
const username = 'logintestuser';
jest.setTimeout(10000);

describe("GET /assessment without an authorized session", () => {
   

    it("should redirect to homepage",  (done) => {
        
        var testSession1 = supertest(app);

        testSession1.get("/assessment").expect(302).then((res) => {
            expect(res.text).not.toContain(username);
            done();
        });
    });

    var testSession = supertest(app);

        // Nested beforeAll and afterAll as the first test does not need session vairables.
        beforeAll (async (done) => {
            try {
    
                await testDB.setup();
                testSession = await testUser.authenticateSession(testDB, testSession, username);
                done();
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

    describe("GET /assessment with an authorized session", () => {

        

        test("It should redirect to assessments for someone in a group",  (done) => {
            
            testSession.get("/assessment")
            .expect(200).then((res) => {
                const cookies = testSession.cookies.find(function (cookie) {
                    return cookie.name === 'usernameCookie';
                });
                expect(cookies.value).toBe(username);
                expect(res.text).toContain('Assessments');
                done()});
        });

        test("It should redirect to assessments for not assigned",  async (done) => {
            
            // remove from group, make sure they have to take assessments
            await testDB.setInactive(1);
            testSession.get("/assessment")
            .expect(200).then((res) => {
                const cookies = testSession.cookies.find(function (cookie) {
                    return cookie.name === 'usernameCookie';
                });
                expect(cookies.value).toBe(username);
                expect(res.text).toContain('Assessments');
                done()});
        });

        test("It should collect info for POST",  async (done) => {
            
            const data = {
                domain1: 'true',
                domain2:  'true',
                domain3:  'true',
                domain4:  'true',
                domain5:  'true',
                domain6:  'true',
                domain7:  'true',
                domain8:  'true',
                domain9:  'true',
            }
            testSession.post("/assessment")
            .send(data)
            .expect(200).then((res) => {
                const cookies = testSession.cookies.find(function (cookie) {
                    return cookie.name === 'usernameCookie';
                });
                expect(cookies.value).toBe(username);
                done()});
        });
    });
});
