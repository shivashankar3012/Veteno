const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const loginSchema = new Schema({
    email:{
        type:String,
        required:true
    }
});

loginSchema.plugin(passportLocalMongoose);

const logging = mongoose.model("logging", loginSchema);
module.exports = logging;
