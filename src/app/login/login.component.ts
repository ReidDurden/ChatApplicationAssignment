import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as $ from 'jquery';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent implements OnInit {

username:string = ''; //NGModel for the username that is entered

  constructor(private router:Router, private form:FormsModule, private http:HttpClient) {  }

  ngOnInit() {
  }

//Sends request to the server to authenticate a given user name
  userLogin(event) {
    event.preventDefault();
    var dataStuff = {username:this.username};
    const that = this;

    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/auth",
      data:JSON.stringify(dataStuff),
      datatype:"JSON",
      success:function(userInfo){
        if(userInfo.exists) {
          alert("Logged In!");
          sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
          that.router.navigate(['chat']);

        } else {
        alert("Please Check Your Username.");

        }
    },
      error:function(e){alert("Authentication Failed")},
    });

  });
  }
}
