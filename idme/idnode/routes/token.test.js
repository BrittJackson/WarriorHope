var supertest = require('supertest');
var app = require('../app');
var request = supertest(app);
var url = require('url');
var database = require('./model');
const { assert } = require('console');

var data = {
    client_id: `WarriorHope`,
    client_secret: `abc123`,
    redirect_uri: `411crystal.cpi.cs.odu.edu:3000/registration`,
    code: 'abc123',
    scope: 'military',
}


it ('tests the reponse of proper access_code', async done => {
   
    const response = await (await request.post('/oauth/token').send(data)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(response => {
        assert(response.body.token);
        done();
    }));
    done(); 
});

it ('tests the reponse of invalid access code', async done => {
   
    data.code = 'notvalid';
    const response = await (await request.post('/oauth/token').send(data)
    .expect(400));
    
    done(); 
});

it ('tests the reponse of missing access code', async done => {
   
    data = {
        client_id: `WarriorHope`,
        client_secret: `abc123`,
        redirect_uri: `411crystal.cpi.cs.odu.edu:3000/registration`,
        scope: 'military',
    }
    const response = await (await request.post('/oauth/token').send(data)
    .expect(404));
    
    done(); 
});