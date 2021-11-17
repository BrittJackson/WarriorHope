const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'

var _db;

module.exports = {

    connectToServer: function (){
        MongoClient.connect(url, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        }, (err, client) => {
            _db = client.db('nodebb');
            return callback(err);
        })
    },

    getDb: function() {
        return _db;
    }
};