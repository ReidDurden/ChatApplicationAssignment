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
  userData;
  groups;
  channels;
  messages = [];
  message;
  connection;
  currentGroup;
  isNorm = false;
  isGroupAdmin = false;
  isSuperAdmin = false;


  ngOnInit() {

    if(sessionStorage.getItem("userInfo")) {
      this.userData = JSON.parse(sessionStorage.getItem("userInfo"));
      this.groups = this.userData.groups;
      const that = this;
      this.username = this.userData.name;
      var groupSend = {groupName: this.groups[0]}
      this.currentGroup = this.groups[0];

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
          if(groupInfo) {
            that.channels = groupInfo.channels;
            that.changeRoom(that.channels[0]);

          } else {
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

  logout(){
    sessionStorage.clear();
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

}
