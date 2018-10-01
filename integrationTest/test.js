/*var assert = require('assert');
describe('Test for function one', () => {
  describe('Test Case 1 #fnOne()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
  describe('Test Case #fnOne()', () => {
    it('should return 3 as the value is present', () => {
      assert.equal([1,2,3,4,5].indexOf(4), 3);
    });
  });
});
*/

var assert = require('assert');
////////Establish the server////////
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const bodyParser = require("body-parser");
//const formidable = require('formidable');

app.use(express.static(path.join('../dist/ChatApplicaton')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var dbF = require('../dbFunctions.js')

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
var mongod;

describe('Tests for Database Functions [dbFunctions.js]', () => {
  before((done) => {
    MongoClient.connect(url, {poolSize:10}, function(err,client) {
      if (err) {return console.log(err)}
      const dbName = 'IntTesting';
      const db = client.db(dbName);
      mongod = db;
      require('../socket.js')(app, io, fs, mongod);


      dbF.DBinit(db).then(result=>{
          done();
        })
    });
  });

  it('dbF.FindRecord(superData)should return the default info for the user super', function(done) {
    dbF.FindRecord(mongod, "super", "admin").then(result=>
      {
        var defaultSuper = { name: 'super',password: 'admin',email: 'super@email.com',permissions: 3,groups: [ 'Global' ],avatar: '' }
        var userData = JSON.parse(result);
        delete userData._id;
        assert.deepEqual(userData , defaultSuper);
        done();
        return;
      });
  });

  it('dbF.FindRecord() should return null if there is no user found', function(done) {
    dbF.FindRecord(mongod, "NotAUser", "NotAPassword").then(result=>{

      assert.equal(result, "null");
      done();
      return;
    })
  })

  it('dbF.GetGroups() should return the channels of the group specified. In this case, the default channel Global.', function(done) {
    dbF.GetGroups(mongod, "Global").then(result=> {
      var defaultChannels = [ "Welcome Channel", "Announcments" ];
      assert.deepEqual(result, defaultChannels);
      done();
      return;
    })
  })

  it('dbF.ChangeGroups() should return the data of the group specified.', function(done) {
    dbF.ChangeGroups(mongod, "Global").then(result=> {
      var globalGroupInfo = [ "Welcome Channel", "Announcments" ];
      delete result._id;
      assert.deepEqual(result.channels, globalGroupInfo);
      done();
      return;
    })
  })

  it('dbF.ChangeGroups() should return null if no group is found', function(done) {
    dbF.ChangeGroups(mongod, "NotAGroup").then(result=> {
      assert.equal(result, null);
      done();
      return;
    })
  })

  it('dbF.NewRoom() should return the updated group information for the group', function(done) {
    dbF.NewRoom(mongod, "Global", "newRoom").then(result=> {
      assert(result);
      done();
      return;
    })
  })

  it('dbF.NewRoom() should return null if the group the channel is being made in doesnt exist', function(done) {
    dbF.NewRoom(mongod, "NotAGroup", "room").then(result=> {
      assert.equal(result, false);
      done();
      return;
    })
  })

  it('dbF.CreateNewGroup() should return the name of the new group back to the user on success', function(done) {
    dbF.CreateNewGroup(mongod, "NotAGroup", "super").then(result=> {
      assert.equal(result, "NotAGroup");
      done();
      return;
    })
  })

  it('dbF.CreateNewGroup() should return false if the group already exists.', function(done) {
    dbF.CreateNewGroup(mongod, "Global", "super").then(result=> {
      assert.equal(result, false);
      done();
      return;
    })
  })

  it('dbF.AddToGroup() should return true on succesfully adding the user to the group', function(done) {
    dbF.AddToGroup(mongod, "NotAGroup", "super").then(result=> {
      assert.equal(result, true);
      done();
      return;
    })
  })

  it('dbF.AddToGroup() should return false if the user doesnt exist', function(done) {
    dbF.AddToGroup(mongod, "Global", "NotAUser").then(result=> {
      assert.equal(result, false);
      done();
      return;
    })
  })

  it('dbF.RemoveFromGroup() should return true if the user was removed', function(done) {
    dbF.RemoveFromGroup(mongod, "Global", "super").then(result=> {
      assert.equal(result, true);
      done();
      return;
    })
  })

  it('dbF.RemoveFromGroup() should return false if the user was removed', function(done) {
    dbF.RemoveFromGroup(mongod, "Global", "NotAUser").then(result=> {
      assert.equal(result, false);
      done();
      return;
    })
  })

  it('dbF.SetAdmin() should return true the users permissions were updated', function(done) {
    dbF.SetAdmin(mongod, "super", 3).then(result=> {
      assert.equal(result, true);
      done();
      return;
    })
  })

  it('dbF.SetAdmin() should return false if the user was not found', function(done) {
    dbF.SetAdmin(mongod, "NotAUser", 2).then(result=> {
      assert.equal(result, false);
      done();
      return;
    })
  })

  it('dbF.SetGroupAdmin should return true if the user was made an admin of the group', function(done) {
    dbF.SetGroupAdmin(mongod, "super", "Global").then(result=> {
      assert.equal(result, true);
      done();
      return;
    })
  })

  it('dbF.SetGroupAdmin() should return false if the group doesnt exist', function(done) {
    dbF.SetGroupAdmin(mongod, "super", "Not A Group").then(result=> {
      assert.equal(result, false);
      done();
      return;
    })
  })

  it('dbF.RemoveGroup() should return a list of users of the deleted group if it exists', function(done) {
    dbF.RemoveGroup(mongod, "NotAGroup" ).then(result=> {
      assert.deepEqual(result, ["super"]);
      done();
      return;
    })
  })

  it('dbF.RemoveRoom() should return true on succesfully removing the room from a channel', function(done) {
    dbF.RemoveRoom(mongod, "Global", "newRoom").then(result=> {
      assert.equal(result, true);
      done();
      return;
    })
  })

  it('dbF.AvatarUpdate() should return true if the users avatar was updated', function(done) {
    dbF.AvatarUpdate(mongod, "super", "BASE64 IMAGE URL").then(result=> {
      assert.equal(result, true);
      done();
      return;
    })
  })

  it('dbF.GetAvatar() should return the avatar of the specified user', function(done) {
    dbF.GetAvatar(mongod, "super").then(result=> {
      assert.equal(result, "BASE64 IMAGE URL");
      done();
      return;
    })
  })



  after((done) => {
    mongod.collection('users').drop();
    mongod.collection('groups').drop();
    done();
  });

});
