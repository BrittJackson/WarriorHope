
//const supertest = require('supertest');
const app = require('../../app');
const testDB = require('../../public/js/userDB');
var supertest = require('supertest-session');

var testSession = null;


beforeAll (async () => {
    try {
        await testDB.setup();
    } catch (err) {
        console.log(`Before catch ${err}`);
    }
});

beforeEach(function () {

  testSession = supertest(app);
});

 // simple call to promise function that drops the database.
afterAll(async () => {
    try {
        await testDB.tearDown();
    } catch (err) {
        console.log(`After catch ${err}`);
    }
});

var data;

const original = {
    
    username: 'test123',
    email: 'notusedtestemail@notgmail.com',
    password: 'mypassword',
    confirm: 'mypassword',
    eula: '1',
    code: 'abc123'
    
}


describe("GET /registration ", () => {
    test("Registration", async (done) => {
        const response = await supertest(app).get("/registration");
        expect(response.statusCode).toBe(200, done());
    });
});



describe("POST /registration valid entry", () => {

    // Test that a valid username, email and password are sent via POST
    // and the user is entered into the database.  A token will be delivered.
    it('should add a new user to the database',  async (done) => {
        
        data =  original;
        supertest(app)
          .post('/registration')
          .send(data)
          .expect(302)
          .then((res) => {
            const header = JSON.stringify(res.header);
            expect(header).toContain('usernameCookie=test123');  
            done()
        });
    });


    describe("POST /registration already used username / password", () => {

        
        beforeEach (async () => {
            data = original;
            try { 
                await testDB.addUser(data.username, data.email, data.password);
            } catch {/*nothing*/}
        });
        // Test that it will not register someone with the same username or email
        it('should not register used username', (done) => {
                
            data.email = "someotheremail@host.org";
            supertest(app)
                .post('/registration')
                .send(data)
                .expect(400) 
                .then(function(res) {
                    expect(res.text).toContain('Username already used');
                    done();
                }).catch(err => {fail(err)});  
            });

        it('should not register used email', async (done) => {
            
            data.username = 'adifferentUserName123';
            // should not add bases off same emails
            supertest(app)
                .post('/registration')
                .send(data)
                .expect(400)    
                .then(res => {
                    expect(res.text).toContain('Email account already');
                    done();
                }).catch(err => {fail(err)});
                
            

        });

  

        describe("POST /registration other issues with registration", () => {

            beforeEach (() => {
                data = original;
            });
            // Test other improper entires
            it('should validate confirm password matches password', async (done) => {
                data.confirm = 'notCorrect';
                const res = supertest(app)
                .post('/registration')
                .send(data)
                .expect(400)
                .then( res => {
                    expect(res.text).toContain('confirmation does not match');
                    done();
                });

                });

                // Test other improper entires
            it('should not allow invalid code',  async (done) => {
                data.confirm = data.password;
                data.username = 'badCodeUser';
                data.email = 'badCode@email.com';
                data.code = 'invalidNumber';
                supertest(app)
                .post('/registration')
                .send(data)
                .expect(400)
                .then(res => {
                    expect(res.text).toContain('Invalid credentials from IDme');
                    done();
                });

                });
            
                // Test no EULA
            it('should not allow unchecked EULA', async (done) => {
                data.eula = '0';
                supertest(app)
                .post('/registration')
                .send(data)
                .expect(400)
                .then(res => {
                    expect(res.text).toContain('Please agree to the EULA');
                    done();
                });
            })
            
        });
    });
});