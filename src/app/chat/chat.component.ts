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

  username:string = '';
  userData = JSON.parse(localStorage.getItem("userInfo"));
  groups = this.userData.groups;
  channels;
  messages = [];
  message;
  connection;
  currentGroup;


  ngOnInit() {
  //  var dataStuff = {username:this.username};

    if(localStorage.getItem("userInfo")) {

      const that = this;
      console.log(this.userData);
      this.username = this.userData.name;
      var groupSend = {groupName: this.groups[0]}
      this.currentGroup = this.groups[0];
      console.log(groupSend);


      this.connection = this.sockServ.getMessages().subscribe(message=> {
        this.messages.push(message);
        this.message = '';
      });
      $(document).ready(function() {
      $.ajax({
        type:"POST",
        contentType:"application/json",
        url:"/getGroups",
        data:JSON.stringify(groupSend),
        datatype:"JSON",
        success:function(groupInfo){
          console.log(groupInfo)
          if(groupInfo) {
            that.channels = groupInfo.channels;
            alert("Channels updated!");
            console.log(that.channels);
            console.log(that.groups);

          } else {
          //console.log(this.loginSuccess + "FailCall");
          alert("Channels was not updated, the group may not exist.");

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

  sendMessage(){
    this.sockServ.sendMessage('['+ this.username +']' + this.message);
  }

  changeRoom(room){
    this.sockServ.joinRoom(room);
  }

  ngOnDestroy(){
    if(this.connection){
      this.connection.unsubscribe();
    }
  }

  changeGroup(name){
    console.log(name);
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
        console.log(groupInfo)
        if(groupInfo) {
          that.channels = groupInfo.channels;
          alert("Channels updated!");
          console.log(that.channels);

        } else {
        //console.log(this.loginSuccess + "FailCall");
        alert("Channels was not updated, the group may not exist.");

        }
    },
      error:function(e){alert("Channels fetch faild")},
    });

  });
  }

  logout(){
    localStorage.clear();
    this.router.navigate(['login']);
  }


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
        console.log(newRoom)
        if(newRoom) {
          that.channels.push(newRoom);
          alert("New Room created!");
          console.log(that.channels);

        } else {
        alert("The new room was not created.");

        }
    },
      error:function(e){alert("Room creation failed")},
    });

  });
  }

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
        console.log(group)
        if(group) {
          that.groups.push(group);
          alert("New Group created!");
          console.log(that.groups);

        } else {
        alert("The new group was not created.");

        }
    },
      error:function(e){alert("Group creation failed")},
    });

  });
  }

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
        console.log(conf)
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
        console.log(conf)
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

  createNewUser(){
    event.preventDefault();
    var dataStuff = {username:prompt("Username?"), email:prompt("The users email?")};

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

  removeAUser(){
    event.preventDefault();
    var dataStuff = {username:prompt("Which user would you like to remove for good?")};

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


//HERE IS THE NO GO ZONE
}
