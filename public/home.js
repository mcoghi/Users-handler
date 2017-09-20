$(function(){
  
  $.get("/user", function(user){
    $("h1").append(user.username)
  })
})