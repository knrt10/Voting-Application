var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var UserSchema = new Schema({
    name : {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    polls :[{
        type : mongoose.Schema.Types.Object,
        ref :'Polls'
    }]
});

var Model = mongoose.model('User',UserSchema);

module.exports = Model;