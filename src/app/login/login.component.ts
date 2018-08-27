import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

username:string = '';
password:string = '';

  constructor(private router:Router, private form:FormsModule) { }

  ngOnInit() {
  }

  userLogin(event) {
    event.preventDefault();

  }

}
