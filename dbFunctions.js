module.exports = {
    DBinit: async function(db) {

        db.createCollection('users', function(err, res) {});
        const usersCollection = db.collection('users');
        if (await usersCollection.countDocuments({}) == 0) {
            console.log(await usersCollection.countDocuments({}));
            await usersCollection.insertOne({
                name: "super",
                email: "super@email.com",
                permissions: 3,
                groups: ["Global"]
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

    FindRecord: async function(db, user) {
        const usersCollection = db.collection('users');

        var query = {name: user};
        let response = await usersCollection.findOne(query);
        let res = JSON.stringify(response);
        //let newV = JSON.parse(res);
        //console.log(newV);
        return res;
    },

    AddUser: async function(db, userData) {
      const usersCollection = db.collection('users');
      var newUser = {name:userData.name, email:userData.email, permissions: 3, groups:["Global"]};
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
    console.log("This is the new user data");
    console.log(userData);
    await usersCollection.update(query, {$set: {groups: userData.groups}});
    return;

  },

  RemoveUser: async function(db, user) {
    const usersCollection = db.collection('users');

    var query = {name: user};
    await usersCollection.remove(query, {justOne: true});
    return;

  }

}
