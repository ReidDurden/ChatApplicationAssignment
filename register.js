module.exports = function(app,fs) {

  app.post('/register', (req, res) => {
    console.log("entered");
    var isUser = 0;
    var userObj;
    var uname = req.body.username;
    var uemail = req.body.email;

    fs.readFile('authdata.json', 'utf-8', function(err,data) {

      if(err) {
        console.log(err);

      } else {

        userObj = JSON.parse(data);

        for(let i = 0;i < userObj.length; i++) {

          if(userObj[i].name == uname){

            isUser = 1;

          }
        }
        if(isUser > 0){
          userObj.status = false;
          res.send(userObj.status);
          console.log("The user registration failed");

        } else {
          userObj.push({"name":uname,"email":uemail, "permissions":1});
          var newData = JSON.stringify(userObj);

          fs.writeFile('authdata.json', newData, 'utf-8', function(err) {

            if (err) throw err;
            console.log("registration succeeded from user: " + uname);
            userObj.status = true;
            res.send(userObj.status);

          });
        }
      }
    });
  });
}
