var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose')

var UserSchema = new mongooseSchema({
    uuid: {
        type: String,
        default: '',
        required: true,
        trim: true
    },
    username: {
        type: String,
        default: 'Guest',
        required: false,
        trim: true,
    },
    roleOfUser : {
        type: String,
        default: 'ROLE_USER',
        required: false,
        trim: true,
    },
    email: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    password: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    jwtHash: {
        type: String,
        requried: false,
        default: '',
        trim: true
    },
    pubKey: {
        type: String,
        requried: false,
        default: '',
        trim: true
    },
    userOrg: {
        type: String,
        default: '',
        required: false,
        trim: true,
    },
    
    // isEmailVerify: {
    //     type: Boolean,
    //     default: false,
    //     required: true,
    //     trim: true
    // },
    // gender: {
    //     type: String,
    //     default: '',
    //     required: false,
    //     trim: true
    // },
    // lastActiveTime: {
    //     type: Date,
    //     default: Date.now
    // },
    // provider: {
    //     type: String,
    //     trim: true
    // },
    // platform: {
    //     type: String,
    //     trim: true
    // },
    // userImage: {
    //     type: String,
    //     default: "",
    //     requried: false,
    //     ref: 'Events',
    //     trim: true
    // },
    // userJwtToken: {
    //     type: String,
    //     requried: true,
    //     default: '',
    //     trim: true
    // },
    // deviceToken: {
    //     androidToken: {
    //         type: String,
    //         default: '',
    //         trim: true
    //     },
    //     iosToken: {
    //         type: String,
    //         default: '',
    //         trim: true
    //     }
    // },
    // city: {
    //     type: String,
    //     default: '',
    //     requried: false,
    //     trim: true
    // },
    // facebookId: {
    //     type: String,
    //     default: null,
    //     requried: false,
    //     trim: true
    // },
    // contryCode: {
    //     type: Number,
    //     default: 91 ,
    //     requried: false,
    //     trim: true
    // }
});

UserSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

UserSchema.plugin(timestamps);
UserSchema.plugin(softDelete);



function stringNotNull(obj) {
    return obj.length
}

var User = mongoose.model('User', UserSchema);
module.exports = User
