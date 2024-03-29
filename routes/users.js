var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');
var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */

router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  // res.send('respond with a resource');
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users)
    }, (err) => next(err))
    .catch((err) => next(err))
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successfull!' })
          });
        });

      }
    });

});
router.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {//info for validation errors and user notexist, err for genunion error
    if (err)
      return next(err);

    if (!user) {// user in valid of password not valid
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: false,
        status: 'Login Unsuccessful!',
        err: info
      })// client when recive token will extract token
    }

    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: false,
          status: 'Login Unsuccessful!',
          err: 'Could not log in user'
        })// client when recive token will extract token
      }

      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        status: 'Login Successful!',
        token: token
      })
    });
  })(req, res, next);
})

router.get('/logout', cors.corsWithOptions, (req, res) => {
  if (req.session) {
    req.session.destroy();//server side
    res.clearCookie('session-id'); //client side
    res.redirect('/');
  }
  else {
    var err = new Error('You are not loggedin!');
    error.status = 403;
    next(err)
  }
})

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  // exprees use facebook token to  verfiy user with facebook exprees return json web tokrn  to client
  if (req.user) {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true, token: token,
      status: 'You are successfully logged in'
    })
  }
})
// chk json web token valid or not
router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ status: 'JWT invalid!', success: false, err: info })
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ status: 'JWT valid!', success: true, user: user })
    }
  })(req, res); // when call passport and expect call back you should add(req.res)
})
module.exports = router;
