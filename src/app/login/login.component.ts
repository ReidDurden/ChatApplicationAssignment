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
email:string = '';


  constructor(private router:Router, private form:FormsModule, private http:HttpClient) { }

  ngOnInit() {
  }

  userLogin(event) {
    event.preventDefault();
    /*this.register(this.username, this.email).subscribe(
      data=>{
        //Do Something
        console.log("Registered Successfully");
      },
      error =>{ alert("Registration Failed"); }
    )
    */
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
          alert("Registered");
        } else {
          alert("Not Registered");
        }
    },
      error:function(e){alert("failure")},
    });
  });
  }

  register(newUsername:string, newEmail:string){
    return this.http.post('/register',{username:newUsername});
  }

}
