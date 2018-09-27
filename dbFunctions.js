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

        const groupsCollection = db.collection('Groups');
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
        console.log(response);
        return res;
    },

    AddUser: async function(db, userData) {
      const usersCollection = db.collection('users');
      var newUser = {name:userData.username, email:userData.email, permissions: 3, groups:["Global"]};
      console.log(newUser);
      await collection.insertOne(newUser, function(err, res) {
       if (err) throw err;
       console.log("1 document inserted");
     });
    }
}
