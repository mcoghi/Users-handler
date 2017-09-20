var express = require('express')
  , router = express.Router();


// check if the user is authenticated
var isAuthenticated = function (req, res, next) {
  console.log('checking authentication')
  if (req.isAuthenticated()){
    console.log("authenticated")
    return next();
  }
  console.log('not authenticated')
  res.redirect('/');
}

module.exports = function(passport){
  
  // LOG IN PAGE//
  router.get("/", function(req, res){
    res.sendFile("views/login.html", {'root': '../app/'});   
  });
  
  // REGISTRATION PAGE //
  router.get("/register", function(req, res){
    res.sendFile("views/register.html", {'root': '../app/'});
  });
  
  // HOME PAGE // pass it only if user is authenticated
  router.get('/home', isAuthenticated, function(req, res){
    res.sendFile("views/home.html", {'root': '../app/'});
  });
  
  // SIGN UP REQUEST //
  router.post("/signup", passport.authenticate("signup", {
    successRedirect : "/home",
    failurRedirect : "/register"
  }))
  
  // LOG IN //
  router.post("/login", passport.authenticate("login", { 
    successRedirect : "/home",
    failureRedirect : "/",
  }));
 
  // LOG OUT //
  router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  })
  
  // USER DATA REQUEST //
  router.get("/user", function(req, res){
    res.send(req.user);
  })

  return router;
  
}