require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');

/**
 * This module supplies the interface between our application and the tensorflow API, exporting a simple
 * function to allow message classification.
 * @module TensorflowToxicity
 */

// The minimum prediction confidence.
const threshold = 0.85;
console.log('starting');
// // Load the model. Users optionally pass in a threshold and an array of
// // labels to include.
// toxicity.load(threshold).then(model => {
//   const sentences = ['you suck'];

// 'Prediction' outputs something similar to this:
//     prints:
//     {
//       "label": "identity_attack",
//       "results": [{
//         "probabilities": [0.9659664034843445, 0.03403361141681671],
//         "match": false
//       }]
//     },
//     {
//       "label": "insult",
//       "results": [{
//         "probabilities": [0.08124706149101257, 0.9187529683113098],
//         "match": true
//       }]
//     },

// The promise containing the model.  This is kept out of the function so that each
// call does not have to reload the model, resulting in faster classifications.
const mod = toxicity.load(threshold);

/**
 * Interface to load the tensorflow module and take a message as input.
 * @param {string} message 
 * @returns An array containing what catagories the message falls under.  If the array is empty,
 * then no classification of toxicitiy was met.
 */
function classify(message) {
    return new Promise ((resolve, reject) => {
        mod.then(model => {
            model.classify(message).then(predictions => {
                // `predictions` is an array of objects, one for each prediction head,
                // that contains the raw probabilities for each input along with the
                // final prediction in `match` (either `true` or `false`).
                // If neither prediction exceeds the threshold, `match` is `null`.
                
                let offense = [];
                var promises = predictions.map ((prediction) => {
                    if (prediction.results[0].match) {
                        offense.push(prediction.label);
                    }
                });
                Promise.all(promises).then(() => { 
                    resolve(offense);
                });
            }).catch((err) => {reject(err)})
        });
    });
}

/**
 * This function takes a message, splits it among phrases, and censors each phrase.  If 
 * improper language is found, the entire phrase is replaced with `*` for the same amount of characters (including spaces) 
 * the phrase originally had.  
 * @param {string} message 
 * @returns censored string
 */
function censorByPhrase(message) {
    return new Promise ((resolve, reject) => {
        // Split into sentances
        //const phrases = message.split(/(?<=(\.|\,|;|\:))/);
        var phrases = message.split(/(\.|\,|\:|;|\!|\?)/);

        mod.then(model => {
            model.classify(phrases).then(async predictions => {
                // `predictions` is an array of objects, one for each prediction head,
                // that contains the raw probabilities for each input along with the
                // final prediction in `match` (either `true` or `false`).
                // If neither prediction exceeds the threshold, `match` is `null`.
                const stuff = predictions;
                console.log(stuff);
                var newString =  phrases.map((aphrase, i) => {
                    var predPromises = predictions.map(pred => {
                        if (pred.results[i].match) {
                            const replacement = '*'.repeat(aphrase.length);
                            return Promise.reject(replacement);
                        } else {
                            return Promise.resolve(true);
                        }
                    });
                    return Promise.all(predPromises).then(()=> {
                        return Promise.resolve(aphrase);
                    }).catch ((censored) => {
                        return Promise.resolve(censored);
                    })
    
                });
            
                Promise.all(newString).then((str) => {
                    resolve(str.join(''));
                });
            }).catch((err) => {reject(err)});

        });
    });
}




module.exports = {classify, censorByPhrase};
