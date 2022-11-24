import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {IndeminityStatus} from "../../../models/enum/IndeminityStatus.enum";

@Component({
  selector: 'app-limitation-status',
  templateUrl: './limitation-status.component.html',
  styleUrls: ['./limitation-status.component.css']
})
export class LimitationStatusComponent implements OnChanges {

  @Input() indeminityStatus?: IndeminityStatus;

  btnClass = "";
  statusClass = "";

  isClickable = false;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {

    switch (this.indeminityStatus) {
      case IndeminityStatus.InProgress:
        this.btnClass = "";
        this.statusClass = "";
        break;
      case IndeminityStatus.Agreement:
        this.btnClass = "";
        this.statusClass = "";
        break;
      case IndeminityStatus.Processed:
        this.btnClass = "bg-success text-white";
        this.statusClass = "text-success";
        break;
      case IndeminityStatus.WaitingInvoice:
        this.btnClass = "bg-orange text-white";
        this.statusClass = "text-orange";
        break;
      case IndeminityStatus.InvoiceSent:
        this.btnClass = "bg-success text-white";
        this.statusClass = "text-success";
        break;
    }
  }

  onClick() {
    console.log("CLICK!")
  }
}
