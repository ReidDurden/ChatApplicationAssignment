import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as $ from 'jquery';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor(private router:Router, private form:FormsModule, private http:HttpClient, private sockServ:SocketService) { }

  username:string = ''; //Current user's username
  userData; //User data stored
  groups; //Users groups stored
  channels; //Users Channels stored
  messages = []; //Messages being sent, (NOTAPPLICABLE)
  message; //NOTAPPLICABLE
  connection; //Storage for the socket.io connection
  currentGroup; //Group the user is currently in
  isNorm = false;
  isGroupAdmin = false;    //Various user permissions
  isSuperAdmin = false;
  userAvatar = '';
  sentImage = '';

//Retrieves the users data and aquires all of the information that the page
//needs to display
  ngOnInit() {

    if(sessionStorage.getItem("userInfo")) {
      this.userData = JSON.parse(sessionStorage.getItem("userInfo"));
      this.groups = this.userData.groups;
      const that = this;
      this.username = this.userData.name;
      var groupSend = {groupName: this.groups[0]}
      this.currentGroup = this.groups[0];
      this.userAvatar = this.userData.avatar;

//Sets the users level of permissons
      if(this.userData.permissions == 1) {
        this.isNorm = true;
        this.isGroupAdmin = false;
        this.isSuperAdmin = false;
      } else if(this.userData.permissions == 2) {
        this.isNorm = false;
        this.isGroupAdmin = true;
        this.isSuperAdmin = false;
      } else if(this.userData.permissions == 3) {
        this.isNorm = false;
        this.isGroupAdmin = false;
        this.isSuperAdmin = true;
      }

//Estabilish connection to socket.io service
      this.connection = this.sockServ.getMessages().subscribe(message=> {
        this.messages.push(message);
        //this.senderAvatar = message.avatar;
        this.message = '';

      });
//Get channels
      $(document).ready(function() {
      $.ajax({
        type:"POST",
        contentType:"application/json",
        url:"/getGroups",
        data:JSON.stringify(groupSend),
        datatype:"JSON",
        success:function(groupInfo){
          if(groupInfo) {
            that.channels = groupInfo.channels;
            that.changeRoom(that.channels[0]);

          } else {
          alert("Channels was not updated, the group may not exist, or there may have been a serious error.");

          }
      },
        error:function(e){alert("Channels fetch faild")},
      });

    });

    } else {
      alert("Sorry! Looks like your not logged in! Back to the login page for you...");
      this.router.navigate(['login']);
    }
  }

//Send message through socket.io
  sendMessage(){
    this.sockServ.sendMessage(' ['+ this.username +']: '  + this.message, this.username);
  }

//Uses socket.io to change the room the user is emiting to
  changeRoom(room){
  const that = this;
  that.messages = []
  var data = {channel:room};
  $(document).ready(function() {
  $.ajax({
    type:"POST",
    contentType:"application/json",
    url:"/getChatHistory",
    data:JSON.stringify(data),
    datatype:"JSON",
    success:function(chatHistory){
      console.log(chatHistory);
      if(chatHistory) {
        for(var i = 0; i < chatHistory.history.length; i++) {
          var message = {text:chatHistory.history[i]};
          that.messages.push(message);
          console.log(chatHistory.history[i]);
        }
      } else {
      alert("The chat history could not be retrieved.");

      }
  },
    error:function(e){alert("Chat history retrieval failed failed.")},
  });

});
    this.sockServ.joinRoom(room, this.username);
  }


  selectedFile = null;
  onFileSelected(event){
    this.selectedFile = event.target.files[0];


    var reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (e)=> {
      this.userAvatar = reader.result;

    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };

  }

  chatImage = null;
  onFileSelectedChat(event){
    this.chatImage = event.target.files[0];


    var reader = new FileReader();
    reader.readAsDataURL(this.chatImage);
    reader.onload = (e)=> {
      this.sentImage = reader.result;

    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };

  }

  sendImage(){
    //this.sockServ.sendMessage(' ['+ this.username +']: '  + this.message, this.username);
    this.sockServ.sendImage(this.sentImage, this.username);

  }

  onUpload(){
    //console.log("AY BRUH YOU DID DAT THING");
    var data = {file: this.userAvatar, user:this.username};
    console.log(data);
    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/uploadFile",
      data:JSON.stringify(data),
      datatype:"JSON",
      success:function(conf){
        if(conf) {
          alert("Your avatar was updated!");
        } else {
        alert("Your avatar was not updated. Something might of gone wrong.");

        }
    },
      error:function(e){alert("Avatar update failed.")},
    });

  });

  }

//Closes the connection when the user leaves the page
  ngOnDestroy(){
    if(this.connection){
      this.connection.unsubscribe();
    }
  }

//Retrieves the group information for a specifed group from the SERVER
// and then chnages the user current group.
  changeGroup(name){
    const that = this;
    var newGroup = {group:name};
    that.currentGroup = name;
    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/changeGroup",
      data:JSON.stringify(newGroup),
      datatype:"JSON",
      success:function(groupInfo){
        if(groupInfo) {
          that.channels = groupInfo.channels;

        } else {
        alert("Channels was not updated, the group may not exist.");

        }
    },
      error:function(e){alert("Channels fetch faild")},
    });

  });
  }

//Logs out the user by clearing local data and then returning them to
// the login screen
  logout(){
    sessionStorage.clear();
    this.router.navigate(['login']);
  }

