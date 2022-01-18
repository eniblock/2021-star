import { Component, Input, OnInit } from '@angular/core';

export declare type BadgeColorType = 'primary' | 'blanc';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css'],
})
export class BadgeComponent implements OnInit {
  @Input() text?: string = '';
  @Input() color: BadgeColorType = 'primary';

  constructor() {}

  ngOnInit() {}
}
