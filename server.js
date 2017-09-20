// server.js

// init project
var express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , config = require('./credentials.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// init cryptography
var bcrypt = require("bcrypt-nodejs");

// init db actions
var db = require('./storage');

// init sessions
var session = require('express-session')
  , MongoStore = require('connect-mongo')(session);

app.use(session({
  store: new MongoStore({
    url : config.dbUrl
  }),
  secret: config.secret,
  resave: true,
  saveUninitialized: true
}));

// init passport
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

// serialize user
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

// deserialize user
passport.deserializeUser(function(username, done) {
  db.findUser({username: username}, function(err, user) {
    done(err, user);
  });
});

// LOGIN strategy //
passport.use("login", new LocalStrategy(
  
  function(username, password, done) {
    
    db.findUser({ username: username }, function (err, user) {
      console.log(user)
      // error in the request
      if (err) { return done(err); }
      
      // username not fuound
      if (!user) {
        console.log("wrong name")
        return done(null, false, { message: "wrong username"});
      }
      
      // hash the password before comparing it
      bcrypt.compare(password, user.password, function(err, res){
             
        if (err){
          console.log("Failed to hash: " + err);
          return done(null, false, { message: "error while hashing"});
        }
        // incorrect password
        if (!res) {
          console.log("wrong password")
          return done(null, false, { message: "wrong password"});
        }
        console.log("correct!");
        return done(null, user);
      })
    });
  }
));

// REGISTER strategy //
passport.use('signup', new LocalStrategy(
  function(username, password, done) {
    
    // crypt the password
    bcrypt.hash(password, null, null, function(err, hashPassword){
      
      if (err){
        console.log('Error in Hashing: ' + err);
        return done(err);
      }
      
      // find a user in Mongo with provided username
      db.findUser({'username':username}, function(err, user) {
        
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
      
        // already exists
        if (user) {
        
          console.log('User already exists');
          return done(null, false, {message : 'User Already Exists'});
        
        } else {
          // if there is no user with that name
          // create the user
          var newUser = {
            // set the user's local credentials
            username : username,
            password : hashPassword
          }
          // save the user
          db.saveUser(newUser, function(err){
          
            if (err){
              console.lgo("Error in SignUp: " + err);
              return done(err);
            }
          
            return done(null, newUser);
        });
      }
    })
      })
  })
);

//init routes
var router = require('./routes/index.js')(passport);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.use(router);

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
