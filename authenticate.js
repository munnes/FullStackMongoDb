var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy; //strategy to configure our passport
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FaceBookTokenStrategy = require('passport-facebook-token');

var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {//user is object
    return jwt.sign(user, config.secretKey,
        { expiresIn: 3600 })//in seconds in real code be fue days
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken() //one of extract type
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log('JWT payload: ', jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);// you can create user account at this point but we leave it simple
            }
        })
    }));//done callback provide by passport


exports.verifyUser = passport.authenticate('jwt', { session: false });

//exports.verifyAdmin =passport.authenticate('jwt', { session: false });
exports.verifyAdmin = function (req, res, next) {
    if (req.user.admin) {
        next()
    }
    else {
        var err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        next(err);
        return;
    }
};

exports.facebookPassport = passport.use(new FaceBookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
},
    (accessToken, refreshToken, profile, done) => {
        //if he loged in b/f  facebookId: profile.id }
        User.findOne({ facebookId: profile.id }, (err, user)=> {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err)
                        return done(err, false);
                    else
                        return done(null, user);
                })
            }
        })
    }
));


