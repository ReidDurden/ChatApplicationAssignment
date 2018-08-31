import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = 'http://localhost:3000';
  private socket;

  constructor() {  }

  getMessages() {
    this.socket = io(this.url);

    let observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        console.log("Recieved messages from server");
        observer.next(data)
      })
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }


  sendMessage(message) {
    this.socket.emit('add-message', message);
  }

  joinRoom(room) {
    this.socket.emit('join-room', room);
  }

  newRoom(roomname, group) {
    this.socket.emit('new-room', roomname, group);
  }






}
