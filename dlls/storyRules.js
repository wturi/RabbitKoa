const material = require('../dlls/mongodb');

let ruleStrategy = {
    RandomStory: function (type) {
        let data = material.find.Random(type);
        let datanext = data.then(function (result) {
            let count = result.length;
            let randomNum = Math.floor(Math.random() * count);
            return result[randomNum];
        })
        return datanext;
    },
    RecentStory: function (type) {
        let data = material.find.Recent(type);
        return data;
    },
    DesignationStory: function (type) {
        return {
            title: 'rtitle',
            url: 'DesignationStory' + type
        }
    }
}






module.exports.ruleStrategy = ruleStrategy;