//Sends a request to the server to create a new room in the current channel
  newRoom() {
    const that = this;
    var newRoom = {newRoom:prompt("New room name?"), curGroup: this.currentGroup};
    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/newRoom",
      data:JSON.stringify(newRoom),
      datatype:"JSON",
      success:function(newRoom){
        if(newRoom) {
          that.channels.push(newRoom);
          alert("New Room created!");

        } else {
        alert("The new room was not created.");

        }
    },
      error:function(e){alert("Room creation failed")},
    });

  });
  }

//Send request to the server to make a new group
  newGroup() {
    const that = this;
    var newGroup = {newGroup:prompt("New group name?"), curUser: this.userData.name};
    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/newGroup",
      data:JSON.stringify(newGroup),
      datatype:"JSON",
      success:function(group){
        if(group) {
          that.groups.push(group);
          alert("New Group created!");

        } else {
        alert("The new group was not created.");

        }
    },
      error:function(e){alert("Group creation failed")},
    });

  });
  }

//Send request to the server to add a user to a specified group
  addToGroup(){
    const that = this;
    var details = {user:prompt("Which user would you like to add to the current group?"), group:this.currentGroup};
    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/addToGroup",
      data:JSON.stringify(details),
      datatype:"JSON",
      success:function(conf){
        if(conf) {
          alert("User was added to the group");

        } else {
        alert("The user was not added to the group, are he sure they exist?");

        }
    },
      error:function(e){alert("Add to group has failed")},
    });

  });
  }

//Send request to the server to remove a specified user from a group
  removeUserFromGroup(){
    const that = this;
    var details = {user:prompt("Which user would you like to remove from the current group?"), group:this.currentGroup};
    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/removeUserFromGroup",
      data:JSON.stringify(details),
      datatype:"JSON",
      success:function(conf){
        if(conf) {
          alert("User was removed from the group");

        } else {
        alert("The user was not removed from the group, are you sure they were in the group?");

        }
    },
      error:function(e){alert("Remove from group has failed")},
    });

  });
  }

//Sends a request to the server to create a new user.
  createNewUser(){
    event.preventDefault();
    var dataStuff = {username:prompt("Username?"),password:prompt("The users password?"), email:prompt("The users email?")};

    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/register",
      data:JSON.stringify(dataStuff),
      datatype:"JSON",
      success:function(userInfo){
        if(userInfo) {
          alert("They have been registered!");
        } else {
        alert("Sorry! Looks like that username is already taken! Or maybe our register system just failed..");

        }
    },
      error:function(e){alert("Registration Failed")},
    });
  });
  }

//Send a request to the server to remove a user from the system.
  removeAUser(){
    event.preventDefault();
    var dataStuff = {user:prompt("Which user would you like to remove for good?")};

    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/removeUser",
      data:JSON.stringify(dataStuff),
      datatype:"JSON",
      success:function(conf){
        if(conf) {
          alert("The user has been removed!");
        } else {
        alert("Sorry! That user might not exist");

        }
    },
      error:function(e){alert("User Removal Failed")},
    });
  });
  }

//Sends request to the server to update a users level of permissions to
//the level of group admin
  setGroupAdmin(){
    event.preventDefault();
    var dataStuff = {user:prompt("Which user would you like to become a group admin?"), group:this.currentGroup};

    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/setGroupAdmin",
      data:JSON.stringify(dataStuff),
      datatype:"JSON",
      success:function(conf){
        if(conf) {
          alert("The user is now an Admin of this group");
        } else {
        alert("Sorry! That user might not exist");

        }
    },
      error:function(e){alert("Group Admin Set Failed")},
    });
  });
  }

//Sends reqest to the server to update the users permissons
// to the level of super admin
  setAdmin(){
    event.preventDefault();
    var dataStuff = {user:prompt("Which user would you like to promote to a super admin?")};

    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/setAdmin",
      data:JSON.stringify(dataStuff),
      datatype:"JSON",
      success:function(conf){
        if(conf) {
          alert("The user is now an super admin");
        } else {
        alert("Sorry! That user doesn't exist");

        }
    },
      error:function(e){alert("Super Admin Set Failed")},
    });
  });

  }

//Send request to the server to remove a group from the system
  removeGroup(){
    event.preventDefault();
    const that = this;
    var dataStuff = {group:prompt("Which group would you like to remove?")};

    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/removeGroup",
      data:JSON.stringify(dataStuff),
      datatype:"JSON",
      success:function(conf){
        if(conf) {
          for(let i = 0; i < that.groups.length; i++) {
            if(that.groups[i] == dataStuff.group) {
              that.groups.splice(i, 1);
            }
          }
          alert("The group has been removed!");
        } else {
        alert("Sorry! That group might not exist");

        }
    },
      error:function(e){alert("Group Removal Failed")},
    });
  });

  }

//Sends request to the server to remove a channel in the specifed group
  removeChannel(){
    event.preventDefault();
    const that = this;
    var dataStuff = {group: this.currentGroup, channel:prompt("Which channel would you like to remove? (Note, you must be in the group that the channel you want to remove is in!)")};

    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/removeChannel",
      data:JSON.stringify(dataStuff),
      datatype:"JSON",
      success:function(conf){
        if(conf) {
          for(let i = 0; i < that.channels.length; i++) {
            if(that.channels[i] == dataStuff.channel) {
              that.channels.splice(i, 1);

            }
          }
          alert("The channel has been removed!");
        } else {
        alert("Sorry! That channel might not exist");

        }
    },
      error:function(e){alert("Channel Removal Failed")},
    });
  });
  }

}
