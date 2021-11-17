// const express = require("express");
// const app = express();




// /*
// * The below `get` function is just to show connectivity to the database and 
// * The ability to return a JSON
// */
// // This lets the express app talk to the web browser that talks to it
// app.get('/', function(req, res) {

    
//     console.log ('Connection to database...');
//     // Perform a query of the database, return a portion of the result as a JSON
//     connection.query('SELECT * FROM user', function (err, result) {
//         if (err) throw err
        
//         // Collect user name and email into an array
//         let users = [];
//         for (i in result) {
            
//             let user = {};
//             user.name = result[i].username;
//             user.email = result[i].email;
    
            
//             users.push({user});
//             console.log(`Pushed user: ${user.name}`)
             
//         }
//         // Return JSON
//         res.send(JSON.stringify(users));
//     });

// })

// // This is the port that the express web server is listening on
// app.listen(PORT, function(){
//     console.log(`app listening on ${PORT}`);
// })
