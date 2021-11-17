const app = require('../../app');
// For testing http responses
const { ExpectationFailed, RequestHeaderFieldsTooLarge } = require('http-errors');
const testDB = require('../../public/js/userDB');

var session = require('supertest-session');
var hash = require('../../routes/login/common/passwordHash');

const testUser = {
    username: 'chickenwing',
    email: 'abcdefg@hijk.lmno',
    password: '1234556777'
}

beforeEach(function () {
    testSession = session(app);
  });

beforeAll (async () => {
    try {
        const hashedpwd = await hash(testUser.password);
        await testDB.setup();
        await testDB.addUser(testUser.username,
         testUser.email, hashedpwd);
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


// Navigating to pag without being logged in
describe("GET /forgotPassword", () => {
    test("get page",  function (done) {
        testSession.get('/forgotPassword')
          .expect(200)
          .end(done)
    });
});

describe("POST /forgotPassword", () => {
    let escapeEmail = testUser.email.replace('@', '%40')
    let badEmail = 'thisis@abad.email'
    let escapeBadEmail = badEmail.replace('@', '%40')
    // 
    it('bad email, do not get token', function(done) {
        testSession.post('/forgotPassword')
        .send({
            email: badEmail
        })
        .expect(302)
        .then((res) => {
            const header = JSON.stringify(res.header);
            expect(header).not.toContain(`emailCookie=${escapeBadEmail}`);  
            done()
        });
    });

    // 
    it('good email, get token', function(done) {
        testSession.post('/forgotPassword')
        .send({
            email: testUser.email
        })
        .expect(302)
        .then((res) => {
            const header = JSON.stringify(res.header);
            expect(header).toContain(`emailCookie=${escapeEmail}`);  
            done()
        });
    });
});