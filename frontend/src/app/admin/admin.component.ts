import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Message} from "../models/message";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  content: string = '';

  constructor(private httpClient: HttpClient) {
  }

  ngOnInit(): void {

  }

  getMessage(): void {
    this.httpClient.get<Message>(`${environment.serverUrl}/admin`).subscribe((message: Message) => {
        this.content = message.content;
      },
      (error) => {
      }
    );
  }
}
