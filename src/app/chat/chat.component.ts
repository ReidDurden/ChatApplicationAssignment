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
  groups;
  messages = [];
  message;
  connection;


  ngOnInit() {
  //  var dataStuff = {username:this.username};

    if(localStorage.getItem("userInfo")) {
      console.log(this.userData);
      this.username = this.userData.name;

      this.connection = this.sockServ.getMessages().subscribe(message=> {
        this.messages.push(message);
        this.message = '';
      });

    } else {
      alert("Sorry! Looks like your not logged in! Back to the login page for you...");
      this.router.navigate(['login']);
    }
  }

  sendMessage(){
    this.sockServ.sendMessage('['+ this.username +']' + this.message);
  }

  joinRoom(){
    this.sockServ.joinRoom(prompt("Room?"));
  }

  ngOnDestroy(){
    if(this.connection){
      this.connection.unsubscribe();
    }
  }

  logout(){
    localStorage.clear();
    this.router.navigate(['login']);
  }
}
