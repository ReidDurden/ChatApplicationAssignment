import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as $ from 'jquery';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor(private router:Router, private form:FormsModule, private http:HttpClient) { }

  username:string = '';
  userData = JSON.parse(localStorage.getItem("userInfo"));

  ngOnInit() {
    if(localStorage.getItem("userInfo")) {
      console.log(this.userData);
      //this.username = userData.name;
      //alert("Welcome to the chat system " + userData.name);
    } else {
      alert("Sorry! Looks like your not logged in! Back to the login page for you...");
      this.router.navigate(['login']);
    }
  }

}
