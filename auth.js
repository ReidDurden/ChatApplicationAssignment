module.exports = function(app,fs) {

  app.post('/auth', (req,res) => {

    var userObj;
    var uname = req.body.username;

    fs.readFile('authdata.json', 'utf-8', function(err,data){

      if(err) {

        console.log(err);
        res.send('Failed to read from file');

      } else {

        userObj = JSON.parse(data);
        for(let i = 0;i < userObj.length;i++){
          if(userObj[i].name == uname) {
            res.send(userObj[i].name + " is a user!");
            return;
          }
        }
      }

      res.send("Please check to make sure that you entered the correct username.");

    });
  });
}
