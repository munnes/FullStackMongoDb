var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
  
    admin: {
        type: Boolean,
        default: false
    }
});
User.plugin(passportLocalMongoose);// add username and hash password add additional method to user
module.exports = mongoose.model('User', User);
