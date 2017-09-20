'use strict'

var mongo = require('mongodb').MongoClient
  , config = require('./credentials.js');

// search for a user in the database
function findUser(query, callBack){
  console.log("searching user")
  mongo.connect(config.dbUrl, function(err, db){
    
    if (err) throw err;
    
    var users = db.collection("users");
    users.find(query).toArray(function(err, documents){
      
      console.log(documents)
      if (err) {
        
        // if the search went wrong, pass the error to the call back
        callBack(err, null);
        
      } else if (documents.length == 0){
        
        // if the search didn't produce any result, tell the callback
        callBack(null, null);
        
      } else {
      
        // if there is at least one result pass the first one
        callBack(null, documents[0]);
      
      }
    });
  });
}

// save new user
function saveUser(query, callBack){
  
  // open the database
  mongo.connect(config.dbUrl, function(err, db){
    
    // open the collection
    var users = db.collection("users");
    
    // insert the new user
    users.insert(query, function(err, data){
      
      // if there is an error during insertion, pass it to the call back
      if (err){ 
        
        callBack(err)
        
      } else {
        
        // if there are no errors, call the callback
        console.log("there's a new user!");
      
        callBack(null);
      }
    })
  })
}

module.exports = {
  findUser : findUser,
  saveUser : saveUser
}