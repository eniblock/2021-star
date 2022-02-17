import { registerLocaleData } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import localeFr from '@angular/common/locales/fr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    registerLocaleData(localeFr, 'fr');
  }
}
