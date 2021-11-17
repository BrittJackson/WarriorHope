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


describe("GET /resetPassword", () => {
    test("email token received",  function (done) {
        testSession.get('/resetPassword')
        .set('Cookie', `emailCookie=${testUser.email}`)
          .expect(200)
          .end(done)
    });
});

describe("GET /resetPassword", () => {

    test("no email token", function (done) {
        testSession.get('/resetPassword')
        .expect(302)
        .end(done)
    });
});

describe("POST /resetPassword", () => {

    let badEmail = 'thisEmail@is.bad'
    // 
    it('reset password bad email', function(done) {
        testSession.post('/resetPassword')
        .set('Cookie', `emailCookie=${badEmail}`)
        .send({
           password: testUser.password,
           passwconfirm: testUser.password
        })
        .expect(500)
        .end(done);
    });


    // 
    it('reset password', function(done) {
        testSession.post('/resetPassword')
        .set('Cookie', `emailCookie=${testUser.email}`)
        .send({
           password: testUser.password,
           passwconfirm: testUser.password
        })
        .expect(200)
        .end(done);
    });
});
