// Include Mongoose ORM to connect with database
const Mongoose = require('mongoose')
// Making connection with `hasjobdb` database in your local machine
Mongoose.connect('mongodb://localhost/guidestar/');
//connect database
var db = Mongoose.connection;
//this is will happen when we got an errror while connecting with database
db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function callback(){
    console.log('Connection with database succeeded.')
});

exports.db =db;