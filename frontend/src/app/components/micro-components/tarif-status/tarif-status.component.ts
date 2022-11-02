import {Component, Input, OnInit} from '@angular/core';
import {EligibilityStatus} from "../../../models/enum/EligibilityStatus.enum";
import {ReserveBidStatus} from "../../../models/enum/ReserveBidStatus.enum";

@Component({
  selector: 'app-tarif-status',
  templateUrl: './tarif-status.component.html',
  styleUrls: ['./tarif-status.component.css']
})
export class TarifStatusComponent implements OnInit {

  @Input() reserveBidStatus?: ReserveBidStatus;

  ReserveBidStatusEnum = ReserveBidStatus;

  constructor() {
  }

  ngOnInit(): void {
  }

}
