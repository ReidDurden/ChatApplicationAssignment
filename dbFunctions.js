module.exports = {
    DBinit: async function(db) {

        db.createCollection('users', function(err, res) {});
        const usersCollection = db.collection('users');
        if (await usersCollection.countDocuments({}) == 0) {
            await usersCollection.insertOne({
                name: "super",
                password: "admin",
                email: "super@email.com",
                permissions: 3,
                groups: ["Global"],
                avatar: ""
            })
            console.log("Users collection defaulted");
        }

        db.createCollection('groups', function(err, res) {});

        const groupsCollection = db.collection('groups');
        if (await groupsCollection.countDocuments({}) == 0) {
            await groupsCollection.insertOne({
                gName: "Global",
                channels: ["Welcome Channel", "Announcments"],
                admins: ["super"]
            })
            console.log("Groups collection defaulted");
        }

        db.createCollection('channelHist', function(err, res) {});

        const histCollection = db.collection('channelHist');
        if (await histCollection.countDocuments({}) == 0) {
          await histCollection.insertOne({
            channelName:"Welcome Channel",
            history:[]
          })
          await histCollection.insertOne({
            channelName:"Announcments",
            history:[]
          })
        }

        console.log("Channel History collection defaulted");

        return;
    },

    FindRecord: async function(db, user, password) {
        const usersCollection = db.collection('users');

        var query = {name: user, password: password};
        let response = await usersCollection.findOne(query);
        let res = JSON.stringify(response);

        return res;
    },

    AddUser: async function(db, userData) {
      const usersCollection = db.collection('users');
      var newUser = {name:userData.name,password: userData.password, email:userData.email, permissions: 1, groups:["Global"], avatar:""};
      await usersCollection.insertOne(newUser)
      return true;
   },

   GetGroups: async function(db, groupName) {
     const groupsCollection = db.collection('groups');
     var query = {gName: groupName};
     let response = await groupsCollection.findOne(query);
     let res = JSON.stringify(response);
     let returnVal = JSON.parse(res);
     return returnVal.channels;
   },

   ChangeGroups: async function(db,groupName) {
     const groupsCollection = db.collection('groups');
     var query = {gName: groupName};
     let response = await groupsCollection.findOne(query);
     let res = JSON.stringify(response);
     let returnVal = JSON.parse(res);
     return returnVal;
   },

   NewRoom: async function(db, groupName, roomName) {
     const groupsCollection = db.collection('groups');
     const channelHist = db.collection('channelHist');

     var query = {gName: groupName};
     let groupTemp = await groupsCollection.findOne(query);
     if(groupTemp == null) {
       return false;
     } else {
     let groupInfo = JSON.stringify(groupTemp);
     let newGroupInfo = JSON.parse(groupInfo);
     newGroupInfo.channels.push(roomName);

     await groupsCollection.updateOne(query, {$set: {channels: newGroupInfo.channels}});
     await channelHist.insertOne({channelName: roomName, history:[]});

     return newGroupInfo;
   }
   },

   CreateNewGroup: async function(db, groupName, curUser) {
     const groupsCollection = db.collection('groups');
     var query = {gName: groupName};
     let groupTemp = await groupsCollection.findOne(query);
     if(groupTemp == null) {
       var newGroup = {gName: groupName, channels: [], admins:[curUser]};
       await groupsCollection.insertOne(newGroup);

        return groupName;
     } else {
       return false;
     }
   },

  AddToGroup: async function(db, group, user) {
    const usersCollection = db.collection('users');
    var query = {name: user};
    let userTemp = await usersCollection.findOne(query);
    if(userTemp == null) {
      return false;
    } else {
    let userJSON = JSON.stringify(userTemp);
    let userInfo = JSON.parse(userJSON);
    userInfo.groups.push(group);
    await usersCollection.updateOne(query, {$set: {groups: userInfo.groups}});

    return true;
  }
  },

  RemoveFromGroup: async function(db, group, user) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    let userTemp = await usersCollection.findOne(query);
    if(userTemp == null) {
      return false;
    } else {
    let userJSON = JSON.stringify(userTemp);
    let userData = JSON.parse(userJSON);

    var userGroups = userData.groups;
      for(let b = 0; b < userGroups.length; b++){
        if(userGroups[b] == group) {
          userGroups.splice(b, 1);
        }
      }
    userData.groups = userGroups;
    await usersCollection.updateOne(query, {$set: {groups: userData.groups}});
    return true;
  }
  },

  RemoveUser: async function(db, user) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    await usersCollection.deleteOne(query, {justOne: true});
    return;

  },

  SetAdmin: async function(db, user, permLvl) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    let response = await usersCollection.findOne(query);
    if(response == null) {
      return false;
    } else {
    let res = JSON.stringify(response);
    let userInfo = JSON.parse(res);

    if(userInfo.permissions < permLvl) {
      userInfo.permissions = permLvl;
      await usersCollection.updateOne(query, {$set: {permissions: userInfo.permissions}})
      return true;
    } else {
      return true;
    }
  }
  },


  SetGroupAdmin: async function(db, user, group) {
    const groupsCollection = db.collection('groups');

    var query = {gName: group};
    let response = await groupsCollection.findOne(query);
    if(response == null) {
      return false;
    } else {

    let groupJ = JSON.stringify(response);
    let groupInfo = JSON.parse(groupJ);

    groupInfo.admins.push(user);
    await groupsCollection.updateOne(query, {$set: {admins: groupInfo.admins}});
    return true;
  }
  },

  RemoveGroup: async function(db, group) {
    const groupsCollection = db.collection('groups');
    const usersCollection = db.collection('users');
    const channelHist = db.collection('channelHist');

    var query = {gName: group};
    var channels = [];
    await groupsCollection.find({}).forEach(function(doc) {
      channels.push(doc.channels);
    });
    await groupsCollection.deleteOne(query, {justOne: true});

    var users = [];

    await usersCollection.find({}).forEach(function(doc) {
      users.push(doc.name);
    });

    var returnVal = {users: users, channels: channels};

    return returnVal;

  },

  RemoveChannelHistory: async function(db, channel) {
    const channelHist = db.collection('channelHist');

    var query = {channelName:channel};

    await channelHist.deleteOne(query, {justOne:true});
    return true;
  },

  GetChannelHistory: async function(db,channel) {
    const channelHist = db.collection('channelHist');

    var query = {channelName:channel};

    var response = await channelHist.findOne(query);
    if(response == null) {
      return false;
    } else {
    let chatH = JSON.stringify(response);
    let chatHistory = JSON.parse(chatH);

    return chatHistory;
  }
},

  AddToChannelHistory: async function(db, channel, message) {
    const channelHist = db.collection('channelHist');

    var query = {channelName: channel};

    let channelTemp = await channelHist.findOne(query);

    let channelJSON = JSON.stringify(channelTemp);
    let channelInfo = JSON.parse(channelJSON);

    channelInfo.history.push(message);
    await channelHist.updateOne(query, {$set: {history: channelInfo.history}});
    return true;
  },

  RemoveRoom: async function(db, group, room) {
    const groupsCollection = db.collection('groups');

    var query = {gName: group};
    let response = await groupsCollection.findOne(query);
    let groupJ = JSON.stringify(response);
    let groupInfo = JSON.parse(groupJ);

    let groupChannels = groupInfo.channels;

    for(var i = 0; i < groupChannels.length; i++) {
      if(groupChannels[i] == room) {
        groupChannels.splice(i, 1);
        groupInfo.channels = groupChannels;
      }
    }
    return true;

  },

  AvatarUpdate: async function(db, user, avatar) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    await usersCollection.updateOne(query, {$set: {avatar: avatar}});

    return true;

  },

  GetAvatar: async function(db, user) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    let response = await usersCollection.findOne(query);
    let res = JSON.stringify(response);
    let returnVal = JSON.parse(res)

    return returnVal.avatar;
  }

}
