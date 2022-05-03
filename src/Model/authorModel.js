const mongoose = require('mongoose');
var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const authorSchema = new mongoose.Schema({
    fname: {
        type: String,
        trim:true,
        required: true
    },
    lname: {
        type: String,
        trim:true,
        required: true
    },
    title: {
        type: String,
        trim:true,
        required: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        lowercase: true,
        validate: [validateEmail, 'Please fill a valid email address']
        
    },
    password: {
        type:String,
        trim:true,
        required: true
    },
},  {timestamps: true });

module.exports = mongoose.model('Author',authorSchema)
