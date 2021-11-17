/**
 * Configure the settings to connect to IDme
 * Update client configurations when the actual IDme is implemented for production
 * @module IDme
 * ***/
 const userPort = require('../../userPorts.js')();

var IDme;
if (process.env.NODE_ENV === 'production') {
    IDme = {
        query: {
            client_id: null,
            client_secret: null,
            redirect_uri: `411crystal.cpi.cs.odu.edu:${process.env.PORT}/registration`,
            response_type: 'code',
            scope: 'military'
        },
        authorizing_endpoint: 'https://api.id.me/oauth/authorize',
        token_endpoint: 'https://api.id.me/oauth/token'
    }
} else {
    IDme = {
        query: { 
            client_id: process.env.SIMULATED_IDME_CLIENT_ID || 'localWarrior',
            client_secret: process.env.SIMULATED_IDME_CLIENT_SECRET || 'localsecret',
            redirect_uri: process.env.SIMULATED_IDME_CLIENT_ID? `411crystal.cpi.cs.odu.edu:${process.env.PORT}/registration` :
                (userPort === 3000) ? 'localhost:3000/registration' : `411crystal.cpi.cs.odu.edu:${userPort}/registration`,
            response_type: 'code',
            scope: 'military'
        },
        authorizing_endpoint: process.env.SIMULATED_IDME_AUTH_ENDPOINT || 'http://411crystal.cpi.cs.odu.edu:3333/oauth/authorize',
        token_endpoint: process.env.SIMULATED_IDME_TOKEN_ENDPOINT || 'http://411crystal.cpi.cs.odu.edu:3333/oauth/token'
    }
}

module.exports = IDme;