import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {IndeminityStatus} from "../../../models/enum/IndeminityStatus.enum";
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";

@Component({
  selector: 'app-limitation-status',
  templateUrl: './limitation-status.component.html',
  styleUrls: ['./limitation-status.component.css']
})
export class LimitationStatusComponent implements OnChanges {

  @Input() indeminityStatus?: IndeminityStatus;

  statusClass = "";
  canChangeStatus = false;

  constructor(
    private instanceService: InstanceService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe(instance => {
      this.initComponent(instance);
    })
  }

  private initComponent(instance: Instance) {
    switch (this.indeminityStatus) {
      case IndeminityStatus.InProgress:
        this.statusClass = "";
        this.canChangeStatus = false;
        break;
      case IndeminityStatus.Agreement:
        this.statusClass = "";
        this.canChangeStatus = instance == Instance.DSO || instance == Instance.TSO;
        break;
      case IndeminityStatus.Processed:
        this.statusClass = "text-success";
        this.canChangeStatus = false;
        break;
      case IndeminityStatus.WaitingInvoice:
        this.statusClass = "text-orange";
        this.canChangeStatus = instance == Instance.PRODUCER;
        break;
      case IndeminityStatus.InvoiceSent:
        this.statusClass = "text-success";
        this.canChangeStatus = false;
        break;
    }
  }

  onClick() {
    console.log("CLICK!")
  }
}
