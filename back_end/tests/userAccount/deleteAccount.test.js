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
describe("GET /deleteAccount not logged in", () => {
    test("Not logged in",  function (done) {
        testSession.get('/deleteAccount')
          .expect(302)
          .end(done)
    });
});

// Navigating to pag being logged in
describe("GET /deleteAccount logged in", () => {

    let authenticatedSession;

    beforeEach(async function (done) {
        testSession.post('/signin')
          .send({ username: testUser.username, password: testUser.password, action: 'Submit' })
          .expect(302)
          .end(function (err) {
            if (err) return done(err);
            console.log('yep');
            authenticatedSession = testSession;
            return done();
        });
    });

    test("Logged in", function (done) {
        authenticatedSession.get('/deleteAccount')
        .expect(200)
        .end(done)
    });
});

describe("POST /deleteAccount", () => {
    
    let badPwd = 'badpassword'
    // Delete bad password
    it('delete', function(done) {
        testSession.post('/deleteAccount')
        .set('Cookie', `usernameCookie=${testUser.username}`)
        .send({
            password: badPwd,
            passwconfirm: badPwd
        })
        .expect(400)
        .end(done);
    });

    // Delete
    it('delete', function(done) {
        testSession.post('/deleteAccount')
        .set('Cookie', `usernameCookie=${testUser.username}`)
        .send({
            password: testUser.password,
            passwconfirm: testUser.password
        })
        .expect(302)
        .end(done);
    });


});