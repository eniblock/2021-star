import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Message} from "../models/message";

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {

  content: string = '';

  constructor(private httpClient: HttpClient) {
  }

  ngOnInit(): void {

  }


  getMessage(): void {
    this.httpClient.get<Message>(`${environment.serverUrl}/manager`).subscribe((message: Message) => {
        this.content = message.content;
      },
      (error) => {
      }
    );
  }

}
