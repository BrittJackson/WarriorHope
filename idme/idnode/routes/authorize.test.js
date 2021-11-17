var supertest = require('supertest');
var app = require('../app');
var request = supertest(app);
var url = require('url');
var database = require('./model');

const data = {
    client_id: `WarriorHope`,
    client_secret: `abc123`,
    redirect_uri: `411crystal.cpi.cs.odu.edu:3000/registration`,
    response_type: 'code',
    scope: 'military',
}

// This user is already in database.
const user = {
    username: 'vet',
    password: 'vet'
}


it('gets the test endpoint', async done => {
    const response = await request.get('/oauth/authorize').query(data);
    expect(response.status).toBe(200)
    done()
})

it ('tests the reponse of filling out the form', async done => {
   
    const response = await request.post('/oauth/authorize').query(data).send(user);
    expect(response.res.headers.location).toContain('411crystal.cpi.cs.odu.edu:3000');
    done(); 
});

it ('tests the reponse of not a veteran', async done => {
    
    const user2 = {
        username: 'notvet',
        password: 'notvet'
    }
    const response = await request.post('/oauth/authorize').query(data).send(user2);
    expect(response.text).toContain('not a military service');
    done(); 
});

it ('tests the reponse of incorrect username or password', async done => {
    
    const user2 = {
        username: 'vet',
        password: 'notvet'
    }
    const response = await request.post('/oauth/authorize').query(data).send(user2);
    expect(response.text).toContain('username or password');
    done(); 
});
