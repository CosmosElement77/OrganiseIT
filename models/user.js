const mongose = require('mongoose');
const Schema=mongose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    }, 
    email: {
        type: String,
        required: [true, "email-id is required"]
    },
    password:{
        type: String,
        required: [true, "Password is required"]
    }
});

module.exports = mongose.model('User', userSchema)  