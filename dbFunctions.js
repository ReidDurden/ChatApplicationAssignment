module.exports = {
    DBinit: async function(db) {

        db.createCollection('users', function(err, res) {});
        const usersCollection = db.collection('users');
        if (await usersCollection.countDocuments({}) == 0) {
            console.log(await usersCollection.countDocuments({}));
            await usersCollection.insertOne({
                name: "super",
                password: "admin",
                email: "super@email.com",
                permissions: 3,
                groups: ["Global"],
                avatar: ""
            })
        }

        db.createCollection('groups', function(err, res) {});

        const groupsCollection = db.collection('groups');
        if (await groupsCollection.countDocuments({}) == 0) {
            console.log(await groupsCollection.countDocuments({}));
            await groupsCollection.insertOne({
                gName: "Global",
                channels: ["Welcome Channel", "Announcments"],
                admins: ["super"]
            })
        }

        return;
    },

    FindRecord: async function(db, user, password) {
        const usersCollection = db.collection('users');

        var query = {name: user, password: password};
        let response = await usersCollection.findOne(query);
        let res = JSON.stringify(response);
        //let newV = JSON.parse(res);
        //console.log(newV);
        return res;
    },

    AddUser: async function(db, userData) {
      const usersCollection = db.collection('users');
      var newUser = {name:userData.name,password: userData.password, email:userData.email, permissions: 1, groups:["Global"], avatar:""};
      await usersCollection.insertOne(newUser, function(err, res) {
       if (err) throw err;
       console.log("1 document inserted");
     });
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
     var query = {gName: groupName};
     let groupTemp = await groupsCollection.findOne(query);
     let groupInfo = JSON.stringify(groupTemp);
     let newGroupInfo = JSON.parse(groupInfo);
     newGroupInfo.channels.push(roomName);
     console.log("This one");
     console.log(newGroupInfo);

     await groupsCollection.update(query, {$set: {channels: newGroupInfo.channels}});

     return newGroupInfo;
   },

   CreateNewGroup: async function(db, groupName, curUser) {
     const groupsCollection = db.collection('groups');
     var query = {gName: groupName};
     let groupTemp = await groupsCollection.findOne(query);
     if(groupTemp == null) {
       var newGroup = {gName: groupName, channels: [], admins:[curUser]};
       await groupsCollection.insertOne(newGroup, function(err, res) {
         if (err) throw err;
          console.log("A new group was added");
          return groupName;
       })
     } else {
       console.log("The group may already exist.");
       return false;
     }
   },

  AddToGroup: async function(db, group, user) {
    const usersCollection = db.collection('users');
    var query = {name: user};
    let userTemp = await usersCollection.findOne(query);
    let userJSON = JSON.stringify(userTemp);
    let userInfo = JSON.parse(userJSON);
    userInfo.groups.push(group);
    console.log(userInfo);
    await usersCollection.update(query, {$set: {groups: userInfo.groups}});

    return;
  },

  RemoveFromGroup: async function(db, group, user) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    let userTemp = await usersCollection.findOne(query);
    let userJSON = JSON.stringify(userTemp);
    let userData = JSON.parse(userJSON);

    var userGroups = userData.groups;
      for(let b = 0; b < userGroups.length; b++){
        if(userGroups[b] == group) {
          userGroups.splice(b, 1);
        }
      }
    userData.groups = userGroups;
    await usersCollection.update(query, {$set: {groups: userData.groups}});
    return;

  },

  RemoveUser: async function(db, user) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    await usersCollection.remove(query, {justOne: true});
    return;

  },

  SetAdmin: async function(db, user, permLvl) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    let response = await usersCollection.findOne(query);
    let res = JSON.stringify(response);
    let userInfo = JSON.parse(res);

    if(userInfo.permissions < permLvl) {
      userInfo.permissions = permLvl;
      console.log(userInfo);
      await usersCollection.update(query, {$set: {permissions: userInfo.permissions}})
      return;
    } else {
      console.log("The user has permissions that are greater than the new permission.");
      return;
    }

  },


  SetGroupAdmin: async function(db, user, group) {
    const groupsCollection = db.collection('groups');

    var query = {gName: group};
    let response = await groupsCollection.findOne(query);
    let groupJ = JSON.stringify(response);
    let groupInfo = JSON.parse(groupJ);

    groupInfo.admins.push(user);
    await groupsCollection.update(query, {$set: {admins: groupInfo.admins}});
    return;
  },

  RemoveGroup: async function(db, group) {
    const groupsCollection = db.collection('groups');
    const usersCollection = db.collection('users');

    var query = {gName: group};
    await groupsCollection.remove(query, {justOne: true});

    var users = [];

    await usersCollection.find({}).forEach(function(doc) {
      users.push(doc.name);
    });
    console.log(users);

    return users;

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
    console.log(groupInfo);
    return;

  },

  AvatarUpdate: async function(db, user, avatar) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    console.log(avatar);
    await usersCollection.update(query, {$set: {avatar: avatar}});
    console.log("Updated avatar of " + user);

    return;

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
