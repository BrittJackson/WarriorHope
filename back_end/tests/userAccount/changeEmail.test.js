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
describe("GET /changeEmail not logged in", () => {
    test("Not logged in",  function (done) {
        testSession.get('/changeEmail')
          .expect(302)
          .end(done)
    });
});

// Navigating to pag being logged in
describe("GET /changeEmail logged in", () => {

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
        authenticatedSession.get('/changeEmail')
        .expect(200)
        .end(done)
    });
});

describe("POST /changeEmail in use", () => {
    // User is changing email to a used email
    it('changing to an in use email', function(done) {
        testSession.post('/changeEmail')
        .set('Cookie', `usernameCookie=${testUser.username}`)
        .send({
            email: testUser.email,
            emailconfirm: testUser.email
        })
        .expect(400)
        .end(done);
    });
});

describe("POST /changeEmail not in use", () => {
    let badEmail = '0yassin@bitmonkey.xyz';
    // User is changing email to an unused email
    it('changing to a not in use email', function(done){
        testSession.post('/changeEmail')
        .set('Cookie', `usernameCookie=${testUser.username}`)
        .send({
            email: badEmail,
            emailconfirm: badEmail
        })
        .expect(200)
        .end(done);
    });
});

