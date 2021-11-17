const tensor = require('../back_end/public/js/tensorflow');

var censorPlugin = {
    censor: async function(postData) {
        const new_message = await tensor.censorByPhrase(postData.content);
        postData.content = new_message;
        return Promise.resolve(postData);
    },

    censorTopic: async function(postData) {
        const toxicity = await tensor.classify(postData.topic.title);
        if (toxicity.length > 0) {
            postData.topic.title = '**Inappropriate Title**'
            return Promise.resolve(postData);
        } else {
            return Promise.resolve(postData);
        }
    }
};

module.exports = censorPlugin;