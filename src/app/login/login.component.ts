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

username:string = '';
RegUsername:string = '';
email:string = '';

  constructor(private router:Router, private form:FormsModule, private http:HttpClient) {  }

  ngOnInit() {
  }

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
          //console.log(userInfo);
          alert("Logged In!");
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          console.log(userInfo);
          that.router.navigate(['chat']);

        } else {
        //console.log(this.loginSuccess + "FailCall");
        alert("Please Check Your Username.");

        }
    },
      error:function(e){alert("Authentication Failed")},
    });

  });
  }


  userRegister(event) {
    event.preventDefault();
    var dataStuff = {username:this.username, email:this.email};

    $(document).ready(function() {
    $.ajax({
      type:"POST",
      contentType:"application/json",
      url:"/register",
      data:JSON.stringify(dataStuff),
      datatype:"JSON",
      success:function(userInfo){
        if(userInfo) {
          alert("You've been registered!");
        } else {
        alert("Sorry! Looks like that username is already taken! Or maybe our register system just failed..");

        }
    },
      error:function(e){alert("Registration Failed")},
    });
  });
  }


}
