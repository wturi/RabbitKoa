const mongoose = require('mongoose');
const db = mongoose.createConnection('mongodb://localhost:27017/rabbitMP');

mongoose.Promise=global.Promise;

db.on('open', function (err) {
    if (err)
        console.error(err)
    else
        console.log('mongodb open');
})

db.on('error', function (err) {
    console.error(err);
})

module.exports.mongoose = {
    mongoose: mongoose,
    db: db
};