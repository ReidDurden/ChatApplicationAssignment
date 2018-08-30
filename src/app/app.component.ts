import { Component } from '@angular/core';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ChatApplicaton';
  constructor(socketService:SocketService) {}

  ngOnInit() {
    if(typeof(Storage) != "undefined") {
      console.log("Storage Ready");
    } else {
      console.log("Storage Failed to Initialize");
    }
  }
}
