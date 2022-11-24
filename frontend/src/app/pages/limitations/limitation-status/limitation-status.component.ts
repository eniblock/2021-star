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
  btnDisabled = true;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.btnDisabled = false;

    switch (this.indeminityStatus) {
      case IndeminityStatus.Processed:
        this.btnClass = "bg-grey";
        break;
      case IndeminityStatus.Agreement:
        this.btnClass = "bg-grey";
        break;
      case IndeminityStatus.Processed:
        this.btnClass = "bg-success";
        break;
      case IndeminityStatus.WaitingInvoice:
        this.btnClass = "bg-orange";
        break;
      case IndeminityStatus.InvoiceSent:
        this.btnClass = "bg-success";
        break;
    }
  }

}
