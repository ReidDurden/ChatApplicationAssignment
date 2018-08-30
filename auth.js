module.exports = function(app,fs) {

  app.post('/auth', (req,res) => {

    var userObj;
    var uname = req.body.username;

    fs.readFile('authdata.json', 'utf-8', function(err,data){

      if(err) {

        console.log(err);

      } else {

        userObj = JSON.parse(data);
        userObj.exists = false;
        for(let i = 0;i < userObj.length;i++){
          if(userObj[i].name == uname) {
            userObj[i].exists = true;
            res.send(userObj[i]);
            return;
          }
        }
      }

      res.send(userObj.exists);
    });
  });
}
